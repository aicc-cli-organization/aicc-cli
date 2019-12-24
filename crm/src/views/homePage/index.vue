<template>
  <div>
    <div class="header">
      <date-range-title
        :filterType="filterType"
        :startEndDate="startEndDate"
        :robotCallJobName="robotCallJobName"
        :dialogFlowName="dialogFlowName"
      ></date-range-title>
      <div class="header-container right">
        <el-select class="w100" v-model="filterType" placeholder="请选择">
          <el-option
            v-for="item in filterTypeList"
            :key="item.filterType"
            :label="item.name"
            :value="item.filterType">
          </el-option>
        </el-select>
        <el-select
          class="w250 mr20"
          filterable
          v-if="filterType=='STATS_CALL_JOB'"
          v-model="filterRobotCallJobId"
          remote
          clearable
          reserve-keyword
          :remote-method="requestRobotCallJobList"
          placeholder="选择任务"
          >
          <el-option
            v-for="item in filterRobotCallJobList"
            :key="item.robotCallJobId"
            :label="item.name"
            :value="item.robotCallJobId">
          </el-option>
        </el-select>
        <el-select filterable
          class="w250 mr20" v-if="filterType=='STATS_DIALOG_FLOW'" v-model="filterDialogFlowIdValue" placeholder="选择话术">
          <el-option
            v-for="item in filterDialogFlowOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
        <el-select
          filterable
          class="w250 mr20"
          v-model="filterIntentLevelTagId"
          placeholder="选择标签分组"
          :disabled="!!(filterRobotCallJobId || filterDialogFlowIdValue)"
        >
          <el-option
            v-for="item in filterIntentLevelTagOptions"
            :key="item.intentLevelTagId"
            :label="item.name"
            :value="item.intentLevelTagId">
          </el-option>
        </el-select>
        <el-date-picker
          v-model="startEndDate"
          type="daterange"
          align="right"
          value-format="yyyy-MM-dd"
          unlink-panels
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="{shortcuts:$utils.pickerOptions, disabledDate}">
        </el-date-picker>
      </div>
    </div>
    <panel-group
      :completedTask="stats.taskCallTotal"
      :answeredTask="stats.answeredTaskTotal"
      :answeredRate="stats.answeredTaskRate"
      :averageDuration="stats.averageDuration"
      :intentLevel="stats.intentLevel || {}"
      :intentLevelTagDetailList="stats.intentLevelTagDetailList || []"
    ></panel-group>
    <div class="flex-container mt15">
      <div class="yw-container flex-item-3 mr14">
        <PieChart class="pieChart"
          :intentLevel="stats.intentLevel || {}"
          :intentLevelTagDetailList="stats.intentLevelTagDetailList || []">
        </PieChart>
      </div>
      <div class="flex-item-2">
        <div class="yw-container mb15" v-if="showTaskProgress">
          <task-schedule :taskProgress="stats.taskProgress"></task-schedule>
        </div>
        <div class="yw-container">
          <div class="customer-concerns-title">
            <span class="text">{{customerStr}}关注点</span>
          </div>
          <word-cloud :area="areaSize" :customerConcern="customerConcern"></word-cloud>
        </div>
        <div class="yw-container mt15">
          <call-peak-duration :area="areaSize" :highestCallTimeBO="highestCallTimeBO"></call-peak-duration>
        </div>
      </div>
    </div>
    <div class="flex-container mt15">
      <seat-stats class="flex-item-3 mr14"/>
      <follow-status class="flex-item-2" :area="areaSize" :highestCallTimeBO="highestCallTimeBO"></follow-status>
    </div>
  </div>
</template>

<script>
import PieChart from '@/components/Charts/intentLevelPieChart'
import PanelGroup from './components/talkPanelGroup'
import answerStatus from './components/answerStatus'
import taskSchedule from '@/components/Charts/taskSchedule'
import CallDuration from './components/callDuration'
import callPeakDuration from './components/callPeakDuration'
import CallRound from './components/callRound'
import * as statsAPI from '@/api/stats'
import moment from 'moment'
import * as taskAPI from '@/api/task'
import * as talkAPI from '@/api/talk'
import wordCloud from '@/components/Charts/wordCloud'
import seatStats from './components/seatStats'
import dateRangeTitle from './components/dateRangeTitle'
import followStatus from './components/followStatus'
import { getSimpleIntentLevelTagList } from '@/api/intentLevel'
import { mapGetters } from 'vuex'

