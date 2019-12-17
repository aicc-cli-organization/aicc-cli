<template>
  <div>
    <yiwise-modal
      class="artificial-join-modal"
      width="960px"
      :hasHeader="false"
      :hasMask="false"
      :visible.sync="artiJoinModalVisible"
      @open="handleModalOpen"
    >
      <div class="content-wrap">
        <call-record-list
          class="record"
          :canListen="false"
          :dataSource="callRecordList"
        >
        </call-record-list>
        <div class="customer-wrap">
          <div class="header">
            <div class="action-group" v-if="artiJoinModalType === 'call'">
              <div @click="handleToggleKnowledge">
                <i class="iconfont icon-tanyizhishikux"></i>
                探意知识库
              </div>
            </div>
            <div class="action-group" v-else-if="artiJoinModalType === 'listen'">
              <div @click="handleExitListen">
                <i class="iconfont icon-tanyizhishikux"></i>
                退出监听
              </div>
              <div
                :class="fsStatus !== 3 || isInterventing ? 'disabled' : ''"
                @click="handleJoinCall"
              >
                <i class="iconfont icon-tanyizhishikux"></i>
                切入通话(<span class="reminder-text" :title="reminderText">{{reminderText}}</span>)
              </div>
            </div>
            <div v-else class="offline-text">{{customerStr}}已离线</div>
            <i class="el-icon-close" @click="handleModalCloseClick"></i>
          </div>
          <call-record-detail-customer
            class="customer"
            type="multiple"
            appType="crm"
            :defaultData="{
              customerPersonId: artiJoinModalData.customerPersonId,
              tenantId: artiJoinModalData.tenantId
            }"
            :customerInfo="customerInfo"
            :followList="followList"
            :visible="artiJoinModalVisible"
            :canEditCustomer="true"
            @addFollow="loadFollowList(artiJoinModalData.customerPersonId)"
            @edit-customer="handleEditCustomer"
          >
          </call-record-detail-customer>
        </div>
      </div>
    </yiwise-modal>
    <customer-dialog :visible.sync="customerVisible" type="edit" :defaultData="customerData" @success="handleEditSuccess"></customer-dialog>
    <audio
      controls
      crossorigin
      :src="reminderUrl"
      ref="reminderAudio"
      class="reminderAudio audio hide"
    >
    </audio>
  </div>
</template>

<script>
import { YiwiseModal, CallRecordList, CallRecordDetailCustomer } from 'yiwise-components'
import CustomerDialog from '@/components/CustomerDialog'
import { getCustomerDetail, getStatInfo, getFollowedByUserList } from '@/api/customer'
import { getRobotJobCallDetailWithIdentifyId } from '@/api/callRecord'
import { mapGetters } from 'vuex'

const isUndefind = v => typeof v === 'undefined' || v === null

