<template>
  <el-select
    v-model="innerValue"
    v-on="$listeners"
    v-bind="$attrs"
    multiple
  >
    <el-option
      key="checkAll"
      disabled
    >
      <el-checkbox
        v-model="allChecked"
        @change="onToggleAllChecked"
      >全选</el-checkbox>
    </el-option>
    <slot></slot>
  </el-select>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      allChecked: false
    }
  },
  methods: {
    onToggleAllChecked(val) {
      const willCheckedValues = this.$slots.default
        .filter(slotItem => !slotItem.componentInstance.disabled)
        .map(slotItem => slotItem.componentInstance.value)
      this.innerValue = val ? willCheckedValues : []
    },
    setAllChecked(val) {
      this.allChecked = val.length === this.$slots.default.length && val.length > 0
    }
  },
  computed: {
    innerValue: {
      get() {
        return this.value
      },
      set(newVal) {
        this.setAllChecked(newVal)
        this.$emit('input', newVal)
      }
    }
  },
  mounted() {
    this.setAllChecked(this.innerValue)
  }
}
</script>
