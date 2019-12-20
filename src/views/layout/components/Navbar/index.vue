<template>
  <div class="navbar">
    <div  v-if="personalizedData.enableStatus && personalizedData.landingPageStatus === 'START_UP'">
      <div v-if="personalizedData.landingPageSelect === 'COPY_WRITING'" class="icon logo mock ronglian">{{personalizedData.landingPageCopyWriting}}</div>
      <div v-else-if="personalizedData.landingPageSelect === 'IMG'">
        <div v-if="personalizedData.landingPageImg"><img :src="personalizedData.landingPageImg" class="logo"></div>
      </div>
    </div>
    <div class="hhf" v-else-if="isHangHuFaIP">
      <img src="/static/img/hhf.png" />杭州互联网法院
    </div>
    <div class="icon logo mock ronglian" v-else-if="isRongLian || NoLogoNorWx">智能语音机器人</div>
    <img :src="iconUrl" class="icon logo mock" v-else-if="iconUrl" />
    <svg v-else-if="showLogo" class="icon logo" aria-hidden="true">
      <use xlink:href="#icon-tanyilogoyingwenx"></use>
    </svg>
    <div v-else class="icon logo mock"></div>
    <div class="action-bar">
      <batch-call-status v-if="batchJobVisible"></batch-call-status>
      <!-- 人工外呼 -->
      <call-btn v-if="userEnableCsSeat" @openEnv="openEnv" @closeEnv="closeEnv"></call-btn>
      <artificial-status v-if="userEnableCsSeat"></artificial-status>
      <!-- 导入导出列表 -->
      <download-and-upload-popover></download-and-upload-popover>
      <!-- 环境检测 -->
      <env-check ref="env-check" :visible="envShown" @openEnv="openEnv" @closeEnv="closeEnv"></env-check>
      <!-- 预警消息列表、系统公告列表 -->
      <TopMessage
        v-if="!isRongLian"
        :type="'crm'" :warningUnread="warningUnread" :sysUnread="sysUnread" :showWarnningMessageDot="!!showWarnningMessageDot"
        :showSystemAnnouncementDot="!!showSystemAnnouncementDot"
        @toMessageCenter="toMessageCenter"
        @updateSysUnread="v => sysUnread = v"
        @updateWarningUnread="v => warningUnread = v"
        @HIDE_WARNNING_MESSAGE_DOT="$store.commit('HIDE_WARNNING_MESSAGE_DOT')"
        @HIDE_SYSTEM_ANNOUNCEMENT_DOT="$store.commit('HIDE_SYSTEM_ANNOUNCEMENT_DOT')"></TopMessage>
      <!-- 退出登陆 -->
      <el-dropdown
        class="user-info-drapdown"
        trigger="click"
        szie="medium"
        placement="bottom-start"
      >
        <div class="user-info">
          <div v-if="personalizedData.enableStatus && personalizedData.accountHeaderImgStatus === 'START_UP'">
            <img v-if="personalizedData.accountHeaderImg" class="user-avatar" :src="personalizedData.accountHeaderImg">
          </div>
          <img v-else class="user-avatar" :src="wxHeadimgurl || defaultHeaderImg">
          <span class="user-name">{{name}}</span>
        </div>
        <el-dropdown-menu class="user-dropdown" slot="dropdown">
          <el-dropdown-item>
            <span @click="logout" style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { TopMessage } from 'yiwise-components'
import downloadAndUploadPopover from './components/downloadAndUploadPopover'
import CallBtn from './components/CallBtn'
import ArtificialStatus from './components/ArtificialStatus'
import BatchCallStatus from './components/BatchCallStatus'
import EnvCheck from './components/EnvCheck'
import * as messageQueueAPI from '@/api/messageQueue'
import { getCsBatchJobInfo } from '@/api/cs'
import { mapGetters } from 'vuex'

