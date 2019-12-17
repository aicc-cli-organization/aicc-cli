<!--
  进度图
-->
<template>
  <div :class="className" :style="{height:height,width:width}"></div>
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
        default: '160px'
      },
      taskProgress: {
        type: Object,
        default() {
          return {
          }
        }
      }
    },
    watch: {
      taskProgress: {
        handler: function(val) {
          this.initChart()
        }
      }
    },
    computed: {
      taskProgressNumber() {
        if (this.taskProgress) {
          for (var i in this.taskProgress) {
            return this.taskProgress[i]
            break
          }
        } else {
          return 0
        }
      }
    },
    data() {
      return {
        chart: null
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
        this.chart.setOption(extendCommonOptions({
          legend: {
            orient: 'vertical',
            x: 'left',
            show: false,
            data: ['已完成']
          },
          title: {
            text: '任务进度',
            textStyle: {
              color: '#333',
              fontSize: '16',
              fontWeight: '777'
            },
            left: '10',
            top: '10'
          },
          color: ['#1890ff', '#e7f4ff'],
          series: [
            {
              name: '访问来源',
              type: 'pie',
              radius: ['50%', '60%'],
              center: ['50%', '50%'],
              avoidLabelOverlap: false,
              label: {
                normal: {
                  textStyle: {
                    fontSize: 14
                  },
                  formatter: '{b}  {d}%',
                  borderColor: '#aaa',
                  rich: {
                    a: {
                      color: '#999',
                      lineHeight: 22,
                      align: 'center'
                    }
                  }
                },
                emphasis: {
                  show: true,
                  textStyle: {
                    fontSize: '15',
                    fontWeight: 'bold'
                  }
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data: [
                { value: this.taskProgressNumber, name: '已完成' },
                { value: 100 - this.taskProgressNumber, name: '未完成' }
              ]
            }
          ]
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
