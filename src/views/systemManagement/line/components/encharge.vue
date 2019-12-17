<template>
  <yiwise-dialog
    title="请选择充值金额"
    @confirm="enCharge"
    @open="handleOpen"
    :hasFooter="false"
    :visible.sync="innerVisible">
    <el-form
      :model="enchargeForm"
      ref="enchargeForm"
      :rules="enchargeFormRules">
      <el-form-item :label-width="0">
        <el-radio-group
          class="radio"
          v-model="enchargeForm.chargeType"
        >
          <el-radio :label="300">300元</el-radio>
          <el-radio :label="500">500元</el-radio>
          <el-radio :label="1000">1000元</el-radio>
          <el-radio :label="''">其他</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="enchargeForm.chargeType === ''" label="充值金额" :label-width="80" prop="chargeNumber">
        <el-input v-model="enchargeForm.chargeNumber" auto-complete="off" :style="{width: '330px', 'margin-right': '2px'}"></el-input>元
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="innerVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit()" :loading="loading">
        去支付宝充值
      </el-button>
    </div>
  </yiwise-dialog>
</template>

<script>
import { aliPay } from '@/api/aliPay'
import { YiwiseDialog } from 'yiwise-components'

export default {
  components: { YiwiseDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    subject: {
      type: String,
      default: ''
    },
    chargeName: {
      type: String,
      default: ''
    },
    chargeData: {
      type: Object
    }
  },
  data() {
    const validateNumber = (rule, value, callback) => { // 校验新密码
      if (!/^[0-9]+(.[0-9]{0,2})?$/.test(value)) {
        callback(new Error('请输入最多两位小数的正数'))
      } else if (value > 1000000) {
        callback(new Error('请输入不超过1000000的数字'))
      } else if (value <= 0) {
        callback(new Error('请输入大于0的数字'))
      } else {
        callback()
      }
    }

    return {
      enchargeForm: {},
      enchargeFormRules: {
        chargeNumber: [
          { required: true, trigger: 'change', message: '请输入金额' },
          { validator: validateNumber }
        ]
      },
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    }
  },
  methods: {
    enCharge() {

    },
    handleOpen() {
      // this.$refs.enchargeForm.resetFields()
      this.enchargeForm = {
        chargeType: 300,
        chargeNumber: undefined
      }
    },
    handleSubmit() {
      this.$refs.enchargeForm.validate(async valid => {
        if (valid) {
          const { data } = await aliPay({
            total_amount: this.enchargeForm.chargeType || this.enchargeForm.chargeNumber,
            subject: this.subject + '充值',
            body: `给${this.subject}${this.chargeName}充值`,
            phoneNumberId: this.chargeData.phoneNumberId,
            rechargeStreamHandleTypeEnum: this.chargeData.phoneType === 'MESSAGE' ? 3 : 0
          })

          document.write(data.data)
        }
      })
    }
  }
}
</script>

<style>

</style>
