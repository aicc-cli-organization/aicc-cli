<template>
  <el-dialog
    :title="isEdit ? '编辑任务' : '新建任务'"
    top="0"
    width="859px"
    :visible.sync="innerVisible">
    <el-form
      class="add-task-form"
      label-width="120px"
      ref="form"
      :rules="formRules"
      :model="formFields">
      <form-item-name v-model="formFields.robotCallJob.name"></form-item-name>
      <form-item-dialog-flow
        ref="dialogFlow"
        v-if="!isEdit"
        v-model="formFields.robotCallJob.dialogFlowId"
        @changeIntentLevelTagId="selectIntentLevelTagId = $event"
      ></form-item-dialog-flow>
      <form-item-transfer-human
        key="human"
        v-if="!isEdit"
        ref="transferHuman"
        v-model="formFields.transferPhoneNumber"
        :transferPhoneChooseType.sync="formFields.robotCallJob.transferPhoneChooseType"
        :jumpToHumanServiceExist="jumpToHumanServiceExist"
        :dialogFlowId="formFields.robotCallJob.dialogFlowId"
      ></form-item-transfer-human>
      <form-item-human-intervention
        key="group"
        v-if="!isEdit"
        ref="humanIntervention"
        v-model="formFields.robotCallJob.csStaffGroupId"
        :humanInterventionExist="humanInterventionExist"
        :dialogFlowId="formFields.robotCallJob.dialogFlowId"
      ></form-item-human-intervention>
      <form-item-mode v-model="formFields.robotCallJob.mode"></form-item-mode>
      <form-item-starttime
        v-if="formFields.robotCallJob.mode === 'AUTO'"
        v-model="formFields.robotCallJob.startTime">
      </form-item-starttime>
      <form-item-daily-time
        :dailyStartTime.sync="formFields.robotCallJob.dailyStartTime"
        :dailyEndTime.sync="formFields.robotCallJob.dailyEndTime"
      ></form-item-daily-time>
      <form-item-inactive-time
        :dailyEndTime="formFields.robotCallJob.dailyEndTime"
        v-model="formFields.robotCallJob.inactiveTimeList"
      ></form-item-inactive-time>
      <form-item-phone-type
        v-model="formFields.robotCallJob.phoneType"
        :jumpToHumanServiceExist="jumpToHumanServiceExist"
        @change="onChangePhoneType"
      ></form-item-phone-type>
      <span style="white-space: nowrap;">
        <form-item-job-phone-number
          ref="jobPhoneNumber"
          v-model="formFields.jobPhoneNumberIdList"
          :phoneType="formFields.robotCallJob.phoneType"
          :jumpToHumanServiceExist="jumpToHumanServiceExist"
          :AICount="AICount"
        ></form-item-job-phone-number>
        <form-item-robot-count
          v-model="formFields.robotCallJob.robotCount"
          :phoneType="formFields.robotCallJob.phoneType"
          :AICount="AICount"
        ></form-item-robot-count>
      </span>
      <form-item-concurrency
        :phoneType="formFields.robotCallJob.phoneType"
        :robotCount="formFields.robotCallJob.robotCount"
        :jobPhoneNumberIdList="formFields.jobPhoneNumberIdList"
        :visible="showConcurrency"
        :AICount="AICount"
        :enableConcurrency.sync="formFields.enableConcurrency"
        :concurrencyQuota.sync="formFields.concurrencyQuota"
      ></form-item-concurrency>
      <form-item-sms-alert
        v-if="!isLocal"
        ref="smsAlert"
        :dialogFlowId="formFields.robotCallJob.dialogFlowId"
        :intentLevelTagList="intentLevelTagList"
        :isEdit="isEdit"
        :smsAlertSwitch.sync="smsAlertSwitch"
        :smsAlertLevelCode.sync="formFields.robotCallJob.smsAlertLevelCode"
        :smsTemplateId.sync="formFields.robotCallJob.smsTemplateId"
      ></form-item-sms-alert>
      <form-item-wechat-alert
        v-if="!isLocal"
        ref="wechatAlert"
        :dialogFlowId="formFields.robotCallJob.dialogFlowId"
        :intentLevelTagList="intentLevelTagList"
        :wechatAlertSwitch.sync="wechatAlertSwitch"
        :durationLimit.sync="durationLimit"
        :wechatAlertLevelCode.sync="formFields.robotCallJob.wechatAlertLevelCode"
        :wechatConditionAlertLevelCode.sync="formFields.robotCallJob.wechatConditionAlertLevelCode"
        :wechatAlertChatDurationThreshold.sync="formFields.robotCallJob.wechatAlertChatDurationThreshold"
        :alertUsers.sync="formFields.robotCallJob.alertUsers"
        :wechatSendMethod.sync="formFields.robotCallJob.wechatSendMethod"
        :transferCustomer.sync="formFields.robotCallJob.transferCustomer"
      ></form-item-wechat-alert>
      <form-item-warning-alert ref="warningAlert" v-model="formFields.robotCallJob.earlyWarningAlertUsers"></form-item-warning-alert>
      <form-item-auto-redial
        :autoRedialSwitch.sync="autoRedialSwitch"
        :redialCondition.sync="formFields.robotCallJob.redialCondition"
        :redialInterval.sync="formFields.robotCallJob.redialInterval"
        :redialTimes.sync="formFields.robotCallJob.redialTimes"
      ></form-item-auto-redial>
      <form-item-description v-model="formFields.robotCallJob.description"></form-item-description>
      <div class="footer">
        <el-button @click="onSubmit" type="primary">提交</el-button>
        <el-button @click="close">取消</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script>
