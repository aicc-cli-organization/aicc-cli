<template>
  <div id="phone-task">
    <!-- 筛选区域 -->
    <filter-bar
      :addTaskDialogVisible.sync="addTaskDialogVisible"
      :interceptDialogVisible.sync="interceptDialogVisible"
      :selectTaskId.sync="selectTaskId"
      :pagingParams.sync="pagingParams"></filter-bar>
    <div id="phone-task-body">
      <div id="left">
        <div class="btns">
          <el-button class="start-all" @click="onStartAllTask" :disabled="!hasAccess('crm_callTask_startOrStop')">开始全部任务</el-button>
          <el-button class="pause-all" @click="onPauseAllTask" :disabled="!hasAccess('crm_callTask_startOrStop')">暂停全部任务</el-button>
        </div>
        <div class="list-wrap">
          <task-list :selectTaskId.sync="selectTaskId"
            :addTaskDialogVisible.sync="addTaskDialogVisible"
            :pagingParams="pagingParams"
          ></task-list>
        </div>
      </div>
      <div id="right">
        <el-tabs class="tabs" v-model="activeTab">
          <el-tab-pane label="运行概况" lazy name="overview">
            <overview
              :addTaskDialogVisible.sync="addTaskDialogVisible"
              ref="overview"
              @importSuccessCallback="onImportSuccessCallback"
            ></overview>
          </el-tab-pane>
          <el-tab-pane :label="`未呼${customerStr}列表`" name="uncalled">
            <uncompleted-customer-list :select-task-id="selectTaskId" ref="uncalled"></uncompleted-customer-list>
          </el-tab-pane>
          <el-tab-pane :label="`已呼${customerStr}列表`" lazy name="called">
            <completed-customer-list :select-task-id="selectTaskId" @update="onReAddImport"></completed-customer-list>
          </el-tab-pane>
          <el-tab-pane label="操作日志列表" lazy name="operation">
            <operation-log :select-task-id="selectTaskId"></operation-log>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 弹框 -->
      <intercept-dialog :visible.sync="interceptDialogVisible"
      ></intercept-dialog>

      <!-- 新建任务弹框 -->
      <add-task-dialog :visible.sync="addTaskDialogVisible"
        @update="onEditTaskSuccess"
      ></add-task-dialog>

      <!-- 开始任务/暂停任务弹框 -->
      <check-robot-call-job-dialog
        :visible.sync="checkRobotCallJobDialogVisible"
        :operation="operation"
        @executeCallback="excuteRobotCallJobCallback">
      </check-robot-call-job-dialog>

      <!-- 开始任务/暂停任务提交后失败列表弹框 -->
      <excute-robot-call-job-result-list 
        :visible.sync="excuteRobotCallJobResultListVisible"
        :list.sync="excuteRobotCallJobResultList">
      </excute-robot-call-job-result-list>
    </div>
  </div>
</template>

<script>
  import {
    FilterBar,
    AddTaskDialog,
    InterceptDialog,
    Overview,
    TaskList,
    CheckRobotCallJobDialog,
    UncompletedCustomerList,
    CompletedCustomerList,
    ExcuteRobotCallJobResultList
  } from './components'
  import PhoneTaskWebSocket from '@/mixins/phoneTaskWebSocket'
  import Connect from './config/connect'
  import OperationLog from './operationLog'
  import { mapGetters } from 'vuex'

  export default {
    mixins: [PhoneTaskWebSocket, Connect],
    data() {
      return {
        selectTaskId: undefined,
        addTaskDialogVisible: undefined,
        interceptDialogVisible: undefined,
        pagingParams: undefined,
        checkRobotCallJobDialogVisible: undefined,
        operation: undefined,
        excuteRobotCallJobResultListVisible: undefined,
        excuteRobotCallJobResultList: undefined
      }
    },
    components: {
      FilterBar,
      AddTaskDialog,
      InterceptDialog,
      Overview,
      TaskList,
      CheckRobotCallJobDialog,
      UncompletedCustomerList,
      CompletedCustomerList,
      OperationLog,
      ExcuteRobotCallJobResultList
    },
    computed: {
      ...mapGetters([
        'customerStr'
      ]),
      fullStatsInfo() {
        return this.$store.state.taskV2.fullTaskInfo
      },
      activeTab: {
        get() {
          return this.$store.state.taskV2.activeTab
        },
        set(value) {
          this.__updateTaskTab(value)
        }
      }
    },
    methods: {
      onImportSuccessCallback() {
        this.$refs.uncalled && this.$refs.uncalled.onRefresh()
      },
      onReAddImport() {
        this.$refs.overview.updateTaskListProgress()
      },
      onStartAllTask() {
        this.checkRobotCallJobDialogVisible = true
        this.operation = 'START'
      },
      onPauseAllTask() {
        this.checkRobotCallJobDialogVisible = true
        this.operation = 'PAUSE'
      },
      excuteRobotCallJobCallback(list) {
        if (list && list.length) {
          this.excuteRobotCallJobResultList = list
          this.excuteRobotCallJobResultListVisible = true
        }
        this.__refreshTaskList(true)
      },
      onEditTaskSuccess() {
        this.$refs.overview.initOverview()
      }
    },
    mounted() {
      this.connect()
    }
  }
</script>

<style lang="scss" scoped>
@import "src/styles/mixin.scss";

#phone-task {
  height: 100%;
  display: flex;
  flex-direction: column;

  #phone-task-body {
    flex: 1;
    white-space: nowrap;
    margin-top: 10px;
    display: flex;
    overflow: auto;
    
    #left {
      width: 260px;
      height: 100%;
      display: flex;
      flex-direction: column;
      .btns {
        width: 244px;
        display: flex;
        padding-bottom: 12px;

        .start-all {
          background-color: #52C356;
          color: white;
          border: 0;
        }

        .pause-all {
          background-color: #E4B03F;
          color: white;
          border: 0;
        }

        .el-button.is-disabled {
          cursor: not-allowed;
          opacity: .7;
        }

        /deep/ .el-button {
          flex: 1;
          &:last-child {
            margin-left: 12px;
          }
        }
      }
      
      .list-wrap {
        flex: 1;
        overflow: hidden;
      }
    }
    #right {
      flex: 1;
      width: 972px;
      height: 100%;
      margin-left: 20px;

      .tabs {
        border-radius: 4px;
        height: 100%;
        display: flex;
        flex-direction: column;

        /deep/ .el-tabs__header {
          margin-bottom: 0;
        }

        /deep/ .el-tabs__content {
          flex: 1;
          overflow: auto;
          @include transparentScrollBar();

          .el-tab-pane {
            height: 100%;
          }
        }
      }
    }
  }
}
</style>
