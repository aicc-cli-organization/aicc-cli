<template>
  <div :style="{ height,width }"></div>
</template>

<script>
  import echarts from 'echarts'
  import { getFollowStatusStats } from '@/api/stats'
  require('echarts/theme/macarons') // echarts theme
  import { extendCommonOptions } from '@/components/Charts/mixins/chartsCommon'
  import { followStatusENUM } from '@/utils/constant'
  import { mapGetters } from 'vuex'

  export default {
    data() {
      return {
        chartList: [],
        followStatusENUM
      }
    },
    props: {
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '360px'
      },
      innerRadius: {
        type: String
      },
      outerRadius: {
        type: String
      }
    },
    computed: {
      ...mapGetters(['customerStr'])
    },
    methods: {
      getFollowStatusStats() {
        getFollowStatusStats().then(({ data }) => {
          const temp = {
            xData: [],
            yData: []
          }
          for (const i in data.data) {
            temp.xData.push(followStatusENUM[data.data[i].followStatus])
            temp.yData.push(data.data[i].count)
          }
          this.chartList = temp
        })
      },
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.chart.setOption(extendCommonOptions({
          backgroundColor: '#fff',
          xAxis: {
            name: '跟进状态',
            type: 'category',
            data: this.chartList.xData,
            axisLabel: {
              interval: 0,
              rotate: -30
            }
          },
          grid: {
            y2: 100
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
            name: `${this.customerStr}数量（位）`
          },
          series: [{
            data: this.chartList.yData,
            type: 'bar',
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: 'top',
                  textStyle: {
                    fontSize: 16
                  }
                }
              }
            }
          }]
        }), true)
      }
    },
    watch: {
      chartList() {
        this.initChart()
      }
    },
    mounted() {
      this.getFollowStatusStats()
      this.initChart()
    }
  }
</script>
