<template>
  <span class="status-tag" :class="klass">{{statusText}}</span>
</template>

<script>
import { IVR_STATUS } from '../utils/enum'

export default {
  props: {
    status: String
  },
  computed: {
    statusText() {
      return IVR_STATUS[this.status]
    },
    klass() {
      let index = ''
      switch (this.status) {
        case 'DRAFT':
          index = 1
          break
        case 'FINISHED':
          index = 2
          break
      }
      return index ? `status-${index}` : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.status-tag {
  display: inline-block;
  width: 48px;
  height: 23px;
  line-height: 23px;
  font-size: 12px;
  border-radius: 2px;
  text-align: center;
  &.status-1 {
    color: #E99209;
    background-color: rgba(236, 184, 69, .1);
  }
  &.status-2 {
    color: #06AC0D;
    background-color: rgba(24, 180, 30, .1);
  }
}
</style>
