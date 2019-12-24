<template>
  <el-dialog
    title="申请开票"
    :visible.sync="dialogVisible"
    width="600px"
    @open="onOpen"
    @close="onClose"
    >
    <el-form
      ref="form"
      label-width="100px"
      :model="invoiceInfo"
      :rules="invoiceRules"
    >
       <el-form-item
        label="选择发票类型"
        prop="billType"
       >
        <el-radio-group v-model="invoiceInfo.billType" :disabled="disabled">
          <el-radio label="TYPE_NORMAL">普通发票</el-radio>
          <el-radio label="TYPE_INCREMENT">增值税专用发票</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="填写发票信息"
       >
        <div class="inner-form">
           <el-form-item
            label="抬头:"
            label-width="75px"
            prop="taiTou"
           >
            <el-input
              v-model="invoiceInfo.taiTou"
              :disabled="disabled"
              clearable
            ></el-input>
           </el-form-item>
           <el-form-item
            label="税号:"
            label-width="75px"
            prop="billAccount"
           >
            <el-input
              placeholder="15-20位，输入后请仔细确认"
              v-model="invoiceInfo.billAccount"
              :disabled="disabled"
              clearable
            ></el-input>
           </el-form-item>
           <div v-if="invoiceInfo.billType === 'TYPE_INCREMENT'">
            <el-form-item
              label="公司地址:"
              label-width="75px"
              prop="companyArea"
            >
              <el-input
                placeholder=""
                 v-model="invoiceInfo.companyArea"
                :disabled="disabled"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item
              label="注册电话:"
              label-width="75px"
              prop="phoneNumber"
            >
              <el-input
                placeholder=""
                v-model="invoiceInfo.phoneNumber"
                :disabled="disabled"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item
              label="开户银行:"
              label-width="75px"
              prop="bank"
            >
              <el-input
                placeholder=""
                v-model="invoiceInfo.bank"
                :disabled="disabled"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item
              label="银行账号:"
              label-width="75px"
              prop="bankNumber"
            >
              <el-input
                placeholder=""
                v-model="invoiceInfo.bankNumber"
                :disabled="disabled"
                clearable
              ></el-input>
            </el-form-item>
           </div>
        </div>
      </el-form-item>
      <el-form-item
        label="寄送地址"
      >
        <div class="inner-form">
          <el-form-item
            label="收件人:"
            label-width="75px"
            prop="recivedName"
           >
            <el-input
              placeholder=""
              v-model="invoiceInfo.recivedName"
              :disabled="disabled"
              clearable
            ></el-input>
           </el-form-item>
           <el-form-item
            label="电话:"
            label-width="75px"
            prop="recivedPhone"
           >
            <el-input
              placeholder=""
              v-model="invoiceInfo.recivedPhone"
              :disabled="disabled"
              clearable
            ></el-input>
           </el-form-item>
           <el-form-item
            required
            label="地址:"
            label-width="75px"
           >
              <disPicker 
                ref="disPicker"
                v-model="invoiceInfo.disInfo"
                :disabled="disabled"
                @change="distChange"
              />
           </el-form-item>
           <el-form-item
            label=""
            label-width="75px"
            prop="area"
           >
            <el-input
              placeholder="详细地址"
              :disabled="disabled"
              v-model="invoiceInfo.area"
              clearable
            ></el-input>
           </el-form-item>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <yiwise-pop-confirm
        label="请确认信息无误"
        v-if="formType === 'add' || formType === 'multiAdd'"
        @submit="submit"
      >
        <el-button type="primary">提交</el-button>
     </yiwise-pop-confirm>
      <el-button v-if="formType === 'retreat'" type="primary" @click="reset">撤回</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { phoneNumberregex, phoneRules } from '@/utils/regexp'
