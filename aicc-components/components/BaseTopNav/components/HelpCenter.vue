<template>
  <el-dropdown
    size="medium"
    @command="handleCommand"
  >
    <span class="el-dropdown-link">
      <i class="el-icon-question"></i>
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="quickStart">快速入门</el-dropdown-item>
      <el-dropdown-item command="questionFeedback">问题反馈</el-dropdown-item>
      <el-dropdown-item command="APIDoc">API文档</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

const QUICK_START_URL = 'http://confluence.yiwise.net/pages/viewpage.action?pageId=5865489'
const API_DOC_URL = 'https://api.tanyibot.com/'

export default {
  computed: {
    ...mapGetters([
      'userName'
    ]),
    commandNextMap: {
      get() {
        return {
          quickStart: () => window.open(QUICK_START_URL),
          questionFeedback: () => {
            this.$router.push('/feedback')
          },
          APIDoc: () => window.open(API_DOC_URL)
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
