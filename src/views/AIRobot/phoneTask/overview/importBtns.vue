<template>
  <span>
    <el-dropdown
      v-if="showImportButton"
      size="mini"
      type="primary"
      @command="importCustomer">
      <el-button size="mini" type="primary" >
        导入{{customerStr}}
        <i class="el-icon-arrow-down"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="singleImport" :disabled="!hasAccess('crm_callTask_importCus')">单个导入</el-dropdown-item>
        <el-dropdown-item command="multipleImport" :disabled="!hasAccess('crm_callTask_importCus')">批量导入</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- 批量导入客户 -->
    <yw-import-csv-dialog
      title="批量导入"
      width="942px"
      v-if="importCustomerDialogVisible"
      :robotCallJobId="selectTaskId"
      :visible.sync="importCustomerDialogVisible"
      @update="updateTaskListProgress"
    ></yw-import-csv-dialog>
    <!-- 客户表单 弹框 -->
    <customer-form-dialog
      v-if="customerFormDialogVisible"
      title="单个导入"
      :robotCallJobId="selectTaskId"
      :visible.sync="customerFormDialogVisible"
      :transferPhoneChooseType="robotCallJobDetail.robotCallJob.transferPhoneChooseType"
      @success="updateTaskListProgress"
      singleImportTip
    >
    </customer-form-dialog>
  </span>
</template>

<script>
import { hasAccess } from '@/utils/access'
import CustomerFormDialog from '@/business/customer/customerFormDialog'
import YwImportCsvDialog from '@/components/ywImportCsvDialog'
import * as taskApi from '@/api/task'
import Connect from '../utils/connect'
import { mapGetters } from 'vuex'

const STATUS_LIST = ['TERMINATE']

export default {
  mixins: [Connect],
  data() {
    return {
      hasAccess,
      importCustomerDialogVisible: false,
      customerFormDialogVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    robotCallJobDetail() {
      return this.$store.state.taskV2.taskDetail
    },
    selectTaskId() {
      return this.$store.state.taskV2.selectTaskId
    },
    showImportButton() {
      return !STATUS_LIST.includes(this.robotCallJobDetail.robotCallJob.status)
    }
  },
  components: {
    CustomerFormDialog,
    YwImportCsvDialog
  },
  methods: {
    importCustomer(command) {
      if (!hasAccess('crm_callTask_importCus')) {
        this.$message.error('暂无导入权限')
        return
      }
      if (command === 'multipleImport') {
        this.importCustomerDialogVisible = true
      } else {
        this.customerFormDialogVisible = true
      }
    },
    async updateTaskListProgress() {
      const robotCallJobId = this.selectTaskId
      if (!robotCallJobId) {
        return
      }
      const { data: progressObj } = (await taskApi.getRobotCallJobProgressList([robotCallJobId])).data
      const { taskCompleted, taskTotal } = progressObj[robotCallJobId]
      this.__updateTaskItem({ robotCallJobId, completedTask: taskCompleted, taskCallTotal: taskTotal })
      this.__coverTaskDetail({
        ...this.robotCallJobDetail,
        taskCallTotal: taskTotal
      })
      // 需要暴露出成功导入的钩子函数，来刷新未呼客户列表
      this.$emit('importSuccess')
    }
  }
}
</script>
