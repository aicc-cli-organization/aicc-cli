<template>
  <el-dropdown
    size="medium"
    @command="handleCommand"
  >
    <span class="el-dropdown-link">
      <span></span>
      <img src="https://www.cpnic.com/UploadFiles/img_3_2686129075_1665769608_26.jpg">
      <span></span>
      <!-- <span>{{userName}}</span> -->
    </span>
    <el-dropdown-menu slot="dropdown" class="menu">
      <el-dropdown-item><div>坐席状态：</div></el-dropdown-item>
      <el-dropdown-item command="userCenter">个人账号信息</el-dropdown-item>
      <el-dropdown-item>联系客户经理</el-dropdown-item>
      <el-dropdown-item command="backDomain">切换旧版</el-dropdown-item>
      <el-dropdown-item command="helpCenter">帮助中心</el-dropdown-item>
      <el-dropdown-item command="logout"><div class="tc">退出账号</div></el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

const genOldUrl = () => {
  if (location.pathname.includes('yiwise.com')) {
    return 'https://crm.yiwise.com'
  }

  return 'https://crm.tanyibot.com'
}
const HELP_CENTER_URL = 'http://confluence.yiwise.net/pages/viewpage.action?pageId=5865489'

export default {
  computed: {
    ...mapGetters([
      'userName'
    ]),
    commandNextMap: {
      get() {
        return {
          userCenter: () => this.$router.push('/userCenter'),
          backDomain: () => {
            location.href = genOldUrl()
          },
          helpCenter: () => window.open(HELP_CENTER_URL, '_target'),
          logout: async() => {
            await this.logout()
            location.reload()
          }
        }
      }
    }
  },

  methods: {
    ...mapActions([
      'logout'
    ]),
    handleCommand(command) {
      const commandNext = this.commandNextMap[command]
      if (!commandNext || typeof commandNext !== 'function') {
        return
      }

      commandNext()
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@aicc/styles/variables.scss';
.el-dropdown-link {
  position: relative;
 > img {
  display: inline-block;
  vertical-align: middle;
  width:30px;
  height:30px;
  border-radius: 50%;
  border: 2px solid  $--color-primary;
  cursor: pointer;
 }
 > span {
  position: absolute;
  right: -6px;
  top: -4px;
  width:12px;
  height:12px;
  border-radius: 50%;
  background:rgba(179,185,207,1);
  border:2px solid rgba(51,57,84,1);
 }
}
.menu {
  width: 160px;
  padding:0;
  background: #1F284D;
  border-radius: 0;
  transform: translate(18px,-4px);
  /deep/ .el-dropdown-menu__item {
    color: #fff;
  }
  /deep/ .popper__arrow {
    left: -9999px !important;
  }
  /deep/ .el-dropdown-menu__item { 
    line-height: 42px;
    padding-left: 20px;
    color: #a6abbc;
    &:hover {
      background: #1F284D;
    }
    &:first-child {
      border-bottom: 1px solid #55607d;
    }
     &:nth-last-child(2) {
      border-top: 1px solid #55607d;
    }
  }
}
</style>
