<template>
  <task-list :totalElements="totalElements" @change="onPageChange">
    <task-item
      @click="onSelectItem(item.qcJobId)"
      :class="{'active': selectedTaskId === item.qcJobId}"
      v-for="(item, index) in taskList"
      :key="index"
      :name="item.jobName"
      :complete="item.recordDoneNum"
      :total="item.recordAllNum"
      :createUserName="item.createUserName"
      :createTime="item.createTime"
    >
      <task-type :jobType="item.jobType" slot="reason"></task-type>
      <task-status :status="item.jobStatus" slot="status"></task-status>
      <div class="progress" slot="progress" v-if="item.jobType === 'CALLING'">已质检: {{item.recordDoneNum}}通</div>
      <i
        v-if="EDIT_STATUES.includes(item.jobStatus) && hasAccess('crm_qc_job_edit')"
        class="iconfont icon-edited"
        slot="edit"
        @click="onEditItem(item.qcJobId)"
      ></i>
      <YiwisePopConfirm v-if="DELETE_STATUSES.includes(item.jobStatus) && hasAccess('crm_qc_job_delete')"
        label="确认删除该任务吗？"
        @submit="deleteJob(item.qcJobId)"
        slot="delete"
      >
        <i class="iconfont icon-delet"></i>
      </YiwisePopConfirm>
    </task-item>
  </task-list>
</template>

<script>
import { YiwisePopConfirm } from 'yiwise-components'
import TaskList from '@/components/taskList'
import TaskItem from '@/components/taskList/taskItem'
import * as qcAPI from '@/api/qualityTest'
import { DELETE_STATUSES, EDIT_STATUES } from '../utils/enum'
import TaskType from './jobType'
import TaskStatus from './taskStatus'

export default {
  data() {
    return {
      taskList: undefined,
      totalElements: undefined,
      DELETE_STATUSES,
      EDIT_STATUES,
      pagingParams: {
        pageNum: 1,
        pageSize: 20
      }
    }
  },
  components: {
    TaskList,
    TaskItem,
    YiwisePopConfirm,
    TaskType,
    TaskStatus
  },
  computed: {
    selectedTaskId() {
      return this.$store.state.qcTask.selectedTaskId
    }
  },
  methods: {
    async loadData(params, needInitFirstJob = true) {
      this.pagingParams = {
        ...this.pagingParams,
        ...params
      }
      const res = await qcAPI.getQCTaskList({
        ...this.pagingParams
      })
      const { content, totalElements } = res.data.data
      if (content && content[0] && needInitFirstJob) {
        this.onSelectItem(content[0].qcJobId)
      }
      this.totalElements = totalElements
      this.taskList = content
    },
    async deleteJob(qcJobId) {
      await qcAPI.delQCTask({
        qcJobId
      })
      this.$message({
        message: '删除成功',
        type: 'success'
      })
      const needBackPageNum = Math.max(Math.ceil((this.totalElements - 1) / 20), 1)
      this.loadData({
        pageNum: needBackPageNum
      })
    },
    onSelectItem(qcJobId) {
      this.$store.commit('QC_SELECT_TASKID', qcJobId)
    },
    onEditItem() {
      this.$emit('edit')
    },
    onPageChange(pageNum) {
      this.loadData({
        pageNum
      })
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style lang="scss" scoped>
.progress {
  margin-top: 10px;
}
</style>
