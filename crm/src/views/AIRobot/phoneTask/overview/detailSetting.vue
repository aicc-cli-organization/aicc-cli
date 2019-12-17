<template>
  <span>
    <div class="detail-list">
      <span class="detail-span" v-if="humanExist">
        <span v-if="robotCallJobDetail.csStaffGroupName">
          人工介入坐席组: 
          <span>{{robotCallJobDetail.csStaffGroupName}},</span>
          <span :class="{'empty-group': robotCallJobDetail.onlineCount <= 0}">{{robotCallJobDetail.onlineCount > 0 ? '当前在线坐席' + robotCallJobDetail.onlineCount + '个' : '当前无在线坐席!'}}</span>
        </span>
        <span v-if="robotCallJobDetail.transferPhoneNumberList && robotCallJobDetail.transferPhoneNumberList.length">
          转人工号码: {{humanTransferText}}
        </span>
      </span>
      <span class="detail-span" v-if="wechatAlertText || (robotCallJobDetail.robotCallJob.alertUserNames && robotCallJobDetail.robotCallJob.alertUserNames.length) && !isLocal">
        <i class="iconfont icon-weixin"></i>
        <span v-if="wechatAlertText">微信推送等级:{{wechatAlertText}}</span>
        <span v-if="wechatAlertText && (robotCallJobDetail.robotCallJob.alertUserNames && robotCallJobDetail.robotCallJob.alertUserNames.length)">,</span>
        <span v-if="robotCallJobDetail.robotCallJob.alertUserNames && robotCallJobDetail.robotCallJob.alertUserNames.length">
          微信推送人:
          <span
            v-for="(item, index) in robotCallJobDetail.robotCallJob.alertUserNames"
            :key="index">
            {{item}}
          </span>
          <span v-if="wechatSendMethodName">({{wechatSendMethodName}})</span>
        </span>
      </span>
      <span class="detail-span" v-if="smsAlert && !isLocal"><i class="iconfont icon-duanxin"></i>短信推送:{{smsAlert}} ({{robotCallJobDetail.smsTemplateName}})</span>
      <span class="detail-span" v-if="robotCallJobDetail.robotCallJob.earlyWarningAlertUserNames">
        <i class="iconfont icon-Pathx"></i>预警消息推送人:
        <span
          v-for="(item, index) in robotCallJobDetail.robotCallJob.earlyWarningAlertUserNames"
          :key="index">{{item}}</span>
      </span>
      <span class="detail-span" v-if="redialInfo">
        <i class="iconfont icon-zantingbofang"></i>自动重拨设置:{{redialInfo}}
      </span>
    </div>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import { WECHAT_ALERT_MAP, REDIAL_CONDITION_MAP } from '../utils/enum'

export default {
  props: {
    robotCallJobDetail: {
      type: Object,
      default() {
        return {}
      }
    },
    fullStatsInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'isLocal'
    ]),
    wechatAlertText() {
      const { wechatAlertLevelCode = [], wechatConditionAlertLevelCode = [], wechatAlertChatDurationThreshold } = this.robotCallJobDetail.robotCallJob
      const { intentLevelTagDetailList } = this.fullStatsInfo
      let wechatAlertLevel = []
      let wechatConditionAlertLevel = []
      if (intentLevelTagDetailList && intentLevelTagDetailList.length) {
        wechatAlertLevel = intentLevelTagDetailList.filter(item => wechatAlertLevelCode.includes(item.code) && !wechatConditionAlertLevelCode.includes(item.code)).map(item => item.name)
        wechatConditionAlertLevel = intentLevelTagDetailList.filter(item => wechatConditionAlertLevelCode.includes(item.code)).map(item => item.name)
      }
      const wechatConditionAlertLevelStrArr = wechatConditionAlertLevel.length ? [wechatConditionAlertLevel.join('、')] : []
      const alerLevel = wechatAlertLevel.concat(wechatConditionAlertLevelStrArr)
      if (alerLevel.length === 0) {
        return ''
      }
      const prefix = alerLevel.join('/')
      if (wechatConditionAlertLevel.length === 0) {
        return prefix
      }
      return `${prefix}且>${wechatAlertChatDurationThreshold}s`
    },
    wechatSendMethodName() {
      const { wechatSendMethod } = this.robotCallJobDetail.robotCallJob
      return WECHAT_ALERT_MAP[wechatSendMethod]
    },
    smsAlert() {
      const { robotCallJob: { smsAlertLevelCode = [] }, intentLevelTag } = this.robotCallJobDetail
      if (intentLevelTag && intentLevelTag.details) {
        const smsAlertLevelName = intentLevelTag.details.filter(item => smsAlertLevelCode.includes(item.code)).map(item => item.name)
        return smsAlertLevelName.join('/')
      }
      return ''
    },
    redialInfo() {
      const { robotCallJob: { redialCondition = [], redialTimes }, redialIntervalHour } = this.robotCallJobDetail
      if (redialCondition.length === 0) {
        return ''
      }
      const redialNameArr = redialCondition.map(item => REDIAL_CONDITION_MAP[item])
      return `${redialNameArr.join('/')} 间隔: ${redialIntervalHour}h 次数: ${redialTimes}次`
    },
    humanTransferText() {
      const { transferPhoneNumberList } = this.robotCallJobDetail
      return `${transferPhoneNumberList.map(item => item.name ? item.name + '-' + item.phoneNumber : item.phoneNumber).join(',')}`
    },
    humanExist() {
      const { csStaffGroupName, transferPhoneNumberList } = this.robotCallJobDetail
      return (transferPhoneNumberList && transferPhoneNumberList.length) || csStaffGroupName
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-list {
  white-space: normal;
  .detail-span {
    display: inline-block;
    background-color: #f2f2f2;
    padding: 4px 7px;
    color: #333333;
    border-radius: 2px;
    margin-right: 10px;
    margin-bottom: 10px;
    i {
      margin-right: 8px;
      font-size: 14px;
      color: #777777;
    }
    .empty-group {
      color: #f56c6c;
    }
  }
}
</style>
