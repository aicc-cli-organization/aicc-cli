<template>
  <div class="yw-container all-customer">

    <!-- 筛选框 -->
    <table-filter
      ref="tableFilter"
      @updatePaginationParams="handlePaginationParamsChange"
    ></table-filter>

    <!-- 按钮组 -->
    <action-button-group
      v-model="allChecked"
      :checkedCount="checkedCount"
      :multipleSelection="multipleSelection"
      :paginationParams="paginationParams"
      @loadData="loadData"
      @all-check="handleAllChecked"
    >
    </action-button-group>

    <!-- 客户列表  表格 -->
    <customer-list
      ref="table"
      @edit="edit"
      @refresh="loadData"
      :multipleSelection="multipleSelection"
      :paginationParams="paginationParams"
      @totalSizeChange="handleTotalSizeChange"
      @selection-change="handleSelectionChange"
      @select="handleSelectChange"
      @select-all="handleSelectAll"
      @refreshTable="handleRefreshTable"
      >
    </customer-list>

    <!-- 客户表单  弹框 -->
    <customer-form-dialog
      :visible.sync="customerFormDialogVisible"
      :type="customerType"
      :defaultData="customerData"
      :customerSourceEnum="'INSERT_FROM_PUBLIC'"
      @success="loadData"
      page="all"
    >
    </customer-form-dialog>


  </div>
</template>

<script>
  import customerList from './components/customerList'
  import tableFilter from './components/tableFilter'
  import customerFormDialog from '@/business/customer/customerFormDialog'
  import actionButtonGroup from './components/actionButtonGroup'
  import TableCheckAll from '@/mixins/tableCheckAll'

  export default {
    // 处理table全选的mixin
    mixins: [TableCheckAll],
    components: {
      actionButtonGroup,
      tableFilter,
      customerList,
      customerFormDialog
    },
    data() {
      return {
        multipleSelection: [],
        customerFormDialogVisible: false,
        customerData: {},
        customerType: 'edit',
        paginationParams: {}
      }
    },
    methods: {
      handleSelectionChange(val) {
        this.multipleSelection = val
        // 这个函数时定义在mixin中，用于处理全选操作的
        this._handleSelectionChange && this._handleSelectionChange(val)
      },
      handlePaginationParamsChange(val) {
        this.paginationParams = val
        this.$refs.table.loadData()
      },
      edit(data) {
        this.customerFormDialogVisible = true
        this.customerData = data
        this.customerType = 'edit'
      },
      loadData() {
        this.$refs.table.loadData()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';
  .button-container {
    height: 52px;
    padding: 10px 8px 10px 15px;
    border-bottom: $--border-base;
  }
  .all-customer {
    height: 100%;
  }
  #customer-management {
    height: 100%;
    position: relative;
  }
  .title {
    margin: 15px 16px 15px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .el-date-editor{
    width: 380px
  }

  .el-dialog{
    padding: 0px 0px;
  }

  .el-dialog__header{
    padding: 0px 0px;
    height: 48px;
    line-height: 48px;
    background: #f0f3f8;
  }

  .el-dialog__header .el-dialog__title {
    margin-left: 15px;
    font-size: 14px;
  }
  .el-dialog__header .el-dialog__headerbtn {
    margin-left: 15px;
    font-size: 14px;
  }

  .bottom-pagination{
    height: 46px;
    border-top: 1px solid #dadadb;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .pagination-container {
    width: 500px;
    margin: 8px auto;
  }
  .message-box::-webkit-scrollbar {display:none}
  .message-box {
    overflow-y: scroll;
    max-height: 480px;
    padding-bottom: 120px;
  }
  .history-dialog{
    max-height: 85vh;
    overflow: hidden;
  }
  .action {
    > span {
      @extend %tableAction;
    }
  }

  .preview {
    @extend %tableAction;
  }

  .el-button + .el-button{
    margin-left: 5px;    
  }
  .border-box+.border-box {
    margin-top: 10px !important;
  }
  .border-box {
    margin: 20px 20px 0 20px;
    width: 296px;
    height: 100px;
    border-radius: 2px;
    border: 1px solid #d8d9de;
  }

  .colorBlack {
    color: #333;
  }

  .pre-text {
    width: 70px;
    height: 20px;
    margin-left: 20px;
    text-align: right;
    display: inline-block;
  }

  .left-area{
    background: #fff;
  }

  .button-container .el-form-item{
    margin: 0 5px 0 0;
  }

  .center-text {
    text-align: center;
    display: inline-block;
    width: 100%;
    line-height: 196px;
    font-size: 20px;
    color: #1890ff;
  }

  .move-to-select{
    position: absolute !important;
    bottom: 0;
  }
  .history-dialog{
    /deep/ .el-dialog__header{
      margin-bottom: 0;
    }
    /deep/ .el-dialog__body {
      padding: 0!important;
      display: flex;
      .detail-left {
        width: 342px;
        min-height: 555px;
      }
      .detail-right {
        padding-top: 14px;
        flex: 1;
      }
    }
  }
</style>
