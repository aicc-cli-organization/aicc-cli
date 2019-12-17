<template>
  <div class="call-btn-wrap">
    <artificial-call-popover  @openEnv="openEnv">
      <div slot="reference">
        <!-- batchJobVisible:已经有人工外呼了，此popover不能被点出来,因为不能重复创建外呼任务 -->
        <el-button
          v-if="!fsStatus || fsStatus === 0 || fsStatus === 4"
          type="primary"
          class="call-btn"
          :disabled="batchJobVisible"
        >
          <div class="btn-text">
            <i class="iconfont icon-bohaox"></i>
            人工外呼
          </div>
        </el-button>
      </div>
    </artificial-call-popover>
    <div v-if="fsStatus === 1">
      <el-button
        type="success"
        class="call-btn"
        :disabled="true"
      >
        <div class="btn-text">
          <i class="iconfont icon-bohaox"></i>
          {{callType === 'out' ? '正在外呼...' : '等待接听...'}}
        </div>
      </el-button>
      <el-button
        type="danger"
        class="call-btn"
        @click="handleHangup"
      >
        <div class="btn-text">
          <i class="iconfont icon-bohaox"></i>
          挂断
        </div>
      </el-button>
    </div>
    <div v-else-if="fsStatus === 2 && callType === 'out'">
      <el-button
        type="success"
        class="call-btn"
        :disabled="true"
      >
        <div class="btn-text">
          <i class="iconfont icon-bohaox"></i>
          等待接听...
        </div>
      </el-button>
      <el-button
        type="danger"
        class="call-btn"
        @click="handleHangup"
      >
        <div class="btn-text">
          <i class="iconfont icon-bohaox"></i>
          挂断
        </div>
      </el-button>
    </div>
    <div v-else-if="fsStatus === 3">
      <span class="customer-info">
        <i class="iconfont icon-kehutubiaox1"></i>
        <span>{{`${artiCustomerData.name || '未知'}（${artiCustomerData.phoneNumber}）`}}</span>
      </span>
      <el-button
        type="success"
        class="call-btn call-btn-success"
        @click="handleToggleModal"
      >
        <div class="btn-text">
          <i class="iconfont icon-bohaox"></i>
          {{callType === 'join' && artiJoinModalType === 'listen' ? '监听中' : '通话中'}}（<span class="time">{{formatTime}}</span>）...
        </div>
      </el-button>
      <el-button
        v-if="callType !== 'join' || artiJoinModalType !== 'listen'"
        type="danger"
        class="call-btn"
        @click="handleHangup"
      >
        <div class="btn-text">
          <i class="iconfont icon-bohaox"></i>
          挂断
        </div>
      </el-button>
    </div>
  </div>
</template>

<script>
import { transTimeForCount } from '@/utils/date'
import { mapGetters } from 'vuex'
import ArtificialCallPopover from '@/components/ArtificialCallPopover'

export default {
  name: 'CallBtn',
  components: {
    ArtificialCallPopover
  },
  computed: {
    ...mapGetters([
      'fsUserAgent',
      'fsStatus',
      'artiCustomerData',
      'artiModalVisible',
      'callType',
      'artiJoinModalVisible',
      'artiJoinModalType',
      'batchJobVisible'
    ]),
    formatTime() {
      return transTimeForCount(this.duration)
    }
  },
  data() {
    return {
      duration: 0, // 通话时长
      timer: null,
      popoverVisible: false
    }
  },
  watch: {
    fsStatus(newStatus, oldStatus) {
      if (newStatus === 3) { // 通话中开始计时
        this.startCount()
      }
      if (oldStatus === 3) { // 挂断
        this.stopCount()
      }
    },
    artiJoinModalType(newType) {
      if (newType === 'call') { // 监听-切入重新计时
        this.stopCount()
        this.startCount()
      }
    }
  },
  methods: {
    openEnv(){
      this.$emit('openEnv')
      console.log('close')
      this.handlePopoverHide()   
    },
    startCount() { // 开始计时
      this.timer = setInterval(() => {
        this.duration++
      }, 1000)
    },
    stopCount() { // 终止计时
      clearInterval(this.timer)
      this.duration = 0
    },
    handleHangup() { // 挂断
      this.$store.commit('SET_HANGUP_BY', 2) // 客服挂断更新状态
      this.fsUserAgent.hangup()
    },
    handleToggleModal() { // 显示/隐藏modal
      if (this.callType === 'join') {
        this.$store.commit('SET_ARTI_JOIN_MODAL_VISIBLE', !this.artiJoinModalVisible)
      } else {
        this.$store.commit('SET_ARTI_MODAL_VISIBLE', !this.artiModalVisible)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/mixin.scss';

  .call-btn-wrap {
    display: flex;
    align-items: center;
    &::after {
      content: '';
      display: inline-block;
      @include lineSplit(18px);
      margin: 0 34px;
    }
    .customer-info {
      display: inline-block;
      > i {
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
      }
    }
    .call-btn {
      .btn-text {
        display: flex;
        align-items: center;
        > .iconfont {
          margin-right: 10px;
        }
        .time {
          width: 33px;
        }
      }
    }
  }
</style>
