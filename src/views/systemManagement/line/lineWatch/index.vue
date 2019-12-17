<template>
  <div class="tab-sms">
    <div class="header-container">
      <!-- <div class="" style="line-height: 32px;" > -->
        <el-date-picker
          class=""
          v-model="startEndTime"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="refresh">
        </el-date-picker>
      <!-- </div> -->
      <el-radio-group class="ml15" v-model="type" @change="handleTypeChange">
        <el-radio
          v-for="(v, k) in typeMap"
          :key="k"
          :label="k"
        >{{v}}</el-radio>
      </el-radio-group>
    </div>
    <div class="chart-table-wrap">
      <number-by-date-chart
        :chartStats="chartStats">
      </number-by-date-chart>
    </div>
  </div>
</template>

<script>
import { listLineStatus } from '@/api/linestatus'
import NumberByDateChart from './numberByDateChart'
import moment from 'moment'

const typeMap = {
  SUM: '接听率',
  INTENT: '拒接率',
  SMSJOB: '畅通率'
}

export default {
  data() {
    return {
      typeMap,
      type: 'SUM',
      monthCount: 3,
      startEndTime: [new Date().getTime() - 7 * 24 * 60 * 60 * 1000, new Date().getTime()],
      userId: undefined,
      smsCostInfoList: [],
      chartStats: {}
    }
  },
  components: {
    NumberByDateChart
  },
  methods: {
    requestConcurrencySumUp() {
      listLineStatus({
        startDate: moment(this.startEndTime[0]).format('YYYY-MM-DD'),
        endDate: moment(this.startEndTime[1]).format('YYYY-MM-DD')
      }).then(({ data }) => {
        this.initChartStats(data.data)
      })
    },
    initChartStats(list) {
      const temp = {
        legend: [],
        queryTime: [],
        series: []
      }

      for (const i in list) {
        temp.legend.push(list[i].phoneNumberName)
        temp.series.push({
          name: list[i].phoneNumberName,
          type: 'line',
          data: list[i].lineStatsPhoneNumberBOList.map(item => item[{
            SUM: 'answeredCallRate',
            INTENT: 'refusedCallRate',
            SMSJOB: 'unimpededCallRate'
          }[this.type]])
        })

        temp.queryTime = list[0].lineStatsPhoneNumberBOList.map(item => item.localDate)
      }

      this.chartStats = temp
    },
    refresh() {
      if (this.startEndTime[1] - this.startEndTime[0] > 30 * 24 * 60 * 60 * 1000) {
        this.$message.error('查询时长不能超过30天')
        return
      }

      this.requestConcurrencySumUp()
    },
    handleTypeChange() {
      this.requestConcurrencySumUp()
    }
  },
  mounted() {
    this.requestConcurrencySumUp()
  }
  // ,
  // watch: {
  //   smsStatsParams: {
  //     handler: function() {
  //       this.loadSmsStats()
  //     }
  //   },
  //   deep: true
  // }
}
</script>

<style lang="scss" scoped>
.header-container {
  box-sizing: border-box;
  padding: 5px 15px;
  background: #fff;
}
.chart-table-wrap {
  padding: 10px;
}
.operation-row {
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;  
}
</style>
