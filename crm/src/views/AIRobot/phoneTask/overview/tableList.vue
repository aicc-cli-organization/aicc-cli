<template>
  <ul class="table-ul">
    <li>
      <label>话术模版:</label>
      <el-tooltip effect="dark" :content="robotCallJobDetail.dialogFlowName" placement="top">
        <span class="value">{{robotCallJobDetail.dialogFlowName}}</span>
      </el-tooltip>
    </li>
    <li>
      <label>启动方式:</label>
      <span class="value">{{startModeText}}</span>
    </li>
    <li>
      <label>外呼方式:</label>
      <span class="value">{{phoneTypeText}}</span>
    </li>
    <li>
      <label>外呼线路:</label>
      <span class="value" v-for="(item, index) in robotCallJobDetail.jobPhoneNumberList" :key="index">{{item.phoneType === 'MOBILE' ? (`${item.phoneName ? item.phoneName + '-' : ''}${item.phoneNumber}`) : (item.phoneName || item.phoneNumber)}}</span>
    </li>
    <li>
      <label>AI数量:</label>
      <span class="value">
        {{AICount}}
      </span>
    </li>
    <li>
      <label>平均通话时长:</label>
      <span class="value">
        {{averageCallDuration}}秒
      </span>
    </li>
  </ul>
</template>

<script>
const START_MODE = {
  AUTO: '自动启动',
  MANUAL: '手动启动'
}

const PHONE_TYPE = {
  MOBILE: '手机',
  LANDLINE: '固定电话',
  UNFIXED_CALL: '无主叫号码'
}

export default {
  props: {
    robotCallJobDetail: {
      type: Object,
      default() {
        return {}
      }
    },
    fullStatsInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    startModeText() {
      return START_MODE[this.robotCallJobDetail.robotCallJob.mode]
    },
    phoneTypeText() {
      return PHONE_TYPE[this.robotCallJobDetail.robotCallJob.phoneType]
    },
    AICount() {
      const { robotCallJob: { robotCount, phoneType }, enableConcurrency, concurrencyQuota } = this.robotCallJobDetail
      if (enableConcurrency) {
        if (phoneType === 'MOBILE') {
          return `${concurrencyQuota}个 并发数${robotCount}个`
        }
        return `${robotCount}个 并发数${concurrencyQuota}个`
      }
      return robotCount
    },
    averageCallDuration() {
      const { chatDurationTotal, answeredTask } = this.fullStatsInfo
      if (!answeredTask) return 0
      return Math.ceil(chatDurationTotal / answeredTask)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-ul {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 40% 30% 30%;
  grid-template-rows: 50px 50x;
  grid-column-gap: 2px;
  grid-row-gap: 2px;
  li {
    background-color: #F4F8FC;
    line-height: 50px;
    height: 50px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    label {
      display: inline-block;
      color: #666666;
      width: 116px;
      text-align: right;
      font-size: 14px;
    }
    .value {
      margin-left: 10px;
      font-size: 16px;
      color: #333333;
    }
  }
}
</style>
