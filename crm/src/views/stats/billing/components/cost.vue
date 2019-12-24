<template>
  <div class="cost-container">
    <div class="header-container">
      <el-select v-model="type"
        class="ml15 mr5"
        @change="handleTypeChange"
        :disabled="!hasAccess('crm_cusSeat_view')"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.key"
          :value="item.key"
          :label="item.value"
        ></el-option>
      </el-select>
      <el-select
        v-if="type === 0"
        class="mr5"
        placeholder="请输入关键词搜索任务"
        v-model="robotCallTaskId"
        @change="taskIdChange"
        filterable
        remote
        clearable
        :loading="selectLoading"
        :remote-method="remoteMethod"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in taskList"
          :key="item.robotCallTaskId"
          :value="item.robotCallTaskId"
          :label="item.robotCallTaskName"
        >
        </el-option>
      </el-select>
      <el-tooltip effect="dark" placement="top-start">   
        <div slot="content">已删除的任务，将无法进行筛选计费。</div>
        <i class="el-icon-question icon-tip"></i>
      </el-tooltip>
      <el-select
        v-if="activeName!='fourth'"
        class="mr5"
        filterable
        v-model="phoneNumberId"
        @change="numberIdChange"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in numberList"
          :key="item.phoneNumberId"
          :value="item.phoneNumberId"
          :label="item.phoneName || item.phoneNumber"
        >
          <span style="float: left">{{(item.phoneName || item.phoneNumber)}}
            <el-tag v-if="item.phoneName !== '全部线路' && item.enabledStatus">有效</el-tag>
            <el-tag v-if="item.phoneName !== '全部线路' && !item.enabledStatus" type="danger">解绑</el-tag>
          </span>
        </el-option>
      </el-select>
      <el-select
        v-if="activeName!='fourth' && [0, 1].includes(type)"
        placeholder="选择类型"
        @change="search"
        v-model="local"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in localOptions"
          :key="item.key"
          :value="item.key"
          :label="item.value"
        >
        </el-option>
      </el-select>
      <el-select
        v-if="activeName!='fourth' && [2, 3].includes(type)"
        placeholder="选择类型"
        @change="search"
        v-model="callInCostType"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in localOptions1"
          :key="item.key"
          :value="item.key"
          :label="item.value"
        >
        </el-option>
      </el-select>

      <div style="line-height: 32px;margin-left:20px;margin-top:15px" >
        <el-radio-group v-model="timeType" class="mr10">
          <el-radio :label="'BY_DATE'">按日期汇总</el-radio>
          <el-radio :label="'BY_MONTH'">按月汇总</el-radio>
        </el-radio-group>
        <yiwise-date-picker
          v-if="timeType=='BY_DATE'"
          v-model="startEndTime"
          type="daterange"
          ref="elDatePicker"
          style="width: 350px"
          align="right"
          :getData="getStats"
          :setHasData="setHasData"
        />
        <el-select
          v-if="timeType=='BY_MONTH'"
          @change="search"
          style="width: 350px"
          v-model="monthCount"
        >
          <el-option
            v-for="item in monthOptions"
            :key="item.key"
            :value="item.key"
            :label="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>

    <el-tabs v-model="activeName">
      <el-tab-pane label="拨通数" name="first" lazy>
        <bar-category-stack-by-time
          :unit="'拨通次数（通）'"
          :stats = stats.answeredCallList
        >
        </bar-category-stack-by-time>

      </el-tab-pane>
      <el-tab-pane label="计费时长" name="second" lazy>
        <bar-category-stack-by-time
          :stats = stats.billChatTimeList
          :unit ="'计费时长（分钟）'"
        ></bar-category-stack-by-time>
      </el-tab-pane>
      <el-tab-pane label="话费" name="third" lazy>
        <bar-category-stack-by-time
          :stats = stats.callCostList
          :unit="'话费（元）'"
        ></bar-category-stack-by-time>
      </el-tab-pane>
      <!-- <el-tab-pane label="短信费" name="fourth"  v-if="type==0 && !isLocal" lazy>
        <number-by-date-chart
            :title="'短信费（元）'"
            :unit="'元'"
            :stats="smsData"></number-by-date-chart>
      </el-tab-pane> -->
    </el-tabs>
    <b class="ml15 f18 fs">
      账户余额：
      <span class="ib" v-for="(item, index) in accountFareList"
        :key="index">
        线路{{item.phoneName ? '-' + item.phoneName : ''}}{{item.phoneNumber ? '-' + item.phoneNumber : ''}}：{{item.phoneNumberAccountFare / 1000}}元
      </span>
      <!-- <template v-if="!isLocal">短信：<span class="ib">{{balance.messageAccountFare / 1000}}元</span></template> -->
    </b>
    <el-button type="primary" class="mt15 ml15" @click="exportStats()" v-if="hasAccess('crm_statisticsBill_export')" style="display:block">导出以下数据列表</el-button>
    <el-tabs class="mt15" v-model="callOrSms">
      <el-tab-pane label="通话费用" name="CALL">
        <el-table
        show-summary
        :summary-method="getSummariesOfCall"
        :data="stats.callCostStatsPhoneNumberList">
          <el-table-column
            prop="localDate"
            label="时间">
            <template slot-scope="scope">
              {{parseDate(scope.row.localDate)}}
            </template>
          </el-table-column>
          <el-table-column
            prop="phoneNumberName"
            label="线路">
            <template slot-scope="scope">
              <span>{{(scope.row.phoneNumberName ? scope.row.phoneNumberName + '-' : '') + scope.row.phoneNumber}}</span>
              <el-tag v-if="scope.row.tenantPhoneNumberStatus==0" type="danger">解绑</el-tag>
              <el-tag v-if="scope.row.tenantPhoneNumberStatus==1">有效</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="local"
            label="类型">
            <template slot-scope="scope">
              {{ getType(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="answeredCall"
            label="接通数（通）">
          </el-table-column>
          <el-table-column
            prop="billChatTimeList"
            label="计费时长（分钟）">
          </el-table-column>
          <el-table-column
            prop="callCostList"
            label="话费（元）">
            <template slot-scope="scope">
              {{ scope.row.callCostList / 1000 }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- <el-tab-pane label="短信费用" name="SMS" v-if="type==0 && !isLocal">
        <el-table
        show-summary
        :summary-method="getSummariesOfSms"
        :data="stats.smsCostInfoList">
          <el-table-column
            fixed
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
        </el-table>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import * as statsAPI from '@/api/stats'
import * as taskAPI from '@/api/task'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { YiwiseDatePicker } from 'yiwise-components'
import NumberByDateChart from '@/components/Charts/numberByDateChart'
import barCategoryStackByTime from '@/components/Charts/barCategoryStackByTime'
import * as numberpoolAPI from '@/api/numberpool'

export default {
  name: 'cost',
  components: {
    barCategoryStackByTime,
    NumberByDateChart,
    YiwiseDatePicker
  },
  data() {
    return {
      selectLoading: false,
      balance: {},
      accountFareList: [],
      callOrSms: 'CALL',
      activeName: 'first',
      phoneNumberId: '',
      robotCallTaskId: '',
      timeType: 'BY_DATE',
      stats: {
        answeredCallList: {},
        billChatTimeList: {},
        callCostList: {},
        smsCostList: [],

        smsCostInfoList: [],
        callCostStatsPhoneNumberList: []
      },
      monthCount: 3,
      monthOptions: [
        { key: 3, value: '近三个月' },
        { key: 6, value: '近半年' },
        { key: 12, value: '近一年' },
        { key: null, value: '使用至今' }
      ],
      local: null,
      callInCostType: undefined,
      type: 0,
      localOptions: [
        {
          key: null,
          value: '全部类型'
        }, {
          key: true,
          value: '外呼本地'
        }, {
          key: false,
          value: '外呼外地'
        }
      ],
      localOptions1: [
        {
          key: null,
          value: '全部类型'
        }, {
          key: 'LOCAL_CALL_BILL',
          value: '呼入本地'
        }, {
          key: 'OTHER_CALL_BILL',
          value: '呼入外地'
        }, {
          key: 'LINE_MONTHLY_BILL',
          value: '呼入月租'
        }
      ],
      numberList: [],
      taskList: [{
        robotCallTaskName: '全部任务',
        robotCallTaskId: ''
      }],
      startEndTime: [new Date().getTime() - 30 * 24 * 60 * 60 * 1000, new Date().getTime()]
    }
  },
  mounted() {
    this.remoteMethod()
    this.requestStats()
    this.getNumberPoolList()
    this.getTenantAccountFare()
  },
  computed: {
    ...mapGetters([
      'isLocal',
      'enableCsSeat',
      'userEnableCsSeat',
      'enableIvr'
    ]),
    typeOptions() {
      const options = [
        {
          key: 0,
          value: 'AI外呼'
        },
        {
          key: 2,
          value: 'AI接待'
        },
        {
          key: 3,
          value: '人工接待'
        }
      ]

      if (this.enableCsSeat || this.userEnableCsSeat) {
        options.splice(1, 0, {
          key: 1,
          value: '人工外呼'
        })
      }

      if (this.enableIvr) {
        options.push({
          key: 4,
          value: 'IVR接待'
        })
      }

      return options
    },
    smsData() {
      if (this.stats.smsCostInfoList.length === 0) {
        return
      }
      const temp = this.stats.smsCostInfoList.map((item) => {
        return {
          date: item.date,
          value: item.smsCost
        }
      })
      return temp
    },
    dateParams() {
      if (this.timeType === 'BY_DATE') {
        return {
          local: this.local,
          type: this.type,
          robotCallTaskId: this.robotCallTaskId,
          phoneNumberId: this.phoneNumberId,
          startDate: moment(this.startEndTime[0]).format('YYYY-MM-DD'),
          endDate: moment(this.startEndTime[1]).format('YYYY-MM-DD'),
          callInCostType: this.callInCostType
        }
      } else {
        return {
          monthCount: this.monthCount,
          type: this.type,
          local: this.local,
          robotCallTaskId: this.robotCallTaskId,
          phoneNumberId: this.phoneNumberId
        }
      }
    },
  },
  watch: {
    startEndTime: {
      handler: function(val) {
        this.$nextTick(() => {
          this.requestStats()
        })
      }
    },
    timeType: {
      handler: function(val) {
        this.$nextTick(() => {
          this.requestStats()
        })
      }
    },
    monthCount: {
      handler: function(val) {
        this.$nextTick(() => {
          this.requestStats()
        })
      }
    },
    stats: {
      handler: function(val) {
        this.initData(val, 'answeredCallList', 'answeredCall')
        this.initData(val, 'callCostList', 'callCostList')
        this.initData(val, 'billChatTimeList', 'billChatTimeList')
      }
    },
    phoneNumberId: {
      handler: function(val) {
        if(val) {
          const accountFareList = this.balance.phoneNumberAccountFareList.filter(item => item.phoneNumberId === val)
          this.accountFareList = accountFareList
        }else {
          this.accountFareList = this.balance.phoneNumberAccountFareList
        }
      }
    },
    dateParams() {
      this.$refs.elDatePicker.reset()
    }
  },
  methods: {
    async remoteMethod(name) {
        this.selectLoading = true;
        const { content: taskList, totalElements } = (await taskAPI.getRobotCallJobList({
          name
        })).data.data
        if(taskList.length > 0) {
          let list = taskList.map(item => {
            return {
              robotCallTaskName: item.name,
              robotCallTaskId: item.robotCallJobId
            }
          })

          this.taskList = [{
            robotCallTaskName: '全部任务',
            robotCallTaskId: ''
          },...list]
        }else {
          this.taskList = [{
            robotCallTaskName: '全部任务',
            robotCallTaskId: ''
          }]
        }
        this.selectLoading = false
    },
    getType(row) {
      if (row.costType) {
        return (this.localOptions1.find(item => item.key === row.costType) || {}).value || ''
      } else {
        return row.local ? '外呼本地' : '外呼外地'
      }
    },
    handleTypeChange(v) {
      this.phoneNumberId = ''
      if(![0].includes(v)) {
        this.robotCallTaskId = ''
      }else {
        this.remoteMethod()
      }
      if ([2, 3].includes(v)) {
        this.local = undefined
      } else {
        this.callInCostType = undefined
      }
      this.search()
    },
    taskIdChange(v) {
      if(v === '') {
        this.phoneNumberId = ''
      }
      this.search()
    },
    numberIdChange(v) {
      this.search()
    },
    getTenantAccountFare() {
      try {
        statsAPI.getTenantAccountFare().then(({ data }) => {
          this.balance = data.data
          this.accountFareList = data.data.phoneNumberAccountFareList
        })
      } catch (e) {
        console.log(e)
      }
    },
    initStats() {
      this.stats = {
        answeredCallList: {},
        billChatTimeList: {},
        callCostList: {},
        smsCostList: [],

        smsCostInfoList: [],
        callCostStatsPhoneNumberList: []
      }
    },
    parseDate(date) {
      if (this.timeType === 'BY_MONTH') {
        return moment(date).format('YYYY-MM')
      } else {
        return date
      }
    },
    getNumberPoolList() {
      numberpoolAPI.getTenantPhoneNumberList().then(({ data }) => {
        this.numberList = data.data
        this.numberList = [{
          phoneNumberId: '',
          phoneName: '全部线路'
        }, ...this.numberList]
      })
    },
    async setHasData(hasD, statsData) {
      statsData.callCostStatsPhoneNumberList.forEach(item => {
        hasD[item.localDate] = true
      })
      for(const date in statsData.callCostStatsPhoneNumberChat) {
        const data = statsData.callCostStatsPhoneNumberChat[date]
        hasD[date] = hasD[date] ||
          (
            data && data.length &&
            data.filter(d => data.answeredCall || data.callCostList || data.billChatTimeList).length
          )
      }
    },
    search() {
      this.$nextTick(() => {
        this.requestStats()
      })
    },
    async getStats(params) {
      const newParams = {
        ...this.dateParams,
        ...params
      }
      const FunName = this.timeType === 'BY_DATE' ? 'costChartStats' : 'costChartStatsByMonoth'
      const { data } = await statsAPI[FunName](newParams)
      return data.data
    },
    async requestStats(params) {
      this.initStats()

      this.stats = await this.getStats(params)
    },
    getDifferentItem(array, item) {
      if (array.includes(item)) {
        return this.getDifferentItem(array, item + ' ')
      } else {
        return item
      }
    },
    getLegendItem(data, phoneName, phoneNumber, local) {
      const getType = key => {
        const d = this.localOptions1.find(item => item.key === key) || {}
        return d.value || ''
      }

      return data.phoneType === 'MOBILE'
        ? '' + phoneName + '-' + phoneNumber + '-' + (typeof data.costType !== 'undefined' ? getType(data.costType) : local ? '外呼本地' : '外呼外地')
        : '' + phoneNumber + '-' + (typeof data.costType !== 'undefined' ? getType(data.costType) : local ? '外呼本地' : '外呼外地')
    },
    initData(stats, listName, attr) {
      const list = {
        date: [],
        legend: [],
        data: []
      }
      const legendItemId = []
      // list.legend
      for (const item in stats.totalPhoneNumberLocal) {
        const _data = stats.totalPhoneNumberLocal[item]
        const phoneName = stats.totalPhoneNumberLocal[item].phoneNumberName || ''
        const phoneNumber = stats.totalPhoneNumberLocal[item].phoneNumber || ''
        const local = stats.totalPhoneNumberLocal[item].local
        var legendItem = this.getLegendItem(_data, phoneName, phoneNumber, local)
        legendItemId.push(stats.totalPhoneNumberLocal[item])
        list.legend.push(this.getDifferentItem(list.legend, legendItem))
      }
      // answeredCAllList.date
      for (const item in stats.callCostStatsPhoneNumberChat) {
        list.date.push(item)
      }
      // answeredCAllList.data
      for (const item in list.legend) {
        const legendLine = stats.totalPhoneNumberLocal[item]
        const temp = {
          name: list.legend[item],
          data: []
        }
        for (var day in stats.callCostStatsPhoneNumberChat) {
          const dayStats = stats.callCostStatsPhoneNumberChat[day]
          const matchedLine = (dayStats || []).filter(line => {
            return line.phoneNumberId === legendLine.phoneNumberId &&
            line.local === legendLine.local
          })
          if (matchedLine.length === 0) {
            temp.data.push(0)
          } else {
            temp.data.push(matchedLine[0][attr])
          }
        }
        list.data.push(temp)
      }
      if (this.timeType === 'BY_MONTH') {
        list.date = list.date.map((item) => {
          return moment(item).format('YYYY-MM')
        })
      }
      
      this.stats[listName] = list
      if(listName === 'answeredCallList' && this.robotCallTaskId) {  //选择单个任务
        const name = this.stats.answeredCallList.data[0] && this.stats.answeredCallList.data[0].name.split('-')[0]
        const list = this.numberList.filter(item => item.phoneNumber === name || item.phoneName === name)
        if(list.length) {
          this.phoneNumberId = list[0].phoneNumberId
        }
      }
    },
    getSummariesOfCall(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        if (index === 1 || index === 2) {
          sums[index] = '--'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              if (index === 4) {
                return Math.ceil(prev) + Math.ceil(curr / 60)
              } else {
                return prev + curr
              }
            } else {
              return prev
            }
          }, 0)
        } else {
          sums[index] = '--'
        }
        if (index === 4) {
          sums[index] = sums[index]
        }
        if (index === 5) {
          sums[index] = (sums[index] / 1000).toFixed(3)
        }
      })
      return sums
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
      })
      return sums
    },
    exportStats() {
      if (this.timeType === 'BY_DATE' && this.callOrSms === 'CALL') {
        this.exportCallCostInfo()
      } else if (this.timeType === 'BY_DATE' && this.callOrSms === 'SMS') {
        this.exportMessageCostInfo()
      } else if (this.timeType === 'BY_MONTH' && this.callOrSms === 'CALL') {
        this.exportCallCostMonthInfo()
      } else if (this.timeType === 'BY_MONTH' && this.callOrSms === 'SMS') {
        this.exportMessageCostMonthInfo()
      }
    },
    exportMessageCostInfo() {
      // 导出短信费用 按天
      statsAPI.exportMessageCostInfo(this.dateParams).then(({ data }) => {
        if (data.code === 200) {
          this.$message.success('操作成功！详细结果请在导入导出列表查看')
          this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        } else {
          this.$message({
            message: '导出失败',
            type: 'error'
          })
        }
      })
    },
    exportMessageCostMonthInfo() {
      // 导出短信费用 按月
      statsAPI.exportMessageCostMonthInfo(this.dateParams).then(({ data }) => {
        if (data.code === 200) {
          this.$message.success('操作成功！详细结果请在导入导出列表查看')
          this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        } else {
          this.$message({
            message: '导出失败',
            type: 'error'
          })
        }
      })
    },
    exportCallCostInfo() {
      // 导出通话费用 按天
      statsAPI.exportCallCostInfo(this.dateParams).then(({ data }) => {
        if (data.code === 200) {
          this.$message.success('操作成功！详细结果请在导入导出列表查看')
          this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        } else {
          this.$message({
            message: '导出失败',
            type: 'error'
          })
        }
      })
    },
    exportCallCostMonthInfo() {
      // 导出通话费用 按月
      statsAPI.exportCallCostMonthInfo(this.dateParams).then(({ data }) => {
        if (data.code === 200) {
          this.$message.success('操作成功！详细结果请在导入导出列表查看')
          this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        } else {
          this.$message({
            message: '导出失败',
            type: 'error'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../../styles/variables.scss';
  .ib{
    display: inline-block;
    margin-right: 10px;
  }
  .fs {
    font-size: 14px;
    font-weight: normal;
    margin-top: 20px;
    display: inline-block;
  }
  .cost-container{
    background: $bodyBg;
    /deep/ .el-range-separator {
      padding: 0;
    }
  }
  .header-container {
    box-sizing: border-box;
    padding: 5px 15px 15px 0px;
    background: #fff;
  }
  .icon-tip {
    margin-right: 15px
  } 
</style>
