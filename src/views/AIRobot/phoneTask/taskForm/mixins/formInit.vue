<script>
export default {
  methods: {
    formatDailyTime(originDailyTime) {
      return originDailyTime.substring(0, 5)
    },
    __initFormFields(taskInfo) {
      // this.formFields = taskInfo
      // 不可拨打时间段
      const {
        concurrencyQuota,
        robotCallJob,
        robotCallJob: {
          inactiveTimeList,
          dailyStartTime,
          dailyEndTime,
          smsTemplateId,
          alertUsers,
          phoneType,
          robotCount,
          redialCondition,
          wechatConditionAlertLevelCode
        },
        redialIntervalHour,
        jobPhoneNumberList
      } = taskInfo
      inactiveTimeList && inactiveTimeList.forEach((item) => { // 处理下inactiveTimeList
        item.startTime ? item.startTime = this.formatDailyTime(item.startTime) : null
        item.endTime ? item.endTime = this.formatDailyTime(item.endTime) : null
      })
      const formatInactiveTimeList = inactiveTimeList.length ? inactiveTimeList : [{ startTime: '', endTime: '' }]
      const formatRobotCallJob = {
        ...robotCallJob,
        dailyStartTime: this.formatDailyTime(dailyStartTime),
        dailyEndTime: this.formatDailyTime(dailyEndTime),
        inactiveTimeList: formatInactiveTimeList,
        ...!(redialCondition && redialCondition.length) ? {
          redialCondition: ['NO_ANSWER', 'BUSY'],
          redialInterval: 0.1,
          redialTimes: 1
        } : { redialInterval: redialIntervalHour },
      }
      this.formFields = {
        ...taskInfo,
        robotCallJob: formatRobotCallJob,
        jobPhoneNumberIdList: jobPhoneNumberList.map(item => item.tenantPhoneNumberId)
      }
      this.$nextTick(() => {
        this.$set(this.formFields, 'concurrencyQuota', concurrencyQuota)
      })
      // 手机坐席的时候，这俩对调。。。。。
      if (phoneType === 'MOBILE') {
        this.$set(this.formFields, 'concurrencyQuota', robotCount)
        this.$set(this.formFields.robotCallJob, 'robotCount', concurrencyQuota)
      }
      this.smsAlertSwitch = !!smsTemplateId
      this.wechatAlertSwitch = !!(alertUsers && alertUsers.length)
      this.autoRedialSwitch = !!(redialCondition && redialCondition.length)
      this.durationLimit = !!(wechatConditionAlertLevelCode && wechatConditionAlertLevelCode.length)
    }
  }
}
</script>
