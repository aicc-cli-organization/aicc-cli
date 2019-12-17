<template>
  <task-layout>
    <template slot="filter">
      <filter-bar :pagingParams.sync="pagingParams"></filter-bar>
    </template>
    <template slot="left">
      <batch-btns></batch-btns>
      <div class="list-wrap">
        <left-list :pagingParams="pagingParams" @editItem="onEditItem"></left-list>
      </div>
    </template>
    <template slot="right">
      <el-tabs class="tabs" v-model="activeTab">
        <el-tab-pane label="运行概况" lazy name="overview">
          <overview ref="overview" @importSuccessCallback="onImportSuccessCallback"></overview>
        </el-tab-pane>
        <el-tab-pane :label="`未呼${customerStr}列表`" name="uncalled">
          <uncalled-list ref="uncalled"></uncalled-list>
        </el-tab-pane>
        <el-tab-pane :label="`已呼${customerStr}列表`" lazy name="called">
          <called-list @update="onImportSuccessCallback"></called-list>
        </el-tab-pane>
        <el-tab-pane label="操作日志" lazy name="operation">
          <operation-log></operation-log>
        </el-tab-pane>
      </el-tabs>
    </template>
  </task-layout>
</template>

<script>
  import TaskLayout from '@/components/task/layout'
  import FilterBar from './filterBar/index'
  import LeftList from './leftList/index'
  import Overview from './overview/index'
  import UncalledList from './uncalledList/index'
  import CalledList from './calledList/index'
  import OperationLog from './log/index'
  import BatchBtns from './components/batchBtns'
  import Connect from './utils/connect'
  import PhoneTaskWebSocket from '@/mixins/phoneTaskWebSocket'
  import { mapGetters } from 'vuex'

  export default {
    mixins: [PhoneTaskWebSocket, Connect],
    data() {
      return {
        pagingParams: undefined
      }
    },
    components: {
      TaskLayout,
      FilterBar,
      BatchBtns,
      LeftList,
      Overview,
      UncalledList,
      CalledList,
      OperationLog
    },
    computed: {
      ...mapGetters([
        'customerStr'
      ]),
      activeTab: {
        get() {
          return this.$store.state.taskV2.activeTab
        },
        set(value) {
          this.__updateTaskTab(value)
        }
      }
    },
    methods: {
      onImportSuccessCallback() {
        this.$refs.uncalled.onRefresh()
      },
      onEditItem() {
        this.$refs.overview.onEditTask()
      }
    },
    mounted() {
      this.connect()
    }
  }
</script>

<style lang="scss" scoped>
@import "~src/styles/mixin.scss";
.list-wrap {
  flex: 1;
  overflow: hidden;
}

/deep/ .tabs {
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  > .el-tabs__header {
    margin-bottom: 0;
  }
  > .el-tabs__content {
    flex: 1;
    overflow: auto;
    @include transparentScrollBar();
    .el-tab-pane {
      height: 100%;
    }
  }
}
</style>
