<template>
  <yiwise-dialog
    class="dialog"
    :title="isEdit ? '编辑质检任务' : '新建质检任务'"
    width="800px"
    :visible.sync="innerVisible"
    @confirm="onSubmit"
    @close="onClose"
    @open="onOpen"
  >
    <el-form ref="form" label-width="100px" :model="formFields" :rules="formRules">
      <form-item-name v-model="formFields.jobName"></form-item-name>
      <form-item-rule
        v-if="!isFetching || !isEdit"
        ref="rule"
        v-model="formFields.ruleList"
        :isEdit="isEdit"
      />
      <form-item-basic-score v-model.number="formFields.jobBaseScore"></form-item-basic-score>
      <form-item-range v-model="formFields.jobProperty" :isEdit="isEdit"></form-item-range>
      <form-item-record-setting
        v-if="formFields.jobProperty === UPLOAD_RECORD"
        :isEdit="isEdit"
        :leftChannel.sync="formFields.leftChannel"
        :rightChannel.sync="formFields.rightChannel"
      ></form-item-record-setting>
      <template v-else-if="conditionRanges.includes(formFields.jobProperty)">
        <el-form-item class="nowrap-formitem" label="设置条件（可多选，需同时满足）"></el-form-item>
        <form-item-setting-condition
          ref="condition"
          :isEdit="isEdit"
          :jobProperty="formFields.jobProperty"
          v-model="formFields.conditionData"
        ></form-item-setting-condition>
        <form-item-type v-model="formFields.jobType" :isEdit="isEdit"></form-item-type>
        <template v-if="formFields.jobType === 'CALLING'">
          <form-item-threshold v-model="formFields.jobScoreThreshold"></form-item-threshold>
          <form-item-alert-user v-model="formFields.jobAlertUserList"></form-item-alert-user>
        </template>
        <div class="after-tip" v-else>注意：仅支持质检2019-03-22 00:00:00之后“已接听”状态的人工坐席通话记录</div>
      </template>
    </el-form>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import FormItemName from './formItem/name'
import FormItemRule from './formItem/rule'
import FormItemRange from './formItem/range'
import FormItemBasicScore from './formItem/basicScore'
import FormItemSettingCondition from './formItem/settingCondition'
import FormItemType from './formItem/type'
import FormItemThreshold from './formItem/scoreThreshold'
import FormItemAlertUser from './formItem/alertUser'
import FormItemRecordSetting from './formItem/recordSetting'
import { FRONT_UPLOAD_SINGLE, UPLOAD_RECORD, CHANNEL_VALUE_MAP, conditionRanges } from '../utils/enum'
import * as qcAPI from '@/api/qualityTest'
import { mapGetters } from 'vuex'

