<template>
  <div class="pagination-table">
    <el-table
      :data="tableData"
      style="width: 100%"
      stripe
      ref="table"
      :border="true"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
      @select-all="(selection) => $emit('select-all', selection)"
      @select="(selection, row) => $emit('select', selection, row)"
      v-loading="loading"
    >
      <slot></slot>
    </el-table>
    <el-pagination
      v-if="isPagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="internalCurrentSize"
      :current-page.sync="internalCurrentPage"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    ></el-pagination>
  </div>
</template>

<script>
import SockJs from 'sockjs-client'
import Stomp from 'stompjs'
import request from '@/utils/request'

export default {
  name: 'WebSocketPaginationTable',
  inheritAttrs: false,
  props: {
    isPagination: {
      type: Boolean,
      default: true
    },
    url: String,
    webSocketUrl: String,
    params: {
      type: Object,
      default: () => {
        return {}
      }
    },
    pageZero: {
      // TODO: 兼容后端page从0和1开始的问题
      type: Boolean,
      default: true
    },
    server: {
      type: String,
      default: () => {
        return ''
      }
    },
    method: {
      type: String,
      default: 'get'
    },
    headers: {
      type: Object,
      default() {
        return {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    },
    pageable: {
      type: Boolean,
      default: true
    },
    autoLoad: {
      // 第一次是否自动加载
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      total: 0,
      internalCurrentPage: 1,
      internalCurrentSize: 20,
      tableData: [],
      loading: false
    }
  },
  computed: {
    multipleSelection: {
      get() {
        return this.multipleSelection
      },
      set(newVal) {
        this.$emit('update:multipleSelection', newVal)
      }
    }
  },
  watch: {
    url() {
      // url改变时自动刷新列表
      this.loadData(1)
    },
    total: {
      handler: function(val) {
        this.$emit('update:total', val)
      }
    }
  },
  methods: {
    checkAll(checkAll) {
      if (!checkAll) {
        this.$refs.table.clearSelection()
      } else {
        for (let i = 0; i < this.tableData.length; i++) {
          this.$refs.table.toggleRowSelection(this.tableData[i], true)
        }
      }
    },
    handleSelectionChange(val) {
      this.$emit('selection-change', val)
      this.$emit('handleSelectionChange', val)
    },
    handleCurrentChange(page) {
      // 页码切换
      this.loadData(page, this.internalCurrentSize)
    },
    handleSizeChange(size) {
      this.internalCurrentPage = 1
      this.loadData(1, size)
    },
    async loadData(page = 1, size = 20) {
      // 加载数据
      this.internalCurrentPage = page // 保持internalCurrentPage与element pagination一致
      this.internalCurrentSize = size
      this.loading = true
      try {
        const params = {
          ...this.params,
          pageNum: this.isPagination
            ? this.pageZero
              ? page - 1
              : page
            : undefined,
          pageSize: this.isPagination ? size : undefined
        }
        const config = {
          url: this.url,
          method: this.method,
          server: this.server,
          headers: this.headers
        }
        if (config.method === 'get') {
          config.params = params
        } else {
          config.data = params
        }
        const { data } = await request(config)
        if (data && data.data && this.server === 'engine' && !this.pageable) {
          // TODO: 列表的路径不一致
          this.tableData = data.data
          this.total = 100
        } else if (
          data &&
          data.data &&
          data.data.content &&
          this.server === 'engine'
        ) {
          this.tableData = data.data.content
          this.total = data.data.totalElements
        } else {
          this.tableData = data.content
          this.total = data.totalElements
        }

        if (!this.stompClient) {
          const random = this.generateRandom()
          const socket = new SockJs(this.webSocketUrl, [], {
            sessionId: () => {
              return random
            }
          })
          this.stompClient = Stomp.over(socket)
          this.stompClient.connect(
            { Cookie: document.cookie },
            () => {
              this.stompClient.subscribe(`/user/queue/ioProgress`, res => {
                this.$emit('onSocketMsg', res)
                if (res.body) {
                  const body = JSON.parse(res.body)
                  const data = body.data.info
                  const newData = []
                  this.tableData.forEach(item => {
                    if (item.jobInstanceId === data.jobInstanceId) {
                      const itm = Object.assign({}, item, {
                        status: data.queryStatus,
                        queryStatus: data.queryStatus,
                        successCount: data.successProgress,
                        failureCount: data.failProgress,
                        ossUrl: data.ossUrl
                      })
                      newData.push(itm)
                    } else newData.push(item)
                  })
                  this.tableData = newData
                }
              })
            },
            () => {}
          )
        }

        this.$emit('totalSizeChange', this.total)
        this.$emit('refreshTable')
      } catch (error) {
        this.loading = false
      }
      this.loading = false
    },
    generateRandom() {
      // 生成随机字符串作为ws唯一标识
      const randomStr = Math.random()
        .toString()
        .slice(-6)
      const timeStamp = Date.parse(new Date()).toString()
      return randomStr + timeStamp
    }
  },
  mounted() {
    if (this.autoLoad) {
      this.loadData(this.internalCurrentPage, this.internalCurrentSize)
    }
  },
  destroyed() {
    // 销毁时断开连接
    if (this.stompClient) {
      this.stompClient.disconnect(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.pagination-table {
  .el-pagination {
    text-align: center;
    margin: 10px 0;
  }
}
/deep/ .el-table th {
  height: 37px;
}
/deep/ .el-table td {
  height: 39px;
}
/deep/ .el-table--small td {
  padding: 2px 0;
}
/deep/ .el-table th,
.el-table td {
  padding: 2px 0;
}
/deep/ .el-table--group,
.el-table--border {
  border: 0px solid #f0f0f0;
}
/deep/ .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #fcfdfe;
}
/deep/ .el-button--text {
  padding: 0px !important;
}
</style>