import { YiwisePopConfirm } from 'yiwise-components'
import disPicker from '@/components/disPicker'
import * as constant from '@/utils/constant'
import * as invoiceAPI from '@/api/invoice'
export default {
  name: 'invoice',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    },
    rowData: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(newVal) {
        this.$emit('update:visible',newVal)
      }
    },
    disabled() {
      return this.formType === 'retreat' ? true : false
    },
    billMerge() {
      return this.rowData.length > 1 ? 'MERGE_YES' : 'MERGE_NO'
    }
  },
  components: {
    disPicker,
    YiwisePopConfirm
  },
  data() {
    return {
      invoiceRules: {
        'taiTou': [
          { required: true, message: '请输入抬头', trigger: 'blur' },
        ],
        'companyArea': [
          { required: true, message: '请输入公司地址', trigger: 'blur' },
        ],
        'bank': [
          { required: true, message: '请输入银行', trigger: 'blur' },
        ],
        'bankNumber': [
          { required: true, message: '请输入银行账号', trigger: 'blur' },
        ],
        'recivedName': [
          { required: true, message: '请输入收件人', trigger: 'blur' },
        ],
        'area': [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
        'billAccount': [
          { required: true, message: '请输入税号', trigger: 'blur' },
          { min: 15, max: 20, message: '输入长度在15到20位', trigger: 'blur' }
        ],
        'recivedPhone': phoneRules,
        'phoneNumber': phoneRules
      },
      formType: '',
      invoiceInfo : {
      }
    }
  },
  created() {
  },
  methods: {
    async onOpen() {
      this.formType = this.type
      if(this.formType === 'retreat') {
        this.invoiceInfo = {}
        const res = await invoiceAPI.get({
          rechargeDistributeStreamId: this.rowData.length && this.rowData[0].rechargeDistributeStreamId
        })
        const data = res.data.data
        this.invoiceInfo = {
          ...data,
          disInfo: {
            province: data.province,
            city: data.city,
            district: data.district
          }
        }

      }else {
        this.invoiceInfo = {
          billType: 'TYPE_NORMAL'
        }
      }
      
    },
    onClose() {
      this.dialogVisible = false
      this.$refs.form.clearValidate()
      this.$refs.disPicker.clearValidate()
    },
    submit() {
      this.$refs.form.validate(async valid => {
        const v = this.$refs.disPicker.validate()
        if(!v) {
          return 
        }
        if(valid) {
          const type = this.invoiceInfo.billType === 'TYPE_INCREMENT' ? true : false
          let increment = {
            companyArea: '',
            phoneNumber: '',
            bank: '',
            bankNumber: ''
          }
          if(type) {
            increment = {
              companyArea: this.invoiceInfo.companyArea,
              phoneNumber: this.invoiceInfo.phoneNumber,
              bank: this.invoiceInfo.bank,
              bankNumber: this.invoiceInfo.bankNumber
            }
          }

          let amount = 0
          if(this.type === '') {

          }
          const rechargeDistributeStreamIds = this.rowData.map(item => {
            return item.rechargeDistributeStreamId
          })
          if(this.rowData.length > 1) {
            amount = this.rowData.reduce((prev,cur) => {
              return prev + cur.fare
            },0)

          }else {
            amount = this.rowData[0].fare
          }
          
          const p = {
            ...this.invoiceInfo,
            billMerge: this.billMerge,
            rechargeDistributeStreamIds,
            amount,
            province: this.invoiceInfo.disInfo.province,
            city: this.invoiceInfo.disInfo.city,
            district: this.invoiceInfo.disInfo.district,
            ...increment
          }
          
          await invoiceAPI.create(p)
          this.$message.success('申请开票成功')
          this.dialogVisible = false
          this.$emit('success')
        }
      })
    },
    async reset() {
      this.formType = 'add'
      const rechargeDistributeStreamId = this.rowData.length && this.rowData[0].rechargeDistributeStreamId
      await invoiceAPI.updateStatus({rechargeDistributeStreamId})
      this.$message.success('撤回成功')
      this.$emit('success')
    }
  },
  mounted() {
    
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__header {
  line-height: 45px;
}
/deep/ .el-dialog__body {
  padding: 0 24px !important;
  max-height:550px;
  overflow-y: auto
}
.inner-form {
  width: 435px;
  padding: 12px;
  background: #f7f7f7;
}
</style>

