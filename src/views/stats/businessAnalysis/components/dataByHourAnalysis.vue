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
          clearable
          remote
          :remote-method="requestRobotCallJobList"
          v-if="filterType=='STATS_CALL_JOB'"
          @change="handleRemoteSearch"
          v-model="filterRobotCallJobId" placeholder="选择任务">
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
        v-model="startDate"
        type="date"
        value-format="yyyy-MM-dd"
        placeholder="开始日期">
      </el-date-picker>
      <el-date-picker
        v-model="endDate"
        value-format="yyyy-MM-dd"
        type="date"
        :picker-options="endDatePickerOptions"
        placeholder="结束日期">
      </el-date-picker>
    </div>
    <dataByHourTable
      :stats="stats"
    ></dataByHourTable>
  </div>
</template>

<script>
  import IntentCountChart from '@/components/Charts/intentCountChart'
  import * as statsAPI from '@/api/stats'
  import * as taskAPI from '@/api/task'
  import moment from 'moment'
  import CategoryStackChart from '@/components/Charts/categoryStackChart'
  import customerConcerns from '@/components/Charts/customerConcerns'
  import dataByHourTable from './components/dataByHourTable'
  import * as talkAPI from '@/api/talk'

  export default {
    name: 'CallStatistics',
    components: {
      dataByHourTable,
      customerConcerns,
      CategoryStackChart,
      IntentCountChart
    },
    mounted() {
      this.requestRobotCallJobList()
      this.requestDialogFlowList()
    },
    computed: {
      endDatePickerOptions() {
        return {
          disabledDate: (time) => {
            return moment(time).unix() < moment(this.startDate).unix() ||
            moment(time).unix() > moment().unix() ||
            moment(time).unix() > moment(this.startDate).add('days', 6).unix()
          }
        }
      }
    },
    data() {
      return {
        startDate: moment().subtract(6, 'days').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
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
        intentCountStats: {},
        activeName: 'first',
        stats: {
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
      startDate: {
        handler: function(val) {
        }
      },
      endDate: {
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
        this.stats = {}
      },
      requestStats(
        statsId = this.filterType === 'STATS_CALL_JOB' ? this.filterRobotCallJobId : this.filterDialogFlowIdValue,
        statsDim = this.filterType,
        startDate = this.startDate,
        endDate = this.endDate
      ) {
        if (statsId === null || statsId === '' || statsId === undefined) {
          return
        }
        this.initStats()
        statsAPI.duringAnalysisInfo({
          statsDim, statsId, startDate, endDate
        }).then(({ data }) => {
          this.stats = data.data
          // if (data.code === 200) {
          //   this.$message({
          //     message: '获取数据成功',
          //     type: 'success'
          //   })
          // } else {
          //   this.$message({
          //     message: '获取数据失败',
          //     type: 'error'
          //   })
          // }
        })
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
