<template>
  <div class="system-setting">
    <div class="body" v-show="!buyHistoryVisible">
      <div class="block">
        <div class="title">基本信息</div>
        <el-button type="primary" class="submit-btn" @click="save">保存</el-button>
        <div class="">
          <div class="form-info">
            <el-form ref="baseform" class="person-info-form" label-width="85px" :model="formData" :rules="rules">
              <div class="header-info">
                <div v-if="personalizedData.enableStatus && personalizedData.accountHeaderImgStatus === 'START_UP'">
                  <img v-if="personalizedData.accountHeaderImg" :src="personalizedData.accountHeaderImg" class="img">
                  <div v-else class="img"></div>
                </div>
                <img v-else :src="wxHeadimgurl || defaultHeaderImg" class="img" />
                <div class="name">{{name}}</div>
                <div class="pos">{{role}}</div>
              </div>

              <el-form-item label="账号：">
                {{phoneNumber || emptyPlaceholder}}
              </el-form-item>

              <el-form-item label="密码：">
                <div>
                  <span class="psw">**********</span>
                  <span
                    class="action update-psw"
                    @click="changePasswordVisible = true"
                  >
                    修改密码
                  </span>
                </div>
              </el-form-item>

              <div class="inline-item">
                <el-form-item label="职位：" prop="position">
                  <el-input placeholder="输入职位" v-model="formData.position"></el-input>
                </el-form-item>
                <el-form-item label="手机号：" prop="phoneNumber">
                  <el-input placeholder="输入手机号" v-model="formData.phoneNumber"></el-input>
                </el-form-item>
              </div>

              <el-form-item label="工作描述：" prop="description">
                <el-input type="textarea" resize="none" :style="{'height': '65px'}" placeholder="输入工作描述" v-model="formData.description"></el-input>
              </el-form-item>
              <el-form-item label="性别：" prop="gender">
                <el-radio-group v-model="formData.gender" size="small">
                  <el-radio label="MALE">男</el-radio>
                  <el-radio label="FEMALE">女</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="微信：" v-if="!isLocal && !isRongLian && !NoLogoNorWx">
                <div class="clearfix band-we" v-if="!wxOfficialAccountBinded && qrCode">
                  <img :src="qrCode" class="qr-img pull-left" />
                  <img :src="erweimaLogo" class="erweima-logo" />
                  <div class="pull-left ml16">
                    <div class="tip">扫一扫</div>
                    <div class="content first">绑定微信公众号，登录探意小程序</div>
                    <div class="content">实时获取意向{{customerStr}}，掌握任务动态</div>
                  </div>
                </div>
                <div v-else>
                  {{wechat}}
                  <span
                    class="action"
                    @click="handleBindCancelClick"
                  >
                    取消绑定
                  </span>
                </div>
              </el-form-item>

              <div class="right-part" :style="wxOfficialAccountBinded ? 'margin-top: -2px;' : 'margin-top: 10px;'">
                <el-form-item label="所属公司：">
                  {{companyName || emptyPlaceholder}}
                </el-form-item>
                <el-form-item :label="`可拥有${customerStr}数：`">
                  {{customerCountLimit || '不限制'}}
                </el-form-item>
                <el-form-item label="主属部门：">
                  {{organization || emptyPlaceholder}}
                </el-form-item>
                <el-form-item :label="`拥有${customerStr}剩余天数：`">
                  {{customerDaysLimit || '不限制'}}
                </el-form-item>
                <el-form-item label="部门负责人：">
                  {{manager || '暂未设置'}}
                </el-form-item>
              </div>

            </el-form>
          </div>
        </div>
      </div>
      <div class="block" v-if="hasAccess('crm_account_view')">
        <div class="title">账户信息</div>
        <div class="account-info-con">
          <el-form ref="form" class="accout-form" label-width="140px">
            <el-form-item label="账户余额：" class="account-over-time-item mt17">
              <div class="cover"></div>
              <router-link tag="div" class="cover" to="/stats/billing"></router-link>
              <div class="clearfix relative w100">
                <span class="pull-left">{{balance.totalAccountFare / 1000}}元</span>
                <div class="lines pull-left">
                  <div v-for="(item, index) in balance.phoneNumberAccountFareList" :key="index">
                    线路{{item.phoneName || item.phoneNumber}}：{{item.phoneNumberAccountFare / 1000}}元
                  </div>
                  <div>
                    短信：{{balance.messageAccountFare / 1000}}元
                  </div>
                  <div>
                    智能语音质检：{{(balance.qcAccountFare || 0) / 1000}}元
                  </div>
                </div>
                <router-link
                  tag="a"
                  class="action icon-action"
                  to="/stats/billing"
                >
                  <span class="flex-center" v-if="hasAccess('crm_statisticsBill_view')"><i class="iconfont icon-chakanxiaofeiliushuix"></i><span class="text">查看消费流水</span></span>
                </router-link>
              </div>
            </el-form-item>
            <el-form-item label="账户过期时间：" class="account-over-time-item">
              <div class="cover" @click="buyHistoryVisible = true"></div>
              <div class="clearfix relative w100">
                <div class="account-over-time">{{expireTime || emptyPlaceholder}}</div>
                <a
                  class="action icon-action flex-center"
                  @click="buyHistoryVisible = true"
                >
                  <i class="iconfont icon-chakangoumaimingxix"></i><span class="text">查看购买明细</span>
                </a>
              </div>
            </el-form-item>
            <el-form-item label="AI数量：" class="mt15 mb15">
              <span>有效（{{aiConcurrencyLevel || 0}}个）</span><span class="overtime">过期（{{aiExpiredLevel || 0}}个）</span>
            </el-form-item>
            <el-form-item label="API对接账号：" class="account-over-time-item" v-if="openISV">
              <div class="cover" @click="editingAPI = true"></div>
              <div class="clearfix relative w100">
                <div class="form-item">
                  <div class="label">公司签名：</div>
                  <div class="content">
                    <el-input placeholder="输入公司签名" v-model="tenantSignInner" v-if="editingAPI"></el-input>
                    <span v-else>{{tenantSign}}</span>
                  </div>
                </div>
                <div class="form-item">
                  <div class="label">回调地址：</div>
                  <div class="content">
                    <el-input placeholder="输入回调地址" v-model="callbackUrlInner" v-if="editingAPI"></el-input>
                    <span v-else>{{callbackUrl}}</span>
                  </div>
                </div>
                <div class="form-item">
                  <div class="label">短信回调地址：</div>
                  <div class="content">
                    <el-input placeholder="输入短信回调地址" v-model="smsCallbackUrlInner" v-if="editingAPI"></el-input>
                    <span v-else>{{smsCallbackUrl}}</span>
                  </div>
                </div>
                <a
                  class="action icon-action flex-center"
                  @click="handleEditIsv"
                  v-if="!editingAPI"
                >
                  <i class="iconfont icon-edited"></i><span class="text">编辑</span>
                </a>
                <div class="btn-group" v-else>
                  <el-button type="primary" @click="updateIsv">保存</el-button>
                  <el-button type="primary" @click="editingAPI = false">取消</el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="AI等待时长：" class="mb15 account-over-time-item" v-if="enableTaskWaitingTimeout">
              <template v-if="!editWaiting">
                <div class="waiting-time">
                  <span>{{taskWaitingTimeout}}s</span>
                  <a
                    class="action"
                    @click="editWaiting = true"
                    v-if="!editingAPI"
                  >
                    <i class="iconfont icon-edited"></i><span class="text">编辑</span>
                  </a>
                </div>
              </template>
              <template v-else>
                <div class="waiting-time">
                  <div>
                    <el-input-number
                      :min="1"
                      :max="40"
                      v-model="taskWaitingTimeout"
                    >
                    </el-input-number>
                    <el-tooltip
                      placement="top"
                      :content="`“AI等待时长为30s”是指AI外呼${customerStr}时，${customerStr}手机响铃30s不接起，AI就挂断电话。该字段可自行调整，取值范围为1s~40s。`"
                    >
                      <i class="el-icon-question"></i>
                    </el-tooltip>
                  </div>
                  <div>
                    <el-button type="primary" @click="handleSaveWaiting">保存</el-button>
                    <el-button @click="editWaiting = false">取消</el-button>
                  </div>
                </div>
              </template>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="block" v-if="distributorLevel != 0">
        <div class="title">功能市场</div>
        <div class="tip-right">
          <i class="el-icon-warning yellow"></i>
          如需开通新功能，请联系您的{{customerStr}}经理
        </div>
        <div class="cards-con">
          <div class="card" v-for="(func, index) in funcs" :key="index" :class="func.enable ? 'enable' : 'disable'">
            <i class="iconfont card-img" :class="func.icon" :style="{'color': func.enable ? func.color : '#DBDBDB'}"></i>
            <el-tag type="success" v-if="func.enable">已开通</el-tag>
            <el-tag type="danger" v-else>未开通</el-tag>
            <el-button type="text" class="open-func" @click="openFunc">开启服务</el-button>
            <div class="card-content">
              <div class="card-title">
                {{func.title}}
                <span class="card-sub-title" v-if="index === 1 && func.enable">{{func.count}}个有效坐席</span>
                <span class="card-sub-title" v-if="index === 3 && func.enable">{{func.count}}个有效助理</span>
                <span class="card-sub-title" v-if="[2].includes(index)">{{func.count}}个有效坐席</span>
                <span class="card-sub-title" v-if="index === 5 && func.enable">{{func.count / 100}}元/分钟</span>
              </div>
              <div class="card-msg">{{func.msg}}</div>
            </div>
          </div>
        </div>
      </div>
      <div>
      </div>
    </div>
    <changePsw
      :visible.sync="changePasswordVisible"
    >
    </changePsw>
    <buy-history
      :visible.sync="buyHistoryVisible"
    ></buy-history>
    <yiwise-dialog
      title="提示"
      class="tip-dialog"
      width="554px"
      @confirm="handleSubmit"
      :visible.sync="cancelBindVisible"
    >
      <div class="tip-con">
        <i class="iconfont icon-tishix"></i>
        <div class="tips">
          <div class="title mb10">要取消绑定当前的微信号吗？</div>
          <div class="content">取消绑定后，进行中的任务将无法推送意向{{customerStr}}。若需绑定新微信号，您可以先暂停进行中的任务，绑定成功后再开始任务，方能正常推送意向{{customerStr}}。</div>
        </div>
      </div>
    </yiwise-dialog>

    <yiwise-dialog
      title="提示"
      class="tip-dialog"
      width="554px"
      :visible.sync="tipDialogVisible"
      :hasFooter="false"
    >
      <div class="tip-con">
        <i class="iconfont icon-tishix t1"></i>
        <div class="tips">
          <div class="content l40">如需开通，请先与您的{{customerStr}}经理进行了解</div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="tipDialogVisible = false">知道了</el-button>
      </div>
    </yiwise-dialog>
  </div>
