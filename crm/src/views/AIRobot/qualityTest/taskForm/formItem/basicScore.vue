<template>
  <el-form-item
    class="form-item"
    label="基础分"
    prop="jobBaseScore"
  >
    <el-input
      type="number"
      class="basic-input"
      v-model="innerValue"
      placeholder="坐席基础分"
      :max="max"
      :min="min"
    ></el-input>
    <span class="unit">分</span>
    <span class="tip">满分：{{max}}分; 最低分：{{min}}分</span>
  </el-form-item>
</template>

<script>
import FormItemCommon from './common'

export default {
  mixins: [FormItemCommon],
  props: {
    value: [String, Number]
  },
  data() {
    return {
      max: 100,
      min: 0
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item {
   /deep/ .el-input {
     width: 120px;
   }
}
</style>
