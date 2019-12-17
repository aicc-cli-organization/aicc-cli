<template>
  <div class="btns">
    <el-button class="start-all" @click="onStartAllTask" :disabled="!hasAccess('crm_callTask_startOrStop')">开始全部任务</el-button>
    <el-button class="pause-all" @click="onPauseAllTask" :disabled="!hasAccess('crm_callTask_startOrStop')">暂停全部任务</el-button>
    <check-robot-call-job-dialog
      :visible.sync="checkRobotCallJobDialogVisible"
      :operation="operation"
      @executeCallback="excuteRobotCallJobCallback">
    </check-robot-call-job-dialog>
    <excute-robot-call-job-result-list-dialog
      :visible.sync="excuteRobotCallJobResultListVisible"
      :list.sync="excuteRobotCallJobResultList">
    </excute-robot-call-job-result-list-dialog>
  </div>
</template>

<script>
import CheckRobotCallJobDialog from './checkRobotCallJobDialog'
import ExcuteRobotCallJobResultListDialog from './excuteRobotCallJobResultListDialog'
import Connect from '../utils/connect'

export default {
  mixins: [Connect],
  data() {
    return {
      checkRobotCallJobDialogVisible: false,
      excuteRobotCallJobResultListVisible: false,
      excuteRobotCallJobResultList: [],
      operation: undefined
    }
  },
  components: {
    CheckRobotCallJobDialog,
    ExcuteRobotCallJobResultListDialog
  },
  methods: {
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
    }
  }
}
</script>

<style lang="scss" scoped>
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
</style>
