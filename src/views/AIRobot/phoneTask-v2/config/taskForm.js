import { getWechatPushConditionItem } from './addTask'

export default {
  methods: {
    __initFormFields(taskInfo) {
      this.formFields = taskInfo
      const {
        concurrencyQuota,
        robotCallJob: {
          inactiveTimeList,
          inactiveDateList,
          inactiveStartTime,
          inactiveEndTime,
          dailyStartTime,
          dailyEndTime,
          smsTemplateId,
          // alertUsers,
          phoneType,
          robotCount,
          redialCondition,
          connectRedialCondition,
          wechatPushConditionList,
          redialInterval,
          redialTimes,
          tenantCallInterceptId
          // wechatConditionAlertLevelCode
        },
        jobPhoneNumberList,
        callPolicyGroupId,
        callPolicyGroupName,
        staffGroupType,
        csStaffGroupId
      } = taskInfo
      if (taskInfo.robotCallJob.endTime) {
        this.isEndDate = true
      }
      if (taskInfo.robotCallJob.connectRedialCondition.length > 0) {
        this.isListening = true
      }
      this.$set(this.formFields.robotCallJob, 'tenantCallInterceptId', tenantCallInterceptId)
      if (inactiveStartTime === '00:00:00' && inactiveEndTime === '00:00:00') {
        this.$set(this.formFields.robotCallJob, 'inactiveStartTime', undefined)
        this.$set(this.formFields.robotCallJob, 'inactiveEndTime', undefined)
      } else {
        this.$set(this.formFields.robotCallJob, 'inactiveStartTime', inactiveStartTime ? inactiveStartTime.substring(0, 5) : '')
        this.$set(this.formFields.robotCallJob, 'inactiveEndTime', inactiveEndTime ? inactiveEndTime.substring(0, 5) : '')
      }
      inactiveTimeList && inactiveTimeList.forEach((item) => {
        if (item.startTime) {
          item.startTime = item.startTime.substring(0, 5)
        }
        if (item.endTime) {
          item.endTime = item.endTime.substring(0, 5)
        }
      })

      let reInactiveDateList = []
      reInactiveDateList = inactiveDateList.map(item => {
        if (item.startDate && item.endDate) {
          return {
            datePicker: [item.startDate, item.endDate]
          }
        }
      })

      if (reInactiveDateList.length === 0) {
        reInactiveDateList = [{
          datePicker: []
        }]
      }

      this.$nextTick(() => {
        this.$set(this.formFields.robotCallJob, 'inactiveDateList', reInactiveDateList)
      })

      // 后端会传个空数组过来。。。处理下；否则回填的时候，无法渲染
      const realInactiveTimeList = inactiveTimeList.length ? inactiveTimeList : [{ startTime: '', endTime: '' }]
      this.$set(this.formFields.robotCallJob, 'inactiveTimeList', realInactiveTimeList)
      this.$nextTick(() => {
        this.$set(this.formFields, 'concurrencyQuota', concurrencyQuota)
      })
      // 手机坐席的时候，这俩对调。。。。。
      if (phoneType === 'MOBILE') {
        this.$set(this.formFields, 'concurrencyQuota', robotCount)
        this.$set(this.formFields.robotCallJob, 'robotCount', concurrencyQuota)
      }
      this.$set(this.formFields.robotCallJob, 'redialInterval', redialInterval / 60)
      this.$set(this.formFields.robotCallJob, 'redialTimes', redialTimes || 1)
      // }
      // if (wechatConditionAlertLevelCode && wechatConditionAlertLevelCode.length) {
      //   this.$set(this.configData, 'durationLimit', true)
      // }
      if (!wechatPushConditionList || !wechatPushConditionList.length) {
        this.$set(this.formFields.robotCallJob, 'wechatPushConditionList', [getWechatPushConditionItem()])
      }
      this.$set(this.formFields.robotCallJob, 'dailyStartTime', dailyStartTime.substring(0, 5))
      this.$set(this.formFields.robotCallJob, 'dailyEndTime', dailyEndTime.substring(0, 5))
      let realJobPhoneNumberList = jobPhoneNumberList
      if (phoneType === 'CALL_POLICY_GROUP') {
        realJobPhoneNumberList = [{ tenantPhoneNumberId: callPolicyGroupId || 4, phoneNumber: callPolicyGroupName || 'mock' }]
      }
      if (staffGroupType === 'THIRD_PARTY') {
        this.transferHumanMode = 'callCenter'
        this.$set(this.formFields.robotCallJob, 'callCenterStaffGroupId', csStaffGroupId)
      }
      this.$set(this.formFields, 'jobPhoneNumberIdList', realJobPhoneNumberList.map(item => item.tenantPhoneNumberId))
      this.$set(this.configData, 'autoRecalled', ((redialCondition && redialCondition.length) || (connectRedialCondition && connectRedialCondition.length)) ? 'yes' : 'no')
      this.$set(this.configData, 'smsSend', smsTemplateId ? 'yes' : 'no')
      this.$set(this.configData, 'wechatSend', (wechatPushConditionList && wechatPushConditionList.length) ? 'yes' : 'no')

      this.timePeriod = {
        daysOfWeek: this.formFields.robotCallJob.daysOfWeek,
        dailyStartTime: this.formFields.robotCallJob.dailyStartTime,
        dailyEndTime: this.formFields.robotCallJob.dailyEndTime,
        inactiveTimeList: this.formFields.robotCallJob.inactiveTimeList,
        startTime: this.formFields.robotCallJob.startTime,
        endTime: this.formFields.robotCallJob.endTime,
        dialIntervalStart: this.dialIntervalStart || '09:00',
        dialIntervalEnd: this.dialIntervalEnd || '20:00'
      }
    }
  }
}

