<template>
  <el-select
    filterable
    v-model="innerValue"
    placeholder="全部坐席名称"
    @change="$emit('change')"
  >
    <el-option
      v-for="(item, index) in taskDetail.csStaffList"
      :key="index"
      :label="item.name"
      :value="item.id"
    ></el-option>
  </el-select>
</template>

<script>
export default {
  props: {
    value: [String, Number]
  },
  computed: {
    taskDetail() {
      return this.$store.state.qcTask.taskDetail
    },
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
