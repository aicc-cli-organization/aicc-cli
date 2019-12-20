<template>
  <div>
    <drag-dialog
      :visible.sync="innerVisible"
      :showCloseIcon="false"
      width="294px"
      class="batch-call-dialog"
    >
      <div slot="title" class="title">
        <div class="main">{{customerStr}}接通提示</div>
        <div class="extra">{{currentTime}}</div>
      </div>
      <div slot="body" class="body">
        <div class="content">
          <div class="content-item">
            <span class="label">{{customerStr}}姓名：</span>
            <span>{{name}}</span>
          </div>
          <div class="content-item">
            <span class="label">联系电话：</span>
            <span>{{phoneNumber}}</span>
          </div>
          <div class="content-item">
            <span class="label">等待时长：</span>
            <span>{{duration}}秒</span>
          </div>
        </div>
        <div class="btn-group">
          <el-button
            type="danger"
            size="medium"
            round
            plain
            @click="handleHangupClick"
          >
            拒绝
          </el-button>
          <el-button
            type="success"
            size="medium"
            round
            @click="handleAcceptClick"
          >
            接入电话
          </el-button>
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
import { getCsBatchJobInfo, csNotify } from '@/api/cs'
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
  name: 'InComingDialog',
  components: {
    DragDialog
  },
  props: {
    phoneNumber: String,
    name: String
  },
  computed: {
    ...mapGetters(['fsUserAgent', 'fsStatus', 'callType', 'artiCustomerData', 'customerStr'])
  },
  data() {
    return {
      innerVisible: false,
      currentTime: undefined,
      duration: 0,
      timer: null
    }
  },
  watch: {
    async fsStatus(newStatus) {
      const { callin } = this.$refs
      if (newStatus === 1 && this.callType === 'batch') {
        if (callin) {
          callin.currentTime = 0
          callin.play()
        }

        csNotify({
          csJobRecordId: this.artiCustomerData.csJobRecordId
        })

        const { answerMode } = await this.getCsBatchJobInfo()
        // 如果是自动接听，则不弹框, 直接接听
        if (answerMode === 'AUTO') {
          this.handleAcceptClick()
        } else {
          this.innerVisible = true
        }
      } else {
        if (callin) {
          callin.pause()
        }
        this.innerVisible = false
      }
    },
    innerVisible(newVisible) {
      if (newVisible) {
        this.currentTime = moment().format('HH:mm:ss')
        this.countDuration()
      } else {
        clearInterval(this.timer)
        this.timer = null
        this.duration = 0
      }
    }
  },
  methods: {
    async getCsBatchJobInfo() {
      const { data } = await getCsBatchJobInfo()
      if (data && data.data) {
        return data.data
      } else {
        return {}
      }
    },
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
    },
    countDuration() { // 计算通话时长
      this.timer = setInterval(() => {
        this.duration++
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

.batch-call-dialog {
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
  .body {
    > .content {
      padding: 40px 0 14px 70px;
      > .content-item {
        margin-bottom: 14px;
        > .label {
          color: $--color-text-regular;
        }
      }
    }
    > .btn-group {
      padding: 18px 26px;
      border-top: 1px solid #F2F2F2;
      .el-button {
        width: 110px;
      }
    }
  }
}
.audio {
  opacity: 0;
  position: fixed;
  z-index: -1;
}
</style>

