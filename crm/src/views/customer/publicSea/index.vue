<template>
  <div class="yw-container">
    <!-- 筛选框 -->
    <table-filter
      ref="tableFilter"
      @updatePaginationParams="handlePaginationParamsChange"
    ></table-filter>

    <!-- 按钮组 -->
    <action-button-group
      v-model="allChecked"
      :multipleSelection="multipleSelection"
      :paginationParams="paginationParams"
      :showTableHeaders="showTableHeaders"
      :checkedCount="checkedCount"
      :total="total"
      v-bind="$attrs"
      @loadData="loadData"
      @all-check="handleAllChecked"
      @headerChange="v => showTableHeaders = v"
      @loadCustomerGroup="loadCustomerGroup"
    >
    </action-button-group>

    <!-- 客户列表  表格 -->
    <customer-list
      ref="table"
      v-bind="$attrs"
      :total.sync="total"
      :showTableHeaders="showTableHeaders"
      :multipleSelection="multipleSelection"
      :paginationParams="paginationParams"
      @edit="edit"
      @refresh="loadData"
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
      page="public"
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
  import { mapGetters } from 'vuex'

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
        total: 0,
        multipleSelection: [],
        customerFormDialogVisible: false,
        customerData: {},
        customerType: 'edit',
        paginationParams: {}
      }
    },
    computed: {
      ...mapGetters(['public_checked_fields']),
      showTableHeaders: {
        set(v) {
          this.$store.commit('SET_PUBLIC_CHECKED_FIELDS', v)
        },
        get() {
          return this.public_checked_fields
        }
      }
    },
    methods: {
      handlePaginationParamsChange(params) {
        this.paginationParams = params
        this.loadData()
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
        // 这个函数时定义在mixin中，用于处理全选操作的
        this._handleSelectionChange && this._handleSelectionChange(val)
      },
      loadCustomerGroup() {
        this.$refs.tableFilter.getCustomerGroupList()
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
  .title {
    margin: 15px 16px 15px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .el-dialog{
    padding: 0px 0px;
  }

  .action {
    > span {
      @extend %tableAction;
    }
  }

  .el-button + .el-button{
    margin-left: 5px;
  }
</style>
