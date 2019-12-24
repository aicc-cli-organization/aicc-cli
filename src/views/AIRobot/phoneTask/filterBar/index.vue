<template>
  <div class="filter-bar">
    <el-button
      class="add-task"
      @click="openAddTaskDialog"
      type="primary"
      :disabled="!hasAccess('crm_callTask_addOrEdit')">
      <i class="iconfont icon-xinjianrenwu1"></i>新建任务
    </el-button>
    <search-input
      placeholder="搜索任务名称"
      width="200px"
      v-model="name"
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
    <el-select
      class="status-select"
      v-model="status"
      @change="search">
      <el-option
        v-for="(value, key) in TASK_STATUS"
        :key="key"
        :label="value"
        :value="key"
      ></el-option>
    </el-select>
    <el-button @click="reset" type="primary">清空筛选条件</el-button>
    <task-form :visible.sync="taskFormVisible" type="add"></task-form>
  </div>
</template>

<script>
import { SearchInput } from 'yiwise-components'
import { TASK_STATUS } from '../utils/enum'
import TaskForm from '../taskForm/index'

export default {
  components: {
    SearchInput,
    TaskForm
  },
  data() {
    return {
      TASK_STATUS,
      name: undefined,
      status: undefined,
      datepicker: undefined,
      taskFormVisible: false
    }
  },
  methods: {
    openAddTaskDialog() {
      this.taskFormVisible = true
    },
    search() {
      this.$emit('update:pagingParams', this.pagingParams)
    },
    reset() {
      this.name = undefined
      this.status = undefined
      this.datepicker = undefined
      this.beginCreateDate = undefined
      this.endCreateDate = undefined
      this.search()
    }
  },
  computed: {
    pagingParams() {
      return {
        name: this.name || undefined,
        status: this.status || undefined,
        beginCreateDate: this.datepicker ? this.datepicker[0] : undefined,
        endCreateDate: this.datepicker ? this.datepicker[1] : undefined
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
  /deep/ .status-select {
    margin-right: 12px;
  }
  /deep/ .el-date-editor {
    width: 250px;
  }
  .el-button {
    vertical-align: top;
  }
}
</style>
