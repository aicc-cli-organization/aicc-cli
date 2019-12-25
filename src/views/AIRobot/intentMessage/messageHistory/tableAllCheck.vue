<template>
  <div class="all-check-row">
    <el-checkbox v-model="innerAllChecked">全选</el-checkbox>
    <span>已选中项</span>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    }
  },
  computed: {
    innerAllChecked: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    }
  },
  watch: {
    innerAllChecked(newVal) {
      this.$emit('toggle-all')
    }
  }
}
</script>
