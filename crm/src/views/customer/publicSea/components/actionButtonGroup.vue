<template>
  <div class="table-top-action">
    <div class="action-left">
      <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
      <span class="checked-count ml5">已选中<span class="num">{{checkedCount}}</span>项</span>
      <SelectTableHeaders v-model="innerShowTableHeaders" :tableHeaders="public_all_fields"></SelectTableHeaders>
    </div>
    <!-- 左浮 按钮组 -->
    <div class="title left ml15">
      <el-button type="primary" plain @click="$router.push('/customer/whiteList')" v-if="hasAccess('crm_whiteList_view')">{{customerStr}}白名单</el-button>
      <el-button type="primary" plain @click="$router.push('/customer/customerGroup')" v-if="hasAccess('crm_group_view')">{{customerStr}}分组</el-button>
    </div>

    <!-- 右浮 按钮组 -->
    <div class="title right">
      <el-button type="primary" @click="moveToPrivateCustomerList" v-if="hasAccess('crm_publicSea_receive')">领取</el-button>
      <el-button type="primary" @click="showDistributeDialog" v-if="hasAccess('crm_publicSea_distribute')">分配{{customerStr}}</el-button>
      <el-button type="primary" @click="showCustomerGroupForm" icon="el-icon-plus">新建{{customerStr}}分组</el-button>
      <el-button type="primary" @click="showCustomerForm" icon="el-icon-plus" v-if="hasAccess('crm_publicSea_addOrEdit')">新建{{customerStr}}</el-button>
      <!-- 批量删除 -->
      <multi-del-confirm
        class="ml10 mr10 multi-del-confirm"
        :onSubmit="handleBatchDel"
        :multipleSelection="multipleSelection"
        v-if="hasAccess('crm_publicSea_del')"
      />
      <el-button type="primary" @click="importCustomer" v-if="hasAccess('crm_publicSea_import')">批量导入{{customerStr}}</el-button>
      <el-button type="primary" @click="handleExportCommand" v-if="hasAccess('crm_publicSea_export')">导出{{customerStr}}</el-button>
    </div>

    <!-- 分配 弹框 -->
    <distribute-dialog
      :visible.sync="distributeDialogVisible"
      :customerPersonIds="customerPersonIds"
      :distributeType="distributeType"
      :paginationParams="paginationParams"
      :total="total"
      @success="$emit('loadData')"
    >
    </distribute-dialog>

    <!-- 客户分组表单 弹框 -->
    <customer-group-form-dialog
      :visible.sync="customerGroupFormDialogVisible"
      @success="$emit('loadCustomerGroup')"
    ></customer-group-form-dialog>

    <!-- 客户表单  弹框 -->
    <customer-form-dialog
      :visible.sync="customerFormDialogVisible"
      :type="customerType"
      :customerSourceEnum="'INSERT_FROM_PUBLIC'"
      @success="$emit('loadData')"
      page="public"
    >
    </customer-form-dialog>

    <!-- 导入客户 弹框 -->
    <yw-import-csv-dialog
      title="导入"
      width="942px"
      v-if="importCustomerDialogVisible"
      :customerPersonListType="'PUBLIC_LIST'"
      :visible.sync="importCustomerDialogVisible"
    ></yw-import-csv-dialog>
  </div>
</template>

<script>
import multiDelConfirm from '@/components/multiDelConfirm'
import * as customerAPI from '@/api/customer'
import DistributeDialog from './DistributeDialog'
import SelectTableHeaders from '@/components/SelectTableHeaders'
import customerGroupFormDialog from '@/business/customer/customerGroupFormDialog'
import customerFormDialog from '@/business/customer/customerFormDialog'
import ywImportCsvDialog from '@/components/ywImportCsvDialog'
import * as taskAPI from '@/api/task'
import { mapGetters } from 'vuex'

