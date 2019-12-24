<template>
  <div class="desc">
    <div>
      <span class="name">{{smsTaskDetail.smsJob.name}}</span>
      <task-status :status="smsTaskDetail.smsJob.status"></task-status>
      <task-reason :status="smsTaskDetail.smsJob.status" location="detail" :hangUpReason="smsTaskDetail.smsJob.hangUpReason"></task-reason>
      <task-next-start-time
        v-if="!financeTipText"
        :status="smsTaskDetail.smsJob.status"
        location="detail"
        :nextStartTime="smsTaskDetail.smsJob.nextStartTime">
      </task-next-start-time>
    </div>
    <div class="finiace-tip" v-if="!isMeet">{{financeTipText}}</div>
    <ul class="subtitle-list">
      <li class="subtitle-item">{{smsTaskDetail.createdByUserName}}创建于: {{smsTaskDetail.smsJob.createTime}}</li>
      <li class="subtitle-item">任务最近更新于: {{smsTaskDetail.smsJob.updateTime}}</li>
      <li class="subtitle-item">可发送时段: {{dailyTime}}</li>
    </ul>
    <div class="task-desc">任务描述: {{smsTaskDetail.smsJob.description || '暂无描述'}}</div>
  </div>
</template>

<script>
import TaskStatus from '../components/taskStatusTag'
import TaskNextStartTime from '@/components/task/taskNextStartTime'
import TaskReason from '../components/taskReason'

export default {
  props: {
    smsTaskDetail: {
      type: Object,
      default() {
        return {
          smsJob: {}
        }
      }
    },
    isMeet: { // 是否满足短信发送条件
      type: Boolean,
      default: false
    },
    meetCountObj: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    dailyTime() {
      const { startTime, dailyStartTime = '', dailyEndTime = '' } = this.smsTaskDetail.smsJob
      if (startTime) {
        return `${startTime.replace(/\s00:00:00/, '')}起 ${dailyStartTime}~${dailyEndTime}`
      }
      return `${dailyStartTime}~${dailyEndTime}`
    },
    financeTipVisible() {
      const { type } = this.smsTaskDetail.smsTemplate
      const { status } = this.smsTaskDetail.smsJob
      return type === 'FINANCE' && ['NOT_STARTED', 'SYSTEM_SUSPENDED'].includes(status) && this.$store.state.smsTask.notSendTotal < 300
    },
    financeTipText() {
      if (this.isMeet || !this.smsTaskDetail.smsJob.smsJobId) return ''
      const { yd_send_count = 0, lt_send_count = 0, dx_send_count = 0 } = this.meetCountObj
      return `金融短信未发送数量需达到要求: 移动${yd_send_count}条起, 联通${lt_send_count}条起, 电信${dx_send_count}条起! 当前条件不满足!`
    }
  },
  components: {
    TaskStatus,
    TaskNextStartTime,
    TaskReason
  }
}
</script>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;
  li {
    list-style-type: none;
  }
}
.desc {
  padding: 20px 10px 10px;
  .name {
    color: #4A4A4A;
    font-size: 22px;
    font-weight: 700;
    margin-right: 10px;
  }
  .subtitle-list {
    line-height: 12px;
    overflow: hidden;
    margin-top: 10px;
    .subtitle-item {
      float: left;
      color: #666666;
      border-right: 1px solid #d8d8d8;
      padding: 0 20px;
      &:first-child {
        padding-left: 0;
      }
      &:last-child {
        border-right: 0;
      }
    }
  }
  .task-desc {
    line-height: 12px;
    color: #666666;
    margin-top: 10px;
  }
  .finiace-tip {
    margin-top: 10px;
    color: #F3374C;
  }
}
</style>
