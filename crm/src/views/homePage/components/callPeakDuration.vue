<template>
  <div  id="call-peak-duration">
    <div class="customer-concerns-title">
      <span class="text">通话高峰时段</span>
      <span v-if="highestCallTimeBO && highestCallTimeBO.hour" class="right mr15">{{parseHour(highestCallTimeBO.hour)}}</span>
      <img v-if="highestCallTimeBO && highestCallTimeBO.hour" class="icon" src="/static/img/homepage/home_icon_gaofengshiduan.png" alt="">
    </div>
    <div class="call-peak-duration" :class="{large: area=='LARGE', normal: area=='NORMAL'}">
      <div class="left-area">
        <div class="title">{{highestCallTimeBO && highestCallTimeBO.answeredTaskRate || 0}}<span class="f12">%</span></div>
        <div class="subtitle">接听率</div>
      </div>
      <div class="right-area">
        <div class="title">{{highestCallTimeBO && highestCallTimeBO.averageDuration || 0}}<span class="f12">秒</span></div>
        <div class="subtitle">平均通话时长</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    area: {
      type: String,
      default: 'NORMAL'
    },
    highestCallTimeBO: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  methods: {
    parseHour(hour) {
      if (hour === undefined) {
        return ''
      }
      var hour = parseInt(hour)
      if (hour === 0) {
        return '无'
      } else if (hour < 9) {
        return '0' + hour + ':00-' + '0' + (hour + 1) + ':00'
      } else if (hour === 9) {
        return '0' + hour + ':00-' + (hour + 1) + ':00'
      } else {
        return '' + hour + ':00-' + (hour + 1) + ':00'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#call-peak-duration{
  .customer-concerns-title .text{
    display: inline-block;
    margin: 0 0 0 12px;
    height: 38px;
    font-size: 16px;
    font-weight: 700;
  }
  .customer-concerns-title{
    .icon {
      height: 20px;
      width: 20px;
      float: right;
      margin: 8px 10px 0 0;
    }
    line-height: 38px;
    font-size: 14px;
    border-bottom: none;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
  }
  .call-peak-duration {
    display: flex;
    justify-content: space-around;
    &.normal {
      height: 120px;
    }
    &.large {
      height: 218px;
    }
    .left-area, .right-area {
      flex-direction: column;
      width: 130px;
      justify-content: center;
      display: flex;
      .title {
        height: 24px;
        font-size: 26px;
      }
      .subtitle {
        height: 34px;
        line-height: 24px;
        font-size: 12px;
        color: #b2b2b2;
      }
    }
  }
}
</style>
