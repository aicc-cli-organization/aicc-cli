<style lang="scss" scoped>
.audio {
  audio {
    display: none;
  }
  .controls {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .iconfont {
      width: 33px;
      height: 33px;
      line-height: 33px;
      font-size: 14px;
      cursor: pointer;
      color: #1890ff;
      text-align: center;
      &.disabled {
        color: #a1a1a1;
      }
    }

    i {
      color: #1d91ff;
      font-size: 23px;
      text-shadow: 0px 0px 70px 0px rgba(0, 37, 162, 0.18);
      cursor: pointer;
    }

    .time {
      font-family: PingFangSC-Regular;
      font-size: 12px;
      font-weight: normal;
      font-stretch: normal;
      line-height: 0;
      letter-spacing: 0px;
      color: #333;
    }

    .played-time {
      margin-left: 4px;
    }

    .right-tri {
      &:hover {
        opacity: 0.6;
      }
    }

    .progress-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 10px;
      margin: 0 15px;
      position: relative;
      cursor: pointer;
      .progress {
        background: #1d91ff;
        height: 4px;
        position: absolute;
        left: 0;
      }
      .dot {
        width: 12px;
        height: 12px;
        background: #1d91ff;
        border-radius: 50%;
        position: absolute;
        top: -1px;
        cursor: pointer;
        &:hover {
          background: #6cb5f9;
        }
        &.disabled {
          background: #a1a1a1;
        }
      }
      .inner-progress-bar {
        height: 4px;
        width: 100%;
        border-radius: 1px;
        background: #d7d7d7;
      }
    }
    .download {
      display: block;
      text-decoration: none;
      &:hover {
        opacity: 0.6;
      }
    }
  }
  .pre-load {
    display: none;
  }
}
</style>

<template>
  <div class="audio">
    <audio ref="audioTag" :src="src" v-bind="$attrs" crossorigin></audio>
    <div class="controls">
      <div class="right-tri iconfont"
        :class="[playClass, !src ? 'disabled' : '']"
        @click="togglePlay"></div>
      <span class="played-time time">{{currentTimeStr}}</span>
      <div class="progress-container" ref="progressContainer" @click="changeProgress">
        <div class="inner-progress-bar"></div>
        <div class="progress" :style="{'width': progressWidth}"></div>
        <div class="dot" :style="{'left': progressWidth}" :class="!src ? 'disabled' : ''"></div>
      </div>
      <!-- '/static/ai_user (24).wav' -->
      <span class="audio-time time">{{durationStr}}</span>
      <!-- <a v-if="download" class="download" :href="src" :download="'downloadName'"></a> -->
      <a v-if="download && !dowaLoadDisable" class="download iconfont icon-xiazaix" :class="!src ? 'disabled' : ''" @click="handleDownload"></a>
      <el-tooltip placement="top" content="当前录音已失效，无法下载" v-else-if="download && dowaLoadDisable">
        <a class="download iconfont icon-xiazaix disabled"></a>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { downloadAudio, transTime } from '@/utils/audio'

export default {
  name: 'YiwiseAudio',

  props: {
    src: {
      type: String,
      default: ''
    },
    download: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      default: ''
    },
    dowaLoadDisable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      duration: 0,
      audio: null,
      currentTime: 0,
      isPlay: false,
      playClass: 'icon-bofangx',
      classTimeout: null
    }
  },
  computed: {
    progressWidth() {
      return this.duration
        ? Math.min(100, Math.max(0, (this.currentTime / this.duration) * 100)) +
            '%'
        : '0%'
    },
    currentTimeStr() {
      return transTime(this.currentTime)
    },
    durationStr() {
      return transTime(this.duration)
    },
    paused() {
      return !this.isPlay
    }
  },
  watch: {
    src(v) {
      this.currentTime = 0
      if (this.$attrs.autoplay) this.play()
      else this.pause()

      if (!v) {
        this.duration = 0
        this.pause()
      }
    },
    isPlay(v) {
      this.clearClassTimeout()

      if (v) {
        this.playClass = 'icon-zantingx'

        if (this.duration === 0 || this.duration === Infinity) {
          this.classTimeout = setTimeout(() => {
            this.pause()
          }, 200)
        }
      } else {
        this.playClass = 'icon-bofangx'
      }
      // isPlay && duration !== 0 && duration !== Infinity ? 'icon-zantingx' : 'icon-bofangx'
    }
  },
  methods: {
    clearClassTimeout() {
      if (this.classTimeout) {
        clearTimeout(this.classTimeout)
      }
    },
    togglePlay() {
      if (!this.src) return

      if (this.audio.paused) {
        this.audio.play()
        this.isPlay = true
      } else {
        this.audio.pause()
        this.isPlay = false
      }
    },
    // 更新进度条
    updateProgress() {
      this.currentTime = this.audio.currentTime
    },
    // 播放完成
    audioEnded() {
      this.audio.currentTime = 0
      this.audio.pause()
      this.isPlay = false
    },
    // 点击进度条跳到指定点播放
    changeProgress(e) {
      if (!this.src) return

      const rate = e.offsetX / this.$refs.progressContainer.offsetWidth
      this.audio.currentTime = this.audio.duration * rate
      this.updateProgress()
    },
    play() {
      this.audio.play()
      this.isPlay = true
    },
    pause() {
      this.audio.pause()
      this.isPlay = false
    },
    handleDownload() {
      // 下载录音
      if (!this.src) return
      downloadAudio(this.src, this.name)
    }
  },
  mounted() {
    this.audio = this.$refs.audioTag

    // 监听音频播放时间并更新进度条
    this.audio.addEventListener(
      'timeupdate',
      () => {
        this.updateProgress()
        this.$emit('timeupdate')
      },
      false
    )
    // 监听播放完成事件
    this.audio.addEventListener(
      'ended',
      () => {
        this.$emit('ended')
        this.audioEnded()
      },
      false
    )
    // 获取音频的时长，单位为秒
    this.audio.addEventListener('loadedmetadata', () => {
      this.$emit('loadedmetadata')
      this.duration = this.audio.duration
    })

    this.audio.addEventListener('pause', () => {
      this.$emit('pause')
      this.isPlay = false
    })

    this.audio.addEventListener('play', () => {
      this.$emit('play')
      this.isPlay = true
    })

    // 监听事件列表
    const events = [
      'abort',
      'canplay',
      'canplaythrough',
      'durationchange',
      'emptied',
      'error',
      'loadeddata',
      'loadstart',
      'mozaudioavailable',
      'playing',
      'progress',
      'ratechange',
      'seeked',
      'seeking',
      'stalled',
      'suspend',
      'volumechange',
      'waiting'
    ]
    events.forEach(eventName => {
      this.audio.addEventListener(eventName, () => this.$emit(eventName))
    })

    if (this.$attrs.autoplay) this.isPlay = true
  }
}
</script>
