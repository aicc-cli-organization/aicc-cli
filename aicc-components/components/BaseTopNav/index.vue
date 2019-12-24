<template>
  <header class="base-topnav">
    <a @click="handleJump('主站')">
      <multi-color-icon
        width="160"
        height="20"
        klass="icon-logox1"
      />
    </a>
    <div class="menu-wrapper">
      <SystemMenu
        v-for="(menuItem, menuIndex) in flatMenuList"
        :key="menuIndex"
        :menuTypeName="menuItem.menuTypeName"
        :subMenuList="menuItem.subMenuList"
      />
    </div>
    <div class="base-topnav_right">
      <el-button
        round
        @click="handleJump('客户中心')"
      >客户中心</el-button>
      <el-button
        round
        @click="handleJump('企业')"
      >企业</el-button>
      <span class="line-split"></span>
      <ArtificialStatus />
      <env-check/>
      <TopMessage
        :type="'crm'" :warningUnread="warningUnread" :sysUnread="sysUnread" :showWarnningMessageDot="!!showWarnningMessageDot"
        :showSystemAnnouncementDot="!!showSystemAnnouncementDot"
        @toMessageCenter="toMessageCenter"
        @updateSysUnread="v => sysUnread = v"
        @updateWarningUnread="v => warningUnread = v"
        @HIDE_WARNNING_MESSAGE_DOT="$store.commit('HIDE_WARNNING_MESSAGE_DOT')"
        @HIDE_SYSTEM_ANNOUNCEMENT_DOT="$store.commit('HIDE_SYSTEM_ANNOUNCEMENT_DOT')">
      </TopMessage>
      <UpDownload />
      <!-- <help-center-menu /> -->
      <user-center-menu />
    </div>
  </header>
</template>

<script>
import MultiColorIcon from '../MultiColorIcon'
import SystemMenu from './components/SystemMenu'
import EnvCheck from './components/EnvCheck'
import UserCenterMenu from './components/UserCenterMenu'
import HelpCenterMenu from './components/HelpCenter'
import ArtificialStatus from './components/ArtificialStatus'
import TopMessage from '@aicc/components/TopMessage'
import UpDownload from './components/UpDownload'
import { flatMenuList } from './utils'
import { mapGetters } from 'vuex'
import * as messageQueueAPI from '@aicc/api/messageQueue'
export default {
  data() {
    return {
      flatMenuList,
      warningUnread: false,
      sysUnread: false,
    }
  },

  computed: {
    ...mapGetters([
      'showWarnningMessageDot',
      'showSystemAnnouncementDot'
    ])
  },

  components: {
    MultiColorIcon,
    SystemMenu,
    EnvCheck,
    HelpCenterMenu,
    UserCenterMenu,
    ArtificialStatus,
    TopMessage,
    UpDownload
  },

  methods: {
    handleJump(name) {
      alert(name)
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
  },
  mounted() {
    this.listSystemInfo()
    this.listAll()
  }
}
</script>

<style lang="scss" scoped>
@import '@aicc/styles/mixin.scss';
.base-topnav {
  height: 46px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background:linear-gradient(90deg,rgba(69,83,118,1) 0%,rgba(51,57,84,1) 100%);
  box-shadow: rgba(49, 55, 78, 0.04) 0px 3px 5px 0px;
  /deep/ .iconcont-popover {
    color: #adafba;
  }
  .menu-wrapper {
    flex: 1;
    color: #a4acbb;
  }
  .base-topnav_right {
    display: flex;
    align-items: center;
    > * {
      margin: 0 15px;
    }
  }
  .line-split {
    width:1px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
    background: #55607d;
  }
}
/deep/ .el-button--small.is-round {
  padding: 7px 13px;
  margin: 0 7px;
  color: #a4acbb;
  background: #55607d;
  border:none;
}
</style>