import * as taskAPI from '@/api/task'
import moment from 'moment'
import { mapGetters } from 'vuex'
import FormInit from './mixins/formInit'
import { initFormFields, formRules, formFields } from '../utils/enum'
import FormItemCompMixin from './formItem/index'

export default {
  mixins: [FormInit, FormItemCompMixin],
  props: {
    type: {
      validator: function(value) {
        return ['add', 'edit'].indexOf(value) !== -1
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formRules,
      formFields,
      showConcurrency: false,
      AICount: {
        free: undefined,
        total: undefined,
        AITip: undefined
      },
      intentLevelTagList: [], // 自定义意向标签列表
      jumpToHumanServiceExist: false,
      humanInterventionExist: false,
      selectIntentLevelTagId: undefined,
      smsAlertSwitch: false,
      wechatAlertSwitch: true,
      durationLimit: false,
      autoRedialSwitch: false
    }
  },
  methods: {
    close() {
      this.formFields = initFormFields
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.innerVisible = false
    },
    async loadRobotJobInfo() {
      const taskInfo = (await taskAPI.getRobotCallJob({
        robotCallJobId: this.selectTaskId
      })).data.data
      this.intentLevelTagList = taskInfo.intentLevelTag.details
      this.__initFormFields(taskInfo)
    },
    async loadAICount() {
      const { freeRobotCount, robotCount, enableConcurrency, robotCountLimit, userFreeRobotCount } = (await taskAPI.getFreeRobotCount()).data.data
      const total = robotCountLimit <= 0 ? robotCount : Math.min(robotCountLimit, robotCount)
      const free = robotCountLimit <= 0 ? freeRobotCount : Math.min(userFreeRobotCount, freeRobotCount)
      this.AICount = {
        free,
        total,
        AITip: robotCountLimit <= 0 ? '' : (freeRobotCount < userFreeRobotCount ? `您原本剩余坐席${userFreeRobotCount}个，由于其他账号占用坐席，导致您剩余坐席数为${freeRobotCount}个` : '')
      }
      this.showConcurrency = !!enableConcurrency
    },
    async loadIntentLevelTag(dialogFlowId) {
      const intentLevelTagId = this.selectIntentLevelTagId
      return taskAPI.getIntentLevelTag(intentLevelTagId)
        .then(({ data }) => {
          const intentLevelTagList = data.data.details
          this.intentLevelTagList = intentLevelTagList
          return intentLevelTagList
        })
    },
    requestJumpToHumanServiceExist() {
      const dialogFlowId = this.formFields.robotCallJob.dialogFlowId
      if (!dialogFlowId) return
      taskAPI.getDialogFlowCallJobRelatedInfo({
        dialogFlowId
      }).then(({ data }) => {
        const { jumpToHumanServiceExist, humanInterventionExist } = data.data
        this.jumpToHumanServiceExist = jumpToHumanServiceExist
        this.humanInterventionExist = humanInterventionExist
      })
    },
    requestIntentLevelTag(dialogFlowId) {
      if (!dialogFlowId || this.isEdit) return
      this.loadIntentLevelTag(dialogFlowId)
        .then((intentLevelTagList) => {
          const initSelectIntentLevelTagCodeList = intentLevelTagList.slice(0, 2).map(item => item.code)
          this.$set(this.formFields.robotCallJob, "smsAlertLevelCode", initSelectIntentLevelTagCodeList)
          this.$set(this.formFields.robotCallJob, "wechatAlertLevelCode", initSelectIntentLevelTagCodeList)
        })
    },
    onChangePhoneType() {
      this.$set(this.formFields, 'jobPhoneNumberIdList', [])
    },
    resetConfig() {
      this.durationLimit = false
      this.smsAlertSwitch = false
      this.wechatAlertSwitch = true
      this.intentLevelTagList = []
    },
    onSubmit() {
      this.$refs.form.validate(async validate => {
        if (!validate) return
        const { robotCallJob, jobPhoneNumberIdList, enableConcurrency } = this.formFields
        robotCallJob.inactiveTimeList = robotCallJob.inactiveTimeList.filter(({ startTime, endTime }) => {
          return startTime && endTime && startTime.replace(/00:00:00/, '') && endTime.replace(/00:00:00/, '')
        })
        // 选择手机座席的时候，并发数与robotCount对换 !!!
        if (robotCallJob.phoneType === 'MOBILE') {
          const tmpCount = jobPhoneNumberIdList.length
          robotCallJob.robotCount = tmpCount
          // 选了一线多并发，则对换
          if (enableConcurrency) {
            robotCallJob.robotCount = this.formFields.concurrencyQuota
            this.formFields.concurrencyQuota = tmpCount
          }
        }
        const formatRobotCallJob = {
          ...robotCallJob,
          ...robotCallJob.mode === 'AUTO' ? {
            startTime: moment(robotCallJob.startTime).format('YYYY-MM-DD') + ' 00:00:00'
          } : { startTime: null },
          ...!this.smsAlertSwitch ? {
            smsAlertLevelCode: [],
            smsTemplateId: undefined
          } : {},
          ...(!this.wechatAlertSwitch || this.isLocal) ? {
            wechatAlertLevelCode: [],
            wechatConditionAlertLevelCode: [],
            wechatAlertChatDurationThreshold: 1,
            alertUsers: [],
            wechatSendMethod: undefined,
            transferCustomer: false
          } : {},
          ...!this.autoRedialSwitch ? {
            redialCondition: null,
            redialInterval: null,
            redialTimes: null
          } : { redialInterval: robotCallJob.redialInterval * 60 },
          ...!this.humanInterventionExist ? {
            csStaffGroupId: null
          } : {},
          ...!this.durationLimit ? {
            wechatConditionAlertLevelCode: [],
            wechatAlertChatDurationThreshold: 1
          } : {}
        }
        this.formFields = {
          ...this.formFields,
          robotCallJob: formatRobotCallJob,
          ... !enableConcurrency ? {
            concurrencyQuota: formatRobotCallJob.robotCount
          } : {}
        }
        console.log(JSON.stringify(this.formFields), '+++++++++++++formFields++++++++++++++')
        if (this.isEdit) { // 编辑任务
          await taskAPI.editRobotCallJob(this.formFields)
          this.$message({
            message: '编辑任务成功',
            type: 'success'
          })
          this.$emit('update')
          this.close()
          return
        }
        await taskAPI.addRobotCallJob(this.formFields) // 新建任务
        this.$message({
          message: '新建任务成功',
          type: 'success'
        })
        this.$store.commit('ADD_TASK_SUCCESS', true)
        this.close()
      })
    }
  },
  computed: {
    ...mapGetters([
      'isLocal'
    ]),
    isEdit() {
      return this.type === 'edit'
    },
    selectTaskId() {
      return this.$store.state.taskV2.selectTaskId
    },
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    }
  },
  watch: {
    visible(value) {
      if (!value) return
      this.loadAICount()
      if (!this.isEdit) return this.resetConfig()
      this.$nextTick(() => {
        this.$refs.jobPhoneNumber.initData()
        this.$refs.wechatAlert.initData()
        this.$refs.warningAlert.initData()
        this.$refs.smsAlert.initData()
        this.loadRobotJobInfo()
      })
    },
    'formFields.robotCallJob.dialogFlowId': {
      handler: function(val) {
        this.requestIntentLevelTag(val)
        if (this.isEdit) return
        this.requestJumpToHumanServiceExist()
      }
    },
  }
}
</script>

