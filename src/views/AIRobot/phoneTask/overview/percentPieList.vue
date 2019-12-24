<template>
  <div class="pies">
    <div class="pie-item" v-for="(pie, index) in pieData" :key="index">
      <div class="left">
        <p>{{pie.title}}</p>
        <span class="progress">
          <span class="num">{{pie.showNum ? pie.num : ''}}{{pie.showNum ? '(' + pie.progress + '%)' : pie.progress + '%'}}</span>
        </span>
      </div>
      <pie-chart width="60px" height="60px" outer-radius="20" inner-radius="13" :chart-list="pie.chartList"></pie-chart>
    </div>
  </div>
</template>

<script>
import PieChart from './pieChart'
import { mapGetters } from 'vuex'

export default {
  props: {
    fullStatsInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    pieData() {
      const {
        intentLevel = {},
        answeredTask, // 接听数
        taskCallTotal, // 外呼数,
        taskTotalCompleted, // 接听数 / 外呼数
        totalTask = 1,
        intentLevelTagDetailList = [] // 自定义意向标签
      } = this.fullStatsInfo
      if (!this.fullStatsInfo) return ''
      let intentTotal = 0
      for(let key in intentLevel) {
        intentTotal += intentLevel[key]
      }
      const taskProgress = this.getPercent(taskCallTotal, totalTask)
      const answeredRate = this.getPercent(answeredTask, taskTotalCompleted)
      const customerIntentList = []
      const realIntentLevelTagDetailList = intentLevelTagDetailList.slice(0, 2)
      realIntentLevelTagDetailList.forEach((item) => {
        const progress = this.getPercent(intentLevel[item.code], intentTotal)
        customerIntentList.push({
          progress,
          showNum: true,
          num: `${intentLevel[item.code] || 0}位`,
          title: `${item.name}${this.customerStr}数及占比`,
          chartList: [{ value: progress, color: '#1890FF' }, { value: 100 - progress, color: '#F3F3F3' }]
        })
      })
      return [
        { progress: taskProgress, title: '外呼进度', chartList: [{ value: taskProgress, color: '#1890FF' }, { value: 100 - taskProgress, color: '#F3F3F3' }] },
        { progress: answeredRate, title: '电话接通率', chartList: [{ value: answeredRate, color: '#1890FF' }, { value: 100 - answeredRate, color: '#F3F3F3' }] },
        ...customerIntentList
      ]
    }
  },
  components: {
    PieChart
  },
  methods: {
    getPercent(son, mon) {
      if (!mon || !son) return 0
      const digit = ((son || 0) / mon * 100)
      return digit === 100 ? digit : digit.toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
.pies {
  display: flex;
  margin-top: 20px;
  padding: 23px 0;
  background-color: white;

  .pie-item {
    flex: 1;
    display: flex;
    justify-content: center;

    .left {
      margin-right: 20px;
      p {
        margin-top: 5px;
      }
      .progress {
        color: #333333;
        font-size: 14px;
        .num {
          font-size: 22px;
        }
      }
    }
  }
}
</style>
