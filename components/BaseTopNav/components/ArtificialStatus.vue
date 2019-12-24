<template>
  <el-dropdown
    trigger="click"
    placement="bottom-start"
    @command="handleCommand"
  >
    <div class="artificial-status">
      <span
        class="status-text"
        :class="artificialStatus === 'online' ? 'status-text-online' : 'status-text-offline'"
      >
        <span>人工坐席</span>
        <span class="status">{{artificialStatus === 'online' ? '（在线）' : '（离线）'}}</span>
      </span>
      <i class="el-icon-caret-bottom"></i>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="online">
        <div class="status-item">
          <span class="status-text status-text-online">
            <span>人工坐席</span>
            <span class="status">（在线）</span>
          </span>
          <div class="text-extra">{{extra.online}}</div>
        </div>
      </el-dropdown-item>
      <el-dropdown-item command="offline">
        <div class="status-item">
          <span class="status-text status-text-offline">
            <span>人工坐席</span>
            <span class="status">（离线）</span>
          </span>
          <div class="text-extra">{{extra.offline}}</div>
        </div>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'
import { updateOnlineStatus } from '@aicc/api/user'
import ArtificialJoinWebSocket from '@aicc/mixins/ArtificialJoinWebSocket'

export default {
  name: 'ArtificialStatus',
  mixins: [ArtificialJoinWebSocket],
  computed: {
    ...mapGetters([
      'artificialStatus',
      'fsUserAgent',
      'enableCallIn',
      'userEnableCsSeat',
      'enableCsTransfer'
    ]),
    extra() { // 描述文案
      if (this.enableCallIn && this.enableCsTransfer) {
        return {
          online: '可接听电话和收到人工介入请求',
          offline: '不可接听电话且无法收到人工介入请求'
        }
      } else if (this.enableCallIn) {
        return {
          online: '可接听电话',
          offline: '不可接听电话'
        }
      } else if (this.enableCsTransfer) {
        return {
          online: '可收到人工介入请求',
          offline: '不可收到人工介入请求'
        }
      } else {
        return {}
      }
    }
  },
  data() {
    return {
      pollingTimer: null
    }
  },
  watch: {
    artificialStatus: {
      async handler(newStatus) {
        if (this.userEnableCsSeat && this.enableCallIn) { // 有呼入权限则更新在线状态
          updateOnlineStatus({
            isOnline: newStatus === 'online'
          })
          if (newStatus === 'online') { // 坐席在线
            if (this.fsUserAgent) {
              this.fsUserAgent.ua.start()
            }
            this.pollingArtificialStatus(newStatus)
          } else {
            if (this.fsUserAgent) {
              const { ua } = this.fsUserAgent
              if (ua && ua.isRegistered()) {
                ua.stop()
              }
            }
            this.stopPolling()
          }
        }
        if (this.userEnableCsSeat) { // 有介入权限连接ws
          if (newStatus === 'online') {
            this.connect() // mixin
          } else {
            this.disconnect()
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    handleCommand(command) {
      this.$store.commit('SET_ARTIFICIAL_STATUS', command) // 切换坐席状态
    },
    pollingArtificialStatus(status) { // 在线则轮询状态
      this.pollingTimer = setInterval(() => {
        updateOnlineStatus({
          isOnline: status === 'online'
        })
      }, 60000)
    },
    stopPolling() { // 停止轮询
      clearInterval(this.pollingTimer)
      this.pollingTimer = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
@import 'src/styles/mixin.scss';

.artificial-status {
  margin-left: 16px;
  &::after {
    content: '';
    display: inline-block;
    vertical-align: middle;
    @include lineSplit(16px,#55607d);
    margin-left: 30px;
  }
}

.status-text {
  font-weight: $--font-weight-medium;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: -16px;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: $--border-radius-circle;
  }
}

.status-text-online {
  &::before {
    background-color: $--color-success;
  }
  > .status {
    color: $--color-success;
  }
}

.status-text-offline {
  &::before {
    background-color: #DDD;
    border: 1px solid #BCBCBC;
  }
  > .status {
    color: #dbdbdb;
  }
}

.el-dropdown-menu__item {
  padding: 0 8px;
}

.el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: transparent;
  color: $--color-text-primary;
  .status-item {
    background-color: #f2f2f2;
  }
}

.status-item {
  transition: background-color .3s;
  padding: 18px 30px;
  border-radius: $--border-radius-large;
  > .text-extra {
    font-size: $--font-size-small;
    line-height: 16px;
  }
}
</style>

