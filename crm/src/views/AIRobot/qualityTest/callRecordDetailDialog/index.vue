<template>
  <yiwise-modal
    class="call-record-modal"
    width="1088px"
    :visible.sync="innerVisible"
    @open="handleDialogOpen"
    @close="handleDialogClose"
  >
    <div slot="title" class="header">
      <div class="title">通话详情</div>
      <div class="btn-group">
        <el-button
          @click="handlePrevClick"
          :disabled="prevDisabled"
        >
          <i class="el-icon-caret-left"></i>
          上一通
        </el-button>
        <el-button
          @click="handleNextClick"
          :disabled="nextDisabled"
        >
          下一通
          <i class="el-icon-caret-right"></i>
        </el-button>
      </div>
      <slot name="header"></slot>
    </div>
    <div class="call-record-detail">
      <record
        class="record"
        v-loading="loadingCustomerData"
        :type="callRecordInfo.robotType"
        :qcJobRecordId="callRecordInfo.qcJobRecordId"
        :callRecordId="callRecordInfo.callRecordId"
        :fullAudioUrl="callRecordInfo.fullAudioUrl"
        :customerAudioUrl="callRecordInfo.customerAudioUrl"
        :robotCallJobId="robotCallJobId"
        :startTime="callRecordInfo.startTime"
        :chatRound="callRecordInfo.chatRound"
        :callRecordList="callRecordList"
      >
      </record>
      <call-record-setting
        :qcJobRecordId="callRecordInfo.qcJobRecordId"
        :csName="callRecordInfo.csName"
        :customerPersonName="callRecordInfo.customerPersonName"
        :qcSum="callRecordInfo.qcSum"
        :keyWordsList="callRecordInfo.keyWordsList"
        :focusList="callRecordInfo.focusList"
      ></call-record-setting>
    </div>
  </yiwise-modal>
</template>

<script>
import { YiwiseModal } from 'yiwise-components'
import CallRecordDetailRecord from './record'
import CallRecordSetting from './setting'
import { fetchCallInRecordDetail } from '@/api/callRecord'
import * as qcAPI from '@/api/qualityTest'

