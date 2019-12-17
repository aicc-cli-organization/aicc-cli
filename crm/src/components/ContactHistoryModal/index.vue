<template>
  <yiwise-modal
    width="1340px"
    class="contact-history-modal"
    :visible.sync="innerVisible"
    @open="handleDialogOpen"
    @close="handleDialogClose"
  >
    <div slot="title" class="title">
      <div>联系历史</div>
      <div class="btn-group">
        <el-button
          @click="handlePrevClick"
          :disabled="prevDisabled"
        >
          <i class="el-icon-caret-left"></i>
          上一{{unit}}
        </el-button>
        <el-button
          @click="handleNextClick"
          :disabled="nextDisabled"
        >
          下一{{unit}}
          <i class="el-icon-caret-right"></i>
        </el-button>
      </div>
      <artificial-call-popover
        v-if="enableCsSeat || userEnableCsSeat"
        :defaultName="defaultData.name"
        :defaultPhoneNumber="defaultData.phoneNumber"
      >
        <div
          class="call"
          slot="reference"
        >
          <i class="iconfont icon-bohaox"></i>
          人工外呼
        </div>
      </artificial-call-popover>
      <div v-else></div>
    </div>
    <div class="contact-history">
      <contact-history-card-list
        class="list"
        :tag="tag"
        :recordList="recordList"
        :callRecordId="callRecordId"
        @select="handleCardSelect"
      >
      </contact-history-card-list>
      <call-record-detail-record
        class="record"
        :downloadAudio="downloadAudio"
        :callRecordId="callRecordInfo.callRecordId"
        :fullAudioUrl="callRecordInfo.fullAudioUrl"
        :customerAudioUrl="callRecordInfo.customerAudioUrl"
        :robotCallJobId="robotCallJobId"
        :startTime="callRecordInfo.startTime"
        :chatRound="callRecordInfo.chatRound"
        :callRecordList="callRecordList"
        :type="callRecordInfo.robotType"
        :expires="callRecordInfo.expires"
        :remind="callRecordInfo.remind"
        :customerPersonId="customerPersonId"
        :correctHisList="correctHisList"
        :correctIntentList="correctIntentList"
        @correctDial="getCorrectHisData"
      >
      </call-record-detail-record>
      <call-record-detail-customer
        type="multiple"
        select="multiple"
        appType="crm"
        class="customer"
        :customerFields_private="customerFields_private"
        :callRecordId="callRecordInfo.callRecordId"
        :defaultData="defaultData"
        :customerInfo="customerInfo"
        :followList="followList"
        :visible="visible"
        :canEditCustomer="true"
        @addFollow="loadFollowList"
        @refreshFollowList="loadFollowList"
        @preview-detail="handlePreviewDetail"
        @edit-customer="handleEditCustomer"
        @refresh="$emit('edit-customer-success')"
      >
      </call-record-detail-customer>
    </div>
    <customer-dialog :visible.sync="customerVisible" type="edit" :defaultData="customerData" @success="handleEditSuccess"></customer-dialog>
  </yiwise-modal>
</template>

