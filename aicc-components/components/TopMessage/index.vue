<template>
  <div class="top-message">
    <!-- 预警消息列表 -->
    <warnning-message-popover
      class="warning"
      :unRead.sync="_warningUnread"
      :sysUnread="_sysUnread"
      :showWarnningMessageDot="showWarnningMessageDot"
      :type="type"
      v-if="auth_warnMsg_view"
      :style="auth_sysMsg_view ? '' : 'margin-right: 0'"
      @toMessageCenter="$emit('toMessageCenter','wm')"
      @HIDE_WARNNING_MESSAGE_DOT="$emit('HIDE_WARNNING_MESSAGE_DOT')"
      @HIDE_SYSTEM_ANNOUNCEMENT_DOT="$emit('HIDE_SYSTEM_ANNOUNCEMENT_DOT')">
    </warnning-message-popover>

    <!-- 系统公告列表 -->
    <system-announcement-popover
      :unRead.sync="_sysUnread" :showWarnningMessageDot="showWarnningMessageDot" :type="type"
      v-if="auth_sysMsg_view"
      @toMessageCenter="$emit('toMessageCenter','sa')"
      @HIDE_WARNNING_MESSAGE_DOT="$emit('HIDE_WARNNING_MESSAGE_DOT')"
      @HIDE_SYSTEM_ANNOUNCEMENT_DOT="$emit('HIDE_SYSTEM_ANNOUNCEMENT_DOT')">
    </system-announcement-popover>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import warnningMessagePopover from './warnningMessagePopover'
import systemAnnouncementPopover from './systemAnnouncementPopover'
export default {
  name: 'YiwiseTag',
  components: {
    warnningMessagePopover,
    systemAnnouncementPopover
  },
  props: {
    warningUnread: {
      type: [Boolean, Number],
      default: false
    },
    sysUnread: {
      type: [Boolean, Number],
      default: false
    },
    showWarnningMessageDot: {
      type: Boolean,
      default: false
    },
    showSystemAnnouncementDot: {
      type: Boolean,
      default: false
    },
    type: {
      // 区分crm和ope应用
      validator(value) {
        return ['crm', 'ope', 'boss'].indexOf(value) !== -1
      },
      default: 'crm'
    }
  },
  computed: {
    ...mapGetters(['auth_warnMsg_view', 'auth_sysMsg_view']),
    _sysUnread: {
      get() {
        return this.sysUnread
      },
      set(newValue) {
        this.$emit('updateSysUnread', newValue)
      }
    },
    _warningUnread: {
      get() {
        return this.warningUnread
      },
      set(newValue) {
        this.$emit('updateWarningUnread', newValue)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.top-message {
  height: 100%;
  display: flex;
  align-items: center;
  > .warning {
    margin-right: 30px;
  }
}
.el-tag-ghost.el-tag--info {
  background: $--color-white;
  border: 1px solid #ddd;
  color: $--color-text-primary;
}
.el-tag-ghost.el-tag--primary {
  background: $--color-white;
  border: 1px solid $--color-primary;
}
.el-tag-ghost.el-tag--success {
  background: $--color-white;
  border: 1px solid $--color-success;
}
.el-tag-ghost.el-tag--warning {
  background: $--color-white;
  border: 1px solid $--color-warning;
}
.el-tag-ghost.el-tag--danger {
  background: $--color-white;
  border: 1px solid $--color-danger;
}
</style>