const validateRuleList = function(rule, value, callback) {
  const detailValue = value.filter(item => item.ruleRate && item.ruleScore)
  if (value.length === 0 ||
  detailValue.length < value.length) {
    callback(new Error('请输入质检规则'))
    return
  }
  let message
  for (const item of detailValue) {
    if (item.ruleScore > 100) {
      message = '分值不超过100分'
    }
  }
  if (message) {
    return callback(new Error(message))
  }
  callback()
}

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      validator: function(value) {
        return ['add', 'edit'].indexOf(value) !== -1
      }
    },
    qcJobId: [String, Number]
  },
  components: {
    YiwiseDialog,
    FormItemName,
    FormItemRule,
    FormItemRange,
    FormItemBasicScore,
    FormItemSettingCondition,
    FormItemType,
    FormItemThreshold,
    FormItemAlertUser,
    FormItemRecordSetting
  },
  data() {
    return {
      formFields: {
        jobName: undefined,
        ruleList: [],
        jobBaseScore: undefined,
        jobProperty: 'CS_CALL_OUT',
        csStaffIdList: [],
        jobType: 'CALL_AFTER',
        jobScoreThreshold: undefined,
        jobAlertUserList: [],
        conditionData: {
          csStaffIdList: [],
          receptionList: [],
          startTime: undefined,
          endTime: undefined,
          startDate: undefined,
          endDate: undefined
        },
        leftChannel: undefined,
        rightChannel: undefined
      },
      formRules: {
        jobName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { min: 1, max: 20, message: '请输入1到20个字符' }
        ],
        ruleList: [
          { validator: validateRuleList, required: true }
        ],
        jobBaseScore: [
          { required: true, trigger: 'blur', message: '请输入坐席基础分' },
          { pattern: /^(([1-9][0-9])|(\d{1})|100)$/, message: '请输入0-100的整数' }
        ],
        jobProperty: [
          { required: true, trigger: 'change' }
        ],
        csStaffIdList: [
          { type: 'array', required: true, trigger: 'blur', message: '请选择人工坐席' }
        ],
        jobScoreThreshold: [
          { required: true, trigger: 'blur', message: '请输入预警阈值' },
          { pattern: /^(([1-9][0-9])|(\d{1})|100)$/, message: '请输入0-100的整数' }
        ],
        jobAlertUserList: [
          { type: 'array', required: true, trigger: 'blur', message: '请选择预警接收人' }
        ]
      },
      conditionRanges,
      UPLOAD_RECORD,
      isFetching: true
    }
  },
  computed: {
    ...mapGetters([
      'enableCsSeat'
    ]),
    innerVisible: {
      get() {
        return this.visible
      },
      set(newVal) {
        this.$emit('update:visible', newVal)
      }
    },
    isEdit() {
      return this.type === 'edit'
    }
  },
  methods: {
    async loadTaskDetail() {
      const res = await qcAPI.getQCTaskDetail({
        qcJobId: this.qcJobId
      })
      this.isFetching = false
      const {
        csStaffIdList,
        receptionList,
        startTime,
        endTime,
        startDate,
        endDate
      } = res.data.data
      const conditionData = {
        csStaffIdList,
        receptionList,
        startTime,
        endTime,
        startDate,
        endDate
      }
      this.formFields = {
        ...res.data.data,
        conditionData
      }
    },
    onSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return

        let formatFields = {}
        if (this.formFields.jobProperty === FRONT_UPLOAD_SINGLE) {
          const channelKeys = Object.keys(CHANNEL_VALUE_MAP)
          formatFields = {
            jobProperty: UPLOAD_RECORD,
            leftChannel: channelKeys[0], // 约定： 随便传一个给后端即可
            rightChannel: channelKeys[0]
          }
        }
        const formFields = {
          ...this.formFields,
          ...this.formFields.conditionData,
          ruleList: this.formFields.ruleList.map(item => ({
            ruleId: item.qcRuleId,
            ruleRate: item.ruleRate,
            ruleScore: item.ruleScore
          })),
          ...formatFields
        }
        delete formFields.conditionData
        if (this.isEdit) {
          await qcAPI.editQCJob(formFields)
          this.$message({
            message: '编辑成功',
            type: 'success'
          })
          this.$emit('editSuccess')
          this.onClose()
          return
        }
        await qcAPI.addQCTask(formFields)
        this.$message({
          message: '添加成功',
          type: 'success'
        })
        this.$emit('addSuccess')
        this.onClose()
      })
    },
    onClose() {
      this.innerVisible = false
      // Object.assign(this.$data, this.$options.data())
      this.isFetching = true
      this.$refs.form.resetFields()
      this.$refs.form.clearValidate()
      const { rule, condition } = this.$refs
      rule && rule.resetData()
      condition && condition.resetData()
    },
    async onOpen() {
      if (this.type !== 'edit' && !this.enableCsSeat) {
        this.formFields.jobProperty = 'UPLOAD'
      } else if (this.type === 'edit') {
        await this.loadTaskDetail()
        const { jobProperty, leftChannel, rightChannel } = this.formFields
        if (jobProperty === UPLOAD_RECORD &&
          leftChannel === rightChannel
        ) {
          this.formFields.jobProperty = FRONT_UPLOAD_SINGLE
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  /deep/ .el-dialog__body {
    padding: 0 20px !important;
    .nowrap-formitem {
      margin-bottom: 0;
      .el-form-item__label {
        white-space: nowrap;
        &::before {
          content: '*';
          color: #f56c6c;
          margin-right: 4px;
        }
      }
    }
    .after-tip {
      color: #E6A23C;
      margin-left: 100px;
      padding-bottom: 20px;
    }
  }
}
</style>
