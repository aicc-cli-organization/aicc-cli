<template>
  <div class="title">
    <span>{{title}}</span>
    <span
      v-if="unit"
      class="unit"
    >{{unit}}</span>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    unit: String
  }
}
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  margin-bottom: 14px;
  justify-content: space-between;
  color: #333333;
  font-size: 18px;
  .unit {
    font-size: 16px;
  }
}
</style>
