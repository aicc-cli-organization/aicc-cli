<template>
  <div>
    <yiwise-modal
      width="auto"
      class="contact-history-modal"
      :hasHeader="false"
      :hasMask="false"
      :visible.sync="innerVisible"
      @close="handleDialogClose"
    >
      <div class="contact-history">
        <div class="history-wrap" :style="historyStyle">
          <contact-history-card-list
            class="list"
            :recordList="recordList"
            :callRecordId="callRecordId"
            @select="handleCardSelect"
          >
          </contact-history-card-list>
          <call-record-detail-record
            class="record"
            :callRecordId="callRecordId"
            :fullAudioUrl="callRecordInfo.fullAudioUrl"
            :customerAudioUrl="callRecordInfo.customerAudioUrl"
            :robotCallJobId="robotCallJobId"
            :startTime="callRecordInfo.startTime"
            :chatRound="callRecordInfo.chatRound"
            :callRecordList="calcCallRecordList"
            :type="callRecordInfo.robotType"
            :isRealTime="isRealTime"
            :needVisitRS="false"
            :correctHisList="correctHisList"
            :correctIntentList="correctIntentList"
            @correctDial="getCorrectHisData(customerPersonId)"
          >
          </call-record-detail-record>
        </div>
        <div class="customer-wrap">
          <div class="header">
            <div class="action-group">
              <div @click="handleToggleHistory">
                <i class="iconfont icon-lianxilishix"></i>
                {{historyVisible ? '收起联系历史' : '展开联系历史'}}
              </div>
              <div @click="handleToggleKnowledge">
                <i class="iconfont icon-tanyizhishikux"></i>
                探意知识库
              </div>
            </div>
            <i class="el-icon-close" @click="handleModalClose"></i>
          </div>
          <call-record-detail-customer
            type="multiple"
            appType="crm"
            class="customer"
            :callRecordId="callRecordInfo.callRecordId"
            :defaultData="defaultData"
            :customerInfo="customerInfo"
            :followList="followList"
            :visible="visible"
            :canEditCustomer="true"
            @addFollow="loadFollowList(customerPersonId)"
            @refreshFollowList="loadFollowList(customerPersonId)"
            @preview-detail="handlePreviewDetail"
            @edit-customer="handleEditCustomer"
          >
          </call-record-detail-customer>
        </div>
      </div>
    </yiwise-modal>
    <customer-dialog :visible.sync="customerVisible" type="edit" :defaultData="customerData" @success="handleEditSuccess"></customer-dialog>
  </div>
</template>

