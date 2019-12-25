export default {
  name: 'TableCheckAll',
  data() {
    return {
      allChecked: false,
      checkedCount: 0,
      totalSize: 0
    }
  },
  methods: {
    handleSelectAll() {
      if (this.allChecked) {
        this.allChecked = false
        this.checkedCount = 0
        this.checkAll(false)
      }
    },
    handleSelectChange(selection, row) {
      if (this.allChecked) {
        this.allChecked = false
        this.checkedCount = 0
        this.checkAll(false)
      }
    },
    _handleSelectionChange(val) {
      if (!this.allChecked) this.checkedCount = val.length
    },
    handleRefreshTable() {
      // 重新查询后，如果是全选状态，要选中所有展示项
      if (this.allChecked) {
        this.$nextTick(() => {
          this.checkAll(true)
        })
      }
    },
    handleTotalSizeChange(totalSize) {
      this.totalSize = totalSize
      if (this.allChecked) {
        this.checkedCount = totalSize || 0
      }
    },
    checkAll(checkAll) {
      this.$refs.table.checkAll(checkAll)
    },
    handleAllChecked() {
      if (this.allChecked) this.checkedCount = this.totalSize || 0
      else this.checkedCount = 0
      this.checkAll(this.allChecked)
    }
  }
}
