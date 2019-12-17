<template>
  <el-tabs class="qc-tabs">
    <el-tab-pane label="质检任务" v-if="hasAccess('crm_qc_job_view')">
      <quality-task v-if="hasAccess('crm_qc_job_view')"></quality-task>
    </el-tab-pane>
    <el-tab-pane label="规则引擎" v-if="hasAccess('crm_qc_rule_view')">
      <quality-rule v-if="hasAccess('crm_qc_rule_view')"></quality-rule>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import QualityTask from './task/index'
import QualityRule from './rule/index'

export default {
  components: {
    QualityTask,
    QualityRule
  }
}
</script>

<style lang="scss" scoped>
.qc-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  /deep/ .el-tabs__content {
    flex: 1;
    overflow: hidden;
    .el-tab-pane {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
