<template>
  <div
    v-if="placement === 'left'"
    class="record-item-left"
  >
    <div class="record-item">
      <i class="iconfont icon-tanyitouxiangx"></i>
      <div class="text-wrap"></div>
      <div class="text">{{text}}</div>
    </div>
    <div class="debug-list" v-if="debugLogList && debugLogList.length">
      <div v-for="(item, index) in debugLogList" :key="index">{{item}}</div>
    </div>
  </div>
  <div
    v-else
    class="record-item record-item-right"
    :class="debugLog ? 'mb50' : 'mb20'"
  >
    <div
      class="text"
      @click="handleListen()"
    >
      <i
        v-if="canListen"
        :class="`icon-voice${playState ? ' icon-voice-play' : ''}`"
      >
      </i>
      <pre class="pre-text" v-if="hasCorrected && rightText.length"><template v-for="(item, index) in rightText"><template v-if="!item.toReplace">{{item.text}}</template><template v-else><el-popover
        :key="'popover' + index"
        placement="top-start"
        width="200"
        trigger="hover">
        <span>{{item.origin + '->' + item.replace}}</span>
        <div class="popover-footer">
          <el-button size="mini" type="text" :icon="'iconfont icon-' + (hasCorrected && liked ? 'zansolid' : 'zan')" @click="handleLike">点赞</el-button>
          <el-button type="text" size="mini" icon="iconfont icon-close" @click="handleIgnore">忽略</el-button>
        </div>
        <span class="red-underline" slot="reference">{{item.replace}}</span>
      </el-popover></template></template></pre>
      <pre class="pre-text" v-else>{{corrected ? correctedText : text}}</pre>
    </div>
    <img :src="userAvatar" slot="reference" />
    <div class="debug" v-if="debugLog" :title="debugLog">{{debugLog}}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  correctCallDetail,
  setFeedbackStatus
} from 'yiwise-components/src/api/callDetail'

