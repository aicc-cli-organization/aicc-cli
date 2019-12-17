<!--
  客户关注点
-->
<template>
    <div :class="chart" :style="{height:height,width:width}"></div>
</template>

<script>
  import echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  import { extendCommonOptions } from './mixins/chartsCommon'
  import { debounce } from '@/utils'

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
        default: '420px'
      },
      stats: {
        type: Array,
        default() {
          return []
        }
      }
    },
    watch: {
      stats: {
        handler: function(val, oldVal) {
          this.dataKeys = []
          this.dataValues = []
          for (var i in val) {
            if (this.dataKeys.length < 20) {
              this.dataKeys.push(val[i].knowledgeName)
              this.dataValues.push(val[i].count)
            }
          }
          this.dataKeys.reverse()
          this.dataValues.reverse()

          this.initChart()
        },
        deep: true
      }
    },
    data() {
      return {
        chart: null,
        dataKeys: [],
        dataValues: []
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
        this.chart = echarts.init(this.$el, 'macarons')
        var myChart = this.chart
        var option = {
          title: {
            left: '15',
            top: '15',
            textStyle: {
              fontSize: '12',
              color: '#333'
            },
            text: this.dataValues.length >= 20 ? '问答知识触发次数(排名前20）' : '问答知识触发次数'
          },
          tooltip: {},
          grid: {
            left: '6%',
            right: '15%',
            bottom: '0%',
            top: '15%',
            containLabel: true
          },
          backgroundColor: 'white',
          yAxis: {
            axisLine: { show: true },
            axisTick: { show: true },
            data: this.dataKeys,
            axisLabel: {
              fontSize: '12',
              color: '#000'
            },
            boundaryGap: ['10%', '20%'],
            splitLine: {
              show: true
            }
          },
          xAxis: {
            name: '次数',
            show: true
          },
          itemStyle: {
            normal: {
              color: '#1890ff'
            }
          },
          series: [{
            name: '',
            type: 'bar',
            data: this.dataValues,
            barWidth: 15,
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: 'right',
                  formatter: '{c}'
                }
              }
            }
          }]
        }
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(extendCommonOptions(option))
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

</style>
