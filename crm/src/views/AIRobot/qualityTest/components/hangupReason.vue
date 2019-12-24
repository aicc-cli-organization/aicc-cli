<template>
  <el-tag type="danger" v-if="visible">{{hangUpReason}}</el-tag>
</template>

<script>
export default {
  props: {
    hangUpReason: String,
    status: String
  },
  computed: {
    visible() {
      return this.hangUpReason && this.status === 'SYSTEM_HANG_UP'
    }
  }
}
</script>
