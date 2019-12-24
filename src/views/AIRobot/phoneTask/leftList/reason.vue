<template>
  <div class="reason" v-if="reasonText">{{reasonText}}{{nextStartTimeText}}</div>
</template>

<script>
import { nextStartTimePrefixMap } from '../utils/enum'

const pauseStatuses = ['WAITING_FOR_REDIAL', 'SYSTEM_SUSPENDED'] // 自动重拨在页面上也展示成系统暂停

export default {
  props: {
    hangUpReason: { // 系统挂起原因
      type: String,
      default: ''
    },
    taskStatus: { // 任务状态
      type: String,
      default: ''
    },
    nextStartTime: { // 下次开始时间
      type: String,
      default: ''
    }
  },
  methods: {
    getNextStartTime() {
      const { nextStartTime } = this.robotCallJobDetail.robotCallJob
      const date = new Date()
      const currDate = date.getDate()
      const currHour = date.getHours()
      const currMinute = date.getMinutes()
      const currSecond = date.getSeconds()
      const endHour = nextStartTime.split(":")[0]
      const endMinute = nextStartTime.split(":")[1]
      const endSecond = nextStartTime.split(":")[2]
      if (
        ((currHour * 3600 + currMinute * 60 + currSecond * 1) > (endHour * 3600 + endMinute * 60 + endSecond * 1))
      ) {
        return `明天${nextStartTime}`
      }
      return `今天${nextStartTime}`
    }
  },
  computed: {
    reasonText() {
      if (this.taskStatus === 'SYSTEM_HANG_UP' && this.hangUpReason) {
        return this.hangUpReason
      }
      if (pauseStatuses.includes(this.taskStatus)) {
        return `${nextStartTimePrefixMap[this.taskStatus]}下次开始时间`
      }
      return ''
    },
    nextStartTimeText() {
      if (!pauseStatuses.includes(this.taskStatus)) {
        return ''
      }
      const nextStartTime = this.nextStartTime
      const date = new Date()
      const currDate = date.getDate()
      const currHour = date.getHours()
      const currMinute = date.getMinutes()
      const currSecond = date.getSeconds()
      const endHour = nextStartTime.split(":")[0]
      const endMinute = nextStartTime.split(":")[1]
      const endSecond = nextStartTime.split(":")[2]
      if (
        ((currHour * 3600 + currMinute * 60 + currSecond * 1) > (endHour * 3600 + endMinute * 60 + endSecond * 1))
      ) {
        return `明天${nextStartTime}`
      }
      return `今天${nextStartTime}`
    }
  }
}
</script>

<style lang="scss" scoped>
.reason {
  padding: 0 5px;
  background-color: rgba(238, 23, 48, .1);
  color: #EE1730;
  font-size: 12px;
  line-height: 20px;
  white-space: normal;
  margin-top: 2px;
}
</style>


