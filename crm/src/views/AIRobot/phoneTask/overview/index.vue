<template>
  <div class="section-overview">
    <div class="desc">
      <div class="title">
        <span class="name">{{robotCallJobDetail.robotCallJob.name}}</span>
        <task-status-tag :status="robotCallJobDetail.robotCallJob.status"></task-status-tag>
        <task-reason
          class="comp-reason"
          :status="robotCallJobDetail.robotCallJob.status"
          :hangUpReason="robotCallJobDetail.robotCallJob.hangUpReason"
          location="detail"
        ></task-reason>
        <task-next-starttime
          class="comp-next-starttime"
          :status="robotCallJobDetail.robotCallJob.status"
          :nextStartTime="robotCallJobDetail.robotCallJob.nextStartTime"
          location="detail"
        ></task-next-starttime>
        <div class="btns">
          <el-button class="refresh-btn" size="mini" type="primary" @click="onRefresh"><i class="iconfont icon-shuaxin"></i>刷新</el-button>
          <el-button class="edit-btn" size="mini" type="primary" @click="onEditTask" v-if="showEditIcon(robotCallJobDetail.robotCallJob.status)" :disabled="!hasAccess('crm_callTask_addOrEdit')"><i class="iconfont icon-edited"></i>编辑任务</el-button>
          <flow-status-btns @flowSuccess="initOverview"></flow-status-btns>
          <import-btns @importSuccess="$emit('importSuccessCallback')"></import-btns>
        </div>
      </div>
      <detail-setting :robotCallJobDetail="robotCallJobDetail" :fullStatsInfo="fullStatsInfo"></detail-setting>
      <sub-title :robotCallJobDetail="robotCallJobDetail"></sub-title>
      <task-descpition :robotCallJobDetail="robotCallJobDetail"></task-descpition>
      <customer-cost :robotCallJobDetail="robotCallJobDetail"></customer-cost>
      <table-list :robotCallJobDetail="robotCallJobDetail" :fullStatsInfo="fullStatsInfo"></table-list>
    </div>
    <percent-pie-list :fullStatsInfo="fullStatsInfo"></percent-pie-list>
    <num-pie-list :fullStatsInfo="fullStatsInfo" :smsSendList="smsSendList"></num-pie-list>
    <chat-count :fullStatsInfo="fullStatsInfo"></chat-count>
    <chart-tabs :fullStatsInfo="fullStatsInfo"></chart-tabs>
    <task-form type="edit" :visible.sync="taskFormVisible" @update="initOverview"></task-form>
  </div>
</template>

<script>
import * as taskApi from '@/api/task'
import { EDIT_TYPE_LIST } from '../utils/enum'
import Connect from '../utils/connect'
import { mapGetters } from 'vuex'
import TaskStatusTag from '../components/taskStatusTag'
import TaskReason from '../components/taskReason'
import TaskNextStarttime from '../components/taskNextStartTime'
import FlowStatusBtns from './flowStatusBtns'
import ImportBtns from './importBtns'
import DetailSetting from './detailSetting'
import SubTitle from './subTitle'
import TaskDescpition from './descpition'
import CustomerCost from './customerCost'
import TableList from './tableList'
import PercentPieList from './percentPieList'
import NumPieList from './numPieList'
import ChatCount from './chatCount'
import ChartTabs from './chartTabs'
import TaskForm from '../taskForm/index'

export default {
  mixins: [Connect],
  data() {
    return {
      timerStats: null,
      smsSendList: [],
      taskFormVisible: false
    }
  },
  components: {
    TaskStatusTag,
    TaskReason,
    TaskNextStarttime,
    FlowStatusBtns,
    ImportBtns,
    DetailSetting,
    SubTitle,
    CustomerCost,
    TableList,
    TaskDescpition,
    PercentPieList,
    NumPieList,
    ChatCount,
    ChartTabs,
    TaskForm
  },
  methods: {
    onRefresh() {
      this.initOverview()
      this.__refreshTaskList(true)
      this.$message.success('刷新成功')
    },
    onEditTask() {
      // this.__updateEditTaskId(this.selectTaskId)
      this.taskFormVisible = true
      // this.$emit('update:addTaskDialogVisible', true)
    },
    async getCallJobFullStatsInfo() {
      const fullStatsInfo = (await taskApi.getRobotCallJobStats(this.selectTaskId)).data.data
      fullStatsInfo.robotCallJobId = this.selectTaskId
      this.__coverTaskFullStats(fullStatsInfo)
    },
    initOverview() {
      const selectTaskId = this.selectTaskId
      if (!selectTaskId) return
      Promise.all([taskApi.getRobotCallJobStats(selectTaskId), taskApi.getRobotCallJobDetail(selectTaskId), taskApi.getIntentMessage(selectTaskId)])
        .then((resArr) => {
          const fullStatsInfo = resArr[0].data.data
          const taskDetail = resArr[1].data.data
          this.smsSendList = resArr[2].data.data
          fullStatsInfo.robotCallJobId = selectTaskId
          this.__coverTaskFullStats(fullStatsInfo)
          this.__updateTaskItem({ robotCallJobId: selectTaskId, status: taskDetail.robotCallJob.status })
          this.__coverTaskDetail(taskDetail)
        })
      this.poolingStatsInfo()
    },
    poolingStatsInfo() {
      if (this.timerStats) {
        clearInterval(this.timerStats)
      }
      this.timerStats = setInterval(() => {
        this.getCallJobFullStatsInfo()
      }, 10000 * 12 * 15)
    },
    showEditIcon(status) {
      return EDIT_TYPE_LIST.includes(status)
    }
  },
  computed: {
    ...mapGetters([
      'isLocal'
    ]),
    robotCallJobDetail() {
      return this.$store.state.taskV2.taskDetail
    },
    fullStatsInfo() {
      return this.$store.state.taskV2.fullTaskInfo
    },
    selectTaskId() {
      return this.$store.state.taskV2.selectTaskId
    }
  },
  watch: {
    selectTaskId(value) {
      if (value) {
        document.querySelector('.el-tabs__content').scrollTop = 0
        this.initOverview()
      }
    }
  },
  beforeDestroy() {
    this.$store.commit('SELECT_TASK_ID', undefined)
    this.$store.commit('SELECT_INTENT_LEVEL_TAG_ID', undefined)
    this.$store.commit('UPDATE_TASK_TAB', 'overview')
    clearInterval(this.timerStats)
  }
}
</script>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;
  li {
    list-style-type: none;
  }
}

.section-overview {
  .desc {
    padding: 20px 10px 10px;
    background-color: white;
    .title {
      position: relative;
      display: flex;
      align-items: flex-end;
      margin-bottom: 10px;
      .name {
        color: #4A4A4A;
        font-size: 22px;
        font-weight: 600;
        margin-right: 10px;
      }
      .btns {
        position: absolute;
        top: 0;
        right: 0;
        .edit-btn,
        .refresh-btn {
          i {
            font-size: 12px;
            margin-right: 5px;
          }
        }
      }
    }
  }
}
</style>
