<template>
  <el-form-item
    class="form-item"
    label="预警阈值"
    prop="jobScoreThreshold"
  >
    <el-input
      class="basic-input"
      v-model="innerValue"
      placeholder="请输入预警阈值"
    ></el-input>
    <span class="unit">分(低于此分数将出发预警)</span>
  </el-form-item>
</template>

<script>
import FormItemCommon from './common'

export default {
  mixins: [FormItemCommon]
}
</script>

<style lang="scss" scoped>
.form-item {
   /deep/ .el-input {
     width: 200px;
   }
}
</style>
