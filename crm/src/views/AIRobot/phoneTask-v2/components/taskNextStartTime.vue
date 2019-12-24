<template>
  <div :class="`next-start-${location}`" v-if="nextStartTimeText">{{nextStartTimeText}}</div>
</template>

<script>
const STATUS_LIST = ['WAITING_FOR_REDIAL', 'SYSTEM_SUSPENDED'] // 自动重拨 && 系统暂停
const PREFIX_MAP = {
  WAITING_FOR_REDIAL: '未到重拨时间段, ',
  SYSTEM_SUSPENDED: '当前已不在可运行时间段, '
}

export default {
  props: {
    location: { // 页面位置
      type: String,
      default: ''
    },
    status: { // 任务状态
      type: String,
      default: ''
    },
    nextStartTime: { // 下次开始时间
      type: String,
      default: ''
    }
  },
  computed: {
    nextStartTimeText() {
      if (!STATUS_LIST.includes(this.status)) {
        return ''
      }
      if (this.status === 'EXPIRED') {
        return '无可拨打时间，请检查可拨打时间段设置'
      }
      const nextStartTime = this.nextStartTime
      const prefix = PREFIX_MAP[this.status]
      const date = new Date()
      const currDate = date.getDate()
      const currHour = date.getHours()
      const currMinute = date.getMinutes()
      const currSecond = date.getSeconds()
      const endHour = nextStartTime.split(":")[0]
      const endMinute = nextStartTime.split(":")[1]
      const endSecond = nextStartTime.split(":")[2]
      if ((currHour * 3600 + currMinute * 60 + currSecond * 1) > (endHour * 3600 + endMinute * 60 + endSecond * 1)) {
        return `${prefix}下次开始时间明天${nextStartTime}`
      }
      return `${prefix}下次开始时间今天${nextStartTime}`
    }
  }
}
</script>

<style lang="scss" scoped>
.next-start-list {
  padding: 0 5px;
  background-color: rgba(238, 23, 48, .1);
  color: #EE1730;
  font-size: 12px;
  line-height: 20px;
  white-space: normal;
  margin-top: 2px;
}
.next-start-detail {
  color: #666666;
  // margin-left: 6px;
  font-size: 12px;
}
</style>


