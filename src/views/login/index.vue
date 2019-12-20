<template>
  <div class="outer-container">
    <div class="login-container">
      <div  v-if="personalizedData.enableStatus && personalizedData.landingPageStatus === 'START_UP'">
        <div v-if="personalizedData.landingPageSelect === 'COPY_WRITING'" class="no-logo-ronglian">{{personalizedData.landingPageCopyWriting}}</div>
        <div v-else-if="personalizedData.landingPageSelect === 'IMG'">
          <div v-if="personalizedData.landingPageImg" class="login-logo"><img :src="personalizedData.landingPageImg" ></div>
          <div v-else class="login-logo"></div>
        </div>
      </div>
      <div class="no-logo-ronglian" v-else-if="isYuHangJianKongJu">余杭区市场监督管理局智能语音</div>
      <div class="no-logo-ronglian" v-else-if="isGongDaoBeiJingIP">北京市高级人民法院智能语音</div>
      <div class="no-logo-ronglian" v-else-if="isRongLian || NoLogoNorWx">智能语音机器人</div>
      <svg v-else-if="showLogo" class="icon login-logo" aria-hidden="true">
        <use xlink:href="#icon-tanyilogoyingwenx"></use>
      </svg>
      <div v-else class="no-logo">CRM</div>
      <el-form
        v-if="loginType === 0"
        key="code-form"
        class="login-form"
        autoComplete="off"
        :model="loginCodeForm"
        :rules="loginCodeRules"
        ref="loginCodeForm"
        label-position="left">
        <el-form-item prop="phoneNumber">
          <el-input class="username input-text" name="phoneNumber" type="text" v-model="loginCodeForm.phoneNumber" placeholder="输入手机号码" />
        </el-form-item>

        <el-form-item prop="code" class="mt18 pr">
          <el-input class="password input-text" name="code" v-model="loginCodeForm.code" autoComplete="off" placeholder="输入验证码">
          </el-input>
          <div class="send">
            <el-tag v-if="!sended" class="send-tag" @click.native="send()">发送验证码</el-tag>
            <div v-else class="send-counter">{{counter}}s后重新发送</div>
          </div>
        </el-form-item>
        <el-row type="flex" justify="space-between">
          <!--<el-col :span="6" class="ml30 mt15">
            <el-checkbox v-model="checked">记住密码</el-checkbox>
          </el-col>-->
          <!--<el-col :span="6" class="forget-password">忘记密码？</el-col>-->
        </el-row>
        <el-button
          class="login-btn" type="primary" :loading="loading"
          @click.native.prevent="handleCodeLogin">登录
        </el-button>
        <div class="login-type">
          <div v-if="loginType !== 0 && !isLocal" @click="loginType = 0"><i class="iconfont icon-yanzhengmax"></i>验证码登录</div>
          <div v-if="loginType !== 1 && !isLocal && !isRongLian && !NoLogoNorWx" @click="loginType = 1"><i class="iconfont icon-weixinx"></i>微信登录</div>
          <div v-if="loginType !== 2" @click="loginType = 2"><i class="iconfont icon-zhanghaox"></i>账号登录</div>
        </div>
      </el-form>
      <div v-if="loginType === 1" class="qrlogin-form">
        <div class="qrlogin-header">微信登录</div>
        <img class="qrlogin-code" :src="qrcodeUrl" alt="">
        <div class="qrlogin-footer">请使用微信扫描二维码登录“探意”</div>
        <div class="login-type">
          <div v-if="loginType !== 0 && !isLocal" @click="loginType = 0"><i class="iconfont icon-yanzhengmax"></i>验证码登录</div>
          <div v-if="loginType !== 1 && !isLocal && !isRongLian && !NoLogoNorWx" @click="loginType = 1"><i class="iconfont icon-weixinx"></i>微信登录</div>
          <div v-if="loginType !== 2" @click="loginType = 2"><i class="iconfont icon-zhanghaox"></i>账号登录</div>
        </div>
      </div>
      <el-form
        v-if="loginType === 2"
        key="password-form"
        class="login-form"
        autoComplete="on"
        :model="loginForm"
        :rules="loginRules"
        ref="loginForm"
        label-position="left">
        <el-form-item prop="username">
          <el-input class="username input-text" name="username" type="text" @keyup.enter.native="handleLogin" @input="handleInput" v-model="loginForm.username" placeholder="输入用户名" />
        </el-form-item>

        <el-form-item prop="password" class="mt18">
          <el-input class="password input-text" name="password" :type="passwordType" @keyup.enter.native="handleLogin" v-model="loginForm.password" autoComplete="on" placeholder="输入密码">
          </el-input>
        </el-form-item>

        <el-row type="flex" justify="space-between">
          <el-col :span="6" class="ml30 mt15">
            <el-checkbox v-model="checked">记住密码</el-checkbox>
          </el-col>
          <!--<el-col :span="6" class="forget-password">忘记密码？</el-col>-->
        </el-row>
        <el-button
          class="login-btn" type="primary" :loading="loading"
          @click.native.prevent="handleLogin">登录
        </el-button>
        <div class="login-type">
          <div v-if="loginType !== 0 && !isLocal" @click="loginType = 0"><i class="iconfont icon-yanzhengmax"></i>验证码登录</div>
          <div v-if="loginType !== 1 && !isLocal && !isRongLian && !NoLogoNorWx" @click="loginType = 1"><i class="iconfont icon-weixinx"></i>微信登录</div>
          <div v-if="loginType !== 2" @click="loginType = 2"><i class="iconfont icon-zhanghaox"></i>账号登录</div>
        </div>
      </el-form>
    </div>
    <div class="bottom-text" v-if="isGongdao">
      <span>技术支持</span>
      <span>·</span>
      <span class="name">共道网络科技有限公司</span>
    </div>
    <div class="bottom-text" v-if="personalizedData.enableStatus && personalizedData.bottomCopyWritingStatus === 'START_UP'">
      <span>{{personalizedData.bottomCopyWriting}}</span>
    </div>
    <div class="bottom-text" v-else-if="!personalizedData.enableStatus && personalizedData.bottomCopyWritingStatus === 'BLOCK_UP' && !isRongLian && !NoLogoNorWx">
      <span class="name">探意</span>
      <span>·</span>
      <span>智能语音机器人</span>
    </div>
  </div>