export default {
  name: 'CallRecordItem',
  props: {
    userAvatar: {
      type: String
    },
    placement: {
      validator(value) {
        return ['left', 'right'].indexOf(value) !== -1
      }
    },
    text: {
      // 文字信息
      type: String,
      default: ''
    },
    debugLog: {
      // debug信息
      type: String,
      default: ''
    },
    debugLogList: {
      type: Array,
      default() {
        return []
      }
    },
    playState: {
      // 控制是否播放
      type: Boolean,
      default: false
    },
    canListen: {
      // 是否能够听录音
      type: Boolean,
      default: true
    },
    callDetailId: {
      type: [String, Number],
      default: ''
    },
    recoveryStatus: {}, // # 人工纠错状态 NO_RECOVERY 未纠错 RECOVERY 已纠错
    replaceText: {},
    feedbackStatus: {}, // # 反馈状态 NO_FEED_BACK 无反馈  HELPFUL 有效  UN_HELPFUL 无效
    correctionStatus: {} // # 智能纠错状态 NO_CORRECTION 未纠错 CORRECTION 已纠错 NO_ERROR 无错误
  },
  data() {
    return {
      hasCorrected: false,
      corrected: false,
      correctedText: '',
      noError: false,
      liked: false,
      rightText: [],
      correctPara: ''
    }
  },
  computed: {
    ...mapGetters(['appType'])
  },
  methods: {
    handleListen() {
      if (this.playState) {
        this.$emit('stop')
      } else {
        this.$emit('play')
      }
    },
    getComputedText(text, replaceArr) {
      const rs = []
      const _replace = JSON.parse(JSON.stringify(replaceArr))
        .map(item => {
          item.endIndex = item.index + item.replace.length
          return item
        })
        .sort((a, b) => a.index - b.index)
      _replace.forEach((item, index) => {
        if (index === 0) {
          rs.push({
            text: text.substring(0, item.index),
            toReplace: false
          })
        } else if (index !== _replace.length - 1) {
          rs.push({
            text: text.substring(_replace[index - 1].endIndex, item.index),
            toReplace: false
          })
        }
        rs.push({
          text: text.substring(item.index, item.endIndex),
          toReplace: true,
          origin: item.origin,
          replace: item.replace
        })

        if (index === _replace.length - 1) {
          rs.push({
            text: text.substring(item.endIndex, text.length),
            toReplace: false
          })
        }
      })

      return rs
    },
    async toCorrect() {
      let { data } = await correctCallDetail(
        {
          callDetailId: this.callDetailId
        },
        this.appType
      )

      data = data.data
      this.hasCorrected = true
      if (data && data.length) {
        this.noError = false
        this.rightText = this.getComputedText(this.text, data)
      } else {
        this.noError = true
        this.rightText = []
      }
    },
    async handleIgnore() {
      await setFeedbackStatus(
        {
          callDetailId: this.callDetailId,
          feedbackStatus: 'UN_HELPFUL' // 反馈状态 HELPFUL 点赞 UN_HELPFUL 取消
        },
        this.appType
      )
      this.$message.success('忽略成功')
      this.hasCorrected = false
      this.liked = false
    },
    async handleLike() {
      await setFeedbackStatus(
        {
          callDetailId: this.callDetailId,
          feedbackStatus: 'HELPFUL' // 反馈状态 HELPFUL 点赞 UN_HELPFUL 取消
        },
        this.appType
      )

      this.$message.success('点赞成功！')
      this.liked = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';
@import '~src/styles/placeholder.scss';
$--color-underline-danger: #ff0000 !default;

.record-item {
  display: flex;
  > .text {
    display: flex;
    align-items: center;
    white-space: normal;
    word-break: break-all;
    flex-wrap: wrap;
    max-width: 330px;
    padding: 8px 12px 6px;
    border-radius: $--border-radius-base;
    line-height: 20px;
    position: relative;
    margin: 0 6px;
    > .pre-text {
      margin: 0;
      white-space: pre-wrap;
    }
  }
  .icon-voice {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    box-sizing: border-box;
    position: relative;
    left: -8px;
  }
  .icon-voice,
  .icon-voice::after {
    border: 3px solid transparent;
    border-radius: 50%;
    border-right-color: $--border-color-base;
  }

  .icon-voice::before,
  .icon-voice::after {
    content: '';
    display: block;
    position: absolute;
  }

  .icon-voice::before {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: $--border-color-base;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
  }

  .icon-voice::after {
    width: 60%;
    height: 60%;
    top: 0;
    bottom: 0;
    left: 2px;
    right: 0;
    margin: auto;
  }
  .icon-voice-play {
    animation: voice-play1 2s linear 0s infinite;
  }
  .icon-voice-play::after {
    animation: voice-play2 2s linear 0s infinite;
  }
}
.record-item-left {
  margin-bottom: 20px;
  .record-item {
    > i {
      font-size: 38px;
      color: $--color-primary;
    }
    > .text {
      background-color: $--color-white;
      border-top-left-radius: 0;
      border: $--border-base;
      &::before {
        content: '';
        position: absolute;
        left: -9px;
        top: -1px;
        border-right: 4px solid $--border-color-base;
        border-top: 4px solid $--border-color-base;
        border-left: 4px solid transparent;
        border-bottom: 4px solid transparent;
      }
      &::after {
        content: '';
        position: absolute;
        left: -7px;
        top: 0;
        border-right: 4px solid $--color-white;
        border-top: 4px solid $--color-white;
        border-left: 4px solid transparent;
        border-bottom: 4px solid transparent;
      }
    }
  }
  .debug-list {
    display: inline-block;
    margin-left: 40px;
    margin-top: 10px;
    @extend %ellipsis;
    max-width: 500px;
    line-height: 26px;
    background: #e7dcf5;
    color: #8357bb;
    border-radius: $--border-radius-base;
    padding: 0 12px;
  }
}
.mb50 {
  margin-bottom: 50px;
}
.m20 {
  margin-bottom: 20px;
}
.error-correct {
  display: none;
  padding: 8px 12px 6px;
  line-height: 20px;
  .oper {
    display: inline-block;
    position: relative;
    color: $--color-primary;
    cursor: pointer;
    outline: none;
    .el-popover {
      width: 285px;
      position: absolute;
      top: 20px;
      left: -63px;
      transform-origin: center top;
      z-index: 2001;
      .el-textarea {
        /deep/ .el-textarea__inner {
          max-height: 66px;
        }
      }
    }
  }
}
.record-item-right {
  &:hover {
    .error-correct {
      display: inline-block;
    }
  }
  .red-underline {
    display: inline-block;
    position: relative;
    line-height: 20px;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 1px;
      right: 1px;
      height: 2px;
      background: $--color-underline-danger;
    }
  }
}
.popover-footer {
  text-align: right;
  margin-top: 5px;
  .el-button + .el-button {
    margin-left: 0;
  }
  /deep/ i {
    margin-right: 2px;
  }
  /deep/ .icon-close {
    font-size: 13px;
  }
}

.no-error {
  padding: 8px 12px 6px;
  line-height: 20px;
}

.corrected {
  color: $--color-success;
}

.record-item-right {
  justify-content: flex-end;
  position: relative;
  img {
    display: inline-block;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
  }
  > .text {
    border-top-right-radius: 0;
    background-color: $--color-primary;
    color: $--color-white;
    &::after {
      content: '';
      position: absolute;
      right: -8px;
      top: 0;
      border-right: 4px solid transparent;
      border-top: 4px solid $--color-primary;
      border-left: 4px solid $--color-primary;
      border-bottom: 4px solid transparent;
    }
  }
  > .debug {
    @extend %ellipsis;
    max-width: 500px;
    position: absolute;
    right: 40px;
    bottom: -30px;
    height: 26px;
    line-height: 26px;
    background: #e7dcf5;
    color: #8357bb;
    border-radius: $--border-radius-base;
    padding: 0 12px;
  }
}

@keyframes voice-play1 {
  0% {
    border-right-color: transparent;
  }
  26% {
    border-right-color: transparent;
  }
  62% {
    border-right-color: $--border-color-base;
  }
  78% {
    border-right-color: $--border-color-base;
  }
  100% {
    border-right-color: transparent;
  }
}
@keyframes voice-play2 {
  0% {
    border-right-color: transparent;
  }
  26% {
    border-right-color: $--border-color-base;
  }
  62% {
    border-right-color: $--border-color-base;
  }
  78% {
    border-right-color: $--border-color-base;
  }
  100% {
    border-right-color: transparent;
  }
}
</style>

<style lang="scss">
@import '~src/styles/variables.scss';

.record-choose-emotion-wrap {
  padding: 4px 12px !important;
  min-width: auto !important;
  .record-choose-emotion {
    > img {
      display: inline-block;
      width: 36px;
      height: 36px;
      cursor: pointer;
    }
  }
}
</style>
