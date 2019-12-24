<template>
  <el-form-item label="外呼方式" prop="robotCallJob.phoneType">
    <el-radio-group v-model="innerValue" @change="$emit('change')">
      <el-radio
        v-for="(value, key) in phoneTypeRadioGroup"
        :key="key"
        :label="key"
        :disabled="jumpToHumanServiceExist && key === 'MOBILE'"
      >{{value}}</el-radio>
    </el-radio-group>
    <el-tooltip effect="dark" placement="top-start" v-if="jumpToHumanServiceExist">
      <div slot="content">无法使用手机号线路进行转人工服务，请选择其他线路</div>
      <i class="el-icon-question icon-tip"></i>
    </el-tooltip>
  </el-form-item>
</template>

<script>
import FormItemCommon from '../mixins/formItemCommon'
import { phoneTypeRadioGroup } from '../../utils/enum'

export default {
  mixins: [FormItemCommon],
  props: {
    value: String,
    jumpToHumanServiceExist: Boolean
  },
  data() {
    return {
      phoneTypeRadioGroup
    }
  }
}
</script>