export default{
  components: {
    CallRound,
    wordCloud,
    callPeakDuration,
    CallDuration,
    answerStatus,
    PanelGroup,
    PieChart,
    seatStats,
    taskSchedule,
    dateRangeTitle,
    followStatus
  },
  data() {
    return {
      robotCallJobName: '全部任务',
      dialogFlowName: '全部话术',
      startEndDate: [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
      stats: {},
      value: '',
      options: [],
      filterRobotCallJobList: [],
      filterRobotCallJobId: undefined,
      filterIntentLevelTagId: undefined,
      filterTypeList: [{
        filterType: 'STATS_CALL_JOB',
        name: '任务名'
      }, {
        filterType: 'STATS_DIALOG_FLOW',
        name: '话术名'
      }],
      filterType: 'STATS_CALL_JOB',
      filterDialogFlowIdValue: null,
      filterDialogFlowOptions: [],
      filterIntentLevelTagOptions: []
    }
  },
  mounted() {
    this.requestRobotCallJobList()
    this.requestDialogFlowList()
    this.getSimpleIntentLevelTagList({ isInit: true })
  },
  computed: {
    ...mapGetters(['customerStr']),
    showTaskProgress() {
      return this.filterType === 'STATS_CALL_JOB' && this.filterRobotCallJobId
    },
    areaSize() {
      if (this.showTaskProgress) {
        return 'NORMAL'
      } else {
        return 'LARGE'
      }
    },
    customerConcern() {
      if (this.stats === null) {
        return {}
      } else {
        return this.stats.customerConcern
      }
    },
    highestCallTimeBO() {
      if (this.stats === null) {
        return {}
      } else {
        return this.stats.highestCallTimeBO
      }
    }
  },
  watch: {
    filterType: {
      handler: function(val) {
        this.$nextTick(() => {
          this.requestStats()
        })
      },
      deep: true
    },
    startEndDate: {
      handler: function(val) {
        this.$nextTick(() => {
          this.requestStats()
        })
      },
      deep: true
    },
    filterRobotCallJobId: {
      handler: function(val) {
        if (val === '') {
          this.filterRobotCallJobId = undefined
          this.requestRobotCallJobList()
        }
        for (const index in this.filterRobotCallJobList) {
          if (this.filterRobotCallJobList[index].robotCallJobId === val) {
            this.robotCallJobName = this.filterRobotCallJobList[index].name
            this.filterIntentLevelTagId = this.filterRobotCallJobList[index].intentLevelTagId ||
              this.defaultIntentLevelTagId()
            break
          }
        }
        this.$nextTick(() => {
          this.requestStats()
        })
      }
    },
    filterIntentLevelTagId: {
      handler: function(val) {
        this.$nextTick(() => {
          this.requestStats()
        })
      }
    },
    filterDialogFlowOptions: {
      handler: function(val) {
        this.filterDialogFlowIdValue = val[0].id
      }
    },
    filterDialogFlowIdValue: {
      handler: function(val) {
        for (const index in this.filterDialogFlowOptions) {
          if (this.filterDialogFlowOptions[index].id === val) {
            this.dialogFlowName = this.filterDialogFlowOptions[index].name
            this.filterIntentLevelTagId = this.filterDialogFlowOptions[index].intentLevelTagId ||
              this.defaultIntentLevelTagId()
            break
          }
        }
        this.$nextTick(() => {
          this.requestStats()
        })
      }
    }
  },
  methods: {
    getSimpleIntentLevelTagList(params) {
      getSimpleIntentLevelTagList().then(({ data }) => {
        this.filterIntentLevelTagOptions = data.data
        if (params.isInit === true) {
          this.filterIntentLevelTagId = this.defaultIntentLevelTagId()
        }
      })
    },
    defaultIntentLevelTagId() {
      if (this.filterIntentLevelTagOptions.length === 0) {
        return undefined
      }
      let temp
      for (const i in this.filterIntentLevelTagOptions) {
        if (this.filterIntentLevelTagOptions[i].defaultStatus === true) {
          temp = this.filterIntentLevelTagOptions[i].intentLevelTagId
          break
        }
      }
      if (!temp) {
        temp = this.filterIntentLevelTagOptions[0] ? this.filterIntentLevelTagOptions[0].intentLevelTagId : ''
      }
      return temp
    },
    requestRobotCallJobList(val) {
      taskAPI.getSimpleList({
        searchWords: val
      }).then(({ data }) => {
        this.filterRobotCallJobList = [{
          robotCallJobId: undefined,
          name: '全部任务'
        }, ...data.data]
      })
    },
    requestDialogFlowList() {
      talkAPI.fetchFlowList({
        pageNum: 1,
        pageSize: 100,
        published: true
      }).then(({ data }) => {
        this.filterDialogFlowOptions = [{
          id: undefined,
          name: '全部话术'
        }, ...data.data.content]
      })
    },
    requestStats(
      statsId = this.filterType === 'STATS_CALL_JOB' ? this.filterRobotCallJobId : this.filterDialogFlowIdValue,
      statsDim = this.filterType,
      startDate = this.startEndDate[0],
      endDate = this.startEndDate[1],
      intentLevelTagId = this.filterIntentLevelTagId
    ) {
      this.stats = {}
      if (statsId !== null && intentLevelTagId !== undefined) {
        statsAPI.getStats({
          statsDim, statsId, startDate, endDate, intentLevelTagId
        }).then(({ data }) => {
          this.stats = data.data
        })
      }
    },
    disabledDate(time) {
      return time.getTime() - Date.now() > 0
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .header-container {
    height: 45px;
    box-sizing: border-box;
    padding: 0 15px 0px 0px;
    background: #f9f9f9;
  }
  .flex-container{
    display: flex;
  }
  .flex-item-3 {
    flex: 3;
  }
  .flex-item-2 {
    flex: 2
  }
  .flex-item-1 {
    flex: 1
  }
  .app-container {
    padding-bottom: 150px;
  }
  .pieChart {
    height: 410px;
  }
  .chart-title{
    height: 45px;
    background: white;
    padding: 15px;
    color: #333;
    font-size: 14px;
    border-radius: 4px;
  }
  .customer-concerns-title .text{
    display: inline-block;
    margin: 12px 0 0 12px;
    font-size: 16px;
    font-weight: 700;
  }
  .customer-concerns-title{
    height: 38px;
    border-bottom: none;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
  }
  .el-range-editor--small.el-input__inner {
    width: 250px;
  }
  .app-main-wrap .app-main{
    background-color: #f9f9f9;
    box-shadow: none;
  }
  .yw-container {
    height: auto!important;
  }
</style>
