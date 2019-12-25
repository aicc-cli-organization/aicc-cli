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
        default: '500px'
      },
      stats: {
        type: Object,
        default() {
          return {}
        }
      },
      seriesType: {
        type: String,
        default: 'line'
      }
    },
    data() {
      return {
        chart: null,
        chartStats: {}
      }
    },
    computed: {
      ...mapGetters(['customerStr']),
    },
    watch: {
      stats: {
        handler: function(val) {
          const taskCallCompletedList = val.taskCallCompletedList
          const answeredTaskList = val.answeredTaskList
          const date = taskCallCompletedList.map(item => item.date)
          const call = taskCallCompletedList.map(item => item.val)
          const answer = answeredTaskList.map(item => item.val)
  
          this.chartStats = {
            date, call, answer
          }
          this.initChart()
        },
        deep: true
      }
    },
    mounted() {
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
        var colors = ['#5793f3', '#d14a61', '#675bba']
        this.chart = echarts.init(this.$el, 'macarons')
        
        const option = {
          tooltip: {
            trigger: "axis"
          },
          legend: {
            data: ["外呼总量", "接听总量"]
          },
          calculable: true,
          xAxis: [
            {
              name: '日期',
              type: "category",
              data: this.chartStats.date
            }
          ],
          yAxis: [
            {
              name: `${this.customerStr}数量（位）`,
              type: "value"
            }
          ],
          series: [
            {
              name: "外呼总量",
              type: "bar",
              data: this.chartStats.call,
              markLine: {
                data: [{ type: "average", name: "平均值" }]
              }
            },
            {
              name: "接听总量",
              type: "bar",
              data: this.chartStats.answer,
              markLine: {
                data: [{ type: "average", name: "平均值" }]
              }
            }
          ]
        }
        this.chart.setOption(extendCommonOptions(option))
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .chart{
    background: #fff !important;
  }
  .el-card {
    background: white !important;
  }
</style>
