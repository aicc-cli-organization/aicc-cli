<template>
  <task-list :totalElements="totalElements" @change="onPageChange">
    <task-item
      @click="onSelectTask(item.smsJobId)"
      :class="{'active': selectTaskId === item.smsJobId}"
      v-for="(item, index) in taskList"
      :key="index"
      :name="item.name"
      :complete="item.completedTask"
      :total="item.taskCallTotal"
      :createUserName="item.createUserName"
      :createTime="item.createTime">
      <task-status slot="status" :status="item.status"></task-status>
      <task-reason slot="reason" :status="item.status" :hangUpReason="item.hangUpReason" location="list"></task-reason>
      <i
        v-if="EDIT_SMS_STATUSES.includes(item.status)"
        slot="edit"
        class="iconfont icon-edited"
        :class="{'disabled': !hasAccess('crm_sms_job_addOrEdit')}"
        @click="onEditTask"></i>
      <YiwisePopConfirm v-if="!REVERSE_DELETE_SMS_STATUSES.includes(item.status)"
        label="确认删除该任务吗？"
        @submit="deleteSmsJob(item.smsJobId)"
        slot="delete"
        :disabled="!hasAccess('crm_sms_job_addOrEdit')"
      >
        <i class="iconfont icon-delet" :class="{'disabled': !hasAccess('crm_sms_job_addOrEdit')}"></i>
      </YiwisePopConfirm>
    </task-item>
  </task-list>
</template>

<script>
import * as SmsAPI from '@/api/sms'
import { YiwisePopConfirm } from 'yiwise-components'
import TaskList from '@/components/taskList'
import TaskItem from '@/components/taskList/taskItem'
import TaskStatus from '../components/taskStatusTag'
import TaskReason from '../components/taskReason'
import { EDIT_SMS_STATUSES, REVERSE_DELETE_SMS_STATUSES } from '../config/enum'

export default {
  props: {
    pagingParams: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      totalElements: undefined,
      EDIT_SMS_STATUSES,
      REVERSE_DELETE_SMS_STATUSES
    }
  },
  components: {
    TaskList,
    TaskItem,
    TaskStatus,
    YiwisePopConfirm,
    TaskReason
  },
  computed: {
    selectTaskId() {
      return this.$store.state.smsTask.selectSmsTaskId
    },
    refreshTask() {
      return this.$store.state.smsTask.refreshTask
    },
    taskList() {
      return this.$store.state.smsTask.taskList
    }
  },
  methods: {
    async loadData(noNeedInitFirstItem) {
      const { data: { data: { content, totalElements } }} = await SmsAPI.getSmsTaskList({
        ...this.pagingParams
      })
      const initSmsJobId = content && content[0] && content[0].smsJobId
      if (initSmsJobId && !noNeedInitFirstItem) {
        this.$store.commit('SMS_SELECT_TASKID', initSmsJobId)
      }
      this.$store.commit('UPDATE_SMS_TASK_LIST', content)
      this.totalElements = totalElements
    },
    onPageChange(pageNum) {
      this.pagingParams.pageNum = pageNum
    },
    onSelectTask(smsJobId) {
      this.$store.commit('SMS_SELECT_TASKID', smsJobId)
    },
    async deleteSmsJob(smsJobId) {
      await SmsAPI.deleteSmsTask(smsJobId)
      this.$message({
        message: '删除成功',
        type: 'success'
      })
      this.loadData()
    },
    onEditTask() {
      if (!this.hasAccess('crm_sms_job_addOrEdit')) {
        return
      }
      this.$nextTick(() => {
        this.$emit('editItem')
      })
    }
  },
  watch: {
    pagingParams: {
      handler: function () {
        this.loadData()
      },
      deep: true
    },
    refreshTask: {
      handler: function (newVal) {
        if (newVal) {
          this.pagingParams.pageNum = 1
          const noNeedInitFirstItem = newVal === 'editSuccess'
          this.loadData(noNeedInitFirstItem)
          this.$store.dispatch('refreshSmsTask', false)
        }
      }
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>
