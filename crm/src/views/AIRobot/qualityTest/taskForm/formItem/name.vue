<template>
  <el-form-item
    label="任务名"
    prop="jobName"
  >
    <el-input
      v-model="innerValue"
      placeholder="请输入任务名"
    ></el-input>
  </el-form-item>
</template>

<script>
export default {
  props: {
    value: String
  },
  computed: {
    innerValue: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    }
  }
}
</script>
