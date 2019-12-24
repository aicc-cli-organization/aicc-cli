<template>
  <div class="pagination-table">
		<el-table
      ref="table"
      :data="tableData"
			style="width: 100%"
      :border="true"
      :max-height="innerMaxHeight"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      @row-dblclick="handleRowDoubleClick"
      @sort-change="sortChange"
      @select-all="(selection) => $emit('select-all', selection)"
      @select="(selection, row) => $emit('select', selection, row)"
      v-bind="$attrs"
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
    >
		</el-pagination>
	</div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'PaginationTable',
  inheritAttrs: false,
  props: {
    data: Array,
    isPagination: {
      type: Boolean,
      default: true
    },
    url: String,
    pageZero: { // TODO: 兼容后端page从0和1开始的问题
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
    autoLoad: { // 第一次是否自动加载
      type: Boolean,
      default: true
    },
    maxHeight: Number
  },
  data() {
    return {
      total: 0,
      internalCurrentPage: 1,
      internalCurrentSize: 20,
      tableData: this.data || [],
      loading: false,
      params: {}, // 记录loadData参数
      callback: null, // 记录callback
      wrapHeight: 0 // 容器高度
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
    innerMaxHeight() {
      return this.maxHeight || (this.wrapHeight - 48)
    }
  },
  watch: {
    data(newValue) {
      this.tableData = newValue
    }
  },
  methods: {
    sortChange(data) {
      this.orderBy = data.prop
      this.direction = data.order
      this.loadData()
    },
    handleSelectionChange(val) {
      this.$emit('selection-change', val)
    },
    handleCurrentChange(page) { // 页码切换
      this.loadData({
        pageNum: page
      })
    },
    handleSizeChange(size) {
      this.loadData({
        pageNum: 1,
        pageSize: size
      })
    },
    handleRowDoubleClick(row) { // 行双击事件
      this.$emit('row-dblclick', row)
    },
    checkAll(checkAll) {
      if (!checkAll) {
        this.$refs.table.clearSelection()
      } else {
        for (let i = 0; i < this.tableData.length; i++) {
          this.$refs.table.toggleRowSelection(this.tableData[i], true)
        }
      }
    },
    async loadData(params = {}, cb) { // 加载数据
      if (cb) {
        this.callback = cb
      }
      this.params = Object.assign({ pageNum: 1, pageSize: 20 }, this.params, params) // 合并新老参数
      const { pageNum, pageSize } = this.params
      this.internalCurrentPage = pageNum // 保持internalCurrentPage与element pagination一致
      this.internalCurrentSize = pageSize
      this.loading = true
      try {
        const newParams = {
          ...this.params,
          orderBy: this.orderBy,
          direction: this.direction,
          pageNum: this.isPagination ? this.server === 'engine' ? pageNum : pageNum - 1 : undefined,
          pageSize: this.isPagination ? pageSize : undefined
        }
        const config = {
          url: this.url,
          method: this.method,
          server: this.server,
          headers: this.headers
        }
        if (config.method === 'get') {
          config.params = newParams
        } else {
          config.data = newParams
        }
        const { data } = await request(config)
        if (data && data.data && this.server === 'engine' && !this.pageable) {
          // TODO: 列表的路径不一致
          this.tableData = data.data
          if (this.callback) {
            this.callback(data.data)
          }
        } else if (data && data.data && data.data.content && this.server === 'engine') {
          this.tableData = data.data.content
          this.total = data.data.totalElements
          if (this.callback) {
            this.callback(data.data)
          }
        } else {
          this.tableData = data.content
          this.total = data.totalElements
          if (this.callback) {
            this.callback(data)
          }
        }

        this.$emit('totalSizeChange', this.total)
        this.$emit('refreshTable')
      } catch (error) {
        this.loading = false
      }
      this.loading = false
    }
  },
  mounted() {
    this.wrapHeight = this.$el.offsetHeight
    if (this.autoLoad) {
      this.loadData(this.internalCurrentPage, this.internalCurrentSize)
    }
  }
}
</script>

<style lang="scss" scoped>
  .pagination-table {
    .el-pagination {
      text-align: center;
      padding: 10px 0;
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
    /deep/ .el-table th, .el-table td {
      padding: 2px 0;
    }
    /deep/ .el-table--striped .el-table__body tr.el-table__row--striped td {
      background: #fcfdfe;
    }
    /deep/ .el-button--text {
      padding: 0px !important;
    }
  }
</style>


