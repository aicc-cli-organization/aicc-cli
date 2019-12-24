<template>
  <div class="btns">
    <el-button type="primary" @click="onRefresh">
      <i class="iconfont icon-shuaxin"></i>
      刷新
    </el-button>
    <el-button type="primary" @click="$emit('edit')" v-if="canEdit && hasAccess('crm_qc_job_edit')">
      <i class="iconfont icon-edited"></i>
      编辑
    </el-button>
    <el-button
      @click="onFlowTask(item)"
      type="primary"
      v-for="(item, index) in flowBtnList[status]"
      :key="index"
    >
    <i class="iconfont" :class="item.icon"></i>
    {{item.text}}</el-button>
    <el-button
      v-if="canUpload"
      type="primary"
      @click="onOpenUploadWavDialog">
      <i class="el-icon-upload"></i>
      上传录音
    </el-button>
    <upload-wav-dialog
      :qcJobId="selectedTaskId"
      :visible.sync="uploadWavDialogVisible"
    ></upload-wav-dialog>
  </div>
</template>

<script>
import * as qcAPI from '@/api/qualityTest'
import UploadWavDialog from './uploadWavDialog'
import { UPLOAD_RECORD_STATUSES, EDIT_STATUES } from '../utils/enum'

export const flowBtnList = {
  NOT_STARTED: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  IN_PROCESS: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  USER_PAUSE: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  SYSTEM_HANG_UP: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }]
}
export default {
  props: {
    status: String,
    qcJobId: [String, Number]
  },
  data() {
    return {
      flowBtnList,
      uploadWavDialogVisible: false
    }
  },
  components: {
    UploadWavDialog
  },
  computed: {
    selectedTaskId() {
      return this.$store.state.qcTask.selectedTaskId
    },
    taskDetail() {
      return this.$store.state.qcTask.taskDetail
    },
    canUpload() {
      return this.taskDetail.jobProperty === 'UPLOAD' && UPLOAD_RECORD_STATUSES.includes(this.status)
    },
    canEdit() {
      return !!EDIT_STATUES.includes(this.status)
    }
  },
  methods: {
    async onFlowTask({ value, text }) {
      await qcAPI.flowQCTask({
        qcJobId: this.qcJobId,
        operation: value
      })
      this.$message({
        message: `${text}成功`,
        type: 'success'
      })
      this.$emit('flow')
    },
    onOpenUploadWavDialog() {
      this.uploadWavDialogVisible = true
    },
    onRefresh() {
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
.btns {
  float: right;
  /deep/ .el-button {
    i {
      vertical-align: middle;
      font-size: 10px;
    }
  }
}
</style>