<script>
  import ContactHistoryCardList from '@/components/ContactHistoryCardList'
  import ArtificialCallPopover from '@/components/ArtificialCallPopover'
  import CustomerDialog from '@/components/CustomerDialog'
  import { CallRecordDetailRecord, CallRecordDetailCustomer, YiwiseModal } from 'yiwise-components'
  import { fetchContactHistoryList, fetchCallRecordDetail, fetchCallInRecordDetail } from '@/api/callRecord'
  import { getCustomerDetail, getStatInfo, getFollowedByUserList, getIntentRecoveryList, getVoiceRecoveryList } from '@/api/customer'
  import { mapGetters } from 'vuex'
  const isUndefind = v => typeof v === 'undefined' || v === null

  export default {
    name: 'ContactHistoryModal',
    components: {
      YiwiseModal,
      CallRecordDetailRecord,
      CallRecordDetailCustomer,
      ContactHistoryCardList,
      ArtificialCallPopover,
      CustomerDialog
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      defaultIndex: {
        // 默认索引
        type: Number,
        default: -1
      },
      tag: {},
      downloadAudio: {
        type: Boolean,
        default: true
      },
      loadTableData: Function, // 加载列表数据
      tableData: {
        // 列表相关数据，分页则包含分页信息
        type: [Object, Array],
        default() {
          return []
        }
      },
      unit: {
        type: String,
        default: '条'
      }
    },
    computed: {
      ...mapGetters(['customerFields_private', 'enableCsSeat', 'userEnableCsSeat']),
      innerVisible: {
        get() {
          return this.visible
        },
        set(newValue) {
          this.$emit('update:visible', newValue)
        }
      },
      tableList() {
        // 获取分页列表
        return this.tableData.content || []
      },
      nextDisabled() {
        // next变为disabled的条件
        const { pages, number } = this.tableData
        if (pages === number && this.innerIndex === this.tableList.length - 1) {
          return true
        }
        return false
      },
      prevDisabled() {
        const { number } = this.tableData
        if (number === 1 && this.innerIndex === 0) {
          return true
        }
        return false
      }
    },
    data() {
      return {
        recordList: [], // 该客户所有的通话记录
        callRecordId: 0,
        callRecordInfo: {},
        callRecordList: [],
        customerInfo: {},
        followList: [],
        robotCallJobId: '',
        currentPlayingId: undefined, // 当前正在播放的通话记录详情id
        customerVisible: false, // 是否显示编辑用户dialog
        innerIndex: -1,
        defaultData: {},
        customerPersonId: undefined,
        correctHisList: [],
        correctIntentList: [],
        customerData: {} // 用户信息
      }
    },
    watch: {
      async innerIndex(newIndex) {
        const newItem = this.tableList[newIndex]
        if (newItem && this.visible) {
          const { customerPersonId } = newItem
          this.customerPersonId = customerPersonId
          this.defaultData = newItem
          await this.loadHistoryList()
          await this.getCorrectHisData()
          this.loadCustomerDetail()
          this.loadStatInfo()
          this.loadFollowList()
        }
      }
    },
    methods: {
      handleDialogOpen() {
        this.innerIndex = this.defaultIndex
      },
      handleDialogClose() {
        this.currentPlayingId = undefined
        this.robotCallJobId = ''
        this.innerIndex = -1
        this.$nextTick(() => {
          this.recordList = []
          this.callRecordId = 0
          this.callRecordInfo = {}
          this.callRecordList = []
        })
        this.$emit('refreshLabel')
      },
      handlePrevClick() {
        // 点击上一通
        this.currentPlayingId = undefined
        if (this.tableList[this.innerIndex - 1]) {
          this.innerIndex--
        } else if (this.loadTableData) {
          const { number, pageSize } = this.tableData
          this.loadTableData(
            {
              pageNum: number - 1
            },
            () => {
              this.innerIndex = pageSize - 1
            }
          )
        }
      },
      handleNextClick() {
        // 点击下一通
        this.currentPlayingId = undefined
        if (this.tableList[this.innerIndex + 1]) {
          this.innerIndex++
        } else if (this.loadTableData) {
          const { number } = this.tableData // 当前页数
          this.loadTableData(
            {
              pageNum: number + 1
            },
            () => {
              this.innerIndex = 0
            }
          )
        }
      },
      async loadHistoryList() { // 加载历史所有通话记录
        if (!this.customerPersonId) {
          return
        }
        try {
          const { data } = await fetchContactHistoryList({
            customerPersonId: this.customerPersonId
          })
          this.recordList = data.data || []
          const { callRecordId, type } = this.recordList[0] || {} // 默认第一条
          this.customerInfo.emotion = (this.recordList[0] || {}).emotion
          this.callRecordId = callRecordId
          if (type === 2 || type === 3) {
            this.loadInComingCallDetail(callRecordId)
          } else {
            this.loadCallDetail(callRecordId, type)
          }
        } catch (error) {
          return
        }
      },
      // type // 0 ai外呼 1 人工外呼 2 Ai呼入接待 3 人工呼入接待
      async loadCallDetail(callRecordId, type) { // 加载通话详情
        if (!callRecordId) {
          return
        }
        const { data } = (await fetchCallRecordDetail({
          callRecordId,
          type
        }))
        if (data && data.data) {
          const { callRecordId, startTime, chatRound, fullAudioUrl, customerAudioUrl, callDetailList, robotCallJobId, robotType, calledPhoneNumber, expires, remind} = data.data
          this.robotCallJobId = robotCallJobId
          this.callRecordInfo = {
            callRecordId,
            startTime,
            chatRound,
            fullAudioUrl,
            customerAudioUrl,
            robotType,
            expires,
            remind
          }
          console.log(this.callRecordInfo)
          if (calledPhoneNumber) {
            this.customerInfo = {
              ...this.customerInfo,
              phoneNumber: calledPhoneNumber
            }
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
          const { callInRecordId, startTime, chatRound, fullAudioUrl, customerAudioUrl, callInDetailList, seatType, expires, remind} = data.data
          this.robotCallJobId = ''
          this.callRecordInfo = {
            callRecordId: callInRecordId,
            startTime,
            chatRound,
            fullAudioUrl,
            customerAudioUrl,
            robotType: seatType === 'AI' ? 2 : 3,
            expires,
            remind
          }
          this.callRecordList = callInDetailList || []
        }
      },
      async loadCustomerDetail() { // 加载客户详情
        if (this.customerPersonId) {
          try {
            const { data } = await getCustomerDetail({
              customerPersonId: this.customerPersonId
            })
            if (data.data) {
              const { customerPerson = {}, customerGroup = {}, extraInfo = {}, inWhiteList } = data.data
              this.customerInfo = {
                ...this.customerInfo,
                ...customerPerson,
                extraInfo,
                customerGroup,
                inWhiteList
              }
              this.customerInfo.intentLevelTagId = isUndefind(this.customerInfo.intentLevelTagId) ? this.customerInfo.lastIntentLevelTagId : this.customerInfo.intentLevelTagId
            }
          } catch (error) {
            return
          }
        }
      },
      async loadStatInfo() { // 加载统计信息
        if (this.customerPersonId) {
          try {
            const { data } = await getStatInfo({
              customerPersonId: this.customerPersonId
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
      async getCorrectHisData() {
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
      async loadFollowList() { // 加载跟进列表
        if (this.customerPersonId) {
          try {
            const { data } = await getFollowedByUserList({
              customerPersonId: this.customerPersonId,
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
        this.$set(this.customerInfo, 'emotion', data.emotion)
        this.currentPlayingId = undefined // 切换卡片暂停录音
        const { callRecordId, type } = data
        this.callRecordId = callRecordId
        if (type === 2 || type === 3) {
          this.loadInComingCallDetail(callRecordId)
        } else {
          this.loadCallDetail(callRecordId, type)
        }
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
        this.loadCustomerDetail()
        this.$emit('edit-customer-success')
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';

  .contact-history-modal {
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .btn-group {
        display: flex;
        .el-button {
          width: 148px;
          text-align: center;
        }
        .el-button + .el-button {
          margin-left: 0;
          border-left: none;
        }
      }
      .call {
        color: $--color-primary;
        display: flex;
        align-items: center;
        padding-right: 20px;
        border-right: $--border-base;
        margin-right: 30px;
        cursor: pointer;
        > i {
          display: inline-block;
          margin-right: 10px;
        }
      }
    }
    .contact-history {
      height: 100%;
      display: flex;
      > .list {
        width: 300px;
        flex-shrink: 0;
        box-shadow: $--box-shadow-base;
      }
      > .customer {
        flex-grow: 1;
      }
      > .record {
        width: 608px;
        flex-shrink: 0;
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

