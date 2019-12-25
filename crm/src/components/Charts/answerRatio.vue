<template>
  <div :class="className" :style="{height:height,width:width}"></div>
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import { extendCommonOptions } from './mixins/chartsCommon'
import { debounce } from "@/utils";

export default {
  props: {
    className: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "calc(100vw - 165px - 264px - 20px - 50px)"
    },
    height: {
      type: String,
      default: "500px"
    },
    stats: {
      type: Object,
      default() {
        return {};
      }
    },
    seriesType: {
      type: String,
      default: "line"
    }
  },
  data() {
    return {
      chart: null,
      chartStats: {}
    };
  },
  watch: {
    stats: {
      handler: function(val) {
        const answeredTaskRateList = val.answeredTaskRateList
        const date = answeredTaskRateList.map(item => item.date)
        const ratio = answeredTaskRateList.map(item => item.val)

        this.chartStats = {
          date,
          ratio
        };
        this.initChart();
      },
      deep: true
    }
  },
  mounted() {
    this.__resizeHanlder = debounce(() => {
      if (this.chart) {
        this.chart.resize();
      }
    }, 100);
    window.addEventListener("resize", this.__resizeHanlder);
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    window.removeEventListener("resize", this.__resizeHanlder);
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      var colors = ["#5793f3", "#d14a61", "#675bba"];
      this.chart = echarts.init(this.$el, "macarons");

      const option = {
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: ["接听率"]
        },
        calculable: true,
        xAxis: [
          {
            name: '日期',
            type: "category",
            data: this.chartStats.date
          }
        ],
        yAxis: [
          {
            name: '接听率（%）',
            type: "value"
          }
        ],
        series: [
          {
            name: "接听率",
            type: "bar",
            data: this.chartStats.ratio,
            markLine: {
              data: [{ type: "average", name: "平均值" }]
            }
          }
        ]
      }

      this.chart.setOption(extendCommonOptions(option));
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.chart {
  background: #fff !important;
}
.el-card {
  background: white !important;
}
</style>
