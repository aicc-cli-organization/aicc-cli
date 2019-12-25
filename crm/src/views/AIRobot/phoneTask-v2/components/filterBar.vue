<template>
  <div class="filter-bar">
    <el-button
      class="add-task"
      @click="openAddTaskDialog"
      type="primary"
      :disabled="!hasAccess('crm_callTask_addOrEdit')"
    >
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
      v-model="statusSet"
      @change="search"
      clearable
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
    <el-button
      class="button-primary"
      @click="openInterceptDialog"
    ><img :src="svgSrc" class="">外呼拦截
    </el-button>
  </div>
</template>

<script>
import { SearchInput } from 'yiwise-components'
import {
  FILTER_TASK_STATUS
} from '../config/enum'
import Connect from '../config/connect'
import AddTaskDialog from './addTaskDialog.vue'

export default {
  mixins: [Connect],
  components: {
    SearchInput,
    AddTaskDialog
  },
  data() {
    return {
      FILTER_TASK_STATUS,
      name: undefined,
      statusSet: undefined,
      datepicker: undefined,
      svgSrc: '/static/img/hujiaolangjie_h.svg',
    }
  },
  methods: {
    openAddTaskDialog() {
      this.$emit('update:addTaskDialogVisible', true)
      // this.$emit('update:selectTaskId', undefined)
      this.__updateEditTaskId(undefined)
    },
    openInterceptDialog() {
      this.$emit('update:interceptDialogVisible', true)
    },
    search() {
      this.$emit('update:pagingParams', this.pagingParams)
    },
    reset() {
      this.name = undefined
      this.statusSet = undefined
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
        statusSet: this.statusSet || undefined,
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
  .button-primary {
    float: right;
    margin-right: 5px;
    color: #1890ff;
    border: 1px solid #1890ff;
    img {
      margin-right: 5px;
      vertical-align: -3px;
    }
  }
}
</style>
