<template>
  <span>
    <span class="status-tag" :class="`status-2`" v-if="priority === 0">优先</span>
    <span class="status-tag" :class="`status-${statusStyleIndex}`">{{statusText}}</span>
  </span>
</template>

<script>
import * as constant from '@/utils/constant'

export default {
  props: {
    status: String,
    priority: {}
  },
  computed: {
    statusStyleIndex() {
      return this.getStatusStyleIndex(this.status)
    },
    statusText() {
      return constant.robotCallJobStatus[this.status]
    }
  },
  methods: {
    getStatusStyleIndex(status) {
      let index = 0
      switch (status) {
        case 'IN_PROCESS': case 'COMPLETED': case 'RUNNABLE':
          index = 0
          break
        case 'TERMINATE': case 'SYSTEM_SUSPENDED': case 'WAITING_FOR_REDIAL': case 'EXPIRED':
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
.status-tag {
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
