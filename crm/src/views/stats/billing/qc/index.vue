<template>
  <div class="tab-sms">
    <div class="header-container">
      <el-select
        v-model="qcJobId"
        @visible-change="loadQcJobList"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="(item, index) in qcJobList"
          :key="index"
          :label="item.jobName"
          :value="item.qcJobId"
        ></el-option>
      </el-select>
      <day-month-filter
        class="day-month-filter"
        :timeType.sync="timeType"
        :monthCount.sync="monthCount"
        :startEndTime.sync="startEndTime"
      ></day-month-filter>
    </div>
    <div class="chart-table-wrap">
      <el-tabs>
        <el-tab-pane label="通话数">
          <bar-category-stack-by-time :stats="qcStats.count" unit="通"></bar-category-stack-by-time>
        </el-tab-pane>
        <el-tab-pane label="质检时长" lazy>
          <bar-category-stack-by-time :stats="qcStats.chatDuration" unit=分钟></bar-category-stack-by-time>
        </el-tab-pane>
        <el-tab-pane label="质检费用" lazy>
          <bar-category-stack-by-time :stats="qcStats.cost" unit="元"></bar-category-stack-by-time>
        </el-tab-pane>
      </el-tabs>
      <div class="operation-row">
        <account-fare :accountFare="qcAccountFare" label="账户余额"/>
      </div>
      <el-table
        show-summary
        :summary-method="getSummaries"
        :data="qcCostInfoList">
        <el-table-column prop="date" label="时间"></el-table-column>
        <el-table-column prop="qcJobName" label="任务名"></el-table-column>
        <el-table-column prop="chatDuration" label="质检时长(分钟)">
          <template slot-scope="{ row }">{{Number.isInteger(row.chatDuration / 60) ? row.chatDuration : (row.chatDuration / 60).toFixed(1)}}</template>
        </el-table-column>
        <el-table-column prop="cost" label="金额(元)">
          <template slot-scope="{ row }">{{ row.cost / 1000 }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as statsAPI from '@/api/stats'
import * as qcAPI from '@/api/qualityTest'
import NumberByDateChart from '@/components/Charts/numberByDateChart'
import barCategoryStackByTime from '@/components/Charts/barCategoryStackByTime'
import moment from 'moment'
import DayMonthFilter from '../components/dayMonthFilter'
import AccountFare from '../components/accountFare'

export default {
  props: {
    qcAccountFare: [String, Number]
  },
  data() {
    return {
      startEndTime: [new Date().getTime() - 30 * 24 * 60 * 60 * 1000, new Date().getTime()],
      timeType: 'BY_DATE',
      monthCount: 3,
      qcJobId: undefined,
      qcJobList: [{
        qcJobId: undefined,
        jobName: '全部任务'
      }],
      qcStats: {
        count: {},
        chatDuration: {},
        cost: {}
      },
      qcCostInfoList: []
    }
  },
  components: {
    NumberByDateChart,
    DayMonthFilter,
    barCategoryStackByTime,
    AccountFare
  },
  computed: {
    qcStatsParams() {
      if (this.timeType === 'BY_DATE') {
        return {
          startDate: moment(this.startEndTime[0]).format('YYYY-MM-DD'),
          endDate: moment(this.startEndTime[1]).format('YYYY-MM-DD'),
          qcJobId: this.qcJobId
        }
      }
      return {
        monthCount: this.monthCount,
        qcJobId: this.userId
      }
    }
  },
  methods: {
    async loadQcJobList(visible) {
      if (!visible) return
      const qcJobList = (await qcAPI.getQCTaskList({
        pageNum: 1,
        pageSize: 999
      })).data.data.content
      this.qcJobList = [
        ...[{
          qcJobId: undefined,
          jobName: '全部任务'
        }],
        ...qcJobList
      ]
    },
    async loadQcStats() {
      let res = undefined
      let tableRes = undefined
      if (this.timeType === 'BY_DATE') {
        res = await statsAPI.getQcStatsByDay({
          ...this.qcStatsParams
        })
        tableRes = await statsAPI.getQcTableByDay(this.qcStatsParams)
      } else {
        res = await statsAPI.getQcStatsByMonth({
          ...this.qcStatsParams
        })
        tableRes = await statsAPI.getQcTableByMonth(this.qcStatsParams)
      }
      this.qcCostInfoList = tableRes.data.data
      const resData = res.data.data
      const legendSet = new Set() // 任务list
      const date = [] // 日期list
      const countData = []
      const durationData = []
      const costData = []
      for (let key in resData) {
        resData[key].forEach(item => {
          legendSet.add(item.qcJobName)
        })
        date.push(key)
      }
      const legend = Array.from(legendSet)
      legend.forEach(item => {
        const name = item
        const tmpCountData = []
        const tmpDurationData = []
        const tmpCostData = []
        date.forEach(dateItem => {
          const theItem = resData[dateItem].find(resItem => resItem.qcJobName === name)
          tmpCountData.push(theItem ? theItem.successCount + theItem.failCount : 0)
          tmpDurationData.push(theItem ? (Number.isInteger(theItem.chatDuration / 60) ? theItem.chatDuration / 60 : (theItem.chatDuration / 60).toFixed(1) ) : 0)
          tmpCostData.push(theItem ? Number.isInteger(theItem.cost / 1000) ? theItem.cost / 1000 : (theItem.cost / 1000).toFixed(1) : 0)
        })
        countData.push({
          name,
          data: tmpCountData
        })
        durationData.push({
          name,
          data: tmpDurationData
        })
        costData.push({
          name,
          data: tmpCostData
        })
      })
      this.qcStats = {
        count: {
          date,
          legend,
          data: countData
        },
        chatDuration: {
          date,
          legend,
          data: durationData
        },
        cost: {
          date,
          legend,
          data: costData
        }
      }
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
          sums[index] += ''
        } else {
          sums[index] = '--'
        }
        if (index === 2) {
          sums[index] = Number.isInteger(sums[index] / 60) ? sums[index] / 60 : (sums[index] / 60).toFixed(1)
        }
        if (index === 3) {
          sums[index] = sums[index] / 1000
        }
      })
      return sums
    },
    parseDate(date) {
      if (this.timeType === 'BY_MONTH') {
        return moment(date).format('YYYY-MM')
      } else {
        return date
      }
    }
  },
  mounted() {
    this.loadQcStats()
  },
  watch: {
    qcStatsParams: {
      handler: function() {
        this.loadQcStats()
      }
    },
    deep: true
  }
}
</script>

<style lang="scss" scoped>
.header-container {
  box-sizing: border-box;
  padding: 5px 15px;
  background: #fff;
  .day-month-filter {
    float: right;
    line-height: 32px;
  }
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
