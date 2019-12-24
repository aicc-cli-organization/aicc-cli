<!--
  词云 客户关注点
-->
<template>
  <div :style="{ height, width }"></div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
require('echarts-wordcloud')
import { extendCommonOptions } from '@/components/Charts/mixins/chartsCommon'
import { debounce } from '@/utils'
import { mapGetters } from 'vuex'

export default {
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '220px'
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
      stats: []
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
  },
  watch: {
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
        this.$nextTick(() => {
          this.chart.resize()
        })
      }
    }
  },
  mounted() {
    this.initChart()
    this.chart.on('click', (event) => {
      this.$store.commit('UPDATE_TASK_TAB', 'called')
      this.$store.commit('UPDATE_OVERVIEW_JUMP_CALLED_WITH_CUSTOMER_CONCERN', event.data.name)
    })
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
          sizeRange: [12, 30],
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
.chart{
  background: #fff !important;
}
.el-card {
  background: white !important;
}
</style>