export default {
  name: 'ArtificialJoinModal',
  components: {
    YiwiseModal,
    CallRecordList,
    CallRecordDetailCustomer,
    CustomerDialog
  },
  computed: {
    ...mapGetters([
      'artiJoinModalData',
      'artiJoinModalType',
      'fsUserAgent',
      'fsStatus',
      'callType',
      'knowledgeModalVisible',
      'customerStr'
    ]),
    artiJoinModalVisible: {
      get() {
        return this.$store.getters.artiJoinModalVisible
      },
      set(newVisible) {
        this.$store.commit('SET_ARTI_JOIN_MODAL_VISIBLE', newVisible)
      }
    },
    reminderText() {
      try {
        const { reminder, reminderText } = this.artiJoinModalData.dialogFlowHumanIntervention
        return reminder === 'YES' && reminderText ? reminderText : ''
      } catch(e) {
        return ''
      }
    },
    reminderUrl() {
      try {
        return this.artiJoinModalData.dialogFlowHumanIntervention.prefixAudioUrl // '/static/audio/artificial_join.mp3'
      } catch(e) {
        return ''
      }
    }
  },
  data() {
    return {
      callRecordList: [],
      followList: [],
      customerInfo: {},
      customerVisible: false,
      customerData: {},
      isInterventing: false
    }
  },
  watch: {
    fsStatus(newStatus) {
      // fsStatus为4表示通话结束
      if (newStatus === 4 && this.callType === 'join') {
        this.$store.commit('SET_ARTI_JOIN_MODAL_TYPE', 'offline')
      }
      // fsStatus为0表示当前没有进行中的通话
      console.log('newStatus: '+ newStatus)
      if ([0, 4].includes(newStatus)) {
        const { reminderAudio } = this.$refs
        reminderAudio && reminderAudio.pause()
      }
    }
  },
  methods: {
    handleModalCloseClick() { // 关闭modal
      this.$store.commit('SET_ARTI_JOIN_MODAL_VISIBLE', false)
    },
    handleModalOpen() {
      this.isInterventing = false
      const { customerPersonId, identifyId, robotCallJobId } = this.artiJoinModalData
      this.loadCustomerDetail(customerPersonId)
      this.loadStatInfo(customerPersonId)
      this.loadFollowList(customerPersonId)
      this.getRobotJobCallDetailWithIdentifyId({
        identifyId,
        robotCallJobId
      })
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
            this.customerInfo.intentLevelTagId = isUndefind(this.customerInfo.intentLevelTagId) ? this.customerInfo.lastIntentLevelTagId : this.customerInfo.intentLevelTagId
            this.$store.commit('SET_ARTI_CUSTOMER_DATA', this.customerInfo)
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
    async loadFollowList(customerPersonId) { // 加载跟进列表
      if (customerPersonId) {
        try {
          const { data } = await getFollowedByUserList({
            customerPersonId
          })
          if (data.data) {
            this.followList = data.data
          }
        } catch (error) {
          return
        }
      }
    },
    async getRobotJobCallDetailWithIdentifyId({ robotCallJobId, identifyId }) { // 获取通话记录列表
      const { data } = await getRobotJobCallDetailWithIdentifyId({
        identifyId,
        robotCallJobId
      })
      this.callRecordList = data.data || []
    },
    handleEditCustomer() { // 编辑客户
      this.customerVisible = true
      this.customerData = this.customerInfo
    },
    handleEditSuccess() { // 编辑成功
      this.loadCustomerDetail(this.artiJoinModalData.customerPersonId)
    },
    handleReminderEnd() {
      console.log('---------------audio ended-----------------')
      this.reminderEnd && this.reminderEnd()
    },
    replaceTrack(track, pc) {
      const tracks = []
      pc.getSenders().forEach(function (sender) {
        tracks.push({
          sender: sender,
          track: sender.track
        })

        track = Array.isArray(track) ? (track.find(d => d.sender === sender) || {}).track : track
        track && sender.replaceTrack(track)
      }, this)
      return tracks
    },
    replaceStream(stream, pc) {
      let tracks = []

      const tracksToR = stream.getTracks()
      if (tracksToR && tracksToR[0]) {
        tracks = tracks.concat(this.replaceTrack(tracksToR[0], pc))
      }

      // stream.getTracks().forEach( (track) => {
      //   tracks = tracks.concat(this.replaceTrack(track, pc))
      // }, this)
      return tracks
    },
    doJoinCall() {
      this.$store.commit('SET_ARTI_JOIN_MODAL_TYPE', 'call')
      this.fsUserAgent.sendDTMF(this.artiJoinModalData.isCallIn ? '*6' : '*5')

      const { reminder, prefixAudioUrl } = this.artiJoinModalData.dialogFlowHumanIntervention

      if (reminder === 'YES' && prefixAudioUrl) {
        let streamXX, peerConnection, reminderAudio
        try {
          reminderAudio = this.$refs.reminderAudio
          peerConnection = this.fsUserAgent.session.sessionDescriptionHandler.peerConnection
          streamXX = reminderAudio.captureStream()
        } catch(e) {
          console.error(e)
        }
        
        const preTracks = this.replaceStream(streamXX, peerConnection)
        this.reminderEnd = () => {
          console.log('---------------reminderEnd-----------------')
          // 如果当前在通话中
          if (![0, 4].includes(this.fsStatus)) {
            this.replaceTrack(preTracks, peerConnection)
          }
        }

        reminderAudio.currentTime = 0
        reminderAudio.play()
      }
    },
    handleJoinCall() { // 切入通话
      if (this.fsUserAgent && this.fsStatus === 3 && !this.isInterventing) {
        this.isInterventing = true
        this.doJoinCall()
      }
    },
    handleExitListen() { // 退出监听
      if (this.fsUserAgent) {
        this.fsUserAgent.hangup()
        this.artiJoinModalVisible = false
      }
    },
    handleToggleKnowledge() { // 切换探意知识库
      this.$store.commit('SET_KNOWLEDGE_MODAL_VISIBLE', !this.knowledgeModalVisible)
    }
  },
  mounted() {
    this.reminderEnd = null
    this.$nextTick(() => {
      const { reminderAudio } = this.$refs
      if (reminderAudio) {
        reminderAudio.addEventListener(
          'ended',
          this.handleReminderEnd,
          false
        )
        reminderAudio.addEventListener(
          'error',
          this.handleReminderEnd,
          false
        )
      }
    })
  },
  beforeDestroy() {
    const { reminderAudio } = this.$refs
    if (reminderAudio) {
      reminderAudio.removeEventListener(
        'ended',
        this.handleReminderEnd,
        false
      )
      reminderAudio.removeEventListener(
        'error',
        this.handleReminderEnd,
        false
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';
@import '~src/styles/mixin.scss';
@import '~src/styles/placeholder.scss';

.artificial-join-modal {
  .content-wrap {
    height: 100%;
    display: flex;
    > .record {
      width: 608px;
      background: $bodyBg;
    }
    > .customer-wrap {
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
            &:nth-child(n + 2) {
              &::before {
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
        .reminder-text {
          display: inline-block;
          max-width: 90px;
          @extend %ellipsis;
        }
        > .offline-text {
          color: $--color-text-placeholder;
        }
        > i {
          font-size: $--font-size-base;
          cursor: pointer;
        }
      }
      > .customer{
        width: 352px;
      }
    }
  }
}
.hide {
  display: none;
}
</style>

