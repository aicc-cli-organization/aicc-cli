<!--
  首页饼状图
-->
<template>
    <div :class="className" :style="{height:height,width:width}"></div>
</template>

<script>
import echarts from 'echarts'
import { extendCommonOptions } from './mixins/chartsCommon'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'
import { mapGetters } from 'vuex'

export default {
  props: {
    intentLevel: {
      type: Object,
      default() {
        return {}
      }
    },
    intentLevelTagDetailList: {
      type: Array,
      defualt() {
        return []
      }
    },
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
      default: '520px'
    }
  },
  data() {
    return {
      chart: null,
      data: [],
      seriesData: []
    }
  },
  computed: {
    ...mapGetters(['customerStr']),
  },
  watch: {
    intentLevel: {
      handler: function(val) {
        this.$nextTick(() => {
          this.initChart()
        })
      },
      deep: true
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
    initChart() {
      this.data = []
      this.seriesData = []
      const obj = {}
      for (const i in this.intentLevelTagDetailList) {
        obj[this.intentLevelTagDetailList[i].code] = this.intentLevelTagDetailList[i].name
      }
      for (var key in this.intentLevel) {
        this.data.push(key)
        this.seriesData.push({ value: this.intentLevel[key], name: obj[key] })
      }
      this.chart = echarts.init(this.$el, 'macarons')
      const IntentTagNameArray = this.intentLevelTagDetailList.map(item => item.name)
      this.chart.setOption(extendCommonOptions({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        title: {
          left: '15',
          top: '15',
          textStyle: {
            fontSize: '16',
            color: '#333',
            fontWeight: '777'
          },
          text: `${this.customerStr}意向分级`
        },
        legend: {
          orient: 'vertical',
          itemGap: 40,
          right: '20',
          top: '35',
          data: IntentTagNameArray,
          textStyle: {
            fontSize: 12
          }
        },
        calculable: true,
        series: [
          {
            name: '意向等级',
            type: 'pie',
            roseType: 'radius',
            radius: [25, 100],
            center: ['40%', '50%'],
            color: ['#c382fb', '#2dd4fe', '#7ae3c6', '#ffaf11', '#ffd859', '#ff7878'],
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
              }
            },
            data: this.seriesData,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      }), true)
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
