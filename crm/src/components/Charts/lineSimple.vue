<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import { extendCommonOptions } from './mixins/chartsCommon'
import { mapGetters } from 'vuex'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '420px'
    },
    stats: {
      type: Array,
      default() {
        return []
      }
    },
    intentLevelTagDetailList: {
      type: Array,
      default() {
        return []
      }
    },
    intentLevelRate: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      chart: null,
      chartStats: {}
    }
  },
  watch: {
    intentLevelRate: {
      handler: function(val) {
        const date = val.map(item => item.date)
        const dataArray = []
        for (let i = 0; i < this.IntentTagCodeArray.length; i++) {
          dataArray.push(val.map(item => item.column[i]))
        }
        this.chartStats = {
          date,
          dataArray
        }
        this.initSeries()
        this.initChart()
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['customerStr']),
    IntentTagNameArray() {
      return this.intentLevelTagDetailList.map(item => item.name)
    },
    IntentTagCodeArray() {
      return this.intentLevelTagDetailList.map(item => item.code)
    }
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initSeries() {
      this.series = []
      for (let i = 0; i < 2; i++) {
        this.series.push(
          {
            name: this.IntentTagNameArray[i] + `${this.customerStr}占比`,
            type: 'bar',
            smooth: true,
            data: this.chartStats.dataArray[i],
            markLine: {
              data: [{ type: 'average', name: '平均值' }]
            }
          }
        )
      }
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: this.IntentTagNameArray.map(item => item + `${this.customerStr}占比`)
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            data: this.chartStats.date
          }
        ],
        yAxis: [
          {
            name: `${this.customerStr}占比（%）`,
            type: 'value'
          }
        ],
        series: this.series
      }

      this.chart.setOption(extendCommonOptions(option))
    }
  }
}
</script>
