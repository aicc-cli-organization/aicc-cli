<template>
  <div :class="className" class="echarts" :style="{height:height,width:width}"></div>
</template>

<script>
  import echarts from 'echarts'
  require('./mixins/macarons') // echarts theme
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
        default: '480px'
      },
      stats: {
        type: Array,
        default() {
          return []
        }
      },
      title: {
        type: String,
        default: ''
      },
      unit: {
        type: String,
        default: '单位'
      },
      minInterval: {
        type: Number,
        default: 1
      },
      dataName: {
        type: Array,
        default: []
      }
    },
    watch: {
      stats: {
        handler: function() {
          this.initChart()
        },
        deep: true
      }
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
      window.removeEventListener('resize', this.__resizeHanlder)
      this.chart.dispose()
      this.chart = null
    },
    methods: {
      value(item) {
        if (this.unit === '元' || this.unit === '费用（元）') {
          return (item.val || item.value) / 1000
        } else {
          return item.val || item.value
        }
      },
      refund(item) {
        if (item.refund) {
          return item.refund / 1000
        } else {
          return item.refund
        }
      },
      initChart() {
        const date = []
        const dataValue = []
        const dataRefund = []
        for (var index in this.stats) {
          date.push(this.stats[index].date)
          dataValue.push(this.value(this.stats[index]))
          dataRefund.push(this.refund(this.stats[index]))
        }
        this.chart = echarts.init(this.$el, 'macarons')
        this.chart.setOption(extendCommonOptions({
          tooltip: {
            trigger: 'axis',
            position: function(pt) {
              return [pt[0], '50%']
            },
            formatter(params,ticket,callback){
              let res = params[0].name
              for (let i = 0, l = params.length; i < l; i++) {
                res += '<br/>' + params[i].marker + params[i].seriesName + ' : ' + ' ¥ ' + params[i].value ;
              }
              return res
            },
            backgroundColor: 'rgba(255,255,255,1)',
            borderColor: 'rgba(255,255,255,1)',
            extraCssText: 'box-shadow: 0px 2px 9px 0px rgba(229,216,242,1);',
            textStyle: {
              color: 'rgba(51,51,51,1)'
            },
          },
          legend: {
            right: 80,
            top: 16,
            itemGap: 100,
            textStyle: {
              color: 'rgba(51,51,51,1)'
            },
            data: this.dataName
          },
          title: {
            left: 'center',
            text: this.title,
            textStyle: {
              color: '#333'
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            name: '日期',
            data: date,
            axisLine: {
              lineStyle: {
                color: '#939393',
                width: 1
              }
            }
          },
          yAxis: {
            type: 'value',
            name: this.unit,
            boundaryGap: [0, '100%'],
            axisLine: {
              lineStyle: {
                color: '#939393',
                width: 1,
                // formatter(value) {
                //   return value + "元"
                // }
              }
            },
            minInterval: 0.5
          },
          grid: {
            top: 50,
            left: 80,
            right: 80,
            bottom: 80
          },
          dataZoom: [{
            type: 'inside',
            start: 0,
            end: 100,
          }, {
            start: 0,
            end: 10,
            handleIcon: 'M472.615188 864.295385a354.500923 354.500923 0 0 1 0-704.59077V39.384615a39.384615 39.384615 0 1 1 78.76923 0v120.32a354.500923 354.500923 0 0 1 0 704.59077V984.615385a39.384615 39.384615 0 1 1-78.76923 0v-120.32z',
            handleSize: '80%',
            bottom: 20
          }],
          series: [
            {
              name: this.dataName[0],
              type: 'line',
              smooth: true,
              symbol: 'circle',
              sampling: 'average',
              itemStyle: {
                normal: {
                  color: '#9E57E9',
                  lineStyle:{
                    width:3//设置线条粗细
                  }
                }
              },
              areaStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: '#F0CBFC'
                  }, {
                    offset: 1,
                    color: '#FCF4FF'
                  }])
                }
              },
              data: dataValue
            },
            {
              name: this.dataName[1],
              type: 'line',
              smooth: true,
              symbol: 'circle',
              sampling: 'average',
              itemStyle: {
                normal: {
                  color: '#AEC2FF',
                  lineStyle:{
                    width:3//设置线条粗细
                  }
                }
              },
              areaStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: '#DCE4FF'
                  }, {
                    offset: 1,
                    color: '#F2F5FF'
                  }])
                }
              },
              data: dataRefund
            }
          ]
        }))
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '~src/styles/extend.scss';
  .echarts {
    box-shadow:0px 2px 5px 0px rgba(209,209,209,0.5);
    border:1px solid rgba(238,238,238,1);
  }

</style>
