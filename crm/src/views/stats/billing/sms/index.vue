<template>
  <div class="tab-sms">
    <div class="header-container">
      <!-- <el-select v-model="type">
        <el-option
          v-for="(value, key) in typeMap"
          :key="key"
          :label="value"
          :value="key"
        ></el-option>
      </el-select> -->
      <el-button-group>
        <el-button :class="type === 'SUM' ? 'pitch-on' : '' " @click="changeType('SUM')">费用合计</el-button>
        <el-button :class="type === 'INTENT' ? 'pitch-on' : '' " @click="changeType('INTENT')">意向短信</el-button>
        <el-button :class="type === 'SMSJOB' ? 'pitch-on' : '' " @click="changeType('SMSJOB')">短信任务</el-button>
      </el-button-group>
      <span class="title">账号：</span>
      <el-select
        v-model="userId"
        @visible-change="loadUserListOptions">
        <el-option
          v-for="(item, index) in userListOptions"
          :key="index"
          :label="item.name"
          :value="item.userId"
        ></el-option>
      </el-select>
      <span class="title">发送日期：</span>
      <el-date-picker
        v-if="timeType=='BY_DATE'"
        v-model="startEndTime"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
      <el-select
        v-if="timeType=='BY_MONTH'"
        style="width: 350px"
        v-model="monthCount">
        <el-option
          v-for="item in monthOptions"
          :key="item.key"
          :value="item.key"
          :label="item.value"
        >
        </el-option>
      </el-select>
      <div class="right" style="line-height: 32px;" >
        <el-radio-group v-model="timeType" class="mr10">
          <el-radio :label="'BY_DATE'">按日期汇总</el-radio>
          <el-radio :label="'BY_MONTH'">按月汇总</el-radio>
        </el-radio-group>
      </div>
    </div>
    <div class="chart-table-wrap">
      <number-by-date-chart
        :unit="'费用（元）'"
        :stats="smsChartData"
        :dataName="dataName">
      </number-by-date-chart>
      <div class="operation-row">
        <account-fare :accountFare="messageAccountFare" label="短信账户余额"></account-fare>
        <el-button type="primary" @click="onExportDataList">导出</el-button>
      </div>
      <el-table
        show-summary
        :summary-method="getSummariesOfSms"
        :data="smsCostInfoList">
        <el-table-column
          prop="date"
          label="日期">
          <template slot-scope="scope">
            {{parseDate(scope.row.date)}}
          </template>
        </el-table-column>
        <el-table-column
          prop="smsAmount"
          label="短信数量（条）">
        </el-table-column>
        <el-table-column
          prop="smsBillAmount"
          label="有效计费数（条）">
        </el-table-column>
        <el-table-column
          prop="smsCost"
          label="短信费(元)">
          <template slot-scope="scope">
            {{ scope.row.smsCost / 1000 }}
          </template>
        </el-table-column>
        <el-table-column
          prop="refund"
          width="">
          <template slot="header">
            <span>退费(元)</span>
            <el-tooltip placement="top" content="每天晚上12点，将统计当天短信接收的情况，如未被接收成功将退回短信费用至短信账户。">
              <i class="iconfont icon-shuomingx"></i>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            {{ scope.row.refund / 1000 }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as usersAPI from '@/api/users'
import * as statsAPI from '@/api/stats'
import NumberByDateChart from '@/components/Charts/numberByDateChart'
import moment from 'moment'
import AccountFare from '../components//accountFare'
import { mapGetters } from 'vuex'

const monthOptions = [
  { key: 3, value: '近三个月' },
  { key: 6, value: '近半年' },
  { key: 12, value: '近一年' },
  { key: null, value: '使用至今' }
]

const typeMap = {
  SUM: '费用合计',
  INTENT: '意向短信',
  SMSJOB: '短信任务'
}

export default {
  props: {
    messageAccountFare: [String, Number]
  },
  data() {
    return {
      typeMap,
      type: 'SUM',
      monthCount: 3,
      timeType: 'BY_DATE',
      startEndTime: [new Date().getTime() - 30 * 24 * 60 * 60 * 1000, new Date().getTime()],
      userId: undefined,
      userListOptions: [{
        userId: undefined,
        name: '全部账号'
      }],
      monthOptions,
      smsCostInfoList: [],
      dataName: ['短信费用','退费'],
      soFar: 0
    }
  },
  components: {
    NumberByDateChart,
    AccountFare
  },
  computed: {
    ...mapGetters(['createTime']),
    smsChartData() {
      if (this.smsCostInfoList.length === 0) {
        return
      }
      return this.smsCostInfoList.map((item) => ({
        date: item.date,
        value: item.smsCost,
        refund: item.refund
      }))
    },
    smsStatsParams() {
      if (this.timeType === 'BY_DATE') {
        return {
          type: this.type,
          startDate: moment(this.startEndTime[0]).format('YYYY-MM-DD'),
          endDate: moment(this.startEndTime[1]).format('YYYY-MM-DD'),
          userId: this.userId
        }
        
      }
      let start = this.createTime
      let end = moment().format('YYYY-MM-DD')
      this.soFar = moment(end).diff(moment(start),'month')
      return {
        type: this.type,
        monthCount: this.monthCount || this.soFar,
        userId: this.userId
      }
    }
  },
  methods: {
    async loadUserListOptions(visible) {
      if (!visible) return
      const userListOptions = (await usersAPI.getAllUserList()).data.data
      this.userListOptions = [
        ...[{
          userId: undefined,
          name: '全部账号'
        }],
        ...userListOptions
      ]
    },
    async loadSmsStats() {
      let res = undefined
      if (this.timeType === 'BY_DATE') {
        res = await statsAPI.getSmsStatsByDate({
          ...this.smsStatsParams
        })
      } else {
        res = await statsAPI.getSmsStatsByMonth({
          ...this.smsStatsParams
        })
      }
      this.smsCostInfoList = res.data.data
    },
    async onExportDataList() {
      let res = undefined
      if (this.timeType === 'BY_DATE') {
        res = await statsAPI.exportSmsStatsByDate({
          ...this.smsStatsParams
        })
      } else {
        res = await statsAPI.exportSmsStatsByMonth({
          ...this.smsStatsParams
        })
      }
      if (res.data.code === 200) {
        this.$message.success('操作成功！详细结果请在导入导出列表查看')
        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        return
      }
      this.$message({
        message: '导出失败',
        type: 'error'
      })
    },
    getSummariesOfSms(param) {
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
        if (index === 3) {
          sums[index] = (sums[index] / 1000).toFixed(3)
        }
        else if (index === 4) {
          sums[index] = (sums[index] / 1000).toFixed(4)
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
    },
    changeType(value) {
      this.type = value
    }
  },
  mounted() {
    this.loadSmsStats()
  },
  watch: {
    smsStatsParams: {
      handler: function() {
        this.loadSmsStats()
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
  > .title {
    margin-left: 41px;
  }
 }
  .el-radio {
    margin-right: 60px!important;
  }
  .el-select {
    width: 180px!important;
  }
.chart-table-wrap {
  padding: 10px;
}
.operation-row {
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  > .el-button {
    width: 74px;
  }
}
.el-date-editor.el-input, .el-date-editor.el-input__inner {
  width: 220px!important;
}
.pitch-on {
  background-color: #1890FF;
  border-color: #1890FF;
  color: #FFFFFF;
}
.iconfont {
  font-size: 13px;
}
</style>
