<template>
  <div class="download-and-upload">
    <div class="title-container">
      <span class="title ml15">导入导出列表</span>
    </div>
    <div class="outer-container">
      <WebSocketPaginationTable
      url="/apiEngine/springBatchJob/jobInstances"
      webSocketUrl="/apiEngine/webSocket/user"
      ref="table"
      :server="'engine'"
      stripe
      :max-height="400"
      :pageZero="false"
      @onSocketMsg="onSocketMsg"
      >
        <el-table-column
          fixed
          prop="jobName"
          label="任务名称"
          width="150">
        </el-table-column>
        <el-table-column
          prop="jobType"
          label="类型"
          width="120">
          <template slot-scope="scope">
            {{constant.springBatchJobTypeENUM[scope.row.jobType]}}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :show-overflow-tooltip="true"
          label="状态"
          width="">
          <template slot-scope="scope">
            {{getStatuseStr(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column
          prop="successCount"
          label="成功条数"
          width="70">
        </el-table-column>
        <el-table-column
          prop="failureCount"
          label="失败条数"
          width="70">
        </el-table-column>
        <el-table-column
          prop="createdByUserName"
          label="操作人"
          width="60">
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="操作时间"
          width="80">
        </el-table-column>
        <el-table-column
          label="操作"
          width="80">
          <template slot-scope="scope">
            <el-button v-if="scope.row.ossUrl" type="text">
              <a size="medium" :href="scope.row.ossUrl" target="_blank">下载</a>
            </el-button>
            <!-- , 'STOPPED', 'STOPPING' -->
            <el-button
              v-if="['EXECUTING', 'QUEUEING'].includes(scope.row.queryStatus)"
              @click="cancel(scope.row)"
              type="text"
            >取消</el-button>
            <!-- <el-button v-if="scope.row.queryStatus=='STOPPED'"
              @click="resumeJob(scope.row.jobInstanceId)" type="text">恢复任务</el-button>
            <el-button v-if="scope.row.queryStatus=='QUEUEING'"
              @click="stopJob(scope.row.jobInstanceId)" type="text">暂停任务</el-button> -->
          </template>
        </el-table-column>
      </WebSocketPaginationTable>
    </div>
  </div>
</template>

<script>
import { WebSocketPaginationTable } from 'yiwise-components'
import * as constant from '@/utils/constant'
import { resumeJob, stopJob, cancelJob } from '@/api/csv'

export default {
  components: {
    WebSocketPaginationTable
  },
  data() {
    return {
      constant
    }
  },
  methods: {
    getStatuseStr(row) {
      if (row.queryStatus === 'CANCELLED') {
        // if (!row.successCount && !row.successCount) {
        return '已取消'
        // } else {
        //   const type = row.jobType.includes('IMPORT') ? '已导入'
        //     : row.jobType.includes('EXPORT') ? '已导出' : ''
        //   return `已经完成，由于运行中被取消，请下载查看${type}列表`
        // }
      }

      return constant.springBatchJobENUM[row.queryStatus]
    },
    loadData(page = 1, size = 20) {
      this.$refs.table.loadData(page, size)
    },
    onSocketMsg(res) {
      if (res.body) {
        const body = JSON.parse(res.body)
        const data = body.data.info

        if (data.queryStatus === 'CANCELLED' && data.name && (data.name.includes('Import') || data.name.includes('import')))  {
          const completedCount = data.successProgress + data.failProgress
          this.$message({
            message: `任务已取消，当前完成${completedCount}条，未完成${data.totalProgress - completedCount}条`,
            type: 'success',
            duration: 3500
          })
          // 等后端状态更新再度刷新
          setTimeout(() => {
            this.loadData()
          }, 200)
        }
      }
    },
    async resumeJob(jobInstanceId) {
      await resumeJob({
        jobInstanceId
      })
      this.loadData()
    },
    async stopJob(jobInstanceId) {
      await stopJob({
        jobInstanceId
      })
      this.loadData()
    },
    async cancel(row) {
      await cancelJob({
        jobInstanceId: row.jobInstanceId
      })
      this.loadData()
    }
  }
}
</script>

<style scoped>
  .download-and-upload {
    background: #fff;
    bottom: 0;
    right: 0;
  }
  .title-container{
    width: 760px;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    color: #333;
    font-weight: 700;
    justify-content: space-between;
    margin: -12px -12px 12px -12px;
  }
  .title-container .title{
    width: 100px;
  }
  .button {
    width: 60px;
  }
  .pagination-container{
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .bottom-pagination{
    height: 46px;
    border-top: 1px solid #ebeef5;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .pagination-container {
    width: 400px;
    margin: 8px auto;
    position: relative;
  }
  .outer-container {
  	border-left: solid 1px #e7ebf1;
	  border-right: solid 1px #e7ebf1;
	  border-bottom: solid 1px #e7ebf1;
  }
</style>