<style lang="css" scoped>
  @keyframes task-dialog-fade-in {
    0% {
      transform: translate3d(100%, 0, 0);
      opacity: 0;
    }
    100% {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
  .dialog-fade-enter-active {
    animation: task-dialog-fade-in .3s;
  }
  @keyframes task-dialog-fade-out {
    0% {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
    100% {
      transform: translate3d(100%, 0, 0);
      opacity: 0;
    }
  }
  .dialog-fade-enter-active {
    animation: task-dialog-fade-in .3s;
  }
  .dialog-fade-leave-active {
    animation: task-dialog-fade-out .3s;
  }
</style>
<style lang="scss" scoped>
@import "src/styles/mixin.scss";
$color-border: #D8D8D8;
/deep/ .el-dialog {
  float: right;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  .add-task-form {
    padding-top: 22px;
    padding-bottom: 60px;
    .select-right-checkbox {
      margin-left: 18px;
      .el-checkbox__label {
        font-size: 12px;
      }
    }
    .form-item-double-time {
      width: 420px;
      margin-bottom: 0;
      .daily-time-select {
        width: 140px;
      }
      .el-form-item__content .el-form-item__content {
        margin-left: 0 !important;
      }
    }
    .empty-dialogFlow-tip {
      color: #E99209;
      font-size: 12px;
    }
    .icon-tip {
      margin-left: 30px;
      font-size: 18px;
      vertical-align: middle;
      &.const-cs-group-icon {
        margin-left: 0;
      }
    }
  }
  .el-dialog__header {
    margin-bottom: 0;
    padding: 0 24px;
    line-height: 54px;
    background-color: white;
    border-bottom: 1px solid $color-border;
  }
  .el-dialog__body {
    padding: 0 !important;
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    @include transparentScrollBar();
  }
  .el-input,
  .el-select {
    width: 300px;
  }
  .el-input-number {
    .el-input {
      width: auto;
    }
  }
  .inline-block {
    display: inline-block;
  }
  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    padding: 10px 30px;
    border-top: 1px solid #dddddd;
    text-align: right;
    z-index: 10;
  }
}
</style>