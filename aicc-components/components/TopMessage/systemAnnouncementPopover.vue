<template>
  <el-popover
    placement="bottom-start"
    class="system-popover"
    width="760"
    trigger="click"
    v-model="showPopover"
    @show="onshow()">
      <message-popover
        @hidePopover="showPopover=false"
        @toMessageCenter="$emit('toMessageCenter')"
        @HIDE_SYSTEM_ANNOUNCEMENT_DOT="$emit('HIDE_SYSTEM_ANNOUNCEMENT_DOT')"
        @HIDE_WARNNING_MESSAGE_DOT="$emit('HIDE_WARNNING_MESSAGE_DOT')"
        ref="systemAnnouncement"
        :type="'systemAnnouncement'"
        :appType="type"></message-popover>
      <div
        class="popover-btn"
        slot="reference"
        @click="requestSystemAnnouncementList()">
        <i class="iconfont icon-xitonggonggaox iconcont-popover"></i>
        <!-- <div class="dot" v-show="showSystemAnnouncementDot"></div> -->
        <div role="tooltip" class="el-tooltip__popper is-blue" x-placement="top"
          :style="{opacity: showTooltip ? 1 : 0, lineHeight: intRead >= 100 ? '12px' : '18px'}" @click.stop="() => {}">
          {{unReadStr}}
        </div>
      </div>
  </el-popover>
</template>
<script>
import messagePopover from './messagePopover'
import { bus } from './messageList/components/messageItem'

export default {
  components: {
    messagePopover
  },
  props: {
    unRead: [Boolean, Number],
    type: {
      // 区分crm和ope应用
      validator(value) {
        return ['crm', 'ope', 'boss'].indexOf(value) !== -1
      },
      default: 'crm'
    },
    showSystemAnnouncementDot: Boolean
  },
  data() {
    return {
      showPopover: false,
      iconHover: false
    }
  },
  computed: {
    unReadStr() {
      const num = parseInt(this.unRead, 10)
      return num >= 100 ? '...' : num || 0
    },
    intRead() {
      return parseInt(this.unRead, 10)
    },
    showTooltip: {
      get() {
        return typeof this.unRead === 'number'
          ? parseInt(this.unRead, 10)
          : this.unRead
      },
      set(newValue) {
        this.$emit('update:unRead', newValue)
      }
    }
  },
  methods: {
    onshow() {
      bus.$emit('refresh')
    },
    requestSystemAnnouncementList() {
      this.showTooltip = false
      this.$refs.systemAnnouncement.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@aicc/styles/variables.scss';

.system-popover {
  cursor: pointer;
  line-height: 1;
  .popover-btn {
    position: relative;
  }
  &:hover {
    .iconfont {
      color: $--color-primary;
    }
  }
}
/deep/ .el-popover {
  position: absolute;
  background: #fff;
  min-width: 150px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 0px;
  z-index: 2000;
  color: #666;
  line-height: 1.4;
  text-align: justify;
  font-size: 14px;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.dot {
  height: 6px;
  width: 6px;
  border-radius: 5px;
  background: red;
  position: absolute;
  top: 20px;
  right: 15px;
}
.icon-yunshangchuan {
  display: block;
  position: relative;
}

.popoverImg {
  position: relative;
  display: block;
  height: 40px;
  width: 40px;
}
.el-tooltip__popper {
  transform-origin: center top 0px;
  top: -14px;
  right: -16px;
  width: 18px;
  height: 18px;
  margin-left: 10px;
  padding: 0;
  line-height: 18px;
  z-index: 1000;
  border-radius: 50%;
  transition: opacity 0.7s cubic-bezier(0.17, 0.67, 0, 1.04);
  text-align: center;
  &[x-placement^='top'] .popper__arrow {
    bottom: -3px;
    border-top-width: 7px;
    border-top-color: $--color-primary;
    &::after {
      border-top-color: $--color-primary;
    }
  }
  &.is-blue {
    background: #ee1730;
    color: $--color-white;
    // box-shadow: 0px 3px 12px 0px rgba(145, 201, 253, 0.71);
  }
  .tip {
    transform: scale(0.92, 0.92);
    transform-origin: left center;
    display: inline-block;
  }
  .popper__arrow {
    left: 50%;
    margin-left: -6px;
  }
}
</style>