export default {
  name: 'CallRecordDetailDialog',
  components: {
    YiwiseModal,
    Record: CallRecordDetailRecord,
    CallRecordSetting
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    tableData: {
      // 列表相关数据，分页则包含分页信息
      type: [Object, Array],
      default() {
        return []
      }
    },
    defaultIndex: {
      // 默认索引
      type: Number,
      default: -1
    },
    loadTableData: Function, // 加载列表数据
    appType: {
      // 区分应用类型
      validator(value) {
        return ['crm', 'ope', 'boss'].indexOf(value) !== -1
      },
      default: 'crm'
    },
    tag: String
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    },
    isPagination() {
      // 判断列表是否支持分页
      return !Array.isArray(this.tableData)
    },
    tableList() {
      // 获取分页列表
      return this.isPagination
        ? this.tableData.content || []
        : this.tableData || []
    },
    nextDisabled() {
      // next变为disabled的条件
      if (this.isPagination) {
        const { pages, number } = this.tableData
        if (pages === number && this.innerIndex === this.tableList.length - 1) {
          return true
        }
      } else if (this.innerIndex === this.tableList.length - 1) {
        return true
      }
      return false
    },
    prevDisabled() {
      if (this.isPagination) {
        const { number } = this.tableData
        if (number === 1 && this.innerIndex === 0) {
          return true
        }
      } else if (this.innerIndex === 0) {
        return true
      }
      return false
    },
    selectedTaskId() {
      return this.$store.state.qcTask.selectedTaskId
    }
  },
  data() {
    return {
      callRecordInfo: {}, // 通话基本信息
      callRecordList: [], // 通话列表
      customerInfo: {}, // 客户信息
      currentPlayingId: undefined, // 当前正在播放的通话记录详情id
      followList: [],
      innerIndex: -1,
      robotCallJobId: '',
      loadingCustomerData: false
    }
  },
  watch: {
    innerIndex(newIndex) {
      const newItem = this.tableList[newIndex]
      if (newItem && this.visible) {
        const {
          qcJobRecordId,
          callRecordId,
          tenantId
        } = newItem
        this.loadCallDetail({
          qcJobRecordId,
          callRecordId,
          tenantId
        })
        this.$set(newItem, 'read', 'HAS_READ')
      }
    }
  },
  methods: {
    handleDialogOpen() {
      this.innerIndex = this.defaultIndex
    },
    handleDialogClose() {
      this.currentPlayingId = undefined
      this.$nextTick(() => {
        // 先暂停录音再清空数据
        this.innerIndex = -1
        this.followList = []
        this.customerInfo = {}
        this.callRecordList = []
        this.callRecordInfo = {}
        this.robotCallJobId = ''
      })
    },
    async loadCallDetail({ qcJobRecordId, callRecordId, tenantId, type }) {
      // 加载通话详情
      try {
        const params = {
          qcJobRecordId,
          qcJobId: this.selectedTaskId
          // tenantId,
        }
        const { data } = await qcAPI.getQCRecordDetail(params)
        if (data && data.data) {
          const {
            callRecordId,
            callRecordTime: startTime,
            chatRound,
            fullUrl: fullAudioUrl,
            customerAudioUrl,
            list: callDetailList,
            intentLevelTagId,
            customerPerson,
            customerConcern,
            intentLevel,
            realIntentLevel,
            analysisBasis,
            attributes,
            robotCallJobId,
            robotType,
            calledPhoneNumber,
            customerPersonName,
            keyWordsList,
            focusList,
            muteDuration,
            muteRate,
            score,
            speed,
            jobFullScore,
            jobBaseScore,
            csName,
            madeScore,
            madeComment,
            madeUserName
          } = data.data
          this.callRecordInfo = {
            qcJobRecordId,
            callRecordId,
            startTime,
            chatRound,
            fullAudioUrl,
            customerAudioUrl,
            robotType,
            csName,
            customerPersonName,
            keyWordsList,
            focusList,
            qcSum: {
              muteDuration,
              muteRate,
              score,
              speed,
              jobFullScore,
              jobBaseScore,
              madeScore,
              madeComment,
              madeUserName
            }
          }
          this.robotCallJobId = robotCallJobId
          this.callRecordList = callDetailList || []
          this.customerInfo = {
            ...customerPerson,
            customerConcern,
            intentLevel,
            realIntentLevel,
            intentLevelTagId,
            analysisBasis,
            attributes,
            robotType,
            phoneNumber: calledPhoneNumber, // 客户号码
            name: customerPersonName // 客户姓名
          }
        }
      } catch (error) {
        this.callRecordList = []
        this.customerInfo = {}
      }
    },
    async loadCallInDetail({ callRecordId }) {
      // 加载通话详情
      try {
        const data = (await fetchCallInRecordDetail(
          {
            callInRecordId: callRecordId
          },
          this.appType
        )).data
        if (data && data.data) {
          const {
            callInRecordId,
            startTime,
            chatRound,
            fullAudioUrl,
            customerAudioUrl,
            callInDetailList,
            intentLevelTagId,
            customerPerson,
            customerConcern,
            intentLevel,
            realIntentLevel,
            analysisBasis,
            attributes,
            seatType,
            calledPhoneNumber,
            customerPersonName
          } = data.data
          this.callRecordInfo = {
            callRecordId: callInRecordId,
            startTime,
            chatRound,
            fullAudioUrl,
            customerAudioUrl,
            robotType: seatType === 'AI' ? 2 : 3
          }
          this.callRecordList = callInDetailList || []
          this.customerInfo = {
            ...customerPerson,
            customerConcern,
            intentLevel,
            realIntentLevel,
            intentLevelTagId,
            analysisBasis,
            attributes,
            robotType: seatType === 'AI' ? 2 : 3,
            phoneNumber: calledPhoneNumber, // 客户号码
            name: customerPersonName // 客户姓名
          }
        }
      } catch (error) {
        this.callRecordList = []
        this.customerInfo = {}
      }
    },
    handlePrevClick() {
      // 点击上一通
      this.currentPlayingId = undefined
      if (this.tableList[this.innerIndex - 1]) {
        this.innerIndex--
      } else if (this.isPagination && this.loadTableData) {
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
      } else if (this.isPagination && this.loadTableData) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

.call-record-modal {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    &::after {
      content: '';
    }
    .title {
      font-size: $--font-size-base;
    }
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
  }
  .call-record-detail {
    height: 100%;
    display: flex;
    > .customer {
      flex-grow: 1;
    }
    > .record {
      width: 608px;
      flex-shrink: 0;
    }
  }
  /deep/ .el-dialog__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
    .el-dialog__headerbtn {
      position: static;
    }
  }
  /deep/ .el-dialog__body {
    padding: 0 !important;
  }
}
</style>
