<template>
  <span>
    <span class="label">质检分数:</span>
    <el-input class="w100" v-model="innerMinScore" placeholder="最小值" @keyup.enter.native="$emit('search')"></el-input>
    <span>-</span>
    <el-input class="w100" v-model="innerMaxScore" placeholder="最大值" @keyup.enter.native="$emit('search')"></el-input>
  </span>
</template>

<script>
export default {
  props: {
    minScore: [String, Number],
    maxScore: [String, Number]
  },
  computed: {
    innerMinScore: {
      get() {
        return this.minScore
      },
      set(newVal) {
        this.$emit('update:minScore', newVal || undefined)
      }
    },
    innerMaxScore: {
      get() {
        return this.maxScore
      },
      set(newVal) {
        this.$emit('update:maxScore', newVal || undefined)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.w100 {
  width: 100px;
}
</style>
