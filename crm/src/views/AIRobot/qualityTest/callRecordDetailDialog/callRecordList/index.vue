<template>
  <div class="record-item-wrap">
    <div
      v-for="(data, index) in dataSource"
      :key="index"
    >
      <call-record-item
        :id="`record_${index}`"
        :callDetailId="data.callDetailId"
        :recoveryStatus="data.recoveryStatus"
        :correctionStatus="data.correctionStatus"
        :feedbackStatus="data.feedbackStatus"
        :replaceText="data.replaceText"
        :placement="data.type === 'CUSTOMER_SERVICE' ? 'left' : 'right'"
        :text="data.text"
        :debugLogList="data.debugLogList"
        :debugLog="data.debugLog"
        :userAvatar="userAvatar || '/static/img/user_avatar@2x.png'"
        :playState="innerCurrentPlayingId === data[keyValue]"
        :canListen="canListen"
        :canSetEmotion="canSetEmotion"
        @play="handlePlay(data)"
        @stop="handlePause"
        @set-emotion="emotion => handleSetEmotion(emotion, data, index)"
      >
      </call-record-item>
    </div>
    <audio
      class="audio"
      ref="audio"
      :controls="true"
      :src="audioUrl"
    >
    </audio>
  </div>
</template>

<script>
import CallRecordItem from './item'

export default {
  name: 'CallRecordList',
  components: {
    CallRecordItem
  },
  props: {
    canSetEmotion: {
      // 是否支持设置情绪
      type: Boolean,
      default: false
    },
    canListen: {
      // 是否能够听录音
      type: Boolean,
      default: true
    },
    dataSource: {
      // 数据源，array类型
      type: Array,
      default() {
        return []
      }
    },
    userAvatar: {
      type: String
    },
    audioUrl: String, // 有audioUrl即可听每段录音
    keepScrollIntoView: {
      // 是否保持实时滚动，用于实时通话
      type: Boolean,
      default: false
    },
    currentPlayingId: [Number, undefined], // 当前正在播放的通话记录详情id
    keyValue: {
      // 每条通话记录的唯一标识
      type: String,
      default: 'callDetailId'
    }
  },
  computed: {
    innerCurrentPlayingId: {
      get() {
        return this.currentPlayingId
      },
      set(newValue) {
        this.$emit('update:currentPlayingId', newValue)
      }
    }
  },
  data() {
    return {
      timeout: null
    }
  },
  watch: {
    dataSource(newValue) {
      // 实时拨打实时滚动
      if (this.keepScrollIntoView) {
        this.$nextTick(() => {
          const lastIndex = newValue.length - 1
          const dom = document.getElementById(`record_${lastIndex}`)
          if (dom) {
            dom.scrollIntoView()
          }
        })
      }
    },
    currentPlayingId(newValue) {
      if (!newValue) {
        const dom = this.$refs.audio
        if (dom && !dom.paused) {
          dom.pause()
        }
      }
    }
  },
  methods: {
    handlePlay(data) {
      // 播放
      const dom = this.$refs.audio
      if (dom) {
        if (!dom.paused) {
          dom.pause()
        }
        if (this.timeout) {
          clearTimeout(this.timeout)
        }
        this.$emit('play')
        this.innerCurrentPlayingId = data[this.keyValue]
        dom.currentTime = data.startOffset ? data.startOffset / 1000 : 0
        dom.play()
        this.timeout = setTimeout(() => {
          this.innerCurrentPlayingId = undefined
          dom.pause()
        }, data.endOffset - data.startOffset)
      }
    },
    handlePause() {
      // 暂停
      this.innerCurrentPlayingId = undefined
    },
    async handleSetEmotion(emotion, data, index) {
      this.$emit('set-emotion', {
        emotion,
        data,
        index
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

.record-item-wrap {
  padding: 20px 20px 0;
  overflow: auto;
  flex: 1;
  .audio {
    position: absolute;
    visibility: hidden;
    opacity: 0;
    top: 0;
  }
  .system-msg {
    margin-bottom: 20px;
  }
}
</style>
