<template>
  <div class="app-wrapper" :class="classObj">
    <div class="edit-psw-tip" v-if="showResetPswTip">
      <div class="center">
        <span>为了保障您的数据安全，请尽快修改密码哦~</span>
        <el-button @click="handleSetPsw">点击修改</el-button>
      </div>
      <div class="right">
        <div class="pointer" @click="noToTip">
          <i class="iconfont no-to-tip" :class="noTipChecked ? 'icon-danxuan-xuanzhongx' : 'icon-danxuan-weixuanx'"></i>
          不再提醒
        </div>
        <div class="close">
          <i class="iconfont icon-close pointer" @click="closeTip"></i>
        </div>
      </div>
    </div>
    <el-container class="main-container">
      <el-header class="header">
        <navbar></navbar>
      </el-header>
      <el-container class="inner-main-container">
        <el-aside width="165px" class="aside">
          <sidebar></sidebar>
        </el-aside>
        <el-main class="main">
          <app-main></app-main>
          <customer-robot v-if="!isLocal && !isRongLian && !NoLogoNorWx"></customer-robot>
        </el-main>
      </el-container>
    </el-container>
    <changePsw :visible.sync="changePasswordVisible"></changePsw>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import customerRobot from '@/components/customerRobot'
import changePsw from '@/components/changePsw'
import ResizeMixin from './mixin/ResizeHandler'
import { mapGetters, mapActions } from 'vuex'
import { checkUserIsDefaultPassword } from '@/api/personalInfo'

export default {
  name: 'layout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    changePsw,
    customerRobot
  },
  data() {
    return {
      noTipChecked: false,
      changePasswordVisible: false
    }
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapGetters([
      'userId',
      'isLocal',
      'isRongLian',
      'NoLogoNorWx',
      'showResetPswTip'
    ]),
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  methods: {
    ...mapActions(['set_resetPsw']),
    handleClickOutside() {
      this.$store.dispatch('closeSideBar', { withoutAnimation: false })
    },
    noToTip() {
      this.noTipChecked = !this.noTipChecked
      const noTipUsers = localStorage.noTipUs ? JSON.parse(localStorage.noTipUs) : []

      if (this.noTipChecked) {
        !noTipUsers.includes(this.userId) && noTipUsers.push(this.userId)
      } else {
        const index = noTipUsers.indexOf(this.userId)
        noTipUsers.splice(index, 1)
      }
      localStorage.noTipUs = JSON.stringify(noTipUsers)
    },
    closeTip() {
      this.set_resetPsw(false)
    },
    handleSetPsw() {
      this.changePasswordVisible = true
    }
  },
  async mounted() {
    const noTipUsers = localStorage.noTipUs ? JSON.parse(localStorage.noTipUs) : []
    const { data } = await checkUserIsDefaultPassword()
    if (data.data && !noTipUsers.includes(this.userId)) {
      this.set_resetPsw(true)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "~src/styles/variables.scss";
  @import "~src/styles/mixin.scss";
  @import '~src/styles/variables.scss';

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    .edit-psw-tip {
      position: absolute;
      top: 56px;
      width: 100%;
      height: 40px;
      line-height: 40px;
      background: #F0A332;
      color: #fff;
      z-index: 1001;
      .center {
        text-align: center;
        font-size: 14px;
        > span {
          opacity: .8;
        }
        .el-button {
          padding: 0px 15px !important;
          height: 26px !important;
          line-height: 24px !important;
          background: #F0A332;
          border-color: #fff;
          color: #fff;
          margin-left: 40px;
          // font-weight: 100;
          border-radius: 4px;
        }
      }
      .right {
        position: absolute;
        right: 0;
        top: 0;
        display: flex;
        align-items: center;
        .icon-close {
          font-size: 13px;
        }
        .no-to-tip {
          font-size: 15px;
          font-weight: 100;
          position: relative;
          top: 1px;
        }
        .close {
          display: inline-block;
          width: 54px;
          height: 16px;
          line-height: 16px;
          margin-left: 20px;
          text-align: center;
          border-left: 1px solid rgba(255, 255, 255, .5);
        }
      }
    }
    .main-container {
      height: 100%;
      > .header {
        height: 56px!important;
        padding: 0 40px 0 30px!important;
        box-shadow: 0px 2px 9px 0px rgba(219,219,219,0.5);
        background: $--color-white;
      }
      .aside {
        padding-top: 3px;
        box-shadow: 2px 5px 10px 1px rgba(35, 41, 64, 0.05);
      }
      .inner-main-container {
        min-height: 0; // 修复chrome73.0.3683.86版本浏览器兼容性问题
      }
      .main {
        padding: 0!important;
      }
    }
  }
</style>
