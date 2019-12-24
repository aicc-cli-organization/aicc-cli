<template>
  <div class="details">
    <span class="detail-span" v-if="humanExist">
      <i class="iconfont icon-zuoxiguanlix"></i>
      <span v-if="robotCallJobDetail.csStaffGroupName">
        人工介入坐席组: 
        <span>{{robotCallJobDetail.csStaffGroupName}}</span>
        <span :class="{'empty-group': robotCallJobDetail.onlineCount <= 0}">{{humanIntervertionStr}}</span>
      </span>
      <span v-if="robotCallJobDetail.transferPhoneNumberList && robotCallJobDetail.transferPhoneNumberList.length">
        转人工号码: {{humanTransferText}}
        <template v-if="robotCallJobDetail.transferTenantPhoneNumber">; 呼叫人工号码: {{robotCallJobDetail.transferTenantPhoneNumber.phoneNumber}}</template>
      </span>
    </span>
    <!-- <span class="detail-span" v-if="wechatAlertStr || (robotCallJobDetail.robotCallJob.alertUserNames && robotCallJobDetail.robotCallJob.alertUserNames.length) && !isLocal">
      <i class="iconfont icon-weixin"></i>
      <span v-if="wechatAlertStr">微信推送等级:{{wechatAlertStr}}</span>
      <span v-if="wechatAlertStr && (robotCallJobDetail.robotCallJob.alertUserNames && robotCallJobDetail.robotCallJob.alertUserNames.length)">,</span>
      <span v-if="robotCallJobDetail.robotCallJob.alertUserNames && robotCallJobDetail.robotCallJob.alertUserNames.length">
        微信推送人:
        <span
          v-for="(item, index) in robotCallJobDetail.robotCallJob.alertUserNames"
          :key="index">
          {{item}}
        </span>
        <span>({{wechatSendMethodName}})</span>
      </span>
    </span> -->
    <span class="detail-span" v-if="wechatAlertStr">
      <i class="iconfont icon-weixin"></i>微信推送:{{wechatAlertStr}}
    </span>
    <span class="detail-span" v-if="smsAlertStr && !isLocal"><i class="iconfont icon-duanxin"></i>短信推送:{{smsAlertStr}} ({{robotCallJobDetail.smsTemplateName}})</span>
    <span class="detail-span" v-if="robotCallJobDetail.robotCallJob.earlyWarningAlertUserNames">
      <i class="iconfont icon-Pathx"></i>预警消息推送人:
      <span
        style="margin-right:5px"
        v-for="(item, index) in robotCallJobDetail.robotCallJob.earlyWarningAlertUserNames"
        :key="index">{{item}}</span>
    </span>
    <span class="detail-span hujiaolangjie" v-if="robotCallJobDetail.tenantCallInterceptName">
      <i class="iconfont icon-hujiaolanjiexx hujiaolangjie_img"></i>拦截规则：{{robotCallJobDetail.tenantCallInterceptName}}
    </span>
    <span class="detail-span" v-if="redialInfoStr">
      <i class="iconfont icon-zantingbofang"></i>自动重拨设置:{{redialInfoStr}}
    </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { wechatAlertTypeENUM } from '@/utils/constant'
import { redialConditionEnum } from '../config/enum'

const wechatAlertSendMap = wechatAlertTypeENUM.reduce((prev, curr) => {
  prev[curr.key] = curr.value
  return prev
}, {})

