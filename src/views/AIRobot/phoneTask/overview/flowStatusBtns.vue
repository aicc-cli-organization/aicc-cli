<template>
  <span class="task-operation-btns">
    <el-button 
      v-for="(item, index) in TASK_OPERATION_ENUM[robotCallJobDetail.robotCallJob.status]"
      :key="index"
      size="mini"
      :type="item.btnType || 'primary'"
      @click="flowTaskStatus(item.value, item.text)"
      :disabled="!hasAccess('crm_callTask_startOrStop')"
      :plain="!!item.plain"
    >
      <i class="iconfont f10" :class="item.icon"></i>
      {{item.text}}
    </el-button>
  </span>
</template>

<script>
import { hasAccess } from '@/utils/access'
import * as taskApi from '@/api/task'
import { mapGetters } from 'vuex'

// 任务状态流转
const TASK_OPERATION_ENUM = {
  NOT_STARTED: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  SYSTEM_SUSPENDED: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  WAITING_FOR_REDIAL: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  IN_QUEUE: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  IN_PROCESS: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  USER_PAUSE: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  ACCOUNT_DEBT: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  NO_ROBOT_AVAILABLE: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  SYSTEM_HANG_UP: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  ACCOUNT_DISABLE: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }]
}
export default {
  data() {
    return {
      hasAccess,
      TASK_OPERATION_ENUM
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    robotCallJobDetail() {
      return this.$store.state.taskV2.taskDetail
    },
    showImportButton() {
      return !['TERMINATE'].includes(this.robotCallJobDetail.robotCallJob.status)
    }
  },
  methods: {
    async flowTaskStatus(operation, text) {
      const { taskCallTotal, robotCallJob: { robotCallJobId } } = this.robotCallJobDetail
      if (operation === 'START' && taskCallTotal === 0) {
        this.$message.error(`请先导入${this.customerStr}信息`)
        return
      }
      // START  PAUSE  TERMINATE
      await taskApi.executeRobotCallJob({
        robotCallJobId,
        operation
      })
      this.$emit('flowSuccess')
      this.$message.success(`${text}成功`)
    }
  },
}
</script>

<style lang="scss" scoped>
.edit-btn,
.refresh-btn {
  i {
    font-size: 12px;
    margin-right: 5px;
  }
}
</style>

