<template>
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
        value-format="yyyy-MM-dd"
        align="right"
        unlink-panels
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
    </div>
    <div class="mt5 yw-container">
      <el-tabs v-if="filterRobotCallJobId">
        <el-tab-pane :label="`外呼与接听${customerStr}数`" lazy>
          <call-and-answer-total
            :title="'外呼和接听总量'"
            :unit="'次'"
            :stats="stats.callJobStatsBrokenLine"></call-and-answer-total>
        </el-tab-pane>
        <el-tab-pane label="接听率">
          <answer-ratio
            :stats="stats.callJobStatsBrokenLine"></answer-ratio>
        </el-tab-pane>
        <el-tab-pane label="通话时长">
          <total-and-average-duration
            :title="'总通话时长和平均通话时长'"
            :unit="'秒'"
            :stats="stats.callJobStatsBrokenLine"></total-and-average-duration>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="yw-container mt15">
      <el-tabs class="mt15">
        <el-tab-pane label="对话轮次" lazy>
          <category-stack-chart
            :stats="stats.callJobDateColumnDiagram.chatRound"
            :keyToString="constant.roundToString"
          ></category-stack-chart>
        </el-tab-pane>
        <el-tab-pane label="通话时长" lazy>
          <category-stack-chart
            :stats="stats.callJobDateColumnDiagram.chatDuration"
            :keyToString="constant.durationToString"
          ></category-stack-chart>
        </el-tab-pane>
        <el-tab-pane label="接听状态" lazy>
          <category-stack-chart
            :stats="stats.callJobDateColumnDiagram.dialResult"
            :keyToString="constant.resultStatus"
          ></category-stack-chart>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-button type="primary mt15" @click="exportCallStatsInfo(filterParams)" v-if="hasAccess('crm_statisticsDial_export')">导出以下表格数据</el-button>
    <el-table
    stripe
    class="mt15"
      :data="stats.statsTable"
      style="width: 100%">
      <el-table-column
        prop="date"
        label="日期">
      </el-table-column>
      <el-table-column
        prop="callTaskCompleted"
        label="外呼总量（位）">
      </el-table-column>
      <el-table-column
        prop="answeredCall"
        label="接听总量（位）">
      </el-table-column>
      <el-table-column
        prop="answeredTaskRate"
        label="接听率（%）">
      </el-table-column>
      <el-table-column
        prop="csTransferCount"
        label="请求人工介入数量（个"
      >
      </el-table-column>
      <el-table-column
        prop="chatTime"
        label="总通话时长（s）">
      </el-table-column>
      <el-table-column
        prop="averageChatTime"
        label="平均通话时长（s）">
      </el-table-column>
      <el-table-column
        v-for="(col, index) in cols"
        :key="index"
        :prop="col.prop"
        :label="col.label + '（位）'">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import IntentCountChart from '@/components/Charts/intentCountChart'
  import NumberByDateChart from '@/components/Charts/numberByDateChart'
  import * as statsAPI from '@/api/stats'
  import * as taskAPI from '@/api/task'
  import moment from 'moment'
  import CategoryStackChart from '@/components/Charts/categoryStackChart'
  import callAndAnswerTotal from '@/components/Charts/callAndAnswerTotal'
  import * as constant from '@/utils/constant'
  import * as talkAPI from '@/api/talk'
  import answerRatio from '@/components/Charts/answerRatio'
  import TotalAndAverageDuration from '@/components/Charts/totalAndAverageDuration'
  import { mapGetters } from 'vuex'

export default {
    name: 'CallStatistics',
    components: {
      answerRatio,
      TotalAndAverageDuration,
      callAndAnswerTotal,
      CategoryStackChart,
      NumberByDateChart,
      IntentCountChart
    },
    mounted() {
      this.requestRobotCallJobList()
      this.requestDialogFlowList()
    },
    computed: {
      ...mapGetters([
        'customerStr'
      ]),
      constant() {
        return constant
      },
      filterParams() {
        return {
          statsId: this.filterType === 'STATS_CALL_JOB' ? this.filterRobotCallJobId : this.filterDialogFlowIdValue,
          statsDim: this.filterType,
          startDate: this.startEndTime[0],
          endDate: this.startEndTime[1]
        }
      },
      cols() {
        const intentLevelObj = this.stats.intentLevelTagDetailList.map((item) => {
          return {
            prop: 'code' + item.code,
            label: item.name
          }
        })
        return intentLevelObj
      }
    },
    data() {
      return {
        dialogFlowlistReady: false,
        robotCallJobListReady: false,

        activeName: 'first',

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

        startEndTime: [moment().subtract('days', 30).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],

        stats: {
          statsTable: [],
          intentLevelTagDetailList: [],
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
      filterType: {
        handler: function(val) {
          this.$nextTick(() => {
            this.requestStats(this.filterParams)
          })
        },
        deep: true
      },
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
            this.requestStats(this.filterParams)
          }
        }
      },
      filterDialogFlowIdValue: {
        handler: function(val) {
          if (this.filterType !== 'STATS_CALL_JOB') {
            this.requestStats(this.filterParams)
          }
        }
      },
      startEndTime: {
        handler: function(val) {
          this.requestStats(this.filterParams)
        }
      }
    },
    methods: {
      requestStats(filterParams) {
        if (filterParams.statsId === null || filterParams.statsId === '' || filterParams.statsId === undefined) {
          return
        }
        statsAPI.getCallJobDateRoundStatsInfo(filterParams).then(({ data }) => {
          this.stats = data.data
          this.stats.statsTable = this.stats.statsTable.map(item => {
            const temp = { ...item }
            const map = this.convertMap(item.intentLevelMap)
            for (const i in map) {
              temp[map[i].key] = map[i].value
            }
            return temp
          })
        })
      },
      convertMap(intentLevelMap) {
        const temp = []
        const values = Object.values(intentLevelMap)
        const keys = Object.keys(intentLevelMap).map(item => {
          return 'code' + item
        })
        for (let i = 0; i < values.length; i++) {
          temp.push({
            key: keys[i],
            value: values[i]
          })
        }
        return temp
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
      },
      exportCallStatsInfo() {
        if(!this.filterParams.statsId) {
          this.$message({
            message: '没有可导出的任务或话术',
            type: 'error'
          })
          return
        }
        statsAPI.exportCallStatsInfo(this.filterParams).then(({ data }) => {
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
  .header-container {
    height: 42px;
    box-sizing: border-box;
    padding: 0 15px 0 0px;
    background: #f9f9f9;
  }
</style>
