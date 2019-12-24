<template>
  <div class="tab-task">
    <task-layout>
      <filter-bar slot="filter" @search="onSearch" @addSuccess="onAddSuccess"></filter-bar>
      <left-list slot="left" ref="leftList" @edit="onEdit"></left-list>
      <el-tabs slot="right" class="detail-tabs">
        <el-tab-pane label="运行概况">
          <task-detail-overview
            ref="overview"
            @refresh="onRefresh"
            @editSuccess="onEditSuccess"
          ></task-detail-overview>
        </el-tab-pane>
        <el-tab-pane label="未质检记录">
          <task-detail-unchecked></task-detail-unchecked>
        </el-tab-pane>
        <el-tab-pane label="已质检记录">
          <task-detail-checked></task-detail-checked>
        </el-tab-pane>
        <el-tab-pane label="操作日志">
          <task-log></task-log>
        </el-tab-pane>
      </el-tabs>
    </task-layout>
  </div>
</template>

<script>
import TaskLayout from '@/components/task/layout'
import FilterBar from '../components/filterBar'
import LeftList from '../components/taskLeftList'
import TaskDetailOverview from '../taskDetail/overview'
import TaskDetailUnchecked from '../taskDetail/unchecked'
import TaskDetailChecked from '../taskDetail/checked'
import TaskLog from '../taskDetail/log'

export default {
  components: {
    TaskLayout,
    FilterBar,
    LeftList,
    TaskDetailOverview,
    TaskDetailUnchecked,
    TaskDetailChecked,
    TaskLog
  },
  methods: {
    onSearch(params) {
      this.$refs.leftList.loadData(params)
    },
    onAddSuccess() {
      this.$refs.leftList.loadData({
        pageNum: 1
      })
    },
    onEdit() {
      this.$refs.overview.onEdit()
    },
    onEditSuccess() {
      this.$refs.leftList.loadData(undefined, false)
    },
    onRefresh() {
      this.$refs.leftList.loadData(undefined, false)
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-task {
  height: 100%;
  /deep/ .empty-list {
    width: 244px;
  }
  /deep/ .detail-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
    .el-tabs__header {
      margin-bottom: 0;
    }
    .el-tabs__content {
      padding: 20px;
      flex: 1;
      overflow-y: auto;
      background-color: white;
    }
  }
}
</style>
