<template>
  <ul class="table-ul">
    <li>
      <span class="inner-span">
        <label>短信模版:</label>
        <span class="value">{{smsTaskDetail.smsTemplate.name}}</span>
      </span>
      <span class="inner-span">
        <label>启动方式:</label>
        <span class="value">{{startModeText}}</span>
      </span>
    </li>
    <li class="content">
      <span class="inner-span">
        <label>内容:</label>
        <span class="value">
          {{smsTaskDetail.smsTemplate.text}}
        </span>
      </span>
    </li>
  </ul>
</template>

<script>
const START_MODE = {
  AUTO: '自动启动',
  MANUAL: '手动启动'
}

export default {
  props: {
    smsTaskDetail: {
      type: Object,
      default() {
        return {
          smsJob: {},
          smsTemplate: {}
        }
      }
    }
  },
  computed: {
    startModeText() {
      return START_MODE[this.smsTaskDetail.smsJob.mode]
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  padding: 0;
  margin: 0;
}
.table-ul {
  margin-top: 18px;
  padding: 0 10px;
  li {
    overflow: hidden;
    display: flex;
    margin-bottom: 2px;
    &.content {
      height: auto;
      .value {
        display: inline-block;
        white-space: normal;
        line-height: 24px;
      }
    }
    .inner-span {
      padding: 14px;
      background-color: #F4F8FC;
      flex: 1;
      margin-right: 2px;
      line-height: 22px;
      display: flex;
      &:last-child {
        margin-right: 0;
      }
    }
    label {
      color: #666666;
      width: 116px;
      text-align: right;
      font-size: 14px;
    }
    .value {
      flex: 1;
      margin-left: 10px;
      font-size: 16px;
      color: #333333;
    }
  }
}
</style>
