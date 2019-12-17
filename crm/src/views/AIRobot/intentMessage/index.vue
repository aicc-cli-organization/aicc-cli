<template>
  <div id="task-detail" class="yw-container">
    <el-tabs class="shadow-box" v-model="activeName">
      <el-tab-pane class="task-tab-pane" label="短信任务" name="smsTask" v-if="hasAccess('crm_sms_job_view')">
        <sms-task></sms-task>
      </el-tab-pane>
      <el-tab-pane label="短信模板" name="smsTemplate" v-if="hasAccess('crm_SMSTemplate_view')" lazy>
        <message-template></message-template>
      </el-tab-pane>
      <el-tab-pane label="短信签名" name="smsSignature" lazy>
        <message-signature></message-signature>
      </el-tab-pane>
      <el-tab-pane label="发送历史" name="history" v-if="hasAccess('crm_SMSHistory_view')" lazy>
        <message-history></message-history>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import MessageHistory from './messageHistory/index'
import MessageTemplate from './messageTemplate'
import MessageSignature from './messageSignature'
import SmsTask from '@/views/AIRobot/smsTask'

export default {
  name: 'speechCraft',
  components: {
    SmsTask,
    MessageTemplate,
    MessageHistory,
    MessageSignature
  },
  data() {
    return {
      activeName: 'smsTask'
    }
  },
  created() {
    if (!this.hasAccess('crm_SMSHistory_view')) {
      this.activeName = 'smsTemplate'
      if (!this.hasAccess('crm_SMSTemplate_view')) {
        this.activeName = 'smsSignature'
      }
    }
  },
  methods: {
    handleClick() {}
  }
}
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';

  #task-detail {
    height: 100%;
    .shadow-box {
      height: 100%;
      display: flex;
      flex-direction: column;
      /deep/ .el-tabs__content {
        padding: 0 10px;
        flex: 1;
        min-height: 0;
        .el-tab-pane {
          height: 100%;
          overflow-y: auto;
          &.task-tab-pane {
            background-color: #F9F9F9;
          }
        }
      }
    }
  }

  #task-detail .el-tabs__nav {
    left: 20px;
  }
</style>
