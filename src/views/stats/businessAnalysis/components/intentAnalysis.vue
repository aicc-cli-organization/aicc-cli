a<template>
  <div>
    <div class="header-container">
      <span class="demonstration">主题选择：</span>
        <el-select class="w100" v-model="filterType" placeholder="请选择">
          <el-option
            v-for="item in filterTypeList"
            :key="item.filterType"
            :label="item.name"
            :value="item.filterType">
          </el-option>
        </el-select>
        <el-select class="w200 mr60"
          filterable
          remote
          :remote-method="requestRobotCallJobList"
          @change="handleRemoteSearch"
          clearable
          v-if="filterType=='STATS_CALL_JOB'"
          v-model="filterRobotCallJobId"
          placeholder="选择任务">
          <el-option
            v-for="item in filterRobotCallJobOptions"
            :key="item.robotCallJobId"
            :label="item.name"
            :value="item.robotCallJobId">
          </el-option>
        </el-select>
        <el-select class="w200 mr60" filterable
           v-if="filterType=='STATS_DIALOG_FLOW'" v-model="filterDialogFlowIdValue" placeholder="选择话术">
          <el-option
            v-for="item in filterDialogFlowOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      <span class="demonstration">日期选择：</span>
      <el-date-picker
        v-model="startEndTime"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :clearable="false">
      </el-date-picker>
    </div>
    <div class="pt30 intent-level-container yw-container">
      <intent-count-chart
        :intentLevel="stats.intentLevel"
        :intentLevelTagDetailList="stats.intentLevelTagDetailList"
      ></intent-count-chart>
    </div>
    <div class="flex-container mt15">
      <div class="flex-item2  yw-container">
        <line-simple
          :intentLevelRate="stats.intentLevelRate"
          :intentLevelTagDetailList="stats.intentLevelTagDetailList"
        ></line-simple>
      </div>
      <div class="bottom-container flex-item1  yw-container">
        <customer-concerns :stats="stats.knowledgeActiveCountList"></customer-concerns>
      </div>
    </div>
  </div>
</template>

<script>
  import IntentCountChart from '@/components/Charts/intentCountChart'
  import * as statsAPI from '@/api/stats'
  import * as taskAPI from '@/api/task'
  import moment from 'moment'
  import CategoryStackChart from '@/components/Charts/categoryStackChart'
  import customerConcerns from '@/components/Charts/customerConcerns'
  import lineSimple from '@/components/Charts/lineSimple'
  import * as talkAPI from '@/api/talk'

  export default {
    name: 'CallStatistics',
    components: {
      lineSimple,
      customerConcerns,
      CategoryStackChart,
      IntentCountChart
    },
    mounted() {
      this.requestRobotCallJobList()
      this.requestDialogFlowList()
    },
    data() {
      return {
        filterRobotCallJobOptions: [],
        filterRobotCallJobId: null,
        filterDialogFlowIdValue: null,
        filterDialogFlowOptions: [],
        filterTypeList: [{
          filterType: 'STATS_CALL_JOB',
          name: '任务名'
        }, {
          filterType: 'STATS_DIALOG_FLOW',
          name: '话术名'
        }],
        filterType: 'STATS_CALL_JOB',
        startEndTime: [new Date().getTime() - 30 * 24 * 60 * 60 * 1000, new Date().getTime()],
        intentCountStats: {},
        activeName: 'first',
        stats: {
          customerConcern: {},
          statsTable: [],
          callJobDateColumnDiagram: {},
          callJobStatsBrokenLine: {
            answeredTaskList: [],
            answeredTaskRateList: [],
            averageDurationList: [],
            chatDurationTotalList: [],
            taskCallTotalList: []
          }
        }
      }
    },
    watch: {
      filterDialogFlowOptions: {
        handler: function(val) {
          if (val.length > 0) {
            this.filterDialogFlowIdValue = val[0].id
          }
        },
        deep: true
      },
      filterRobotCallJobId: {
        handler: function(val) {
          if (this.filterType === 'STATS_CALL_JOB') {
            this.requestStats()
          }
        }
      },
      filterDialogFlowIdValue: {
        handler: function(val) {
          if (this.filterType === 'STATS_DIALOG_FLOW') {
            this.requestStats()
          }
        }
      },
      startEndTime: {
        handler: function(val) {
          this.requestStats()
        }
      },
      filterType: {
        handler: function(val) {
          this.requestStats()
        }
      }
    },
    methods: {
      initStats() {
        this.stats = {
          statsTable: [],
          callJobDateColumnDiagram: {},
          callJobStatsBrokenLine: {
            answeredTaskList: [],
            answeredTaskRateList: [],
            averageDurationList: [],
            chatDurationTotalList: [],
            taskCallTotalList: []
          }
        }
      },
      requestStats(
        statsId = this.filterType === 'STATS_CALL_JOB' ? this.filterRobotCallJobId : this.filterDialogFlowIdValue,
        statsDim = this.filterType,
        startDate = moment(this.startEndTime[0]).format('YYYY-MM-DD'),
        endDate = moment(this.startEndTime[1]).format('YYYY-MM-DD')
      ) {
        this.initStats()
        if (statsDim && statsId) {
          statsAPI.businessAnalysisInfo({
            statsDim, statsId, startDate, endDate
          }).then(({ data }) => {
            this.stats = data.data
          })
        }
      },
      handleRemoteSearch(val) {
        if (val === '') {
          this.requestRobotCallJobList()
        }
      },
      requestRobotCallJobList(val) {
        taskAPI.getSimpleList({
          searchWords: val
        }).then(({ data }) => {
          this.filterRobotCallJobOptions = data.data
          if (this.filterRobotCallJobOptions.length > 0 &&
            (val === null || val === '' || val === undefined)) {
            this.filterRobotCallJobId = this.filterRobotCallJobOptions[0].robotCallJobId
          }
        })
      },
      requestDialogFlowList() {
        talkAPI.fetchFlowList({
          pageNum: 1,
          pageSize: 100,
          published: true
        }).then(({ data }) => {
          this.filterDialogFlowOptions = data.data.content
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .header-container {
    height: 45px;
    box-sizing: border-box;
    padding: 0 15px 15px 15px;
  }
  .flex-container{
    display: flex;
  }
  .flex-item1 {
    flex: 1
  }
  .flex-item2 {
    margin-right: 15px;
    flex: 2
  }
</style>
