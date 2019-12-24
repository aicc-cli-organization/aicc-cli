<template>
  <div>
    <drag-dialog
      :visible.sync="innerVisible"
      :showCloseIcon="false"
      width="360px"
      class="incoming-dialog"
    >
      <div slot="title" class="title">
        <div class="main">{{customerStr}}来电</div>
        <div class="extra">本机号码：{{calledPhoneNumber}}</div>
      </div>
      <div slot="body" class="content">
        <div class="phone-number">{{phoneNumber}}</div>
        <div v-if="area">{{area}}</div>
        <div class="ripple">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="name">{{name || '未知'}}</div>
        </div>
        <el-button
          class="accept-btn"
          type="success"
          round
          @click="handleAcceptClick"
        >
          <i class="iconfont icon-dianhuax"></i>
        </el-button>
        <div
          class="refuse-text"
          @click="handleHangupClick"
        >
          拒绝接听
        </div>
      </div>
    </drag-dialog>
    <audio
      controls
      src="/static/audio/incoming.mp3"
      ref="callin"
      class="audio"
      loop
    >
    </audio>
  </div>
</template>

<script>
import DragDialog from '@/components/DragDialog'
import { mapGetters } from 'vuex'

export default {
  name: 'InComingDialog',
  components: {
    DragDialog
  },
  props: {
    calledPhoneNumber: String,
    phoneNumber: String,
    name: String,
    province: String,
    city: String
  },
  computed: {
    ...mapGetters(['fsUserAgent', 'fsStatus', 'callType', 'customerStr']),
    area() {
      return (this.province || '') + (this.city || '')
    }
  },
  data() {
    return {
      innerVisible: false
    }
  },
  watch: {
    fsStatus(newStatus) {
      const { callin } = this.$refs
      if (newStatus === 1 && this.callType === 'in') {
        if (callin) {
          callin.currentTime = 0
          callin.play()
        }
        this.innerVisible = true
      } else {
        if (callin) {
          callin.pause()
        }
        this.innerVisible = false
      }
    }
  },
  methods: {
    handleAcceptClick() { // 接听
      if (this.fsUserAgent) {
        this.fsUserAgent.answer()
        this.innerVisible = false
        this.$store.commit('SET_ARTI_MODAL_VISIBLE', true)
      }
    },
    handleHangupClick() { // 拒接
      if (this.fsUserAgent) {
        this.fsUserAgent.reject()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.incoming-dialog {
  .title {
    padding: 2px 6px;
    > .main {
      font-size: 20px;
      margin-bottom: 8px;
    }
    > .extra {
      font-size: $--font-size-small;
      font-weight: $--font-weight-primary;
    }
  }
  .content {
    text-align: center;
    padding: 40px 0 30px;
    > .phone-number {
      font-size: 34px;
      line-height: 50px;
    }
    > .ripple {
      position: relative;
      width: 242px;
      height: 242px;
      margin: 10px auto;
      > .circle {
        width: 100%;
        height: 100%;
        position: absolute;
        border: 4px solid #EEF7FF;
        border-radius: $--border-radius-circle;
        opacity: 0;
        &:first-child {
          animation: circle-opacity 4s infinite;
        }
        &:nth-child(2) {
          animation: circle-opacity 4s infinite;
          animation-delay: .6s
        }
        &:nth-child(3) {
          animation: circle-opacity 4s infinite;
          animation-delay: .9s
        }
      }
      > .name {
        position: absolute;
        width: 140px;
        height: 140px;
        line-height: 140px;
        border-radius: $--border-radius-circle;
        margin: 0 auto;
        background-color: #EEF7FF;
        font-size: 20px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
    > .accept-btn {
      width: 160px!important;
      height: 58px!important;
      line-height: 58px!important;
      border-radius: 32px;
      i {
        font-size: 32px;
      }
    }
    > .refuse-text {
      color: $--color-danger;
      margin-top: 20px;
      cursor: pointer;
    }
  }
}
.audio {
  opacity: 0;
  position: fixed;
  z-index: -1;
}
@keyframes circle-opacity{
  from {
    opacity: 1;
    transform: scale(0);
  }
  to {
    opacity: 0;
    transform: scale(1);
  }
}
</style>

