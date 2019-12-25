<template>
  <el-form-item label="话术模版" prop="robotCallJob.dialogFlowId">
    <el-select
      placeholder="请选择话术模版"
      filterable
      v-model="innerValue"
      @visible-change="loadDialogFlowInfoList">
      <el-option
        v-for="(item, index) in dialogFlowList"
        :key="index"
        :label="item.name"
        :value="item.id"
      ></el-option>
    </el-select>
    <sms-tooltip v-if="dialogFlowSmsTmpType" :smsType="dialogFlowSmsTmpType" :id="innerValue"></sms-tooltip>
  </el-form-item>
</template>

<script>
import * as talkAPI from '@/api/talk'
import * as taskAPI from '@/api/task'
import SmsTooltip from '../smsToolTip'
import FormItemCommon from '../mixins/formItemCommon'
import { transferPhoneNumberValidator } from '../../utils/enum'

export default {
  mixins: [FormItemCommon],
  props: {
    value: [Number]
  },
  data() {
    return {
      dialogFlowList: [],
      dialogFlowSmsTmpType: undefined,
      transferPhoneNumberValidator
    }
  },
  components: {
    SmsTooltip
  },
  methods: {
    async loadDialogFlowInfoList(visible) {
      if (!visible) return
      this.dialogFlowList = (await talkAPI.fetchFlowList({
        pageNum: 1,
        pageSize: 100,
        published: true
      })).data.data.content
    },
    requestDialogFlowSmsTemplate(dialogFlowId) {
      if (!dialogFlowId) return
      this.$emit('changeIntentLevelTagId', this.dialogFlowList.find(item => item.id === dialogFlowId).intentLevelTagId)
      taskAPI.getDialogFlowSmsTemplate(dialogFlowId)
        .then((res) => {
          this.dialogFlowSmsTmpType = res.data.data || ''
        })
    }
  },
  watch: {
    value: {
      handler: function(newVal) {
        this.requestDialogFlowSmsTemplate(newVal)
      }
    }
  }
}
</script>
