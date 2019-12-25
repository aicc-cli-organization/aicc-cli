<template>
  <div id="sms-task">
    <filter-bar :pagingParams.sync="pagingParams"></filter-bar>
    <div class="container">
      <div class="left-con">
        <left-list :pagingParams.sync="pagingParams" @editItem="onEditTaskItem"></left-list>
      </div>
      <div class="right-con">
        <el-tabs>
          <el-tab-pane label="运行概况">
            <sms-overview ref="overview"></sms-overview>
          </el-tab-pane>
          <el-tab-pane label="操作日志">
            <sms-log></sms-log>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import FilterBar from './components/filterBar'
import LeftList from './leftList'
import SmsOverview from './overview'
import SmsSended from './sended'
import SmsLog from './log'

export default {
  data() {
    return {
      pagingParams: {
        pageNum: 1
      }
    }
  },
  components: {
    FilterBar,
    LeftList,
    SmsOverview,
    SmsSended,
    SmsLog
  },
  methods: {
    onEditTaskItem() {
      this.$refs.overview.onEditTask()
    }
  }
}
</script>

<style lang="scss" scoped>
#sms-task {
  height: 100%;
  display: flex;
  flex-direction: column;
  .container {
    flex: 1;
    margin-top: 10px;
    display: flex;
    min-height: 0;
    .left-con {
      width: 260px;
    }
    .right-con {
      flex: 1;
      margin-left: 20px;
      overflow-x: hidden;
      /deep/ .el-tabs {
        display: flex;
        flex-direction: column;
        height: 100%;
        .el-tabs__header {
          margin-bottom: 0;
        }
        .el-tabs__content {
          flex: 1;
          background-color: #ffffff;
        }
      }
    }
  }
}
</style>
