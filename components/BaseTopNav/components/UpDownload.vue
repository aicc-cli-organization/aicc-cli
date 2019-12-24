<template>
  <el-popover
    class="download-and-upload-popover relative"
    width="760"
    trigger="click"
    @show="handleShow"
  >
    <div class="download-and-upload">
      <div class="title-container">
        <span class="title ml15">导入导出列表</span>
      </div>
      <div class="outer-container">
        <WSPaginationTable
          url="/apiEngine/springBatchJob/jobInstances"
          webSocketUrl="/apiEngine/webSocket/user"
          ref="table"
          :server="'engine'"
          stripe
          :max-height="400"
          :pageZero="false"
          >
          <el-table-column
            fixed
            prop="jobName"
            label="任务名称"
            width="150">
          </el-table-column>
          <el-table-column
            prop="jobTypeName"
            label="类型"
            width="120">
          </el-table-column>
          <el-table-column
            prop="status"
            :show-overflow-tooltip="true"
            label="状态"
            width="">
            <template slot-scope="scope">
              {{springBatchJobENUM[scope.row.queryStatus]}}
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
            </template>
          </el-table-column>
        </WSPaginationTable>
      </div>
    </div>
    <div slot="reference">
      <i class="iconfont icon-shangchuanxiazaix cp iconcont-popover"></i>
      <!-- <div class="dot" v-show="showDownloadAndUploadDot"></div> -->
    </div>
  </el-popover>
</template>

<script>
import WSPaginationTable from '@aicc/components/WSPaginationTable'
import { resumeJob, stopJob } from '@aicc/api/csv'
import { springBatchJobENUM } from '../utils.js'

export default {
  components: {
    WSPaginationTable
  },
  data() {
    return {
      springBatchJobENUM
    }
  },
  methods: {
    handleShow() {
      // this.$store.commit('HIDE_DOWNLOAD_AND_UPLOAD_DOT')
      this.$nextTick(() => {
        this.loadData()
      })
    },
    loadData(page = 1, size = 20) {
      this.$refs.table.loadData(page, size)
    },
    resumeJob(jobInstanceId) {
      resumeJob({
        jobInstanceId
      }).then(({ data }) => {
        this.loadData()
      })
    },
    stopJob(jobInstanceId) {
      stopJob({
        jobInstanceId
      }).then(({ data }) => {
        this.loadData()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
.download-and-upload-popover {
  cursor: pointer;
  margin-right: 40px;
  &:hover {
    .iconfont {
      color: $--color-primary;
    }
  }
}
/deep/ .el-popover {
  position: absolute;
  background: #fff;
  min-width: 150px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 0px;
  z-index: 2000;
  color: #666;
  line-height: 1.4;
  text-align: justify;
  font-size: 14px;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.dot{
  height: 6px;
  width: 6px;
  border-radius: 5px;
  background: red;
  position: absolute;
  top: -5px;
  right: -5px;
}
.icon-yunshangchuan {
    display: block;
    position: relative;
}
.popoverImg {
  position: relative;
  display: block;
  height: 40px;
  width: 40px;
}
.download-and-upload-button {
  height: 59px!important;
  position: relative;
  border: none;
  background-color: #fff;
}
</style>

<style scoped>
  /deep/ .el-card__body {
    padding: 0;
  }
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
  .fold {
  }
  .spreed {
  }
  .none {
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
