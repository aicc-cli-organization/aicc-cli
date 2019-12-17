<template>
  <div class="cost-container">
    <div class="header-container">
      <el-select v-model="type"
        class="ml15 mr5"
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
        filterable
        remote
        reserve-keyword
        :remote-method="requestUserList"
        v-model="filterCreateByUserId"
        placeholder="执行者"
        class="ml5"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in filterUserListOptions"
          :key="item.userId"
          :label="item.userName"
          :value="item.userId">
        </el-option>
      </el-select>
      
      <el-select
        class="ml15 mr5"
        v-model="phoneNumberId"
        filterable
        @change="search"
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

      <div class="right" style="line-height: 32px;" >
        <el-radio-group v-model="timeType" class="mr10">
          <el-radio :label="'BY_DATE'">按日期汇总</el-radio>
          <el-radio :label="'BY_MONTH'">按月汇总</el-radio>
        </el-radio-group>
        <el-date-picker
          v-if="timeType=='BY_DATE'"
          class="right"
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

    <div class="pr10 pt20 clearfix">
      <b class="ml15 f18 fs">
        {{filterUserName}} 消费总额：
        <span class="ib ml15 mt10" v-for="(item, index) in balance" :key="index">
          {{item.phoneNumberName || item.phoneNumber}}：{{item.callCost / 1000}}元
        </span>
        <span v-if="balance.length==0">----</span>
      </b>
      <div class="right">
        <el-button type="primary" @click="exportStats()" v-if="hasAccess('crm_statisticsBill_export')">
          <span v-if="this.phoneNumberOrSms=='PHONE_NUMBER'">导出线路计费</span>
          <span v-if="this.phoneNumberOrSms !=='PHONE_NUMBER' && !isLocal">导出短信计费</span>
        </el-button>
        <el-button type="primary" @click="exportCallRecordCost()" v-if="hasAccess('crm_statisticsBill_export')">导出话单明细</el-button>
      </div>
    </div>

    <el-tabs class="mt15" v-model="phoneNumberOrSms">
      <el-tab-pane label="通话费用" name="PHONE_NUMBER">
        <el-table
        show-summary
        :summary-method="getSummariesOfCall"
        :data="stats.phoneNumberList">
          <el-table-column
            prop="localDate"
            label="时间">
            <template slot-scope="scope">
              {{parseDate(scope.row.localDate)}}
            </template>
          </el-table-column>
          <el-table-column
            prop="phoneNumber"
            label="线路">
            <template slot-scope="scope">
              {{scope.row.phoneNumberName || scope.row.phoneNumber}}
            </template>
          </el-table-column>
          <el-table-column
            prop="local"
            label="类型">
            <template slot-scope="scope">
              {{ scope.row.local ? '本地' : '外地' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="answeredCall"
            label="接通数（通）">
          </el-table-column>
          <el-table-column
            prop="billChatTime"
            label="时长（分钟）">
            <template slot-scope="scope">
              {{ Math.ceil(scope.row.billChatTime / 60) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="callCost"
            label="话费（元）">
            <template slot-scope="scope">
              {{ scope.row.callCost / 1000 }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- <el-tab-pane label="短信费用" name="SMS" v-if="type==0 && !isLocal">
        <el-table
        show-summary
        :summary-method="getSummariesOfSms"
        :data="stats.smsList">
          <el-table-column
            fixed
            prop="localDate"
            label="日期">
            <template slot-scope="scope">
              {{parseDate(scope.row.localDate)}}
            </template>
          </el-table-column>
          <el-table-column
            prop="smsAmount"
            label="短信数量"
            v-if="!isLocal">
          </el-table-column>
          <el-table-column
            prop="smsBillAmount"
            label="有效计费数">
          </el-table-column>
          <el-table-column
            prop="smsCost"
            label="短信费(元)"
            v-if="!isLocal">
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
import moment from 'moment'
import { mapGetters } from 'vuex'
import NumberByDateChart from '@/components/Charts/numberByDateChart'
import barCategoryStackByTime from '@/components/Charts/barCategoryStackByTime'
import * as numberpoolAPI from '@/api/numberpool'
import * as usersAPI from '@/api/users'

export default {
  name: 'cost',
  components: {
    barCategoryStackByTime,
    NumberByDateChart
  },
  data() {
    return {
      filterUserName: undefined,
      filterCreateByUserId: undefined,
      filterUserListOptions: null,
      balance: {},
      phoneNumberOrSms: 'PHONE_NUMBER',
      phoneNumberId: undefined,
      timeType: 'BY_DATE',
      stats: {
        answeredCallList: {},
        chatTimeList: {},
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
      type: 0,
      local: undefined,
      localOptions: [
        {
          key: null,
          value: '全部类型'
        }, {
          key: true,
          value: '本地'
        }, {
          key: false,
          value: '外地'
        }
      ],
      numberList: [],
      startEndTime: [new Date().getTime() - 30 * 24 * 60 * 60 * 1000, new Date().getTime()]
    }
  },
  mounted() {
    this.getNumberPoolList()
    this.requestUserList(undefined, true)
  },
  computed: {
    ...mapGetters([
      'isLocal',
      'enableCsSeat',
      'userEnableCsSeat',
      'enableIvr'
    ]),
    typeOptions() {
      let options = [
        {
          key: 0,
          value: 'AI外呼'
        }
      ]

      if (this.enableCsSeat || this.userEnableCsSeat) {
        options.push({
          key: 1,
          value: '人工外呼'
        })
      }

      options = options.concat([
        {
          key: 2,
          value: 'AI接待'
        },
        {
          key: 3,
          value: '人工接待'
        }
      ])

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
          userId: this.filterCreateByUserId,
          local: this.local,
          type: this.type,
          phoneNumberId: this.phoneNumberId,
          startDate: this.startEndTime ? moment(this.startEndTime[0]).format('YYYY-MM-DD') : undefined,
          endDate: this.startEndTime ? moment(this.startEndTime[1]).format('YYYY-MM-DD') : undefined
        }
      } else {
        return {
          userId: this.filterCreateByUserId,
          monthCount: this.monthCount,
          local: this.local,
          type: this.type,
          phoneNumberId: this.phoneNumberId
        }
      }
    }
  },
  watch: {
    filterCreateByUserId: {
      handler: function(val) {
        this.$nextTick(() => {
          this.requestStats()
          this.getUserCallJobStatPhoneNumberInfo()
          for (const i in this.filterUserListOptions) {
            if (this.filterUserListOptions[i].userId === this.filterCreateByUserId) {
              this.filterUserName = this.filterUserListOptions[i].userName
              return
            }
          }
        })
      }
    },
    type: {
      handler: function(val) {
        this.$nextTick(() => {
          this.requestStats()
          this.getUserCallJobStatPhoneNumberInfo()
        })
      }
    },
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
    }
  },
  methods: {
    getUserCallJobStatPhoneNumberInfo() {
      try {
        this.$nextTick(() => {
          if (!this.filterCreateByUserId === undefined) {
            return
          }
          statsAPI.getUserCallJobStatPhoneNumberInfo({
            userId: this.filterCreateByUserId,
            type: this.type
          }).then(({ data }) => {
            this.balance = data.data
          })
        })
      } catch (e) {
        console.log(e)
      }
    },
    initStats() {
      this.stats = {
        answeredCallList: {},
        chatTimeList: {},
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
    exportCallRecordCost() {
      if (this.timeType === 'BY_MONTH') {
        statsAPI.exportCallRecordAndCostMonth({
          ...this.dateParams
        }).then(({ data }) => {
          if (data.code === 200) {
            this.$message.success('操作成功！详细结果请在导入导出列表查看')
            this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
          }
        })
      } else {
        statsAPI.exportCallRecordAndCost({
          ...this.dateParams
        }).then(({ data }) => {
          if (data.code === 200) {
            this.$message.success('操作成功！详细结果请在导入导出列表查看')
            this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
          }
        })
      }
    },
    getNumberPoolList() {
      numberpoolAPI.getTenantPhoneNumberList().then(({ data }) => {
        this.numberList = data.data
        this.numberList = [{
          phoneNumberId: undefined,
          phoneName: '全部线路'
        }, ...this.numberList]
      })
    },
    search() {
      this.$nextTick(() => {
        this.requestStats()
      })
    },
    requestUserList(val, isInit) {
      usersAPI.getUserByTenant({
        username: val,
        pageSize: 20,
        pageNum: 1
      }).then(({ data }) => {
        this.filterUserListOptions = data.data.content
        if (isInit) {
          this.filterCreateByUserId = this.filterUserListOptions[0].userId
        }
      })
    },
    requestStats() {
      this.initStats()
      if (this.timeType === 'BY_DATE') {
        statsAPI.getUserCallJobStatInfo({
          ...this.dateParams
        }).then(({ data }) => {
          this.stats = data.data
        })
      } else {
        statsAPI.getUserCallJobStatMonthInfo({
          ...this.dateParams
        }).then(({ data }) => {
          this.stats = data.data
        })
      }
    },
    getDifferentItem(array, item) {
      if (array.includes(item)) {
        return this.getDifferentItem(array, item + ' ')
      } else {
        return item
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
      if (this.timeType === 'BY_DATE' && this.phoneNumberOrSms === 'PHONE_NUMBER') {
        this.exportUserCallJobStatInfo()
      } else if (this.timeType === 'BY_DATE' && this.phoneNumberOrSms === 'SMS') {
        this.exportUserSmsJobStatInfo()
      } else if (this.timeType === 'BY_MONTH' && this.phoneNumberOrSms === 'PHONE_NUMBER') {
        this.exportUserCallJobStatMonthInfo()
      } else if (this.timeType === 'BY_MONTH' && this.phoneNumberOrSms === 'SMS') {
        this.exportUserSmsJobStatMonthInfo()
      }
    },
    exportUserSmsJobStatInfo() {
      // 导出短信费用 按天
      statsAPI.exportUserSmsJobStatInfo(this.dateParams).then(({ data }) => {
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
    exportUserSmsJobStatMonthInfo() {
      // 导出短信费用 按月
      statsAPI.exportUserSmsJobStatMonthInfo(this.dateParams).then(({ data }) => {
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
    exportUserCallJobStatInfo() {
      // 导出通话费用 按天
      statsAPI.exportUserCallJobStatInfo(this.dateParams).then(({ data }) => {
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
    exportUserCallJobStatMonthInfo() {
      // 导出通话费用 按月
      statsAPI.exportUserCallJobStatMonthInfo(this.dateParams).then(({ data }) => {
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
    display: inline-block;
  }
  .cost-container{
    background: $bodyBg;
  }
  .header-container {
    height: 48px;
    box-sizing: border-box;
    padding: 5px 15px 15px 0px;
    background: #fff;
  }
</style>
