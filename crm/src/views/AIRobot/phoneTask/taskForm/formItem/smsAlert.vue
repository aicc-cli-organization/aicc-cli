<template>
  <span>
    <el-form-item label="挂机短信推送" class="sms-alert-group">
      <el-radio-group v-model="innerSmsAlertSwitch" :disabled="!!this.isEdit">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
      <div class="empty-dialogFlow-tip" v-if="innerSmsAlertSwitch && !dialogFlowId">选择话术模版后，方可选择意向进行微信推送</div>
    </el-form-item>
    <el-form-item prop="robotCallJob.smsAlertLevelCode" v-if="innerSmsAlertSwitch && dialogFlowId">
      <el-checkbox
        label="all"
        v-model="smsAlertLevelIsCheckAll"
        :indeterminate="smsAlertLevelIsIndeterminate"
        :disabled="!!this.isEdit">全选</el-checkbox>
      <el-checkbox-group
        v-model="innerSmsAlertLevelCode"
        class="sms-alert-checkbox-group"
        :disabled="!!this.isEdit">
        <el-checkbox
          :label="item.code"
          v-for="(item, index) in intentLevelTagList"
          :key="index">{{item.name}}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="短信模版" v-if="innerSmsAlertSwitch" prop="robotCallJob.smsTemplateId">
      <el-select
        v-model="innerSmsTemplateId"
        @visible-change="loadSmsTemplateList"
        :disabled="!!this.isEdit">
        <el-option
          v-for="(item, index) in smsTemplateList"
          :key="index"
          :label="item.name"
          :value="item.smsTemplateId"
        ></el-option>
      </el-select>
      <sms-tooltip location="bottom" v-if="smsTemplateType" :smsType="smsTemplateType" :id="smsTemplateId"></sms-tooltip>
    </el-form-item>
  </span>
</template>

<script>
import * as smsAPI from '@/api/sms'
import SmsTooltip from '../smsToolTip'

export default {
  props: {
    intentLevelTagList: {
      type: Array,
      default() {
        return []
      }
    },
    dialogFlowId: Number,
    isEdit: Boolean,
    smsAlertSwitch: Boolean,
    smsAlertLevelCode: {
      type: Array,
      default() {
        return []
      }
    },
    smsTemplateId: Number
  },
  data() {
    return {
      smsTemplateList: []
    }
  },
  components: {
    SmsTooltip
  },
  computed: {
    innerSmsAlertSwitch: {
      get() {
        return this.smsAlertSwitch
      },
      set(newVal) {
        this.$emit('update:smsAlertSwitch', newVal)
      }
    },
    innerSmsAlertLevelCode: {
      get() {
        return this.smsAlertLevelCode
      },
      set(newVal) {
        this.$emit('update:smsAlertLevelCode', newVal)
      }
    },
    innerSmsTemplateId: {
      get() {
        return this.smsTemplateId
      },
      set(newVal) {
        this.$emit('update:smsTemplateId', newVal)
      }
    },
    smsAlertLevelIsCheckAll: {
      get() {
        const intentLevelTagList = this.intentLevelTagList
        return intentLevelTagList.length > 0 && this.smsAlertLevelCode.length === intentLevelTagList.length
      },
      set(value) {
        const smsAlertLevelCode = value ? this.intentLevelTagList.map(item => item.code) : []
        this.$set(this.formFields.robotCallJob, "smsAlertLevelCode", smsAlertLevelCode)
      }
    },
    smsAlertLevelIsIndeterminate() {
      const smsAlertLevelCode = this.smsAlertLevelCode
      return smsAlertLevelCode.length > 0 && smsAlertLevelCode.length < this.intentLevelTagList.length
    },
    smsTemplateType() {
      const selectedSmsTpId = this.smsTemplateId
      if (!selectedSmsTpId) {
        return ''
      }
      return this.smsTemplateList.find(item => item.smsTemplateId === selectedSmsTpId).type
    }
  },
  methods: {
    async loadSmsTemplateList(visible) {
      if (!visible) {
        return
      }
      this.smsTemplateList = (await smsAPI.getSmsTemplateList({
        status: 'APPROVED'
      })).data.data.content
    },
    initData() {
      this.loadSmsTemplateList(true)
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .sms-alert-group {
  .sms-alert-checkbox-group {
    display: inline-block;
    vertical-align: top;
    margin-left: 30px;
    white-space: normal;

    .el-checkbox {
      margin-left: 0;
      margin-right: 30px;
    }
  }
}
</style>
