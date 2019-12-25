<!--
  词云 客户关注点
-->
<template>
    <div :class="{large: area=='LARGE', normal: area=='NORMAL'}" :style="{height:height,width:width}"></div>
</template>

<script src="http://echarts.baidu.com/build/dist/echarts.js"></script>
<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
require('echarts-wordcloud')
import { extendCommonOptions } from './mixins/chartsCommon'
import { debounce } from '@/utils'
import { mapGetters } from 'vuex'

export default {
  props: {
    area: {
      type: String,
      default: 'NORMAL'
    },
    width: {
      type: String,
      default: '100%'
    },
    customerConcern: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      chart: null,
      stats: [],
      height: '210px'
    }
  },
  computed: {
    ...mapGetters(['customerStr']),
  },
  watch: {
    area: {
      handler: function(val) {
        if (val === 'LARGE') {
          this.height = '210px'
        } else {
          this.height = '130px'
        }
        this.$nextTick(() => {
          this.chart.resize()
        })
      }
    },
    customerConcern: {
      handler: function(val) {
        this.stats = []
        for (const item in val) {
          this.stats.push({
            name: item,
            value: val[item]
          })
        }
        if (this.stats.length === 0) {
          this.stats.push({
            name: `暂无${this.customerStr}关注点`,
            value: '0'
          })
        }
        this.initChart()
      }
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
      this.chart = echarts.init(this.$el, 'macarons')
      const option = {
        tooltip: {},
        series: [{
          type: 'wordCloud',
          gridSize: 20,
          sizeRange: [12, 50],
          rotationRange: [0, 0],
          shape: 'circle',
          textStyle: {
            normal: {
              color: function() {
                return 'rgb(' + [
                  Math.round(Math.random() * 160),
                  Math.round(Math.random() * 160),
                  Math.round(Math.random() * 160)
                ].join(',') + ')'
              }
            },
            emphasis: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          data: this.stats
        }]
      }
      this.chart.setOption(extendCommonOptions(option), true)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.normal {
  height: 140px;
}
.large {
  height: 259px;
}
.chart{
  background: #fff !important;
}
.el-card {
  background: white !important;
}
</style>
