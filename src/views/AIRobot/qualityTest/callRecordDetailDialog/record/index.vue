<template>
  <div class="record">
    <div class="header">
      <div class="header-left">
        <div>通话ID</div>
        <div class="id">{{Number.isInteger(qcJobRecordId) ? qcJobRecordId : emptyPlaceholder}}</div>
      </div>
      <div class="header-right">
        <yiwise-audio
          :controls="true"
          :src="fullAudioUrl || ''"
          ref="audio"
          :name="'Job_' + robotCallJobId + 'CaR_' + qcJobRecordId"
          @play="handleAudioPlay"
        >
        </yiwise-audio>
        <div class="record-info">
          <div>呼叫时间：{{parseDate(startTime)}}</div>
          <!-- <div>通话轮次：{{chatRound || 0}}</div> -->
        </div>
      </div>
    </div>
    <div class="record-list" v-if="type === 0 || type === 2 || isRealTime">
      <call-record-list
        :class="isRealTime ? 'record-real-time': ''"
        :dataSource="callRecordList"
        :audioUrl="customerAudioUrl"
        :currentPlayingId.sync="currentPlayingId"
        :canListen="!isRealTime"
        :keepScrollIntoView="isRealTime"
        :canSetEmotion="appType === 'ope'"
        :key-value="type === 0 ? 'callDetailId' : 'callInDetailId'"
        @set-emotion="data => $emit('set-emotion', data)"
        keyValue="qcJobRecordDetailId"
      >
      </call-record-list>
    </div>
    <div v-else class="empty-text">暂未开放文本功能，请听录音</div>
  </div>
</template>

<script>
import { YiwiseAudio } from 'yiwise-components'
import CallRecordList from '../callRecordList/index'
import { emptyPlaceholder } from '@/utils/constant'
import { parseDate } from '@/utils/date'
import { mapGetters } from 'vuex'

export default {
  name: 'Record',
  components: {
    YiwiseAudio,
    CallRecordList
  },
  props: {
    qcJobRecordId: [String, Number],
    callRecordId: {
      // 通话记录id
      type: [String, Number],
      default: ''
    },
    fullAudioUrl: {
      // 音频url（包含机器人声音）
      type: String,
      default: ''
    },
    customerAudioUrl: {
      // 音频url（仅包含人声）
      type: String,
      default: ''
    },
    robotCallJobId: {
      type: [String, Number],
      default: ''
    },
    startTime: {
      // 呼叫时间
      type: String,
      default: ''
    },
    chatRound: {
      // 通话轮次
      type: Number,
      default: 0
    },
    callRecordList: {
      // 对话记录列表
      type: Array,
      default() {
        return []
      }
    },
    type: {
      // 通话类型 0 ai外呼 1 人工外呼 2 ai呼入 3 人工呼入
      validator(value) {
        return [0, 1, 2, 3].indexOf(value) !== -1
      },
      default: 0
    },
    isRealTime: {
      // 是否为实时展示通话记录
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['appType'])
  },
  data() {
    return {
      emptyPlaceholder,
      currentPlayingId: undefined,
      parseDate
    }
  },
  methods: {
    stop() {
      // 停止播放
      this.currentPlayingId = undefined
      const audio = this.$refs.audio
      if (audio && !audio.paused) {
        audio.pause()
      }
    },
    handleAudioPlay() {
      this.currentPlayingId = undefined
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.record {
  background: $bodyBg;
  display: flex;
  flex-direction: column;
  > .header {
    display: flex;
    align-items: center;
    padding: 16px 14px 16px 26px;
    border-bottom: $--border-base;
    flex-shrink: 0;
    > .header-left {
      margin-right: 80px;
      > .id {
        font-size: 24px;
        color: $--color-text-primary;
      }
    }
    > .header-right {
      flex-grow: 1;
      > .record-info {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
      }
    }
  }
  > .record-list {
    flex-grow: 1;
    overflow: auto;
    display: flex;
    .record-real-time /deep/ {
      .record-item-left {
        > i {
          color: #bcbcbc;
        }
        > .text {
          background-color: #efefef;
          color: $--color-text-regular;
          &::after {
            border-right: 4px solid #efefef;
            border-top: 4px solid #efefef;
          }
        }
      }
    }
  }
  > .empty-text {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $--color-text-secondary;
    font-size: 26px;
  }
}
</style>
