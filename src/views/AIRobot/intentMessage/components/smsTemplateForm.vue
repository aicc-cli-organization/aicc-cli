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
      :formRules="formRules"
      ref="form"
      label-width="80px"
      :rules="formRules">

      <el-form-item label="模板名" :label-width="formLabelWidth" prop="name">
        <el-input v-model="form.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="短信类型" :label-width="formLabelWidth" prop="smsPlatformChannelId">
        <el-radio-group class="mt9" v-model="form.smsPlatformChannelId"
          @change="handlerChangeSmsSignatureType"
        >
          <el-radio
            v-for="item in SmsTemplateType"
            :key="item.smsPlatformChannelId"
            :label="item.smsPlatformChannelId"
          >{{item.smsChannelName}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="短信签名" :label-width="formLabelWidth" prop="smsSignatureId" class="is-required">
        <el-select 
          v-model="form.smsSignatureId" placeholder="请选择">
          <el-option
            v-for="item in signatureList"
            :key="item.smsSignatureId"
            :label="item.name"
            :value="item.smsSignatureId">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="模板内容" style="position:relative" :label-width="formLabelWidth" prop="text">
        <el-input type="textarea" rows="5" v-model="form.text" :placeholder="placeholder()" auto-complete="off"></el-input>
        <div class="remark-text count-text">
          <span>共约</span>
          <span>{{wordNum}}</span>
          <span>字，</span>
          <span>{{messageNum}}</span>
          <span>条短信</span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">运营商将按照短信字数计费，70字为一条，总字数不限</div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
      </el-form-item>
      <el-form-item>
        <div class="remark-text">注：支持"${自定义}"格式自定义变量</div>
        <div class="remark-text mt10">短信模板需经运营商审核，审核周期一般为2-5个工作日，请耐心等待</div>
      </el-form-item>
    </el-form>
  </yiwise-dialog>
</template>

<script>
  import { YiwiseDialog } from 'yiwise-components'
  import { getSmsSignatureList, editSmsTemplate, addSmsTemplate, getSmsTemplateType } from '@/api/sms'
  import * as constant from '@/utils/constant'
  import { mapGetters } from 'vuex'

  const placeholderEnum = {
    NOTICE: '订单状态通知、物流通知、活动通知等，5分/条。\n如：\${用户姓氏}总您好，我们这边是奥体公馆，根据您之前登记的信息，已为您预约在\${参观时间}到我们售楼处参观，预约编号：\${预约编号}欢迎您的来访。',
    MARKETING: '优惠信息群发等。营销短信审核较严，请谨慎使用，5分/条。\n如：我们的商品正在打折促销，最低折扣1折，欢迎关注微信公众号了解详情。',
    FINANCE: '金融产品进度通知，如贷款额度申请结果告知，金融产品促销等。金融短信有最低发送条数限制，所以在呼叫任务完成后才会批量发送，且短信失败率较高、价格较贵，请谨慎使用，7分/条。\n如：恭喜，您的贷款额度已更新，最高2万元，日息低至0.01%。',
    GAME: '游戏类短信发送，5分/条。\n如：XXX游戏已上线公测，限量装备等你来拿，欢迎关注微信公众号了解详情。',
    SOCIAL: '社交类软件营销短信发送，5分/条。如：Hi，XXX的好友关注了你并等你回应哦，快来看看！',
    CREDIT_CARD: '信用卡推销类短信发送，只可以发送给联通用户，请谨慎选择，5分/条。\n如：邀请您办理XX银行信用卡，额度最高5万，审批快，免年费！',
    COLLECTION: '尊敬的${姓名}您好，本期账单已逾期，请您立即登录APP处理还款，如已还款，请忽略本短信，感谢配合。'
  }

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
      ...mapGetters([ 'customerStr' ]),
      messageNum() {
        return this.wordNum === 0 ? 0 : Math.ceil(this.wordNum / 70)
      },
      wordNum() {
        if (this.form.text && this.form.text.length) {
          return this.form.text.length
        } else {
          return 0
        }
      },
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
          return '新建短信模板'
        } else {
          return '编辑短信模板'
        }
      }
    },
    data() {
      const validator = (rule, value, cb) => {
        if (!value) {
          cb(new Error(`请选择${this.customerStr}签名`))
        } else {
          cb()
        }
      }

      return {
        signatureList: [],
        formLabelWidth: '80px',
        form: {
          text: '',
          smsPlatformChannelId: undefined
        },
        formRules: {
          name: [{ required: true, trigger: 'change', message: '请输入模板名称' },
            { min: 1, max: 40, message: '长度在1到40个字符', trigger: 'change' }],
          smsSignatureId: [{ validator, trigger: 'change' }],
          smsPlatformChannelId: [{ required: true, message: '请选择类型', trigger: 'change' }],
          text: [{ required: true, trigger: 'change', message: '请输入模板内容' },
            { min: 1, max: 400, message: '长度在1到400个字符', trigger: 'change' }]
        },
        innerDefaultData: {
          gender: 'UNKNOWN'
        },
        groupList: [],
        constant,
        SmsTemplateType: []
      }
    },
    methods: {
      placeholder() {
        return '' // placeholderEnum[this.form.smsPlatformChannelId]
      },
      async getSmsTemplateType() {
        const { data } = await getSmsTemplateType()
        this.SmsTemplateType  = data.data || []
      },
      add() {
        this.$refs.form.validate(validate => {
          if (validate) {
            addSmsTemplate({
              ...this.form
            }).then(({ data }) => {
              this.success()
            })
            this.formVisible = false
          }
        })
      },
      update() {
        this.$refs.form.validate(validate => {
          if (validate) {
            editSmsTemplate({
              ...this.form
            }).then((data) => {
              this.success()
            })
          }
        })
      },
      async requestSignatureList(smsChannelId) {
        const { data } = await getSmsSignatureList({
          pageNum: 1,
          pageSize: 100,
          status: 'APPROVED',
          smsChannelId
        })

        this.signatureList = data.data.content
        this.filterSignatureList = data.data.content
      },
      getSignatureListByTemplate() {
        const smsTemplate = this.SmsTemplateType.find(item => item.smsPlatformChannelId === this.form.smsPlatformChannelId) || {}
        this.requestSignatureList(smsTemplate.smsChannelId)
      },
      handlerChangeSmsSignatureType() {
        this.$set(this.form, 'smsSignatureId', undefined)
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })

        this.getSignatureListByTemplate()
      },
      async handleDialogOpen() {
        this.$emit('open')
        this.form = {
          ...this.form,
          ...this.row
        }
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })

        await this.getSmsTemplateType()
        this.getSignatureListByTemplate()
      },
      addOrUpdate() {
        if (this.form.addOrEdit === 'ADD') {
          this.add()
        } else {
          this.update()
        }
      },
      confirmBtn() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.addOrUpdate()
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
      .el-radio {
        width: 110px;
        margin: 0 0 5px 0;
      }
  }
</style>
