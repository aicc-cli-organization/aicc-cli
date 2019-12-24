<template>
  <div :class="className" :style="{height:height,width:width}"></div>
</template>

<script>
  import echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  import { extendCommonOptions } from './mixins/chartsCommon'
  import { debounce } from '@/utils'
  import { mapGetters } from 'vuex'

  export default {
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '680px'
      },
      stats: {
        type: Array,
        default() {
          return []
        }
      },
      title: {
        type: String,
        default: 'title'
      },
      unit: {
        type: String,
        default: '单位'
      },
      keyToString: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    watch: {
      stats: {
        handler: function(val) {
          this.initChart()
        },
        deep: true
      }
    },
    data() {
      return {
        chart: null,
        chartData: {
          date: '',
          data: ''
        }
      }
    },
    computed: {
      ...mapGetters(['customerStr']),
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
      window.removeEventListener('resize', this.__resizeHanlder)
      this.chart.dispose()
      this.chart = null
    },
    methods: {
      initChart() {
        this.getDateAndData()
        const date = []
        const data = []
        for (var index in this.stats) {
          date.push(this.stats[index].date)
          data.push(this.stats[index].val)
        }

        this.chart = echarts.init(this.$el, 'macarons')
        this.chartData = this.getDateAndData()
        if (this.chartData === undefined) {
          return
        }
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
              type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          legend: {
            data: this.getLegendByObj()
          },
          grid: {
            left: '3%',
            right: '8%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            name: `${this.customerStr}数量（位）`,
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#939393',
                width: 1
              }
            }
          },
          yAxis: {
            name: '日期',
            type: 'category',
            data: this.chartData.date,
            axisLine: {
              lineStyle: {
                color: '#939393',
                width: 1
              }
            }
          },
          series: this.chartData.series
        }
        this.chart.setOption(extendCommonOptions(option))
      },
      getLegendByObj() {
        const temp = []
        for (const key in this.keyToString) {
          temp.push(this.keyToString[key])
        }
        return temp
      },
      getLegend() {
        const tempArray = []
        if (this.stats.length === 0) {
          return
        }
        for (var key in this.stats[0].column) {
          tempArray.push(key)
        }
        return tempArray
      },
      getDateAndData() {
        const temp = {
          date: [],
          data: {},
          series: [],
          legend: this.getLegend()
        }
        if (this.stats.length === 0) {
          return
        }
        const legend = temp.legend
        for (const i in legend) {
          temp.data[legend[i]] = []
        }
        const stats = this.stats
        for (const i in stats) {
          temp.date.push(stats[i].date)
          for (const key in stats[i].column) {
            temp.data[key].push(stats[i].column[key])
          }
        }
        for (const key in temp.data) {
          temp.series.push({
            name: this.keyToString[key],
            type: 'bar',
            stack: '总量',
            data: temp.data[key]
          })
        }
        return temp
      }
    }
  }
</script>

