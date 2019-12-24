<template>
  <el-form-item label="任务描述" prop="robotCallJob.description">
    <el-input type="textarea" v-model="innerValue"
      placeholder="请输入任务描述"
      rows="4"
      resize="none"
      class="desc-textarea">
    </el-input>
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
.desc-textarea {
  width: 300px;
}
</style>
