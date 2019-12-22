<template>
  <div class="record-card">
    <el-tooltip
      v-if="!!recordJobData.csTransferAccept"
      placement="top"
      content="人工介入"
    >
      <i class="iconfont icon-rengongjierux"></i>
    </el-tooltip>
    <div class="title">{{titleStr}}</div>
    <div class="record-info" v-if="!isArtificialOut && !isAIOrPersonReception">
      <div class="label">意向等级：</div>
      <div class="content">{{intentLevelStr}}</div>
    </div>
    <div class="record-info" v-if="!!recordJobData.csTransferAccept">
      <div class="label">切入坐席：</div>
      <div class="content">
        {{recordJobData.csStaffName}}（{{recordJobData.csStaffGroupName}}）
      </div>
    </div>
    <div class="record-info" v-if="isAIOrPersonReception">
      <div class="label">接待人：</div>
      <div class="content">{{receptPerson}}</div>
    </div>
    <div class="record-info" v-if="recordJobData.type === 2 && recordJobData.resultStatus === 'ANSWERED'">
      <div class="label">话术：</div>
      <div class="content">{{recordJobData.dialogFlowName || emptyPlaceholder}}</div>
    </div>
    <div class="record-info">
      <div class="label">{{isAIOrPersonReception ? '呼入' : '呼出'}}时间：</div>
      <div class="content">{{recordJobData.startTime ? parseDate(recordJobData.startTime) : emptyPlaceholder}}</div>
    </div>
    <div class="record-info emotion-info" v-if="EMOTION_DESC_ENUM[recordJobData.emotion]">
      <div class="label">通话情绪：</div>
      <mood-info class="mode-info" :mood="recordJobData.emotion"></mood-info>
      <div class="content">{{EMOTION_DESC_ENUM[recordJobData.emotion]}}</div>
    </div>
  </div>
</template>

<script>
  import { emptyPlaceholder } from '@/utils/constant'
  import { EMOTION_DESC_ENUM } from '@/utils/enum'
  import { MoodInfo } from 'yiwise-components'
  import moment from 'moment'
  import { mapGetters } from 'vuex'

  export default {
    name: 'CardItem',
    components: {
      MoodInfo
    },
    props: {
      /*
       * recordJobData.type 0 代表AI， 1代表人工外呼，2 Ai呼入接待, 3 人工呼入接待
       */
      recordJobData: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    computed: {
      ...mapGetters(['customerStr']),
      isAIOut() { // 是否为AI外呼
        return this.recordJobData.type === 0
      },
      isArtificialOut() { // 是否为人工外呼
        return this.recordJobData.type === 1
      },
      isAIOrPersonReception() { // 是否为ai接待或人工接待
        return [2, 3].includes(this.recordJobData.type)
      },
      titleStr() {
        return this.isArtificialOut ? '人工外呼'
          : this.isAIOrPersonReception ? `${this.customerStr}呼入`
            : (this.recordJobData.robotCallJobName || emptyPlaceholder)
      },
      receptPerson() {
        const { type, callInCsName, resultStatus } = this.recordJobData
        return resultStatus === 'NO_ANSWER' ? '--(未接听)'
          : type === 2 ? 'AI'
            : type === 3 ? callInCsName : '--'
      },
      intentLevelStr() {
        const { intentLevelTagName, realIntentLevelName } = this.recordJobData
        return (
          (intentLevelTagName || '') +
          (intentLevelTagName && realIntentLevelName ? '-' : '') +
          (realIntentLevelName || '')
        ) || this.emptyPlaceholder
      },
      title() {
        if (this.isArtificialOut) {
          return '人工外呼'
        } else if (this.isAIOut) {
          return this.recordJobData.robotCallJobName || emptyPlaceholder
        } else {
          return `${this.customerStr}呼入`
        }
      }
    },
    data() {
      return {
        emptyPlaceholder,
        EMOTION_DESC_ENUM
      }
    },
    methods: {
      parseDate(date) {
        return moment(date).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/placeholder.scss';

  .record-card {
    position: relative;
    > .title {
      font-size: $--font-size-base;
      margin-bottom: 14px;
    }
    > .record-info {
      display: flex;
      margin-top: 10px;
      > .label {
        width: 60px;
        flex-shrink: 0;
        color: $--color-text-regular;
      }
      > .content {
        @extend %ellipsis;
      }
      &.emotion-info {
        height: 14px;
        align-items: center;
        .mode-info {
          margin-left: -10px;
        }
      }
    }
    > .icon-rengongjierux {
      position: absolute;
      right: 0;
      top: -2px;
      font-size: $--font-size-base;
    }
  }
</style>

