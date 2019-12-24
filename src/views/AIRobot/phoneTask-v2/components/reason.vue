<template>
  <div class="reason" v-if="reasonText">{{reasonText}}{{nextStartTimeText}}</div>
</template>

<script>
import { nextStartTimePrefixMap, isAfterNow } from '../config/enum'

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
    },
    priority: { // 任务优先级
      type: Number,
      default: 0
    }
  },
  computed: {
    reasonText() {
      if (this.taskStatus === 'EXPIRED') {
        return '无可拨打时间，请检查可拨打时间段设置'
      }
      if (this.taskStatus === 'IN_QUEUE' && this.priority > 0 && this.priority < 100) {
        return '坐席被优先任务占用'
      }

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
      return `${this.nextStartTime}`
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
