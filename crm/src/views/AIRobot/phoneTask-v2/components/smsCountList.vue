<template>
  <ul>
    <li v-for="(item, index) in visibleSmsSendList" :key="index">
      <div class="title">
        <span class="label">{{SMS_STATUS_ENUM[item.sendStatus]}}:</span>
        <span class="value">{{item.count}}</span>
      </div>
      <el-progress
        :class="{dashed: item.count === 0}"
        :color="bgColorMap[item.sendStatus]"
        :percentage="item.percentage"
        :show-text="false"
      ></el-progress>
    </li>
  </ul>
</template>

<script>
import { SMS_STATUS_ENUM } from '../config/enum'

const visibleStatusList = [
  'SEND_SUCCESSFUL',
  'SENDING',
  'SEND_FAILURE',
  'SEND_POSTPONE',
  'SEND_CANCEL'
]
const bgColorMap = {
  SEND_SUCCESSFUL: '#9EC7FF',
  SENDING: '#D5F6D7',
  SEND_FAILURE: '#d7d7d7',
  SEND_POSTPONE: '#D8D8D8',
  SEND_CANCEL: '#FA2E37'
}

export default {
  props: {
    smsSendList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      SMS_STATUS_ENUM,
      bgColorMap
    }
  },
  computed: {
    visibleSmsSendList() {
      const tmp = []
      this.smsSendList.forEach(item => {
        if (visibleStatusList.includes(item.sendStatus)) {
          item.percentage = this.sumCount ? (item.count / this.sumCount) * 100 : 0
          tmp.push(item)
        }
      })
      return tmp
    },
    sumCount() {
      let sum = 0
      this.smsSendList.forEach(item => {
        sum += item.count
      })
      return sum
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  li {
    list-style: none;
    & + li {
      margin-top: 12px;
    }
    > .title {
      line-height: 26px;
      .label {
        color: #666666;
        font-size: 12px;
      }
      .value {
        color: #333333;
        font-size: 14px;
      }
    }
    .dashed {
      border: 1px dashed #DFDEDE;
      border-radius: 6px;
      /deep/ .el-progress-bar__outer {
        background-color: #F7F7F7;
      }
    }
  }
}
</style>
