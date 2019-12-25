<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script>
import echarts from 'echarts'
import resize from '@/components/Charts/mixins/resize'
import { extendCommonOptions } from '@/components/Charts/mixins/chartsCommon'
let chart

export default {
  mixins: [resize],
  props: {
    chartStats: {
      type: Object,
      default() {
        return {}
      }
    },
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '600px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartStats: {
      handler: function(val) {
        this.initChart()
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!chart) {
      return
    }
    chart.dispose()
    chart = null
  },
  methods: {
    initChart() {
      chart = echarts.init(document.getElementById(this.id))

      const option = {
        title: {
          text: '接听率（%）'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          formatter(params) {
            const date = params.length ? params[0].axisValue : ''
            return date + '<br />' +
              (params || []).map((data, index) => {
                return '<div style="display: inline-flex;align-items:center;width: 200px;">' + data.marker.replace('\"\>\<\/span\>', 'flex-shrink:0;\"\>\<\/span\>') +
                '<span class="ellipsis" style="display:inline-block;">' + data.seriesName + '</span>' + ': ' +
                '<span class="ellipsis" style="display:inline-block;flex-shrink: 0;">' + data.value + '</span></div>' +
                (index % 2 ? '<br />' : '<span style="display:inline-block;margin-left: 20px;"></span>')
              }).join('')
          },
          position(pos, params, dom, rect, size) {
            // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
            let obj = {}
            if (pos[1] < size.viewSize[1] / 2) {
              if (pos[1] + size.contentSize[1] > size.viewSize[1]) {
                obj.bottom = 0
              } else {
                obj.top = pos[1]
              }
            } else {
              if (size.viewSize[1] - pos[1] + size.contentSize[1] > size.viewSize[1]) {
                obj.top = 0
              } else {
                obj.bottom = size.viewSize[1] - pos[1]
              }
            }
            // obj[pos[1] < size.viewSize[1] / 2 ? 'top' : 'bottom'] = pos[1] < size.viewSize[1] / 2 ? pos[1] : size.viewSize[1] - pos[1]
            obj[pos[0] < size.viewSize[0] / 2 ? 'left' : 'right'] = pos[0] < size.viewSize[0] / 2 ? pos[0] : size.viewSize[0] - pos[0]

            if (size.contentSize[1] >= size.viewSize[1]) {
              obj.top = 0
            }

            return obj
          }
        },
        legend: {
          type: 'scroll',
          left: 120,
          right: 120,
          data: this.chartStats.legend
        },
        dataZoom: [{
          type: 'inside'
        }, {
          type: 'slider'
        }],
        grid: {
          left: '3%',
          right: '100',
          bottom: '40',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            name: '接听率（%）',
            boundaryGap: false,
            data: this.chartStats.queryTime
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: this.chartStats.series
      }

      chart.setOption(extendCommonOptions(option))
    }
  }
}
</script>
