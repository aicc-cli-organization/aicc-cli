<template>
  <el-form-item
    label="质检范围"
    prop="jobProperty"
  >
    <el-radio-group
      :disabled="isEdit"
      v-model="innerValue"
    >
      <el-radio
        v-for="(value, key) in resultRangeType"
        :key="key"
        :label="key"
      >{{value}}</el-radio>
    </el-radio-group>
  </el-form-item>
</template>

<script>
import FormItemCommon from './common'
import { QUALITY_RANGE, disableCsSeatRangeEnum } from '../../utils/enum'
import { mapGetters } from 'vuex'

export default {
  mixins: [FormItemCommon],
  props: {
    value: String,
    isEdit: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  computed: {
    ...mapGetters([
      'enableCsSeat'
    ]),
    resultRangeType() {
      return this.enableCsSeat ? QUALITY_RANGE : disableCsSeatRangeEnum
    }
  }
}
</script>
