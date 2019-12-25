<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import { extendCommonOptions } from './mixins/chartsCommon'
import { debounce } from '@/utils'

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
      default: ''
    },
    height: {
      type: String,
      default: '550px'
    },
    stats: {
      type: Object,
      default() {
        return {}
      }
    },
    unit: {
      type: String,
      default: '单位'
    }
  },
  watch: {
    stats: function(val) {
      this.initChart()
    },
    deep: true
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
    this.__resizeHanlder = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHanlder)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    parseRMB(data) {
      if (this.unit === '元') {
        return data.map(item => item / 1000)
      } else {
        return data
      }
    },
    parseTime(data) {
      if (this.unit === '分') {
        return data.map(item => Math.ceil(item / 60))
      } else {
        return data
      }
    },
    initChart() {
      const statsDate = this.stats.date
      const statsLegend = this.stats.legend
      if (this.stats.data === undefined) {
        return
      }
      const statsDataArray = this.stats.data.map((item) => {
        return {
          name: item.name,
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: this.parseTime(this.parseRMB(item.data))
        }
      })

      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption(extendCommonOptions({
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          // --- legend
          top: '10',
          left: '30',
          right: '30',
          data: statsLegend
        },
        grid: {
          top: '130',
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          name: this.unit
        },
        xAxis: {
          type: 'category',
          // ---- 日期
          data: statsDate
        },
        series: statsDataArray
      }), true)
    }
  }
}
</script>
