<template>
  <div>
    格式化数据
  </div>
</template>
<script>
import { formatData } from '@/api/formatData'
export default {
  mounted() {
    formatData()
  }
}
</script>