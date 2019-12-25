<template>
  <div class="sms-overview">
    <task-desc
      :smsTaskDetail="smsTaskDetail"
      :meetCountObj="meetCountObj"
      :isMeet="isMeet"
    ></task-desc>
    <task-operation-btns
      class="task-btns"
      :smsTaskDetail="smsTaskDetail"
      :isMeet="isMeet"
      :realCountObj="realCountObj"
      :meetCountObj="meetCountObj"
      @edit="onEditTask"
      @flow="onRefreshData"
      @import="onRefreshData"
      @refresh="onRefreshTask"></task-operation-btns>
    <task-tablelist :smsTaskDetail="smsTaskDetail"></task-tablelist>
    <sms-counts :smsTaskDetail="smsTaskDetail"></sms-counts>
    <el-tabs>
      <el-tab-pane label="未发送">
        <sms-sended url="/apiEngine/smsJob/getNotSendMessageList" ref="waitSend"></sms-sended>
      </el-tab-pane>
      <el-tab-pane label="已发送" lazy>
        <sms-sended url="/apiEngine/smsJob/getSentMessageList" ref="sended"></sms-sended>
      </el-tab-pane>
    </el-tabs>
    <!-- 编辑任务对话框 -->
    <edit-sms-dialog :visible.sync="addSmsDialogVisible" type="edit" @updateSuccess="onRefreshData"></edit-sms-dialog>
  </div>
</template>

<script>
import * as SmsAPI from '@/api/sms'
import * as taskAPI from '@/api/task'
import TaskDesc from './desc'
import TaskOperationBtns from './btns'
import SmsSended from '../sended'
import TaskTablelist from './tableList'
import SmsCounts from './counts'
import EditSmsDialog from '../components/addOrEditSmsDialog'

export default {
  data() {
    return {
      smsTaskDetail: {
        smsJob: {},
        smsTemplate: {}
      },
      addSmsDialogVisible: false,
      isMeet: false,
      meetCountObj: {},
      realCountObj: {}
    }
  },
  components: {
    TaskDesc,
    TaskOperationBtns,
    SmsSended,
    TaskTablelist,
    SmsCounts,
    EditSmsDialog
  },
  methods: {
    async loadData(smsJobId) {
      if (!smsJobId) return
      Promise.all([
        SmsAPI.getSmsTaskDetail(smsJobId),
        SmsAPI.getSmsMobileOperatorStats({ smsJobId }),
        taskAPI.getSmsConfig()
      ])
        .then(res => {
          this.smsTaskDetail = res[0].data.data
          const countDataMap = res[1].data.data || { cmcc: 0, cucc: 0, cnc: 0 }
          const configDataList = res[2].data.data
          const configDataMap = {}
          configDataList.forEach(item => {
            configDataMap[item.configKey] = item.configValue
          })
          const { yd_send_count, lt_send_count, dx_send_count } = configDataMap
          const { cmcc, cucc, cnc } = countDataMap
          const isMeet = (cmcc || yd_send_count) >= yd_send_count && (cucc || lt_send_count) >= lt_send_count && (cnc || dx_send_count) >= dx_send_count
          const noLimit = yd_send_count === 0 && lt_send_count === 0 && dx_send_count === 0
          this.isMeet = isMeet || noLimit
          this.meetCountObj = configDataMap
          this.realCountObj = countDataMap
        })
    },
    onEditTask() {
      this.addSmsDialogVisible = true
    },
    onRefreshData() {
      this.loadData(this.selectTaskId) // 刷新详情
      this.$store.dispatch('refreshSmsTask', 'editSuccess') // 刷新左侧列表
      this.$refs.waitSend && this.$refs.waitSend.loadData()
      this.$refs.sended && this.$refs.sended.loadData()
    },
    onRefreshTask() {
      this.onRefreshData()
      this.$message({
        message: '刷新成功',
        type: 'success'
      })
    }
  },
  computed: {
    selectTaskId() {
      return this.$store.state.smsTask.selectSmsTaskId
    }
  },
  watch: {
    selectTaskId: {
      handler: function (newVal) {
        this.loadData(newVal)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sms-overview {
  position: relative;
  .task-btns {
    position: absolute;
    top: 20px;
    right: 10px;
  }
}
</style>
