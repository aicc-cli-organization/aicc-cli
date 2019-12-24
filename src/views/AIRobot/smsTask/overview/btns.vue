<template>
  <div class="btns">
    <el-button class="btn-item" size="mini" type="primary" @click="onRefresh"><i class="iconfont icon-shuaxin"></i>刷新</el-button>
    <el-button v-if="canEdit" class="btn-item" size="mini" type="primary" @click="onEditTask" :disabled="!hasAccess('crm_sms_job_addOrEdit')">
      <i class="iconfont icon-edited"></i>编辑任务
    </el-button>
    <el-button
      size="mini"
      class="btn-item"
      type="primary"
      :key="index"
      @click="onFlowSms(item.value, item.text)"
      v-for="(item, index) in TASK_OPERATION_FLOW[smsTaskDetail.smsJob.status]">
      <i class="iconfont" :class="item.icon"></i>
      {{item.text}}
    </el-button>
    <el-dropdown
      size="mini"
      type="primary"
      @command="importCustomer">
      <el-button size="mini" type="primary" >
        导入{{customerStr}}
        <i class="el-icon-arrow-down"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="manualImport" :class="{'disabled': disabledManualImport}">手动添加</el-dropdown-item>
        <el-dropdown-item command="batchImport">Excel导入</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- 手动添加对话框 -->
    <munual-import-dialog
      @importSuccess="onMunualImportSuccess"
      :visible.sync="munualImportDialogVisible"
    ></munual-import-dialog>
    <!-- excel导入对话框 -->
    <excel-import-dialog
      :smsJobId="smsTaskDetail.smsJob.smsJobId"
      :visible.sync="excelImportDialogVisible"
      @importSuccess="onMunualImportSuccess"
    ></excel-import-dialog>
    <finance-count-dialog
      :isMeet="isMeet"
      :realCountObj="realCountObj"
      :meetCountObj="meetCountObj"
      :visible.sync="financeCountDialogVisible"
      @confirm="flowSmsStatus('START', '开始任务')"
    ></finance-count-dialog>
  </div>
</template>

<script>
import MunualImportDialog from '../components/manualImport'
import ExcelImportDialog from '../components/excelImport'
import FinanceCountDialog from '../components/financeCountDialog'
import { TASK_OPERATION_FLOW, EDIT_SMS_STATUSES } from '../config/enum'
import * as SmsAPI from '@/api/sms'
import { mapGetters } from 'vuex'

export default {
  props: {
    smsTaskDetail: {
      type: Object,
      default() {
        return {
          smsJob: {}
        }
      }
    },
    isMeet: {
      type: Boolean,
      default: false
    },
    meetCountObj: {
      type: Object,
      default() {
        return {}
      }
    },
    realCountObj: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      munualImportDialogVisible: false,
      excelImportDialogVisible: false,
      financeCountDialogVisible: false,
      TASK_OPERATION_FLOW
    }
  },
  components: {
    MunualImportDialog,
    ExcelImportDialog,
    FinanceCountDialog
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    selectTaskId() {
      return this.$store.state.smsTask.selectSmsTaskId
    },
    canEdit() {
      return EDIT_SMS_STATUSES.includes(this.smsTaskDetail.smsJob.status)
    },
    disabledManualImport() { // 有自定义变量则灰
      return !!this.smsTaskDetail.hasPlaceholder
    }
  },
  methods: {
    onRefresh() {
      this.$emit('refresh')
    },
    onEditTask() {
      this.$emit('edit')
    },
    async onFlowSms(operation, text) {
      if (operation === 'START' &&
        !this.isMeet
      ) {
        this.financeCountDialogVisible = true
        return
      }
      this.flowSmsStatus(operation, text)
    },
    async flowSmsStatus(operation, text) {
      await SmsAPI.flowSms(this.selectTaskId, operation)
      this.$message({
        message: `${text}成功`,
        type: 'success'
      })
      this.$emit('flow')
    },
    importCustomer(command) {
      if (command === 'manualImport') {
        if (this.disabledManualImport) {
          this.$message({
            message: '带有自定义变量的短信任务，只支持Excel导入方式',
            type: 'error'
          })
          return
        }
        this.munualImportDialogVisible = true
        return
      }
      this.excelImportDialogVisible = true
    },
    onMunualImportSuccess() {
      this.$emit('import')
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-item {
  i {
    font-size: 12px;
    margin-right: 5px;
  }
}
</style>
