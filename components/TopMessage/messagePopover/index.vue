<template>
  <div class="download-and-upload">
    <div class="title-container">
      <span class="title ml15">{{title}}</span>
      <el-button type="text" class="right mr15 mt10" @click="toMessageCenter()"><span class="f14">查看全部</span></el-button>
    </div>
    <div class="outer-container">
      <message-list
        ref="messageList"
        :type="type"
        :appType="appType"
        :inPopover="true"
        @HIDE_SYSTEM_ANNOUNCEMENT_DOT="$emit('HIDE_SYSTEM_ANNOUNCEMENT_DOT')"
        @HIDE_WARNNING_MESSAGE_DOT="$emit('HIDE_WARNNING_MESSAGE_DOT')"
      ></message-list>
    </div>
  </div>
</template>

<script>
import messageList from '../messageList'

export default {
  components: {
    messageList
  },
  props: {
    type: {
      type: String,
      default: 'systemAnnouncement'
    },
    appType: {
      // 区分crm和ope应用
      validator(value) {
        return ['crm', 'ope', 'boss'].indexOf(value) !== -1
      },
      default: 'crm'
    }
  },
  data() {
    return {}
  },
  methods: {
    loadData() {
      this.$refs.messageList.loadData()
    },
    toMessageCenter() {
      this.$emit('hidePopover')
      this.$emit('toMessageCenter')
    }
  },
  computed: {
    title() {
      if (this.type === 'warnningMessage') {
        return '预警消息'
      } else {
        return '系统公告'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-card__body {
  padding: 0;
}
.download-and-upload {
  background: #fff;
  bottom: 0;
  right: 0;
  .title-container {
    width: 760px;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    color: #333;
    font-weight: 700;
    justify-content: space-between;
    margin: -12px -12px 12px -12px;
    .title {
      width: 100px;
    }
  }
  .outer-container {
    /deep/ #system-announcement {
      margin: 0 -10px !important;
    }
  }
}
</style>
