<template>
  <!-- <el-tooltip
    v-if="!row.lineStatus || row.lineStatus.status === 'IDLE'"
    placement="top"
    content="当前线路没有在执行任何AI外呼、人工外呼、AI接待、人工接待任务"
  > -->
    <span class="free" v-if="!row.lineStatus || row.lineStatus.status === 'IDLE'">空闲</span>
  <!-- </el-tooltip> -->

  <el-tooltip
    v-else-if="row.lineStatus && row.lineStatus.status === 'OCCUPIED'"
    placement="top"
  >
    <el-scrollbar wrapClass="scrollbar-wrapper line-cont" class="" slot="content">
      <div v-for="(job, index) in row.lineStatus.occupiedJobList" :key="index">
        <span v-if="job.jobType === 'AI_CALL_JOB'">AI外呼任务：{{job.jobName}}</span>
        <span v-else-if="job.jobType === 'CS_CALL_SEAT'">人工外呼坐席：{{job.seatName}}</span>
        <span v-else-if="job.jobType === 'AI_CALL_IN_SEAT'">AI接待坐席：{{job.dialogFlowName+'('+ job.seatCount +')'}}</span>
        <span v-else-if="job.jobType === 'CS_CALL_IN_SEAT'">人工接待坐席：{{job.seatName}}</span>
      </div>
    </el-scrollbar>
    <span class="take-up">占用</span>
  </el-tooltip>

  <el-tooltip
    placement="top"
    :content="row.lineStatus.hint"
    v-else-if="row.lineStatus && (row.lineStatus.status === 'BREAKDOWN' || row.lineStatus.isLineAvailable === false)"
  >
    <span class="error">故障</span>
  </el-tooltip>
</template>

<script>

export default {
  name: 'lineStatus',
  props: {
    row: {}
  },
  components: {},
  data() {
    return {}
  },
  mounted() {
    
  }
}
</script>
<style lang="scss" scoped>
@import '~src/styles/variables.scss';
.el-scrollbar {
  /deep/ .line-cont {
    max-height: 300px;
  }
  /deep/ .el-scrollbar__thumb {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.free, .take-up, .error {
  margin-left: 5px;
  font-family: 'PingFangSC-Regular', 'SF Pro SC', 'SF Pro Display',
    'SF Pro Icons', 'PingFang SC', 'Helvetica Neue', 'Helvetica', 'Arial',
    sans-serif !important;
  font-weight: 700;
}

.free {
  color: $--color-primary;
}
.take-up {
  color: $--color-success;
}
.error {
  color: $--color-danger;
}
</style>