</template>


<script>
  import { sendLoginCode, getWechatLoginQrCode, loginPolling } from '@/api/login'
  import { mapGetters } from 'vuex'

  export default {
    name: 'login',
    data() {
      const validatePhoneNumber = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入手机号码'))
        } else if (!(/^1[3456789]\d{9}$/.test(value))) {
          callback(new Error('请输入正确的手机号码'))
        } else callback()
      }
      return {
        loginType: 2,
        sended: false,
        counter: 60,
        qrcodeUrl: '',
        callBackId: '',
        qrTimer: undefined,
        loginCodeForm: {},
        loginForm: {
          username: '',
          password: ''
        },
        loginCodeRules: {
          phoneNumber: [
            { required: true, trigger: 'blur', validator: validatePhoneNumber }
          ],
          code: [
            { required: true, trigger: 'blur', message: '请输入验证码' }
          ]
        },
        loginRules: {
          username: [
            { required: true, trigger: 'blur', message: '请输入用户名' }
          ],
          password: [
            { required: true, trigger: 'blur', message: '请输入密码' },
            { min: 6, trigger: 'blur', message: '密码不能小于6位' }
          ]
        },
        passwordType: 'password',
        password: null,
        loading: false,
        showDialog: false,
        input: '',
        phone: '',
        verificationCode: '',
        checked: false,
        activeName: 'second'
      }
    },
    computed: {
      ...mapGetters([
        'isLocal',
        'isRongLian',
        'NoLogoNorWx',
        'isYuHangJianKongJu',
        'isGongDaoBeiJingIP',
        'isGongdao',
        'personalizedData'
      ]),
      showLogo() {
        return window.location.href.indexOf('ai.tanyibot.com') === -1
      }
    },
    watch: {
      loginType(type) {
        if (type === 1) {
          this.startPolling(this.callBackId)
        } else {
          this.closePolling()
        }
      }
    },
    methods: {
      async send() {
        if (!(/^1[3456789]\d{9}$/.test(this.loginCodeForm.phoneNumber))) {
          this.$message.error('请输入正确的手机号码')
          return
        }
        const res = await sendLoginCode({ phoneNumber: this.loginCodeForm.phoneNumber })
        if (res.data && res.data.code === 200) {
          this.$message.success('发送成功')
          this.sended = true
          const timer = setInterval(() => {
            if (--this.counter === 0) {
              this.sended = false
              clearInterval(timer)
              this.$nextTick(() => {
                this.counter = 60
              })
            }
          }, 1000)
        } else {
          this.$message.error('发送失败')
        }
      },
      async handleCodeLogin() {
        this.$refs.loginCodeForm.validate(async valid => {
          if (valid) {
            this.loading = true
            try {
              await this.$store.dispatch('LoginByCode', this.loginCodeForm)

              this.loading = false
              this.$router.push({ path: this.$route.query.redirect || '/' })
            } catch (error) {
              this.loading = false
            }
          }
        })
      },
      showPwd() {
        if (this.passwordType === 'password') {
          this.passwordType = ''
        } else {
          this.passwordType = 'password'
        }
      },
      handleLogin() {
        this.$refs.loginForm.validate(async valid => {
          if (valid) {
            this.loading = true
            try {
              await this.$store.dispatch('LoginByUsername', this.loginForm)

              if (this.checked) {
                let flag = false
                this.password.forEach((item, index) => {
                  if (item.username === this.loginForm.username) {
                    flag = true
                    this.password.splice(index, 1, this.loginForm)
                  }
                })
                if (!flag) this.password.push(this.loginForm)
                localStorage.setItem('password', JSON.stringify(this.password))
              }

              this.loading = false
              this.$router.push({ path: this.$route.query.redirect || '/' })
            } catch (error) {
              this.loading = false
            }
          }
        })
      },
      handleInput(username) {
        this.password.forEach((item, index) => {
          if (item.username === username) this.loginForm.password = item.password
        })
      },
      afterQRScan() {
        // const hash = window.location.hash.slice(1)
        // const hashObj = getQueryObject(hash)
        // const originUrl = window.location.origin
        // history.replaceState({}, '', originUrl)
        // const codeMap = {
        //   wechat: 'code',
        //   tencent: 'code'
        // }
        // const codeName = hashObj[codeMap[this.auth_type]]
        // if (!codeName) {
        //   alert('第三方登录失败')
        // } else {
        //   this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
        //     this.$router.push({ path: '/' })
        //   })
        // }
      },
      startPolling(callBackId) { // 开启轮询
        this.closePolling()
        this.qrTimer = setInterval(async() => {
          const { data } = await loginPolling({ callBackId })
          if (data.data && data.data.tenantId !== undefined) {
            this.closePolling()
            this.$router.push({ path: this.$route.query.redirect || '/' })
          }
        }, 3000)
      },
      closePolling() { // 关闭轮询
        if (this.qrTimer) {
          clearInterval(this.qrTimer)
          this.qrTimer = null
        }
      }
    },
    async mounted() {
      const p = localStorage.getItem('password')
      this.password = p ? JSON.parse(p) : []
      if (this.isLocal) {
        this.loginType = 2
        return
      }
      // const { data } = await getWechatLoginQrCode()
      // if (data.data) {
      //   const { url, callBackId } = data.data
      //   this.qrcodeUrl = url
      //   this.callBackId = callBackId
      //   this.startPolling(callBackId)
      // }
    },
    destroyed() {
      // window.removeEventListener('hashchange', this.afterQRScan)
      if (this.qrTimer) {
        clearInterval(this.qrTimer)
      }
    },
    created() {
      console.log(this.personalizedData)
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import '~src/styles/variables.scss';
  $bg:#2d3a4b;
  $light_gray:#eee;

  body{
    height: auto !important;
  }
  .mt18{
    margin-top: 18px;
  }
  .pr{
    position: relative;
  }
  /* reset element-ui css */
  .outer-container {
    height: 100%;
    display: flex;
    background: #f6f7ff;
    justify-content: center;
    align-items: center;
    position: relative;
    .login-container {
      background: #fff;
      height: 530px;
      width: 462px;
      position: relative;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
      /*tabs title area start*/
      .no-logo-ronglian {
        height: 60px;
        margin: 50px auto;
        text-align: center;
        color: #057AE6;
        font-size: 30px;
        font-weight: 600;
        font-family: "PingFangSC-Regular", "SF Pro SC","SF Pro Display","SF Pro Icons","PingFang SC","Helvetica Neue","Helvetica","Arial",sans-serif !important;
      }
      .login-logo {
        margin: 50px auto;
        display: block;
        height: 60px;
        width: 198px;
        > img {
          height: 60px;
          width: 198px;
        }
      }
      .no-logo {
        margin: 50px auto;
        display: block;
        height: 60px;
        text-align: center;
        color: $--color-primary;
        font-size: 70px;
        width: 198px;
      }
      /*account login tab page s*/
      .el-input {
        width: 398px;
        height: 55px;
        margin: 0 32px;
      }
      /deep/ .el-form-item.is-error .el-input__inner, .el-form-item.is-error .el-input__inner:focus, .el-form-item.is-error .el-textarea__inner, .el-form-item.is-error .el-textarea__inner:focus {
        border-color: #f56c6c;
      }
      /deep/ .el-form-item--small.el-form-item {
        margin-bottom: 0px;
      }
      /deep/ .el-input--small .el-input__inner {
        height: 55px;
        line-height: 55px;
      }
      .forget-password {
        text-align: right;
      }
      .login-btn {
        position: absolute;
        bottom: 110px;
        left: 32px;
        margin-top: 30px;
        height: 54px !important;
        width: 398px;
        font-size: 20px !important;
      }
      /deep/ .el-form-item__error {
        margin-left: 32px;
      }
    }
    .bottom-text {
        position: fixed;
        bottom: 30px;
        .name {
          color: $--color-primary;
        }
      }
  }

  .send{
    position: absolute;
    top: 13px;
    right: 40px;

    .send-tag {
      border: none;
      background-color: transparent;
      cursor: pointer;
    }

    .send-counter{
      color: #666;
      font-size: 12px;
    }
  }

  .qrlogin-form {
    display: flex;
    flex-direction: column;
    align-items: center;

    .qrlogin-header {
      font-size: 22px;
    }

    .qrlogin-code {
      width: 214px;
      height: 214px;
    }

    .qrlogin-footer {
      font-size: 14px;
    }
  }

  .forget-password {
    cursor: pointer;
    line-height: 19px;
    font-size: 14px;
    color: #666;
    font-weight: 500;
    margin-top: 18px;
    margin-right: 30px;
  }

  .login-type {
    position: absolute;
    display: flex;
    color: #1890ff;
    font-size: 14px;
    justify-content: space-evenly;
    align-items: center;
    width: 462px;
    bottom: 50px;

    div {
      cursor: pointer;

      i {
        margin-right: 5px;
      }
    }
  }

</style>