export default {
  components: {
    customerGroupFormDialog,
    customerFormDialog,
    DistributeDialog,
    ywImportCsvDialog,
    SelectTableHeaders,
    multiDelConfirm
  },
  props: {
    multipleSelection: {
      type: Array,
      default: () => []
    },
    paginationParams: {
      type: Object,
      default: () => ({})
    },
    total: {
      type: Number,
      default: 0
    },
    checkedCount: {
      type: Number,
      default: 0
    },
    value: {
      type: Boolean,
      default: false
    },
    showTableHeaders: Array
  },
  data() {
    return {
      distributeType: 'BY_SELECTION',
      customerFormDialogVisible: false,
      customerType: 'add',
      distributeDialogVisible: false,
      customerGroupFormDialogVisible: false,
      importCustomerDialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['public_all_fields', 'customerStr']),
    customerPersonIds() {
      return this.multipleSelection.map(item => item.customerPersonId)
    },
    allChecked: {
      get() {
        return this.value
      },
      set(newValue) {
        this.$emit('input', newValue)
      }
    },
    innerShowTableHeaders: {
      get() {
        return this.showTableHeaders
      },
      set(newValue) {
        this.$emit('headerChange', newValue)
      }
    }
  },
  methods: {
    handleAllChecked() {
      this.$emit('all-check')
    },
    importCustomer() {
      this.importCustomerDialogVisible = true
    },
    showCustomerForm() {
      this.customerFormDialogVisible = true
    },
    showCustomerGroupForm() {
      this.customerGroupFormDialogVisible = true
    },
    showDistributeDialog() {
      if (!this.allChecked) {
        this.distributeType = 'BY_SELECTION'
        if (this.customerPersonIds.length === 0) {
          this.$message.error(`请选择${this.customerStr}！`)
          return
        }
      } else {
        this.distributeType = 'BY_FILTER'
      }
      this.distributeDialogVisible = true
    },
    async handleBatchDel() { // 批量删除
      if (this.allChecked) {
        await customerAPI.deleteCustomer({
          ...this.paginationParams,
          customerPersonListType: 'PUBLIC_LIST'
        })
      } else {
        const customerPersonIds = this.customerPersonIds
        if (customerPersonIds.length === 0) {
          this.$message.error(`请先选择${this.customerStr}`)
          return
        }
        await customerAPI.deleteCustomer({
          customerPersonIds,
          customerPersonListType: 'PUBLIC_LIST'
        })
      }

      this.$message.success('删除成功')
      this.loadData()
    },
    async handleExportCommand(commnad) { // 导出
      if (this.allChecked) {
        await taskAPI.exportCustomerPerson({
          ...this.paginationParams,
          customerPersonListType: 'PUBLIC_LIST'
        }, 'PUBLIC_LIST')
      } else {
        const customerPersonIds = this.customerPersonIds
        if (customerPersonIds.length === 0) {
          this.$message.error(`请选择需要导出的${this.customerStr}`)
          return
        }
        await taskAPI.exportCustomerPerson({
          customerPersonIds,
          customerPersonListType: 'PUBLIC_LIST'
        }, 'PUBLIC_LIST')
      }

      this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
      this.$message.success('操作成功！详细结果请在导入导出列表查看')
    },
    async moveToPrivateCustomerList() {
      var data
      if (this.allChecked) {
        data = await customerAPI.distributeCustomerListToUsers({
          ...this.paginationParams,
          customerPersonListType: 'PUBLIC_LIST'
        })
      } else {
        const customerPersonIds = this.multipleSelection.map(item => item.customerPersonId)
        if (customerPersonIds.length === 0) {
          this.$message.error(`请选择${this.customerStr}！`)
          return
        }
        data = await customerAPI.distributeCustomerListToUsers({
          customerPersonIds,
          customerPersonListType: 'PUBLIC_LIST'
        })
      }

      this.$emit('loadData')
      data = data.data.data
      if (data.limit === 0) {
        this.$message.error(`领取失败！您的剩余可拥有${this.customerStr}数为0`)
      } else if (data.limit === null || data.limit > data.success) {
        this.$message.success(`领取成功`)
      } else if (data.limit === data.success) {
        this.$message.warning(`剩余可拥有${this.customerStr}数为 ${data.limit}，成功领取 ${data.success}`)
      }
    },
    loadData() {
      this.$emit('loadData')
    }
  }
}
</script>


<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';
  .title {
    // margin: 15px 16px 15px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .el-dialog{
    padding: 0px 0px;
  }

  .table-top-action {
    > span {
      @extend %tableAction;
    }
  }

  .preview {
    @extend %tableAction;
  }

  .multi-del-confirm {
    font-size: 0;
  }
</style>
