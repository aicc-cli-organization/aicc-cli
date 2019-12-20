<template>
  <div class="task-list-wrap">
    <div class="empty-list" v-if="totalElements === 0">
      暂无任务
    </div>
    <ul class="task-list" v-if="totalElements > 0">
      <li class="task-item" @click="onSelectTask(taskItem)"
        :class="selectTaskId === taskItem.robotCallJobId ? 'active' : ''" v-for="(taskItem, index) in taskList"
        :key="index">
        <div class="title">
          <div class="left">{{taskItem.name}}</div>
          <div class="right-area hover-effect">
            <span class="status" :style="{'background-color':switchStatusColor(taskItem.status).bgColor,color:switchStatusColor(taskItem.status).color}">{{config.constant.robotCallJobStatus[taskItem.status]}}</span>
            <a class="icons">
              <i class="iconfont icon-edited" :class="!hasAccess('crm_callTask_addOrEdit') ? 'disabled' : ''" @click="onEditTask(taskItem.robotCallJobId)" v-if="showEditIcon(taskItem.status)"></i>
              <YiwisePopConfirm
                label="确认删除该任务吗？"
                @submit="deleteRobotCallJob(taskItem.robotCallJobId)"
                :disabled="!hasAccess('crm_callTask_del')"
              >
                <i class="iconfont icon-delet" :class="!hasAccess('crm_callTask_del') ? 'disabled' : ''"></i>
              </YiwisePopConfirm>
            </a>
          </div>
        </div>
        <task-reason :hangUpReason="taskItem.hangUpReason" :taskStatus="taskItem.status" :nextStartTime="taskItem.nextStartTime"></task-reason>
        <div class="progress">
          <span class="num">进度: {{taskItem.completedTask}}/{{taskItem.taskCallTotal}}</span>
          <span class="progress-wrap">
            <el-progress :percentage="progressPercent(taskItem.completedTask, taskItem.taskCallTotal)"
              color="#A8D4FC"
              :text-inside="true"></el-progress>
          </span>
        </div>
        <div class="creation">
          <div class="name">{{taskItem.createUserName}}</div>
          <div>创建于{{taskItem.createTime}}</div>
        </div>
        <em class="arrow" v-if="selectTaskId === taskItem.robotCallJobId"></em>
      </li>
    </ul>
    <el-pagination
      small
      layout="prev, pager, next"
      :current-page="pagingParams.pageNum"
      :page-size="20"
      :total="totalElements"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>
</template>

<script>
import * as taskAPI from '@/api/task'
import * as constant from '@/utils/constant'
import { switchStatusColor, EDIT_TYPE_LIST } from '../utils/enum'
import Connect from '../utils/connect'
import { YiwisePopConfirm } from 'yiwise-components'
import TaskReason from './reason'

