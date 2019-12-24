<template>
  <div class="group-title">
    {{dateRange}}数据
    <span class="f14 c666" >{{showText}}</span>
  </div>
</template>
<script>
import moment from 'moment'
export default {
  name: 'dateRangeTitle',
  props: {
    startEndDate: {
      type: Array,
      default() {
        return []
      }
    },
    filterType: {
      type: String,
      default: 'STATS_CALL_JOB'
    },
    robotCallJobName: {
      type: String,
      default: undefined
    },
    dialogFlowName: {
      type: String,
      default: undefined
    }
  },
  computed: {
    dateRange() {
      if (this.startEndDate.length === 2 && this.startEndDate[0] === moment().format('YYYY-MM-DD') &&
        this.startEndDate[1] === moment().format('YYYY-MM-DD')) {
        return '今日实时'
      } else {
        return '' + this.startEndDate[0] + '~' + this.startEndDate[1]
      }
    },
    robotCallJobText() {
      return '（' + this.robotCallJobName + '）'
    },
    dialogFlowText() {
      return '（' + this.dialogFlowName + '）'
    },
    showText() {
      if (this.filterType === 'STATS_CALL_JOB') {
        return this.robotCallJobText
      } else {
        return this.dialogFlowText
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.group-title {
  display: inline-block;
  height: 40px;
  font-size: 20px;
  line-height: 40px;
  font-weight: 700;
}
.c666 {
  color: #666;
}
</style>