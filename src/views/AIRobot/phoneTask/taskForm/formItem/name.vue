<template>
  <el-form-item label="任务名称" prop="robotCallJob.name">
    <el-input placeholder="请输入任务名称" v-model="innerValue" clearable></el-input>
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