export default {
  mixins: [Connect],
  props: {
    pagingParams: {
      type: Object,
      default() {
        return {
          pageNum: 1,
          pageSize: 20
        }
      }
    }
  },
  data() {
    return {
      totalElements: undefined,
      switchStatusColor,
      config: {
        constant
      },
      timerStatus: undefined
    }
  },
  computed: {
    taskList() {
      return this.$store.state.taskV2.taskList
    },
    selectTaskId() {
      return this.$store.state.taskV2.selectTaskId
    },
    refreshTaskList() {
      return this.$store.state.taskV2.refresh
    },
    currentTaskDetail() {
      return this.$store.state.taskV2.taskDetail
    },
    addTaskSuccess() {
      return this.$store.state.taskV2.addTaskSuccess
    }
  },
  components: {
    YiwisePopConfirm,
    TaskReason
  },
  methods: {
    async loadData(noReSelectTaskId) {
      const { content: taskList, totalElements } = (await taskAPI.getRobotCallJobList({
        ...this.pagingParams
      })).data.data
      const taskIdList = taskList.map(item => item.robotCallJobId)
      let progressObj = []
      if (taskIdList && taskIdList.length) {
        progressObj = (await taskAPI.getRobotCallJobProgressList(taskIdList)).data.data
      }
      taskList.forEach((item) => {
        const { taskCompleted, taskTotal } = progressObj[item.robotCallJobId]
        item.completedTask = taskCompleted
        item.taskCallTotal = taskTotal
      })
      this.__updateTaskList(taskList)
      if (totalElements && !noReSelectTaskId) {
        this.onSelectTask(taskList[0])
      }
      this.totalElements = totalElements
      this.poolingStatus()
    },
    progressPercent(completed, total) {
      completed = completed || 0
      total = total || 0
      return total ? Math.max(0, Math.min(100, Number(((completed) / (total) * 100).toFixed(2)))) : 0
    },
    handleCurrentChange(val) {
      this.pagingParams.pageNum = val
      document.querySelector('.task-list').scrollTop = 0
      this.loadData()
    },
    async deleteRobotCallJob(robotCallJobId) {
      await taskAPI.deleteRobotCallJob({ robotCallJobId })
      this.loadData()
    },
    onSelectTask(robotCallJob) {
      this.$store.commit('UPDATE_OVERVIEW_JUMP_CALLED_WITH_CUSTOMER_CONCERN', undefined)
      this.$store.commit('SELECT_TASK_ID', robotCallJob.robotCallJobId)
      this.$store.commit('SELECT_INTENT_LEVEL_TAG_ID', robotCallJob.intentLevelTagId)
    },
    onEditTask(taskId) {
      if (!this.hasAccess('crm_callTask_addOrEdit')) {
        this.$message.success('当前状态不可编辑！')
        return
      }
      this.$nextTick(() => {
        this.$emit('editItem')
      })
      // this.__updateEditTaskId(taskId)
      // this.$emit('update:addTaskDialogVisible', true)
    },
    showEditIcon(status) {
      return EDIT_TYPE_LIST.includes(status)
    },
    poolingStatus() {
      if (this.timerStatus) {
        clearInterval(this.timerStatus)
      }
      this.timerStatus = setInterval(() => {
        const needPoolingTaskIdList = this.taskList.filter(item => item.status !== 'COMPLETED').map(item => item.robotCallJobId)
        needPoolingTaskIdList && needPoolingTaskIdList.length && taskAPI.getTaskStatusList(needPoolingTaskIdList)
          .then((res) => {
            const statusList = res.data.data
            let statusObj = {}
            statusList.forEach((item) => {
              statusObj = { ...statusObj, ...item }
            })
            this.taskList.forEach((taskItem) => {
              const { status, nextStartTime } = statusObj[taskItem.robotCallJobId] || {}
              if (status && taskItem.robotCallJobId === this.selectTaskId) {
                taskItem.status = status
                taskItem.nextStartTime = nextStartTime
                const robotCallJob = this.currentTaskDetail.robotCallJob
                robotCallJob.status = taskItem.status
                robotCallJob.nextStartTime = taskItem.nextStartTime
                this.__updateTaskDetail(robotCallJob)
              }
            })
          })
          .catch(() => {
            return
          })
      }, 10000)
    }
  },
  watch: {
    pagingParams() {
      this.loadData()
    },
    refreshTaskList(value) {
      if (value) {
        this.loadData(true)
        this.__refreshTaskList(false)
      }
    },
    addTaskSuccess(value) {
      if (value) {
        this.pagingParams.pageNum = 1
        this.loadData()
        this.__addTaskSuccess(false)
      }
    }
  },
  mounted() {
    this.loadData()
  },
  beforeDestroy() {
    clearInterval(this.timerStatus)
  }
}
</script>

<style lang="scss" scoped>
@import "~src/styles/mixin.scss";

ul {
  margin: 0;
  padding: 0;
  li {
    list-style-type: none;
  }
}

.task-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  .task-list {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    @include transparentScrollBar();

    .task-item {
      width: 244px;
      position: relative;
      padding: 12px 9px;
      background-color: white;
      margin-top: 12px;
      border-radius: 4px;

      &:first-child {
        margin-top: 0;
      }

      &:hover {
        .title .right-area {
          &.hover-effect {
            .status {
              display: none;
            }
            .icons {
              display: block;
              text-align: right;

              i {
                color: #1890FF;
              }

              span {
                margin-left: 5px;
              }
            }
          }
        }
      }

      &.active {
        border: 2px solid #1890FF;
      }

      .arrow {
        position: absolute;
        width: 0;
        height: 0;
        border-width: 8px;
        border-style: solid;
        border-color: transparent transparent transparent #1890FF;
        top: 50%;
        right: -16px;
        margin-top: -8px;
      }

      .title {
        font-size: 16px;
        display: flex;
        color: #4A4A4A;
        justify-content: space-between;

        .left {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 600;
          line-height: 24px;
        }

        .right-area {
          width: 60px;
          margin-left: 7px;
          font-size: 12px;

          .status {
            float: right;
            padding: 0 6px;
            height: 24px;
            text-align: center;
            line-height: 24px;
          }

          .icons {
            display: none;
            width: 60px;
            height: 24px;
            line-height: 24px;
            font-size: 16px;
            text-align: center;
          }
        }
      }

      .progress {
        margin-top: 16px;
        font-size: 13px;
        display: flex;

        .progress-wrap {
          flex: 1;
          margin-left: 8px;

          /deep/ .el-progress-bar__innerText {
            display: none !important;
          }
        }
      }

      .creation {
        margin-top: 16px;
        font-size: 13px;
        color: #666666;

        .name {
          margin-bottom: 2px;
        }
      }
    }
  }

  .empty-list {
    height: 100%;
    background-color: white;
    color: #333333;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    font-size: 18px;
  }

  .el-pagination {
    background-color: white;
    text-align: center;
    width: 244px;
  }
}
</style>
