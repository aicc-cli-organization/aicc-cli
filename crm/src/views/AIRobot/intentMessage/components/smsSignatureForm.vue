<template>
  <yiwise-dialog
    :title="dialogTitle"
    :visible.sync="innerVisible"
    @open="handleDialogOpen"
    @close="handleDialogClose"
    @confirm="confirmBtn"
    width="830px"
  >
    <el-form
        :model="form"
        ref="form"
        label-width="80px"
        :rules="formRules">
        <el-form-item label="短信类型" :label-width="formLabelWidth" prop="smsPlatformChannelId" required>
          <el-radio-group class="ml15 sms-plat-group mt9" v-model="form.smsPlatformChannelId">
            <el-radio
              v-for="item in SmsTemplateType"
              :key="item.smsPlatformChannelId"
              :label="item.smsPlatformChannelId"
            >{{item.smsChannelName}}</el-radio>
          </el-radio-group>
          <el-tooltip placement="top" content="短信类型应根据发送的短信类型选择，如需发送多种短信类型，可以新增多个同样内容的签名。">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="签名" label-width="80px" prop="name">
          <el-input v-model="form.name" auto-complete="off"
            placeholder="请输入公司名、网站、产品名，如“一知智能”">
          </el-input>
        </el-form-item>
        <el-form-item label="" label-width="80px">
          <span>签名代表短信来源，给用户以信任感。通常显示在短信开头，定义时不能包含“【】”，长度限制为3-8个字符，不能为纯英文或数字。</span>
          <br>
          <span>短信签名需经过运营商审核，审核周期一般为2~5个工作日，请耐心等待~</span>
        </el-form-item>
      </el-form>
  </yiwise-dialog>
</template>

<script>
  import { YiwiseDialog } from 'yiwise-components'
  import { addSmsSignature, updateSmsSignature, getSmsTemplateType } from '@/api/sms'
  import * as constant from '@/utils/constant'

  export default {
    name: 'CustomerDialog',
    components: {
      YiwiseDialog
    },
    props: {
      row: {
        type: Object,
        default() {
          return {}
        }
      },
      visible: {
        type: Boolean,
        default: false
      },
      hasFooter: {
        type: Boolean,
        default: true
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
      },
      dialogTitle() {
        if (this.row.addOrEdit === 'ADD') {
          return '新增短信签名'
        } else {
          return '编辑短信签名'
        }
      }
    },
    data() {
      return {
        formLabelWidth: '80px',
        SmsTemplateType: [],
        form: {
          name: '',
          smsPlatformChannelId: 'NOTICE'
        },
        formRules: {
          name: [
            { required: true, trigger: 'change', message: '请输入签名' },
            { min: 1, max: 20, message: '长度在1到40个字符', trigger: 'change' }
          ],
          smsPlatformChannelId: [
            { required: true, trigger: 'blur', message: '请选择短信类型' }
          ]
        },
        constant
      }
    },
    methods: {
      async getSmsTemplateType() {
        const { data } = await getSmsTemplateType()
        this.SmsTemplateType  = data.data || []
      },
      add() {
        addSmsSignature({
          name: this.form.name,
          smsPlatformChannelId: this.form.smsPlatformChannelId
        }).then(({ data }) => {
          this.success()
        })
      },
      update() {
        updateSmsSignature({
          name: this.form.name,
          smsPlatformChannelId: this.form.smsPlatformChannelId,
          smsSignatureId: this.form.smsSignatureId
        }).then(({ data }) => {
          this.success()
        })
      },
      handleDialogOpen() {
        this.$emit('open')
        this.getSmsTemplateType()
        this.form = {
          ...this.form,
          ...this.row
        }
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      },
      confirmBtn() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.addOrEdit === 'ADD') {
              this.add()
            } else {
              this.update()
            }
            this.$emit('confirm')
          }
        })
      },
      success() {
        this.$message.success('操作成功！')
        this.$emit('success')
        this.$emit('update:visible', false)
      },
      handleDialogClose() {
        this.$refs.form.resetFields()
        this.form = {
          smsPlatformChannelId: 'NOTICE'
        }
        this.$emit('close')
      },
      cancelBtn() {
        this.$emit('update:visible', false)
      }
    }
  }
</script>
<style lang="scss" scoped>
  /deep/ .el-dialog__body {
      padding: 0 30px !important;
  }
  .sms-plat-group {
    width: 655px;
    .el-radio {
      width: 110px;
      margin: 0 0 5px 0;
    }
  }
</style>