export default {
  name: 'Navbar',
  components: {
    TopMessage,
    downloadAndUploadPopover,
    CallBtn,
    EnvCheck,
    ArtificialStatus,
    BatchCallStatus
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'avatar',
      'wxHeadimgurl',
      'showWarnningMessageDot',
      'showSystemAnnouncementDot',
      'userEnableCsSeat',
      'batchJobVisible',
      'iconUrl',
      'isRongLian',
      'NoLogoNorWx',
      'hasEnvironmentTest',
      'personalizedData'
    ]),
    showLogo() {
      return window.location.href.indexOf('ai.tanyibot.com') === -1
    },
    defaultHeaderImg() {
      return this.isRongLian || this.NoLogoNorWx ? '/static/img/default-header.png' : '/static/img/common_daohanglan_morentouxiang@2x.png'
    },
    isHangHuFaIP() { // 杭互法
      return location.href.includes('netcourt.tanyibot.com')
    }
  },
  data() {
    return {
      envShown: false,
      iconHover: false,
      warningUnread: false,
      sysUnread: false,
      warningShown: false,
      sysShown: false
    }
  },
  methods: {
    openEnv() {
      this.envShown = true
    },
    closeEnv() {
      this.envShown = false
    },
    listSystemInfo() {
      // 系统推送消息的红点
      messageQueueAPI.listSystemInfo({
        pageNum: 1,
        pageSize: 5
      }).then(({ data }) => {
        if (data.data.unreadNum) {
          if (!this.sysShown) {
            this.sysShown = true
            this.sysUnread = data.data.unreadNum
          }
          this.$store.commit('SHOW_SYSTEM_ANNOUNCEMENT_DOT')
        }
        setTimeout(() => {
          this.listSystemInfo()
        }, 60000)
      })
    },
    listAll() {
      // 预警消息的红点
      messageQueueAPI.listAll({
        pageNum: 1,
        pageSize: 5
      }).then(({ data }) => {
        if (data.data.unreadNum) {
          if (!this.warningShown) {
            this.warningShown = true
            this.warningUnread = data.data.unreadNum
          }
          this.$store.commit('SHOW_WARNNING_MESSAGE_DOT')
        }
        setTimeout(() => {
          this.listAll()
        }, 60000)
      })
    },
    toMessageCenter(type) {
      this.$router.push({ name: 'messageCenter',query:{type}})
    },
    logout() {
      this.$store.dispatch('logout').then(() => {
        location.reload() // In order to re-instantiate the vue-router object to avoid bugs
      })
    },
    async getCsBatchJobInfo() {
      const { data } = await getCsBatchJobInfo()
      if (data && data.data) {
        this.$store.commit('SET_BATCH_JOB_STATUS', data.data.jobStatus)
        this.$store.commit('SET_BATCH_JOB_VISIBLE', true)
      }
    }
  },
  mounted() {
    this.listSystemInfo()
    this.listAll()
    this.getCsBatchJobInfo()
  },
  watch: {
    hasEnvironmentTest(hasTest) {
      this.envShown = hasTest
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

.navbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .hhf {
    display: inline-flex;
    align-items: center;
    font-size: 14px;
    font-weight: 700;
    width: 160px;
    img {
      margin-right: 5px;
      width: 50px;
    }
  }
  .logo {
    display: inline-block;
    position: relative;
    width: 90px;
    height: 26px;
    &.mock {
      left: -6px;
      width: 116px;
      height: auto;
    }
    &.ronglian {
      color: #057AE6;
      font-size: 21px;
      font-weight: 600;
      width: 150px;
      font-family: "PingFangSC-Regular", "SF Pro SC","SF Pro Display","SF Pro Icons","PingFang SC","Helvetica Neue","Helvetica","Arial",sans-serif !important;
    }
  }
  > .action-bar {
    display: flex;
    align-items: center;
    .user-info-drapdown {
      margin-left: 46px;
      .user-info {
        display: flex;
        align-items: center;
        height: 40px;
        cursor: pointer;
         .user-avatar {
          display: inline-block;
          width: 26px;
          height: 26px;
          border-radius: $--border-radius-circle;
          margin-right: 10px;
        }
      }
    }
  }
}
.user-dropdown {
  width: 130px;
  margin-top: 0;
  /deep/ .el-dropdown-menu__item {
    padding: 0px;
    text-align: center;
  }
}
</style>

