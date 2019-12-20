<style lang="scss" scoped>
@import '~src/styles/variables.scss';

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

    .circleProgress-con {
      width: 20px;
      height: 20px;
    }

    .right-tri {
      width: 14px;
      height: 14px;
      line-height: 14px;
      transform-origin: center;
      transform: translate(-50%, -50%) scale(.43, .43);
      position: absolute;
      top: 50%;
      left: 50%;
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

.circleProgress_wrapper {
  width: 18px;
  height: 18px;
  margin: 50px auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wrapper {
  width: 9px;
  height: 18px;
  position: absolute;
  top:0;
  overflow: hidden;
}
.right {
  right:0;
}
.left {
  left:0;
}
.circleProgress {
  width: 18px;
  height: 18px;
  border:2px solid transparent;
  border-radius: 50%;
  position: absolute;
  top:0;
  -webkit-transform: rotate(45deg) translateZ(0);
}
.rightcircle {
  border-top:2px solid #DFDEDE;
  border-right:2px solid #DFDEDE;
  // background: url('/static/img/circle-r.png');
  // transform-origin: 0 50%;
  right:0;
}
.leftcircle {
  // transform-origin: 100% 50%;
  border-bottom:2px solid #DFDEDE;
  border-left:2px solid #DFDEDE;
  // background: url('/static/img/circle-l.png');
  left:0;
}
.bg {
  border: 2px solid $--color-primary;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background: url('/static/img/circle.png');
}
.bg1 {
  border: 2px solid #DFDEDE;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.demo2 {
  transform-origin: center;
  transform: rotate(-90deg);
}
svg {
  position: absolute;
}
</style>

<template>
  <div class="audio">
    <audio ref="audioTag" :src="src" v-bind="$attrs" crossorigin></audio>
    <div class="controls">
      <!-- <div class="circleProgress_wrapper">
        <div class="bg"></div>
        <div class="wrapper right">
          <div class="circleProgress rightcircle" :style="{'transform': 'rotate(' + rotateRight + 'deg) translateZ(0)'}"></div>
          <img src="/static/img/circle-r.png" class="circleProgress rightcircle" :style="{'transform': 'rotate(' + rotateRight + 'deg)'}">
        </div>
        <div class="wrapper left">
          <div class="circleProgress leftcircle" :style="{'transform': 'rotate(' + rotateLeft + 'deg) translateZ(0)'}"></div>
          <img src="/static/img/circle-l.png" class="circleProgress leftcircle" :style="{'transform': 'rotate(' + rotateLeft + 'deg)'}">
        </div>
        <img src="/static/img/circle.png" class="bg">
        <div class="right-tri iconfont"
          :class="[playClass, !src ? 'disabled' : '']"
          @click="togglePlay"></div>
      </div> -->
      <div class="circleProgress-con relative">
        <svg xmlns="http://www.w3.org/200/svg" height="20" width="20">
          <circle cx="10" cy="10" r="8.5" fill="none" stroke="#DFDEDE" stroke-width="3"/>
          <circle class="demo2" id="J_progress_bar" cx="10" cy="10" r="8.5" fill="none" stroke="#1890ff" stroke-width="3" :stroke-dasharray="strokeDashArr"/>
        </svg>
        <div class="right-tri iconfont"
          :class="[playClass, !src ? 'disabled' : '']"
          @click="togglePlay"></div>
      </div>
      <a v-if="download" class="download iconfont icon-xiazaix" :class="!src ? 'disabled' : ''" @click="handleDownload"></a>
    </div>
  </div>
</template>

<script>
import { downloadAudio, transTime } from './utils'

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
    }
  },
  data() {
    return {
      duration: 0,
      audio: null,
      currentTime: 0,
      isPlay: false,
      playClass: 'icon-bofangx',
      classTimeout: null,
      audioNoFound: true
    }
  },
  computed: {
    strokeDashArr() {
      const len1 = this.duration
        ? Math.min(1, Math.max(0, this.currentTime / this.duration)) * Math.PI * 2 * 9
        : 0
      return len1 + ' 10000'
    },
    rotateRight() {
      const rotate = this.duration
        ? Math.min(1, Math.max(0, this.currentTime / this.duration))
        : 0
      return (rotate > 0.5 ? 225 : 45 + rotate * 360)// - 45
    },
    rotateLeft() {
      const rotate = this.duration
        ? Math.min(1, Math.max(0, this.currentTime / this.duration))
        : 0
      return (rotate <= 0.5 ? 45 : 45 + (rotate - 0.5) * 360)// - 45
    },
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
        this.audio.play().then(() => {
          this.isPlay = true
        }).catch(() => {
          if (this.audioNoFound) {
            this.$message.error('音频文件不存在')
          }
        })
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
      console.log(this.audio.duration)
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

    this.audio.addEventListener('error', () => {
      this.$emit('error')
      this.audioNoFound = true
      console.log(this.audio.error)
    })

    // 监听事件列表
    const events = [
      'abort',
      'canplay',
      'canplaythrough',
      'durationchange',
      'emptied',
      // 'error',
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
