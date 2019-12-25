<template>
  <div class="filter-bar">
    <el-button
      class="add-task"
      @click="openAddTaskDialog"
      type="primary"
      :disabled="!hasAccess('crm_sms_job_addOrEdit')"
    >
      <i class="iconfont icon-xinjianrenwu1"></i>新建短信任务
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
      placeholder="请选择任务状态"
      v-model="status"
      @change="search"
    >
      <el-option v-for="(value, key) in FILTER_TASK_STATUS"
        :key="key"
        :label="value"
        :value="key"
      ></el-option>
    </el-select>
    <el-button @click="reset"
      type="primary"
    >清空筛选条件</el-button>
    <!-- 新建任务对话框 -->
    <add-sms-dialog
      :visible.sync="addSmsDialogVisible"
    >
    </add-sms-dialog>
  </div>
</template>

<script>
import { SearchInput } from 'yiwise-components'
import AddSmsDialog from './addOrEditSmsDialog'
import {
  FILTER_TASK_STATUS
} from '../config/enum'

export default {
  components: {
    SearchInput,
    AddSmsDialog
  },
  data() {
    return {
      FILTER_TASK_STATUS,
      name: undefined,
      status: undefined,
      datepicker: undefined,
      addSmsDialogVisible: false
    }
  },
  methods: {
    openAddTaskDialog() {
      this.addSmsDialogVisible = true
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
  /deep/ .el-select {
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
