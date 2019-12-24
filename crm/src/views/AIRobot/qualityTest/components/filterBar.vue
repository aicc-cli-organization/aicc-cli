<template>
  <div class="filter-bar">
    <el-button
      :disabled="!hasAccess('crm_qc_job_edit')"
      class="add-task"
      @click="openAddTaskDialog"
      type="primary">
      <i class="iconfont icon-xinjianrenwu1"></i>新建质检任务
    </el-button>
    <search-input
      placeholder="搜索任务名称"
      width="200px"
      v-model="jobName"
      @search="search"
    ></search-input>
    <el-date-picker
      v-model="datepicker"
      type="daterange"
      prefix-icon="el"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      value-format="yyyy-MM-dd"
      @change="search"
    ></el-date-picker>
    <!-- <el-select
      class="w150"
      v-model="jobType"
      placeholder="全部任务类型"
      @change="search"
      clearable
    >
      <el-option
        v-for="(v, k) in QUALITY_TYPE"
        :key="k"
        :label="v"
        :value="k"
      ></el-option>
    </el-select> -->
    <el-select
      class="w150"
      v-model="jobStatus"
      placeholder="全部任务状态"
      clearable
      @change="search">
      <el-option
        v-for="(value, key) in TASK_STATUS"
        :key="key"
        :label="value"
        :value="key"
      ></el-option>
    </el-select>
    <el-button @click="reset" type="primary">清空筛选条件</el-button>
    <task-form :visible.sync="visible" @addSuccess="$emit('addSuccess')"></task-form>
  </div>
</template>

<script>
import { SearchInput } from 'yiwise-components'
import { TASK_STATUS, QUALITY_TYPE } from '../utils/enum'
import TaskForm from '../taskForm/index'

export default {
  components: {
    SearchInput,
    TaskForm
  },
  data() {
    return {
      TASK_STATUS,
      QUALITY_TYPE,
      jobName: undefined,
      jobStatus: undefined,
      jobType: undefined,
      status: undefined,
      datepicker: undefined,
      visible: false
    }
  },
  methods: {
    openAddTaskDialog() {
      this.visible = true
    },
    search() {
      this.$emit('search', this.pagingParams)
    },
    reset() {
      this.jobName = undefined
      this.jobType = undefined
      this.jobStatus = undefined
      this.datepicker = undefined
      this.fromDate = undefined
      this.toDate = undefined
      this.search()
    }
  },
  computed: {
    pagingParams() {
      return {
        jobName: this.jobName || undefined,
        jobType: this.jobType || undefined,
        jobStatus: this.jobStatus || undefined,
        fromDate: this.datepicker ? this.datepicker[0] : undefined,
        toDate: this.datepicker ? this.datepicker[1] : undefined
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-bar {
  .add-task {
    width: 244px;
    margin-right: 16px;
    vertical-align: top;
    i {
      font-size: 12px;
      margin-right: 10px;
    }
  }
  .search-input,
  /deep/ .el-date-editor,
  /deep/ .el-select {
    margin-right: 12px;
  }
  /deep/ .el-date-editor {
    width: 250px;
  }
  .el-button {
    vertical-align: top;
  }
  .w150 {
    width: 150px;
  }
}
</style>
