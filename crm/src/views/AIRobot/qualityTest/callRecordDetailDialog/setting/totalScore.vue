<template>
  <span class="score-span">
    <span class="label">得分: </span>
    <span class="value">{{scoreTotal}}分</span>
  </span>
</template>

<script>
export default {
  props: {
    scoreList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    scoreTotal() {
      let sum = 0
      Array.isArray(this.scoreList) && this.scoreList.forEach(item => {
        sum += item.score
      })
      return sum
    }
  }
}
</script>

<style lang="scss" scoped>
.score-span {
  margin-left: 10px;
  font-size: 12px;
  .label {
    color: #666666;
  }
}
</style>
