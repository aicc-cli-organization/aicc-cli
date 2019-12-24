<template>
  <el-form-item label="启动方式" prop="robotCallJob.mode">
    <el-radio-group v-model="innerValue">
      <el-radio label="MANUAL">手动</el-radio>
      <el-radio label="AUTO">自动</el-radio>
    </el-radio-group>
    <el-tooltip effect="dark" placement="top-start">
      <div slot="content">手动启动：新建任务后，在可拨打时段，系统不会开启外呼任务，需要用户手动点击启动!<br />自动启动：新建任务后，在可拨打时段，系统将自动开启外呼任务!</div>
      <i class="el-icon-question icon-tip"></i>
    </el-tooltip>
  </el-form-item>
</template>

<script>
import FormItemCommon from '../mixins/formItemCommon'

export default {
  mixins: [FormItemCommon],
  props: {
    value: String
  }
}
</script>

<style lang="scss" scoped>
.icon-tip {
  margin-left: 30px;
  font-size: 18px;
  vertical-align: middle;
}
</style>