</template>

<script>
  import * as statsAPI from '@/api/stats'
  import { getTaskWaitingTimeout, updateTaskWaitingTimeout } from '@/api/personalInfo'
  import PersonalDialog from './personalDialog'
  import { YiwiseDialog } from 'yiwise-components'
  import changePsw from '@/components/changePsw'
  import buyHistory from './buyHistory'
  import { mapGetters, mapActions } from 'vuex'
  import { genderEnum } from '@/utils/enum'
  import { emptyPlaceholder } from '@/utils/constant'
  import { fetchQrCode, cancelBind, updateUserInfo, updateIsv, getIntentInfo } from '@/api/personalInfo'
  import erweimaLogo from '@/assets/erweima_gongzhonghao_logo.png'
  import app from '@/store/modules/app'
  const customerStr = app.state.customerStr

  const getDefaultData = () => ({
    phoneNumber: '',
    gender: '',
    description: '',
    position: ''
  })

  export default {
    name: 'SystemSettings',
    components: {
      PersonalDialog,
      changePsw,
      buyHistory,
      YiwiseDialog
    },
    computed: {
      ...mapGetters([
        'name',
        'userId',
        'distributorLevel',
        'gender',
        'position',
        'role',
        'description',
        'phoneNumber',
        'wechat',
        'tenantId',
        'wxHeadimgurl',
        'wxOfficialAccountBinded',
        'isLocal',
        'organization',
        'manager',
        'username',
        'companyName', // 所属公司
        'aiConcurrencyLevel', // 有效ai数量
        'aiExpiredLevel', // 过期ai数量
        'accountFare', // 账户余额
        'expireTime', // 账号过期时间
        'customerCountLimit', // 用户可拥有客户数量
        'customerDaysLimit', // 用户拥有客户剩余的天数
        'openISV',
        'tenantSign',
        'callbackUrl',
        'smsCallbackUrl',
        'enableTaskWaitingTimeout',
        'isRongLian',
        'NoLogoNorWx',
        'customerStr',
        'personalizedData'
      ]),
      accountFareComputed() {
        return Number(this.accountFare || 0).toFixed(3) + '元'
      },
      defaultHeaderImg() {
        return this.isRongLian || this.NoLogoNorWx ? '/static/img/default-header.png' : '/static/img/zhagnhu_morentouxiang@2x.png'
      }
    },
    data() {
      return {
        tipDialogVisible: false,
        _funcs: [{
          enable: false,
          title: 'TTS全句合成',
          msg: '支持纯TTS合成话术，纯AI合成音，话术体验更自然。',
          color: '#8451C5',
          icon: 'icon-ttsquanjuhechengx'
        }, {
          count: 0,
          enable: false,
          title: '一线多并发',
          msg: '最大提升AI机器人工作效率，减少机器人空闲时间。',
          color: '#5B9EFA',
          icon: 'icon-yixianduobingfax'
        }, {
          count: 0,
          enable: false,
          title: '人工坐席',
          msg: '支持用于人工介入，转人工，人工外呼，呼入接待等多种场景下的坐席数量。',
          color: '#58D3EA',
          icon: 'icon-zhinengivryuyindaohangx'
        }, {
          enable: false,
          title: 'Ai助理',
          count: 0,
          msg: 'AI辅助人工，降低人力学习成本，客服工作，轻松上手。',
          color: '#6CD370',
          icon: 'icon-AIzhulix'
        }, {
          enable: false,
          title: '智能IVR语音导航',
          msg: `颠覆传统IVR，按键语音双命令，多种接待方式分流，让人工坐席接待更重要的${customerStr}。`,
          color: '#EEB741',
          icon: 'icon-rengongzuoxix'
        }, {
          count: 0,
          enable: false,
          title: '智能质检',
          msg: 'Ai质检，定制化工作模式，摆脱费事费力不稳定的人工质检。',
          color: '#5C54FF',
          icon: 'icon-zhinengzhijianx'
        }],
        balance: {},
        changePasswordVisible: false,
        personalVisible: false,
        buyHistoryVisible: false,
        editingAPI: false,
        genderEnum,
        emptyPlaceholder,
        qrCode: '',
        formData: getDefaultData(),
        rules: {},
        erweimaLogo,
        interval: null,
        tenantSignInner: undefined,
        callbackUrlInner: undefined,
        smsCallbackUrlInner: undefined,
        cancelBindVisible: false,
        taskWaitingTimeout: 1,
        editWaiting: false
      }
    },
    async mounted() {
      this.getTenantAccountFare()
      this.getTaskWaitingTimeout()

      if (this.distributorLevel !== 0) {
        this.getIntentInfo()
      }

      if (!this.wxOfficialAccountBinded && !this.isLocal) {
        this.getQRCode()
        this.setInterval()
      }

      this.formData.position = this.position
      this.formData.description = this.description
      this.formData.phoneNumber = this.phoneNumber
      this.formData.gender = this.gender
      this.tenantSignInner = this.tenantSign
      this.callbackUrlInner = this.callbackUrl
      this.smsCallbackUrlInner = this.smsCallbackUrl
    },
    beforeDestroy() {
      this.clearInterval()
    },
    methods: {
      openFunc() {
        this.tipDialogVisible = true
      },
      async getIntentInfo() {
        const { data } = await getIntentInfo({
          tenantId: this.tenantId
        })
        let d = data.data
        this.funcs[0].enable = !!d.enableTts
        this.funcs[1].enable = !!d.enableConcurrency
        this.funcs[1].count = d.concurrencyCount + d.enabledAiCount
        this.funcs[2].count = d.allAgentCount || 0
        this.funcs[2].enable = this.funcs[2].count > 0
        this.funcs[3].enable = !!d.enableAiAssistant
        this.funcs[3].count = d.assistantCount || 0
        this.funcs[4].enable = !!d.enableIvr
        this.funcs[5].enable = !!d.enableVoiceQualityControl
        this.funcs[5].count = d.qcCostUnit / 10
       },
      setInterval() {
        this.clearInterval()
        this.interval = setInterval(async() => {
          await this.getUserInfo()
          if (this.wxOfficialAccountBinded) {
            this.clearInterval()
          }
        }, 3000)
      },
      clearInterval() {
        if (this.interval) {
          clearInterval(this.interval)
          this.interval = null
        }
      },
      getTenantAccountFare() {
        try {
          statsAPI.getTenantAccountFare().then(({ data }) => {
            this.balance = data.data
          })
        } catch (e) {
          console.log(e)
        }
      },
      async updateIsv() {
        await updateIsv({
          tenantSign: this.tenantSignInner,
          callbackUrl: this.callbackUrlInner,
          smsCallbackUrl: this.smsCallbackUrlInner
        })
        this.$message.success('保存成功')
        this.editingAPI = false
        this.getUserInfo()
      },
      handleEditIsv() {
        this.editingAPI = true
        this.tenantSignInner = this.tenantSign
        this.callbackUrlInner = this.callbackUrl
        this.smsCallbackUrlInner = this.smsCallbackUrl
      },
      handleEditClick() { // 点击修改
        this.personalVisible = true
      },
      async getQRCode() { // 绑定微信
        const { data } = await fetchQrCode()
        if (data.data) {
          this.qrCode = data.data.url
        }
      },
      async handleSubmit() {
        await cancelBind()
        this.$message.success('取消成功')
        this.cancelBindVisible = false
        await this.getUserInfo()
        if (!this.wxOfficialAccountBinded) {
          this.getQRCode()
          this.setInterval()
        }
      },
      async handleBindCancelClick() { // 取消绑定
        this.cancelBindVisible = true
      },
      save() {
        this.$refs.baseform.validate(async(valid) => {
          if (valid) {
            try {
              await updateUserInfo({
                userId: this.userId,
                phoneNumber: this.formData.phoneNumber,
                gender: this.formData.gender,
                job: this.formData.position,
                comment: this.formData.description
              })
              this.getUserInfo()
              this.$message.success('修改成功')
            } catch (error) {
              // this.handleError(error)
              return
            }
          }
        })
      },
      async handleSaveWaiting() {
        await updateTaskWaitingTimeout({
          taskWaitingTimeout: this.taskWaitingTimeout
        })
        this.editWaiting = false
      },
      async getTaskWaitingTimeout() {
        const { data } = await getTaskWaitingTimeout()
        this.taskWaitingTimeout = data.data
      },
      ...mapActions(['getUserInfo'])
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';
  $--color-text-inner: #4A4A4A !default;
  $--color-text-blur: #1890FF;

  .system-setting {
    font-family: "SF Pro SC","SF Pro Display","SF Pro Icons","PingFang SC","Helvetica Neue","Helvetica","Arial",sans-serif;
    overflow: auto;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .block {
    position: relative;
    overflow: hidden;
    background: #fff;
    box-shadow: 0px 0px 4px rgba(219, 219, 219, 0.1);
    padding-bottom: 24px;
    & + .block {
      margin-top: 20px;
    }
    .title {
      position: absolute;
      color: $--color-text-inner;
      font-size: 14px;
      height: 20px;
      line-height: 20px;
      top: 19px;
      left: 20px;
      font-weight: bold;
    }
    .header-info {
      position: absolute;
      top: 137px;
      right: calc(100% + 30px);
      text-align: center;
      font-weight: bold;
      .img {
        width: 120px;
        height: 120px;
        border-radius: 50%;
      }
      .name {
        // height: 28px;
        width: 200px;
        margin-top: 24px;
        line-height: 28px;
        font-size: 20px;
        word-break: break-word;
        color: $--color-text-primary;
      }
      .pos {
        height: 20px;
        margin-top: 5px;
        line-height: 20px;
        font-size: 14px;
        color: $--color-text-primary;
      }
    }
    .submit-btn {
      font-size: 14px !important;
      padding: 0px 19px !important;
      position: absolute;
      top: 20px;
      right: 20px;
    }
    .el-form {
      margin: 0 auto;
      /deep/ .el-form-item__label {
        font-size: 14px;
        color: $--color-text-regular;
      }
      /deep/ .el-form-item__content {
        color: $--color-text-inner;
        font-size: 14px;
        font-weight: bold;
        position: relative;
        textarea, input {
          border-radius: 2px;
          font-weight: bold;
          font-family: "SF Pro SC","SF Pro Display","SF Pro Icons","PingFang SC","Helvetica Neue","Helvetica","Arial",sans-serif;
        }
        textarea {
          height: 100%;
        }
        .band-we {
          .qr-img {
            width: 108px;
            height: 108px;
            border: 1px solid #ddd;
            border-radius: 6px;
          }
          .erweima-logo {
            width: 22px;
            height: 22px;
            position: absolute;
            left: 44px;
            top: 44px;
          }
          .tip {
            color: $--color-text-primary;
            font-size: 18px;
            font-weight: bold;
          }
          .content {
            color: $--color-text-primary;
            font-size: 14px;
            font-weight: bold;
          }
        }
      }
      .action {
        cursor: pointer;
        color: $--color-text-blur;
        .iconfont {
          font-weight: 100;
          font-size: 18px;
        }
        .iconfont + .text {
          margin-left: 5px;
        }
      }
      .icon-action {
        display: flex;
        position: absolute;
        top: -16px;
        right: 15px;
        z-index: 100;
        line-height: 62px;
      }
      .psw {
        position: relative;
        top: 2px;
      }
      .lines {
        font-size: 12px;
        color: #616060;
        margin-left: 14px;
        margin-top: 6px;
        line-height: 20px;
      }
      .update-psw {
        margin-left: 12px;
      }
      .account-over-time-item {
        &.mt17 {
          margin-top: 17px;
        }
        .w100 {
          width: 100%;
        }
        .form-item {
          margin-bottom: 15px;
          line-height: 32px;
          .label {
            display: inline-block;
          }
          .content {
            display: inline-block;
          }
        }
        .btn-group {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 200;
        }
        .el-input {
          z-index: 200;
        }
        /deep/ .el-form-item__label {
          height: 62px;
          line-height: 62px;
        }
        /deep/ .el-form-item__content {
          display: flex;
          cursor: pointer;
          padding: 17px 0;
          &::before {
            content: '';
            height: 1px;
            background: #ddd;
            position: absolute;
            top: 0;
            left: -13px;
            right: -1px;
            display: block;
          }
        }
        .icon-edited {
          font-size: 15px;
        }
        &:first-child {
          /deep/ .el-form-item__content {
            &::before {
              content: '';
              height: 0px;
            }
          }
        }
        & + .account-over-time-item {
          /deep/ .el-form-item__content {
            &::after {
              content: '';
              height: 1px;
              background: #ddd;
              position: absolute;
              bottom: 0;
              left: -13px;
              right: -1px;
              display: block;
            }
          }
        }
        .cover {
          background: rgba(168, 212, 252, .1);
          position: absolute;
          left: -13px;
          right: 0;
          height: 100%;
          top: 0;
          display: none;
          z-index: 100;
        }
        &:hover {
          .cover {
            display: block;
          }
        }
      }
    }
    .person-info-form {
      width: 774px;
      position: relative;
      margin-top: 32px;
      transform: translateX(100px);
      .el-form-item {
        margin-bottom: 20px;
      }
      .el-radio + .el-radio {
        margin-left: 79px;
      }
      .right-part {
        display: inline-block;
        border-top: 1px solid #ededed;
        padding-top: 14px;
        .el-form-item {
          display: inline-block;
          width: 40%;
          margin-bottom: 4px;
          margin-top: 4px;
        }
        /deep/ .el-form-item__label {
          width: 140px !important;
        }
        /deep/ .el-form-item__content {
          white-space: nowrap;
        }
      }
      .inline-item {
        display: flex;
        justify-content: space-between;
        .el-form-item {
          display: inline-block;
          &:first-child {
            .el-input {
              width: 318px;
            }
          }
          &:last-child {
            .el-input {
              width: 203px;
            }
          }
        }
      }
      .el-input {
        width: 300px;
      }
      .el-textarea {
        width: 687px;
      }
    }
    .accout-form {
      width: 830px;
      margin-top: 50px;
      /deep/ .el-form-item {
        margin-bottom: 0;
      }
      /deep/ .el-form-item__label, /deep/ .el-form-item__content {
        line-height: 30px;
      }
      .overtime {
        display: inline-block;
        margin-left: 20px;
        color: $--color-danger;
      }
    }
    .flex-center {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .pull-left {
      float: left;
    }
    .pull-right {
      float: right;
    }
    .cards-con {
      display: flex;
      flex-wrap: wrap;
      padding: 60px 6px 0 26px;
      .card {
        position: relative;
        display: flex;
        align-items: center;
        flex: 1;
        border: 1px solid #f2f2f2;
        height: 120px;
        min-width: 30%;
        margin-right: 20px;
        margin-bottom: 20px;
        &.disable {
          * {
            color: #DBDBDB;
          }
          .el-button {
            color: $--color-primary;
          }
        }
        &:hover {
          .open-func {
            display: inline-block;
          }
        }
        &.enable {
          .open-func {
            display: none;
          }
        }
        .open-func {
          position: absolute;
          bottom: 10px;
          right: 8px;
          display: none;
          cursor: pointer;
        }
        .el-tag {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 48px;
          height: 20px;
          line-height: 20px;
          background:#fff;
          border-radius:2px;
          border-color: #18B41E;
          color: #18B41E;
          padding: 0;
          text-align: center;
          &--danger {
            border-color: #E03B2F;
            color: #E03B2F;
          }
        }
        &-img {
          width: 48px;
          height: 48px;
          margin: 0 20px;
          font-size: 48px;
          position: relative;
          top: -2px;
        }
        &-content {
          flex: 1;
          height: 100%;
          padding-top: 24px;
        }
        &-title {
          font-size: 16px;
          line-height: 22px;
          height: 22px;
          color: #000;
          font-weight: 700;
          margin-bottom: 10px;
        }
        &-sub-title {
          color: #333;
          font-weight: 400;
          font-size: 12px;
        }
        &-msg {
          color: #666;
          font-size: 12px;
          width: 250px;
          line-height: 17px;
        }
      }
    }
  }

  .ml16 {
    margin-left: 16px;
  }

  .tip-dialog {
    /deep/ .el-dialog__body {
      overflow: hidden;
      margin-bottom: 60px;
      padding: 0 80px 0 79px!important;
    }
    /deep/ .el-dialog__header{
      margin-bottom: 60px;
    }
    .tip-con {
      display: flex;
      .iconfont {
        font-size: 35px;
        color: $--color-warning;
      }
      .tips {
        margin-left: 21px;
        .title {
          font-size: 16px;
          line-height: 22px;
          color: $--color-text-primary;
          font-weight: bold;
        }
        .content {
          font-size: 12px;
          color: $--color-text-secondary;
          font-weight:400;
          line-height: 20px;
        }
      }
    }
  }

  .t1 {
    position: relative;
    top: 1px;
  }

  .l40 {
    line-height: 40px !important;
  }

  .tip-right {
    position: absolute;
    top: 35px;
    right: 26px;
  }

  .yellow {
    color: #ECB845;
  }

  .mb15 {
    margin-bottom: 15px !important;
  }

  .waiting-time {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .el-icon-question {
      display: inline-block;
      margin-left: 10px;
    }
  }
</style>

