<template>
  <el-tag class="job-type-tag" v-if="jobType">
    {{typeText}}
  </el-tag>
</template>

<script>
import { QUALITY_TYPE } from '../utils/enum'

export default {
  props: {
    jobType: String
  },
  computed: {
    typeText() {
      return QUALITY_TYPE[this.jobType]
    }
  }
}
</script>