<script>
  import { YiwiseModal } from 'yiwise-components'
  import ContactHistoryCardList from '@/components/ContactHistoryCardList'
  import CustomerDialog from '@/components/CustomerDialog'
  import { CallRecordDetailRecord, CallRecordDetailCustomer } from 'yiwise-components'
  import { fetchContactHistoryList, fetchCallRecordDetail, fetchCallInRecordDetail } from '@/api/callRecord'
  import { getCustomerDetail, getStatInfo, getFollowedByUserList, getIntentRecoveryList, getVoiceRecoveryList } from '@/api/customer'
  import ArtificialCallWebSocket from '@/mixins/ArtificialCallWebSocket'
  import { mapGetters } from 'vuex'
  const isUndefind = v => typeof v === 'undefined' || v === null

  export default {
    name: 'ArtiContactHistoryModal',
    mixins: [ArtificialCallWebSocket],
    components: {
      YiwiseModal,
      CallRecordDetailRecord,
      CallRecordDetailCustomer,
      ContactHistoryCardList,
      CustomerDialog
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      customerPersonId: [Number, String],
      defaultData: {}
    },
    computed: {
      ...mapGetters([
        'historyVisible',
        'newCallRecordId',
        'fsStatus',
        'useAiAssistant',
        'artiInfo',
        'dialInfo',
        'assistantDialogFlowId',
        'knowledgeModalVisible'
      ]),
      innerVisible: {
        get() {
          return this.visible
        },
        set(newValue) {
          this.$emit('update:visible', newValue)
        }
      },
      historyStyle() {
        return this.historyVisible ? {
          width: '908px'
        } : {
          width: 0
        }
      },
      isRealTime() {
        return this.callRecordId === parseInt(this.newCallRecordId, 10) && this.isCalling && this.useAiAssistant// 如果在外呼过程中开启ai助理且选中当前的通话记录，则为实时状态
      },
      calcCallRecordList() {
        return this.isRealTime ? this.dialogDataList : this.callRecordList
      }
    },
    data() {
      return {
        recordList: [], // 该客户所有的通话记录
        callRecordId: 0, // 当前选中的通话记录
        callRecordInfo: {},
        callRecordList: [],
        customerInfo: {},
        followList: [],
        robotCallJobId: '',
        currentPlayingId: undefined, // 当前正在播放的通话记录详情id
        isCalling: false, // 是否正在外呼
        customerVisible: false, // 是否显示编辑用户dialog
        correctHisList: [],
        correctIntentList: [],
        customerData: {} // 用户信息
      }
    },
    watch: {
      newCallRecordId() { // 生成新的通话记录加载数据
        this.loadHistoryList(this.customerPersonId)
      },
      customerPersonId(id) { // 客户信息改变时加载客户数据
        this.loadCustomerDetail(id)
        this.loadStatInfo(id)
        this.loadFollowList(id)
        this.getCorrectHisData(id)
      },
      fsStatus(newStatus) {
        if (newStatus === 3) { // 接通之后建立ws连接
          this.isCalling = true
          if (this.useAiAssistant) { // 开启ai助理需开启ws
            const { phoneNumber } = this.defaultData
            const { dialCode, sipHeaders, useSipHeader, prefixMobile } = this.dialInfo
            const { sipAccount, sipPassword, freeswitchHost, freeswitchPort } = this.artiInfo
            let stringifySipHeaders
            try {
              stringifySipHeaders = JSON.stringify(sipHeaders)
            } catch (error) {
              console.log('json error: ', error)
            }
            this.connect({
              dialogFlowId: this.assistantDialogFlowId,
              csRecordId: this.newCallRecordId,
              customerPersonId: this.customerPersonId,
              // customerPersonPhoneNumber: '10030', // 软电话写死
              customerPersonPhoneNumber: phoneNumber,
              // dialCode: 'CALL10030', // 软电话写死
              dialCode,
              // callerSipAccount: 1016, // 软电话写死
              callerSipAccount: sipAccount,
              // callerSipPwd: 'yiwise', // 软电话写死
              callerSipPwd: sipPassword,
              useSipHeader,
              prefixMobile,
              sipHeaders: stringifySipHeaders,
              fsIp: freeswitchHost,
              fsPort: freeswitchPort
            })
          }
        }
        if (newStatus === 4) { // 会话结束
          this.isCalling = false
          this.disconnect()
        }
      }
    },
    methods: {
      handleDialogClose() {
        this.currentPlayingId = undefined
      },
      async loadHistoryList(customerPersonId) { // 加载历史所有通话记录
        if (!customerPersonId) {
          return
        }
        const { data } = await fetchContactHistoryList({
          customerPersonId
        })
        this.recordList = data.data || []
        const { callRecordId, type } = this.recordList[0] || {} // 默认第一条
        this.callRecordId = callRecordId
        if (type === 2 || type === 3) {
          this.loadInComingCallDetail(callRecordId)
        } else {
          this.loadCallDetail(callRecordId, type)
        }
      },
      async loadCallDetail(callRecordId, type) { // 加载通话详情
        if (!callRecordId) {
          return
        }
        const { data } = (await fetchCallRecordDetail({
          callRecordId,
          type
        }))
        if (data && data.data) {
          const { callRecordId, startTime, chatRound, fullAudioUrl, customerAudioUrl, callDetailList, robotCallJobId, robotType } = data.data
          this.robotCallJobId = robotCallJobId
          this.callRecordInfo = {
            callRecordId,
            startTime,
            chatRound,
            fullAudioUrl,
            customerAudioUrl,
            robotType
          }
          this.callRecordList = callDetailList || []
        }
      },
      async loadInComingCallDetail(callInRecordId) { // 加载呼入通话详情
        if (!callInRecordId) {
          return
        }
        const { data } = await fetchCallInRecordDetail({
          callInRecordId
        })
        if (data && data.data) {
          const { callInRecordId, startTime, chatRound, fullAudioUrl, customerAudioUrl, callInDetailList, seatType } = data.data
          this.robotCallJobId = ''
          this.callRecordInfo = {
            callRecordId: callInRecordId,
            startTime,
            chatRound,
            fullAudioUrl,
            customerAudioUrl,
            robotType: seatType === 'AI' ? 2 : 3
          }
          this.callRecordList = callInDetailList || []
        }
      },
      async loadCustomerDetail(customerPersonId) { // 加载客户详情
        if (customerPersonId) {
          try {
            const { data } = await getCustomerDetail({
              customerPersonId
            })
            if (data.data) {
              const { customerPerson = {}, customerGroup = {}} = data.data
              this.customerInfo = {
                ...this.customerInfo,
                ...customerPerson,
                customerGroup
              }
              this.$store.commit('SET_ARTI_CUSTOMER_DATA', this.customerInfo)
              this.customerInfo.intentLevelTagId = isUndefind(this.customerInfo.intentLevelTagId) ? this.customerInfo.lastIntentLevelTagId : this.customerInfo.intentLevelTagId
            }
          } catch (error) {
            return
          }
        }
      },
      async loadStatInfo(customerPersonId) { // 加载统计信息
        if (customerPersonId) {
          try {
            const { data } = await getStatInfo({
              customerPersonId
            })
            if (data.data) {
              this.customerInfo = {
                ...this.customerInfo,
                customerConcernSum: data.data.customerConcernMap,
                intentLevelSum: data.data.intentLevelMap
              }
              this.customerInfo.intentLevelTagId = isUndefind(this.customerInfo.intentLevelTagId) ? this.customerInfo.lastIntentLevelTagId : this.customerInfo.intentLevelTagId
            }
          } catch (error) {
            return
          }
        }
      },
      // 获取纠错记录
      async getCorrectHisData(customerPersonId) {
        if ([null, undefined, ''].includes(this.callRecordId)) return

        const { data } = await getVoiceRecoveryList({
          callRecordId: this.callRecordId
        }, this.appType)

        this.correctHisList = data.data || []

        const res = await getIntentRecoveryList({
          callRecordId: this.callRecordId
        }, this.appType)
        this.correctIntentList = res.data.data || []
      },
      async loadFollowList(customerPersonId) { // 加载跟进列表
        if (customerPersonId) {
          try {
            const { data } = await getFollowedByUserList({
              customerPersonId,
              excludeFollowType: 'VOICE_CORRECTION'
            })
            if (data.data) {
              this.followList = data.data
            }
          } catch (error) {
            return
          }
        }
      },
      handleCardSelect(data) {
        this.currentPlayingId = undefined // 切换卡片暂停录音
        const { callRecordId, type } = data
        this.callRecordId = callRecordId
        if (type === 2 || type === 3) {
          this.loadInComingCallDetail(callRecordId)
        } else {
          this.loadCallDetail(callRecordId, type)
        }
      },
      handleToggleHistory() { // 收起/显示联系历史
        this.$store.commit('SET_HISTORY_VISIBLE', !this.historyVisible)
      },
      handleModalClose() { // 关闭modal
        this.innerVisible = false
      },
      handlePreviewDetail(callRecordInfo) { // 查看通话详情
        const { callInstanceId, callInstanceType } = callRecordInfo
        this.callRecordId = callInstanceId
        const type = callInstanceType === 'AI_RECORD' ? 0
          : callInstanceType === 'CALL_IN_RECORD' ? 2 : 1
        this.loadCallDetail(callInstanceId, type)
      },
      handleEditCustomer() { // 编辑客户
        this.customerVisible = true
        this.customerData = this.customerInfo
      },
      handleEditSuccess() { // 编辑成功
        this.loadCustomerDetail(this.customerPersonId)
        this.$emit('edit-customer-success')
      },
      handleToggleKnowledge() { // 切换探意知识库
        this.$store.commit('SET_KNOWLEDGE_MODAL_VISIBLE', !this.knowledgeModalVisible)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/mixin.scss';

  .contact-history-modal {
    .contact-history {
      height: 100%;
      display: flex;
      > .history-wrap {
        transition: width .3s;
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        > .list {
          width: 300px;
          box-shadow: $--box-shadow-base;
        }
        > .record {
          width: 608px;
          flex-shrink: 0;
        }
      }
      > .customer-wrap {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        width: 332px;
        > .header {
          padding: 18px 20px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: $--border-base;
          > .action-group {
            display: flex;
            color: $--color-primary;
            > div {
              display: flex;
              align-items: center;
              cursor: pointer;
              &:first-child {
                &::after {
                  content: '';
                  display: inline-block;
                  vertical-align: middle;
                  @include lineSplit(12px);
                  margin: 0 20px;
                }
              }
              > .iconfont {
                margin-right: 4px;
              }
            }
          }
          > i {
            font-size: $--font-size-base;
            cursor: pointer;
          }
        }
        > .customer {
          flex-grow: 1;
        }
      }
    }
    /deep/ .el-dialog__header {
      margin-bottom: 0;
    }
    /deep/ .el-dialog__body {
      padding: 0!important;
    }
  }
</style>

