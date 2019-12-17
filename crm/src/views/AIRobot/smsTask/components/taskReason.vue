<template>
  <div :class="`reason-${location}`" v-if="reasonText">{{reasonText}}</div>
</template>

<script>
const STATUS_LIST = ['SYSTEM_HANG_UP']

export default {
  props: {
    hangUpReason: { // 系统挂起原因
      type: String,
      default: ''
    },
    status: { // 任务状态
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    }
  },
  computed: {
    reasonText() {
      if (STATUS_LIST.includes(this.status) && this.hangUpReason) {
        return this.hangUpReason
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.reason-list {
  padding: 0 5px;
  background-color: rgba(238, 23, 48, .1);
  color: #EE1730;
  font-size: 12px;
  line-height: 20px;
  white-space: normal;
  margin-top: 2px;
}
.reason-detail {
  display: inline-block;
  color: #E99209;
}
</style>


