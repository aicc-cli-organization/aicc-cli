<template>
  <span>
    <span class="reason" v-if="status === 'SYSTEM_HANG_UP'">{{hangUpReason}}</span>
    <span class="all-pause" v-if="status === 'MAINTAIN'">系统维护中，将为您尽快恢复使用！</span>
    <span class="next-start" v-if="['SYSTEM_SUSPENDED', 'WAITING_FOR_REDIAL'].includes(status)">
      {{nextStartTimeStr}}
    </span>
  </span>
</template>

<script>
import { nextStartTimePrefixMap, isAfterNow } from '../config/enum'

export default {
  props: {
    status: String,
    hangUpReason: String,
    nextStartTime: String
  },
  computed: {
    nextStartTimeStr() {
      return `${nextStartTimePrefixMap[this.status]}下次开始时间${isAfterNow(this.nextStartTime) ? '明天' : '今天'}${this.nextStartTime}`
    }
  }
}
</script>

<style lang="scss" scoped>
.reason {
  color: #E99209;
  margin-left: 20px;
}
.all-pause {
  color: #EE1730;
  margin-left: 20px;
}
.next-start {
  color: #666666;
  margin-left: 6px;
  font-size: 12px;
}
</style>

