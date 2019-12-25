<template>
  <span class="status" :class="`status-${statusStyleIndex}`">{{statusText}}</span>
</template>

<script>
import { SMS_TASK_STATUS } from '../config/enum'

export default {
  props: {
    status: String
  },
  computed: {
    statusStyleIndex() {
      return this.getStatusStyleIndex(this.status)
    },
    statusText() {
      return SMS_TASK_STATUS[this.status]
    }
  },
  methods: {
    getStatusStyleIndex(status) {
      let index = 0
      switch (status) {
        case 'IN_PROCESS': case 'COMPLETED': case 'RUNNABLE':
          index = 0
          break
        case 'TERMINATE': case 'SYSTEM_SUSPENDED':
          index = 2
          break
        default:
          index = 1
      }
      return index
    }
  }
}
</script>

<style lang="scss" scoped>
.status {
  display: inline-block;
  line-height: 22px;
  font-size: 13px;
  padding: 0 10px;
  border-radius: 2px;
  &.status-0 {
    background-color: rgba(86, 198, 90, 0.14);
    color: #06AC0D;
  }
  &.status-1 {
    background-color: rgba(236, 184, 69, 0.2);
    color: #E99209;
  }
  &.status-2 {
    background-color: rgba(243, 55, 76, 0.1);
    color: #F3374C;
  }
}
</style>
