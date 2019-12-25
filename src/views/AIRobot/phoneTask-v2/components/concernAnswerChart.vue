<template>
  <div class="answer">
    <chart-item-title
      title="接听状态"
      unit="单位：通"
    >
    </chart-item-title>
    <div class="content">
      <pie-chart
        width="150px"
        height="150px"
        inner-radius="50"
        outer-radius="65"
        :chart-list="answerStatus.pieList"
      >
      </pie-chart>
      <ul>
        <li v-for="(itemList, itemIndex) in answerStatus.liList" :key="itemIndex">
          <div class="spans">
            <span
              v-for="(item, index) in itemList"
              :key="index"
            >{{CALL_RECORD_STATUS[item.backKey]}}: {{item.num}}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import PieChart from './pieChart'
import ChartItemTitle from './chartItemTitle'
import { ANSWER_STATUS_ARRAY, ANSWER_STATUS_COLOR_ENUM, CALL_RECORD_STATUS } from '../config/enum'

export default {
  props: {
    fullStatsInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      CALL_RECORD_STATUS
    }
  },
  components: {
    PieChart,
    ChartItemTitle
  },
  computed: {
    answerStatus() {
      const dialResult = this.fullStatsInfo.dialResult
      if (!dialResult) return []
      const liList = []
      const pieList = []
      ANSWER_STATUS_ARRAY.forEach((items, index) => {
        liList[index] = []
        let count = 0
        items.forEach(item => {
          const num = dialResult[item] || 0
          liList[index].push({ backKey: item, num })
          count += num
        })
        pieList.push({
          value: count,
          color: ANSWER_STATUS_COLOR_ENUM[index]
        })
      })
      return { liList, pieList }
    }
  }
}
</script>

<style lang="scss" scoped>
.answer {
  .content {
    display: flex;
  }
  ul {
    flex: 1;
    margin-left: 20px;
    li {
      padding: 9px 13px 0;
      line-height: 14px;
      color: #666666;
      margin-bottom: 6px;
      &::before {
        display: block;
        content: '';
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
      &:nth-child(1) {
        background-color: rgba(86, 198, 90, .1);
        &::before {
          background-color: rgba(86, 198, 90, 1);
        }
      }
      &:nth-child(2) {
        background-color: rgba(233, 146, 9, .1);

        &::before {
          background-color: rgba(233, 146, 9, 1);
        }
      }
      &:nth-child(3) {
        background-color: rgba(188, 188, 188, .1);

        &::before {
          background-color: rgba(188, 188, 188, 1);
        }
      }
      &:nth-child(4) {
        background-color: rgba(187, 187, 187, .1);
        &::before {
          background-color: rgba(187, 187, 187, 1);
        }
      }
      &:nth-child(5) {
        background-color: rgba(186, 186, 186, .1);
        &::before {
          background-color: rgba(186, 186, 186, 1);
        }
      }
    }
  }
}
</style>
