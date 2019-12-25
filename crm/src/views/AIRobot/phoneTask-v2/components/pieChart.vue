<template>
  <div :style="{ height,width }"></div>
</template>

<script>
  import echarts from 'echarts'
  import * as constant from '@/utils/constant'
  import { extendCommonOptions } from '@/components/Charts/mixins/chartsCommon'
  require('echarts/theme/macarons') // echarts theme
  
  export default {
    props: {
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '100%'
      },
      chartList: {
        type: Array,
        default() {
          return []
        }
      },
      innerRadius: {
        type: String
      },
      outerRadius: {
        type: String
      }
    },
    methods: {
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.chart.setOption(extendCommonOptions({
          tooltip: {
            trigger: 'item',
            formatter: ''
          },
          calculable: true,
          series: [
            {
              type: 'pie',
              radius: [this.innerRadius, this.outerRadius],
              center: ['50%', '50%'],
              color: this.chartList.map(item => item.color),
              label: {
                normal: {
                  show: false,
                  position: 'center'
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              avoidLabelOverlap: false,
              data: this.chartList,
              animationEasing: 'cubicInOut',
              animationDuration: 2600
            }
          ]
        }), true)
      }
    },
    watch: {
      chartList() {
        this.initChart()
      }
    },
    mounted() {
      this.initChart()
    }
  }
</script>
