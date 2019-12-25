<template>
  <task-layout noFilter>
    <template slot="left">
      <filter-bar
        ref="filterBar"
        slot="filter"
        @search="search"
      ></filter-bar>
      <el-button class="add-btn" type="primary" @click="onOpenAddIvrDialog">
        <i class="iconfont icon-xinjianrenwu1 const-add-icon"></i>
        新建语音导航
      </el-button>
      <div class="list-wrap">
        <left-list slot="left" ref="leftList" @emptyFilterBar="onEmptyFilterBar"></left-list>
      </div>
      <add-ivr-dialog :visible.sync="addIvrDialogVisible" type="add" @addSuccess="onAddSuccess"></add-ivr-dialog>
    </template>
    <template slot="right">
      <div class="ivr-detail" :class="{'full': fullScreen}">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="主导航流程" name="flow">
            <process @refreshLeftList="refreshLeftList"></process>
          </el-tab-pane>
          <el-tab-pane label="训练测试" name="training" lazy>
            <ivr-training @refreshHistory="onRefreshHistory"></ivr-training>
          </el-tab-pane>
          <el-tab-pane label="训练历史" name="history" lazy>
            <receptions
              ref="history"
              v-if="selectIVRId"
              v-bind="$attrs"
              receptionType="IVR"
              key="IVR" seatType="IVR"
              entrance="training"
              :traningDialogFlowId="selectIVRId">
            </receptions>
          </el-tab-pane>
        </el-tabs>
        <a class="iconfont control-full-icon" :class="fullScreen ? 'icon-huifuquanpingx': 'icon-quanpingx'" @click="onToggleFullScreen"></a>
      </div>
    </template>
  </task-layout>
</template>

<script>
import TaskLayout from '@/components/task/layout'
import LeftList from './leftList/index'
import FilterBar from './filterBar/index'
import IvrTraining from './training/index'
import AddIvrDialog from './components/copyOrAddOrEditIVR'
import process from './process'
import receptions from '@/views/customer/contactHistory/receptions'

export default {
  components: {
    TaskLayout,
    LeftList,
    process,
    FilterBar,
    IvrTraining,
    AddIvrDialog,
    receptions
  },
  data() {
    return {
      activeTab: 'flow',
      addIvrDialogVisible: false,
      pagingParams: undefined,
      fullScreen: false
    }
  },
  computed: {
    selectIVRId() {
      return this.$store.state.ivr.selectIVRId
    }
  },
  methods: {
    onOpenAddIvrDialog() {
      this.addIvrDialogVisible = true
    },
    search(params) {
      this.$refs.leftList.loadData({
        ...params,
        pageNum: 1
      })
    },
    onAddSuccess() {
      this.$refs.leftList.loadData({
        pageNum: 1,
        searchWords: undefined
      })
      this.onEmptyFilterBar()
    },
    refreshLeftList() {
      this.$refs.leftList.loadData({
        pageNum: this.$refs.leftList.pageNum,
        searchWords: this.$refs.filterBar.searchWords
      }, false)
    },
    onEmptyFilterBar() {
      this.$refs.filterBar.emptyFilter()
    },
    onToggleFullScreen() {
      this.fullScreen = !this.fullScreen
    },
    onRefreshHistory() {
      this.$refs.history && this.$refs.history.refresh()
    }
  }
}
</script>

<style lang="scss" scoped>
.list-wrap {
  flex: 1;
  padding-top: 12px;
  overflow: hidden;
}
.add-btn {
  width: 244px;
  margin-top: 12px;
  .const-add-icon {
    font-size: 12px;
    margin-right: 10px;
  }
}
.ivr-detail {
  position: relative;
  height: 100%;
  background-color: white;
  &.full {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1999;
  }
  /deep/ .el-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
    .el-tabs__header {
      margin-bottom: 0;
    }
    .el-tabs__content {
      flex: 1;
      .el-tab-pane {
        height: 100%;
        overflow: auto;
      }
    }
    .el-tab-pane {
      height: 100%;
    }
  }
  .control-full-icon {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
