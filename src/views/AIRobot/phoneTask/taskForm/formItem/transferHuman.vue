<template>
  <el-form-item
    v-if="showTransferFormItem"
    label="转人工号码"
    ref="humanTransfer"
    prop="transferPhoneNumber"
    :rules="transferPhoneChooseType === UnChecked_TransferChooseType ? [{
      type: 'array', trigger: 'change', validator: transferPhoneNumberValidator
    }] : []"
    :required="transferPhoneChooseType === UnChecked_TransferChooseType">
    <el-select
      v-model="innerValue"
      @visible-change="loadHumanService"
      allow-create
      multiple
      collapse-tags
      filterable
      :disabled="transferPhoneChooseType === Checked_TransferChooseType">
      <el-option
        v-for="item in transferPhoneNumberList"
        :key="item.phoneNumber"
        :label="item.name + '---' +item.phoneNumber"
        :value="item.phoneNumber">
      </el-option>
    </el-select>
    <el-checkbox class="select-right-checkbox" @change="onChangeTransferChooseType">导入{{customerStr}}时，为每个{{customerStr}}单独设置转人工号码</el-checkbox>
  </el-form-item>
</template>

<script>
import FormItemCommon from '../mixins/formItemCommon'
import * as taskAPI from '@/api/task'
import { transferPhoneNumberValidator } from '../../utils/enum'
import { mapGetters } from 'vuex'
const Checked_TransferChooseType = 'ASSIGN'
const UnChecked_TransferChooseType = 'POLLING'

export default {
  mixins: [FormItemCommon],
  props: {
    transferPhoneChooseType: String,
    jumpToHumanServiceExist: Boolean,
    value: {
      type: Array,
      default() {
        return []
      }
    },
    dialogFlowId: [Number]
  },
  data() {
    return {
      transferPhoneNumberList: [],
      transferPhoneNumberValidator,
      Checked_TransferChooseType,
      UnChecked_TransferChooseType
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    showTransferFormItem() {
      return this.dialogFlowId && this.jumpToHumanServiceExist
    }
  },
  methods: {
    onChangeTransferChooseType(checked) {
      const transferPhoneChooseType = checked ? Checked_TransferChooseType : UnChecked_TransferChooseType
      this.$emit('update:transferPhoneChooseType', transferPhoneChooseType)
      this.$emit('input', [])
      this.$refs.humanTransfer.clearValidate()
    },
    async loadHumanService(visible) {
      if (!visible) {
        return
      }
      this.transferPhoneNumberList = (await taskAPI.listAllBrief()).data.data
    },
    initData() {
      this.loadHumanService(true)
    }
  }
}
</script>