export default {
  data() {
    return {
      
    }
  },
  computed: {
    ...mapGetters([
      'isLocal', 'customerStr'
    ]),
    robotCallJobDetail() {
      return this.$store.state.taskV2.taskDetail
    },
    fullStatsInfo() {
      return this.$store.state.taskV2.fullTaskInfo
    },
    humanTransferText() {
      const { transferPhoneNumberList } = this.robotCallJobDetail
      return `${transferPhoneNumberList.map(item => item.name ? item.name + '-' + item.phoneNumber : item.phoneNumber).join(',')}`
    },
    humanExist() {
      const { csStaffGroupName, transferPhoneNumberList } = this.robotCallJobDetail
      return (transferPhoneNumberList && transferPhoneNumberList.length) || csStaffGroupName
    },
    humanIntervertionStr() {
      const { onlineCount, staffGroupType } = this.robotCallJobDetail
      return onlineCount > 0
        ? ',当前在线坐席' + onlineCount + '个'
        : (['TEL', 'THIRD_PARTY'].includes(staffGroupType)
          ? ''
          : ',当前无在线坐席!')
    },
    wechatAlertStr() { // "${推送人}(${推送方式})--${意向等级}类"
      const { wechatPushConditionList, userNameMapList } = this.robotCallJobDetail.robotCallJob
      const { intentLevelTagDetailList } = this.fullStatsInfo
      const userNameMap = userNameMapList
        ? userNameMapList.reduce((prev, curr) => {
          return { ...prev, ...curr }
        }, {})
        : {}

      return wechatPushConditionList.map(item => {
        const intentLevelNames = intentLevelTagDetailList.filter(levelItem => item.intentLevelCodes.includes(levelItem.code))
          .map(item => item.name)
          .join('/')
        const userNames = item.userIds.map(userId => userNameMap[userId])
        return `${userNames.join('、')}(${wechatAlertSendMap[item.wechatSendMethod]})--${intentLevelNames}类`
      }).join(';')
    },
    // wechatAlertStr() {
    //   const {
    //     wechatAlertLevelCode = [],
    //     wechatConditionAlertLevelCode = [],
    //     wechatAlertChatDurationThreshold
    //   } = this.robotCallJobDetail.robotCallJob
    //   const { intentLevelTagDetailList } = this.fullStatsInfo
    //   let wechatAlertLevelNames = []
    //   let wechatConditionAlertLevelNames = []
    //   if (intentLevelTagDetailList && intentLevelTagDetailList.length) {
    //     wechatAlertLevelNames = intentLevelTagDetailList
    //       .filter(item => wechatAlertLevelCode.includes(item.code))
    //       .map(item => item.name)
    //     wechatConditionAlertLevelNames = intentLevelTagDetailList
    //       .filter(item => wechatConditionAlertLevelCode.includes(item.code))
    //       .map(item => item.name)
    //   }
    //   const wechatConditionAlertLevelStrArr = wechatConditionAlertLevelNames.length ? [wechatConditionAlertLevelNames.join('、')] : []
    //   const alertLevelNames = [...wechatAlertLevelNames, ...wechatConditionAlertLevelStrArr]
    //   if (alertLevelNames.length === 0) {
    //     return ''
    //   }
    //   return wechatConditionAlertLevelNames.length
    //     ? `${alertLevelNames.join('/')}且>${wechatAlertChatDurationThreshold}s`
    //     : alertLevelNames.join('/')
    // },
    // wechatSendMethodName() {
    //   const { wechatSendMethod, transferCustomer } = this.robotCallJobDetail.robotCallJob
    //   const wechatSendText = wechatAlertSendMap[wechatSendMethod]
    //   const transferText = wechatSendMethod === 'SENDTOONE' ? `，分配${this.customerStr}给推送人` : ''
    //   return transferCustomer ? `${wechatSendText}${transferText}` : wechatSendText
    // },
    smsAlertStr() {
      const { robotCallJob: { smsAlertLevelCode = [] }, intentLevelTag } = this.robotCallJobDetail
      if (intentLevelTag && intentLevelTag.details) {
        const smsAlertLevelNames = intentLevelTag.details
          .filter(item => smsAlertLevelCode.includes(item.code))
          .map(item => item.name)
        return smsAlertLevelNames.join('/')
      }
      return ''
    },
    redialInfoStr() {
      const { robotCallJob: { redialCondition = [], redialTimes, redialInterval, connectRedialCondition = []}, redialIntervalHour, intentLevelTag = {} } = this.robotCallJobDetail
      const tagList = intentLevelTag.details
      let redialNameStr = ''
      let conditionStr = ''
      if (redialCondition.length !== 0 || connectRedialCondition.length !== 0) { //未接通的数据
        const redialNameArr = redialCondition.map(item => redialConditionEnum[item])
        redialNameStr = `${redialNameArr.join('/')} 间隔: ${redialIntervalHour}h 次数: ${redialTimes}次`
      }   

      if(connectRedialCondition.length !== 0) {
        const conditionArr = connectRedialCondition.map(item => {
          let name = ''
          tagList.map( i => {
            if(i.code === item) {
              name = i.name
            }
          })
          return name
        })
        conditionStr = `${conditionArr.join('/')}`
      }
      
      if(conditionStr || redialNameStr) {
        return `${conditionStr}  ${redialNameStr}`
      }else {
        return ``
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.details {
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
    .hujiaolangjie_img {
      width: 14px;
      opacity: 0.7;
      margin-right: 8px;
    }
  }
  .detail-span.hujiaolangjie {
    color: #E03B2F;
    background: #FDE7EA;
    .iconfont {
      color: #E03B2F;
    }
  }
}
</style>
