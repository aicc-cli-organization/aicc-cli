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
      intentLevel: {
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
      }
    },
    data() {
      return {
        chart: null,
        series: [],
        intentCountStats: {}
      }
    },
    watch: {
      intentLevel: {
        handler: function(val) {
          const date = val.map(item => item.date)
          const dataArray = []
          for (let i = 0; i < this.IntentTagCodeArray.length; i++) {
            dataArray.push(val.map(item => item.column[i]))
          }
          this.intentCountStats = {
            date,
            dataArray
          }
          console.log('this.intentCountStats', this.intentCountStats)
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
      initSeries() {
        this.series = []
        for (let i = 0; i < this.IntentTagCodeArray.length; i++) {
          const temp = {
            name: this.IntentTagNameArray[i],
            type: 'line',
            xAxisIndex: 1,
            smooth: true,
            data: this.intentCountStats.dataArray[this.IntentTagCodeArray[i]]
          }
          console.log(temp)
          this.series.push(temp)
        }
      },
      initChart() {
        var colors = ['#5793f3', '#d14a61', '#675bba']
        this.chart = echarts.init(this.$el, 'macarons')
        this.chart.setOption(extendCommonOptions({
          color: colors,

          tooltip: {
            trigger: 'none',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: this.IntentTagNameArray
          },
          grid: {
            top: 70,
            bottom: 50
          },
          xAxis: [
            {
              type: 'category',
              axisTick: {
                alignWithLabel: true
              },
              axisLine: {
                lineStyle: {
                  color: '#939393',
                  width: 1
                }
              },
              axisPointer: {
                label: {
                  formatter: function(params) {
                    return '' + params.value +
                    (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                  }
                }
              },
              data: this.intentCountStats.date
            },
            {
              type: 'category',
              axisTick: {
                alignWithLabel: true
              },
              axisLine: {
                lineStyle: {
                  color: '#939393',
                  width: 1
                }
              },
              axisPointer: {
                label: {
                  formatter: function(params) {
                    return '' + params.value +
                    (params.seriesData.length ? '：' + params.seriesData[0].data : '') + '位'
                  }
                }
              },
              data: this.intentCountStats.date
            }
          ],
          yAxis: [
            {
              name: `${this.customerStr}数量（位）`,
              type: 'value',
              nameTextStyle: {
                padding: [10, 10, 20, 20]
              },
              axisLine: {
                lineStyle: {
                  color: '#939393',
                  width: 1
                }
              },
              minInterval: 1,
              scale: false
            }
          ],
          series: this.series
        }))
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
