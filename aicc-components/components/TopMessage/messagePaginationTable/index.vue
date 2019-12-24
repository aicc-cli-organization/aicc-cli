<template>
  <div class="pagination-table">
    <div :class="listContainerClass">
      <div v-for="(item, index) in tableData" :key="index" class="announcement-item">
        <message-item :type="type" :data="item" @open="onOpen(item)"></message-item>
      </div>
    </div>
    <el-pagination
      v-if="!inPopover"
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
import request from '@/utils/request'
import messageItem from '../messageList/components/messageItem'
import * as messageQueueAPI from '@aicc/api/messageQueue'
import Vue from 'vue'
export const bus = new Vue()

export default {
  components: {
    messageItem
  },
  props: {
    inPopover: {
      type: Boolean,
      default: false
    },
    appType: {
      // 区分crm和ope应用
      validator(value) {
        return ['crm', 'ope', 'boss'].indexOf(value) !== -1
      },
      default: 'crm'
    },
    url: String,
    params: {
      type: Object,
      default: () => {
        return {}
      }
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
    autoLoad: {
      // 第一次是否自动加载
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: undefined
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
    },
    listContainerClass() {
      if (this.inPopover) {
        return 'list-in-popover'
      } else {
        return 'list-in-page'
      }
    }
  },
  watch: {
    url() {
      // url改变时自动刷新列表
      this.loadData(1)
    }
  },
  methods: {
    hideDot() {
      if (this.type === 'warnningMessage') {
        // 预警消息
        messageQueueAPI
          .listAll(
            {
              pageNum: 1,
              pageSize: 5
            },
            this.appType
          )
          .then(({ data }) => {
            // const messageList = data.data.content
            // const existUnread = messageList.some(item => {
            //   return item.readStatus === 'UNREAD'
            // })
            if (!data.data.unreadNum) {
              // 如果没有未读消息 就隐藏红点
              this.$emit('HIDE_WARNNING_MESSAGE_DOT')
              // this.$store.commit('HIDE_WARNNING_MESSAGE_DOT')
            }
          })
      }
      if (this.type === 'systemAnnouncement') {
        // 系统通知
        messageQueueAPI
          .listSystemInfo(
            {
              pageNum: 1,
              pageSize: 5
            },
            this.appType
          )
          .then(({ data }) => {
            // const messageList = data.data.content
            // const existUnread = messageList.some(item => {
            //   return item.readStatus === 'UNREAD'
            // })
            if (!data.data.unreadNum) {
              // 如果没有未读消息 就隐藏红点
              this.$emit('HIDE_SYSTEM_ANNOUNCEMENT_DOT')
              // this.$store.commit('HIDE_SYSTEM_ANNOUNCEMENT_DOT')
            }
          })
      }
    },
    onOpen(item) {
      // this.$emit('showDialog', item.messageQueuePO.message, item.messageQueuePO.title)
      this.hideDot()
      this.setRead(item.messageQueueId)
    },
    setRead(messageQueueId) {
      messageQueueAPI
        .setRead(
          {
            messageQueueId
          },
          this.appType
        )
        .then(() => {
          for (const i in this.tableData) {
            if (this.tableData[i].messageQueueId === messageQueueId) {
              this.tableData[i].readStatus = 'READ'
            }
          }
        })
    },
    setAllRead() {
      for (const i in this.tableData) {
        this.tableData[i].readStatus = 'READ'
      }
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
          pageNum: page,
          pageSize: this.inPopover ? 5 : size
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
        this.tableData = data.data.messageContent.content
        this.total = data.data.messageContent.totalElements
      } catch (error) {
        this.loading = false
      }
      this.loading = false
    }
  },
  mounted() {
    if (this.autoLoad) {
      this.loadData(this.internalCurrentPage, this.internalCurrentSize)
    }
    bus.$on('setAllRead', () => {
      this.setAllRead()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '~@aicc/styles/variables.scss';

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
.announcement-item {
  border-bottom: 1px solid #f0f3f8;
  height: auto;
  margin: 0 20px;
  position: relative;
  padding-left: 10px;
}

::-webkit-scrollbar {
  display: none;
}
.list-in-popover {
  height: 350px;
  overflow-y: scroll;
}
.list-in-page {
  height: calc(100vh - 200px);
  overflow-y: scroll;
}
</style>
