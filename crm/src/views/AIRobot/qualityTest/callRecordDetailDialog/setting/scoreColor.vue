<template>
  <div class="score-color" :class="klass">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    score: [String, Number]
  },
  computed: {
    klass() {
      switch (true) {
        case this.score >= 80:
          return 'high'
        case this.score >= 60 && this.score < 80:
          return 'medium'
        case this.score < 60:
          return 'low'
        default:
          return 'null'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.score-color {
  padding: 2px;
  &.high {
    background-color: rgb(24, 180, 30);
  }
  &.medium {
    background-color: #1890ff;
  }
  &.low {
    background-color: rgb(102, 102, 102);
  }
  &.null {
    background-color: #999999;
  }
}
</style>
