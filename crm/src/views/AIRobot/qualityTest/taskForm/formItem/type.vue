<template>
  <el-form-item
    label="质检类型"
    prop="jobProperty"
  >
    <el-radio-group
      v-model="innerValue"
      :disabled="isEdit"
    >
      <el-radio
        v-for="(value, key) in QUALITY_TYPE"
        :key="key"
        v-if="key !== 'CALLING'"
        :label="key"
      >{{value}}</el-radio>
    </el-radio-group>
  </el-form-item>
</template>

<script>
import FormItemCommon from './common'
import { QUALITY_TYPE } from '../../utils/enum'

export default {
  mixins: [FormItemCommon],
  props: {
    value: String,
    isEdit: Boolean
  },
  data() {
    return {
      QUALITY_TYPE
    }
  }
}
</script>
