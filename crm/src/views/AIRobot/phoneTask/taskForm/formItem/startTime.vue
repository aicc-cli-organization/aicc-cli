<template>
  <el-form-item label="开始日期" prop="robotCallJob.startTime">
    <el-date-picker
      value-format="yyyy-MM-dd"
      placeholder="选择日期"
      v-model="innerValue">
    </el-date-picker>
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
