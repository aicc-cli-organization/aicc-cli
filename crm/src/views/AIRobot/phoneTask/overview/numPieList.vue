<template>
  <div class="concern-answer-charts">
    <div class="chart-item answer">
      <div class="title">
        <span>接听状态</span>
        <span class="unit">单位：通</span>
      </div>
      <div class="answer-content">
        <pie-chart width="150px" height="150px" inner-radius="50" outer-radius="65" :chart-list="answerStatus.pieList"></pie-chart>
        <ul>
          <li v-for="(itemList, itemIndex) in answerStatus.liList" :key="itemIndex">
            <em></em>
            <div class="spans">
              <span v-for="(item, index) in itemList" :key="index">{{CALL_RECORD_STATUS[item.backKey]}}: {{item.num}}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="chart-item sms">
      <div class="title">
        <span>短信发送状态</span>
      </div>
      <div class="sms-content">
        <pie-chart width="150px" height="150px" inner-radius="50" outer-radius="65" :chart-list="smsStatus.pieList"></pie-chart>
        <ul>
          <li v-for="(itemList, itemIndex) in smsStatus.liList" :key="itemIndex">
            <em></em>
            <div class="spans">
              <span class="sms-span" v-for="(item, index) in itemList" :key="index">
                {{SMS_STATUS_ENUM[item.backKey]}}: {{item.num}}
                <el-tooltip v-if="item.backKey === 'SEND_POSTPONE'" effect="dark" placement="top-start">
                  <div slot="content">金融短信18点之后不可发送，系统会存至第二天早上9点再发送，故为“待发送”状态”</div>
                  <i class="el-icon-question icon-tip const-icon-tip"></i>
                </el-tooltip>
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="chart-item concern">
      <div class="title">
        {{customerStr}}前十大关注点
      </div>
      <customer-concern :customerConcern="fullStatsInfo.customerConcern"></customer-concern>
    </div>
  </div>
</template>

<script>
import * as taskAPI from '@/api/task'
import PieChart from './pieChart'
import CustomerConcern from './customerConcernChart'
import { mapGetters } from 'vuex'
import { CALL_STATUS_ARRAY, SMS_STATUS_ARRAY, CALL_RECORD_STATUS, SMS_STATUS_ENUM } from '../utils/enum'

export default {
  props: {
    fullStatsInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    smsSendList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      CALL_RECORD_STATUS,
      SMS_STATUS_ENUM
    }
  },
  components: {
    PieChart,
    CustomerConcern
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    selectTaskId() {
      return this.$store.state.taskV2.selectTaskId
    },
    answerStatus() {
      const dialResult = this.fullStatsInfo.dialResult
      if (!dialResult) return []
      const liList = []
      let index = 0
      const pieList = []
      for(let itemList of CALL_STATUS_ARRAY) {
        liList[index] = []
        let count = 0
        for(let item of itemList) {
          const num = dialResult[item] || 0
          liList[index].push({ backKey: item, num })
          count += num
        }
        const colorMap = {
          0: '#5BD360',
          1: '#F7BE43',
          2: '#F3F3F3'
        }
        pieList.push({ value: count, color: colorMap[index] })
        index++
      }
      return { liList, pieList }
    },
    smsStatus() {
      const liList = []
      const pieList = []
      if (this.smsSendList.length === 0) {
        return { liList, pieList }
      }
      const smsResult = {}
      this.smsSendList.forEach(item => {
        smsResult[item.sendStatus] = item.count
      })
      let index = 0
      for(let itemList of SMS_STATUS_ARRAY) {
        liList[index] = []
        let count = 0
        for(let item of itemList) {
          const num = smsResult[item] || 0
          liList[index].push({ backKey: item, num })
          count += num
        }
        const colorMap = {
          0: '#5BD360',
          1: '#F7BE43',
          2: '#F3F3F3',
          3: '#bbbbbb'
        }
        pieList.push({ value: count, color: colorMap[index] })
        index++
      }
      return { liList, pieList }
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;
  li {
    list-style-type: none;
  }
}
.concern-answer-charts {
  margin-top: 20px;
  display: flex;
  .chart-item {
    flex: 1;
    padding: 17px 20px;
    background-color: white;
    .title {
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      color: #333333;
      font-size: 18px;
      .unit {
        font-size: 16px;
      }
    }
    &.concern {
      margin-left: 20px;
    }
    &.answer,
    &.sms {
      .answer-content,
      .sms-content {
        display: flex;
        ul {
          flex: 1;
          margin-left: 20px;
          li {
            padding: 9px 13px 0;
            line-height: 14px;
            color: #666666;
            margin-bottom: 6px;
            &:nth-child(1) {
              background-color: rgba(86, 198, 90, .1);
              em {
                background-color: rgba(86, 198, 90, 1);
              }
            }
            &:nth-child(2) {
              background-color: rgba(233, 146, 9, .1);

              em {
                background-color: rgba(233, 146, 9, 1);
              }
            }
            &:nth-child(3) {
              background-color: rgba(188, 188, 188, .1);

              em {
                background-color: rgba(188, 188, 188, 1);
              }
            }
            &:nth-child(4) {
              background-color: rgba(187, 187, 187, .1);
              em {
                background-color: rgba(187, 187, 187, 1);
              }
            }
            em {
              float: left;
              width: 10px;
              height: 10px;
              margin-top: 2px;
              border-radius: 50%;
              margin-right: 10px;
            }
            .spans {
              flex-wrap: wrap;
              display: flex;
              span {
                flex: 0 0 50%;
                margin-bottom: 10px;
                &.sms-span {
                  flex: 1;
                }
              }
            }
          }
        }
        .const-icon-tip {
          font-size: 16px;
          float: right;
        }
      }
    }
    &.sms {
      flex: 0;
      margin-left: 20px;
      .sms-content {
        display: block;
        ul {
          margin-left: 0;
        }
      }
    }
  }
}
</style>
