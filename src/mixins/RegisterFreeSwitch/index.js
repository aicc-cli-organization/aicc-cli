import SIP from '@/assets/sip'
import { mapGetters } from 'vuex'
import { getFreeSwitchIP } from '@/api/login'
import { getArtificialInfo } from '@/api/users'
import { updateArtificialCallRecord, updateInComingArtificialCallRecord } from '@/api/callRecord'
import { updateCsTransferHangUpWithIdentifyId } from '@/api/cs'
import { getCustomerPersonByPhoneNumber } from '@/api/customer'
import { fetchPhoneLocation } from '@/api/phone'
import { globalNotifyForCallIn } from '@/utils/notification'

export default {
  name: 'RegisterFreeSwitchMixin',
  computed: {
    ...mapGetters([
      'artiCustomerData',
      'artiJoinModalData',
      'newCallRecordId',
      'hangupBy',
      'userEnableCsSeat',
      'enableCallIn',
      'isLocal',
      'callType'
    ])
  },
  data() {
    return {
      simple: null,
      incomingCustomerInfo: {}, // 呼入客户的信息
      batchCallCustomerInfo: {} // 批量外呼客户信息
    }
  },
  watch: {
    async userEnableCsSeat(newValue) {
      if (newValue) { // 有坐席权限且坐席在线
        if (this.simple) {
          this.simple.ua.start()
        } else {
          const { sipAccount, sipPassword } = await this.loadArtificialInfo()
          this.registerFs(sipAccount, sipPassword)
          // this.registerFs(1016, 'LETJQXFFWI') // TODO: mock
        }
      }
    }
  },
  methods: {
    async registerFs(sipAccount, sipPassword) { // 注册fs
      let freeSwitchIP = process.env.FREESWITCH
      let freeSwitchPort = '7443'
      if (this.isLocal) {
        const parmas = await getFreeSwitchIP()
        freeSwitchIP = parmas.freeSwitchIP
        freeSwitchPort = parmas.freeSwitchPort
      }
      const uaOptions = { // ua配置项
        media: {
          remote: {
            audio: this.$refs.audio
          }
        },
        ua: {
          uri: `sip:${sipAccount}@${freeSwitchIP}`,
          wsServers: [`wss://${freeSwitchIP}:${freeSwitchPort}`],
          password: sipPassword
        }
      }
      this.simple = new SIP.Web.Simple(uaOptions) // 注册fs，生成ua实例
      this.$store.commit('SET_FS_USERAGENT', this.simple) // 将实例挂载到vuex上
      this.simple.on('ringing', (session) => { // 监听呼入事件
        const callInId = session.request.getHeader('X_BY_CALL_IN_RECORD_ID')
        if (callInId) {
          this.handleCallIn(session)
        } else {
          this.handleBatchCall(session)
        }
      })
      this.simple.ua.on('registrationFailed', () => { // 监听ua注册失败事件
        this.$message.error('通信设备注册失败，请联系管理员')
      })
    },
    handleCallIn(session) { // 处理呼入情况
      this.$store.commit('SET_CALLTYPE', 'in') // 更新外呼类型为呼入
      const header = session.request.getHeader('From')
      const phoneNumber = this.getPhoneNumberFromSipInfo(header)
      globalNotifyForCallIn(phoneNumber)
      Promise.all([this.getCustomerPersonByPhoneNumber(phoneNumber), this.getAreaByPhoneNumber(phoneNumber)]).then(result => {
        this.incomingCustomerInfo = {
          calledPhoneNumber: session.request.getHeader('X_BY_DESTINATION_NUMBER'),
          phoneNumber,
          name: result[0].name,
          province: result[1] ? result[1].province : '',
          city: result[1] ? result[1].city : ''
        }
        this.$store.commit('SET_ARTI_CUSTOMER_DATA', result[0])
        this.$nextTick(() => {
          this.$store.commit('SET_NEW_CALL_RECORD_ID', session.request.getHeader('X_BY_CALL_IN_RECORD_ID')) // 保存新创建的呼入通话记录
        })
      })
    },
    handleBatchCall(session) { // 处理批量外呼情况
      this.$store.commit('SET_CALLTYPE', 'batch') // 更新外呼类型为批量外呼
      const name = session.request.getHeader('X-CUSTOMER_PERSON_NAME')
      const phoneNumber = session.request.getHeader('X-CUSTOMER_PERSON_PHONE_NUMBER')
      const customerPersonId = session.request.getHeader('X-CUSTOMER_PERSON_ID')
      const callId = session.request.getHeader('X-CS_CALL_ID')
      const csJobRecordId = session.request.getHeader('X-JRI')
      const customerData = {
        name,
        phoneNumber,
        customerPersonId,
        csJobRecordId
      }
      this.batchCallCustomerInfo = customerData
      this.$store.commit('SET_ARTI_CUSTOMER_DATA', customerData)
      this.$nextTick(() => {
        this.$store.commit('SET_NEW_CALL_RECORD_ID', callId) // 保存新创建的呼入通话记录
      })
    },
    async loadArtificialInfo() { // 获取人工坐席相关信息
      try {
        const { data } = await getArtificialInfo()
        const info = data.data || {}
        this.$store.commit('SET_ARTI_INFO', info)
        return info
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async updateCallRecord(resultStatus) { // 拨打完更新呼出通话记录
      await updateArtificialCallRecord({
        csRecordId: this.newCallRecordId,
        resultStatus,
        hangupBy: this.hangupBy
      })
      const { modal } = this.$refs
      this.$store.commit('SET_HANGUP_BY', 0)
      if (modal) {
        modal.loadHistoryList(this.artiCustomerData.customerPersonId)
        modal.loadFollowList(this.artiCustomerData.customerPersonId)
      }
    },
    async updateInComingCallRecord() { // 拨打完更新呼入通话记录
      await updateInComingArtificialCallRecord({
        callInRecordId: this.newCallRecordId,
        hangupBy: this.hangupBy
      })
      const { modal } = this.$refs
      this.$store.commit('SET_HANGUP_BY', 0)
      if (modal) {
        modal.loadHistoryList(this.artiCustomerData.customerPersonId)
        modal.loadFollowList(this.artiCustomerData.customerPersonId)
      }
    },
    async updateCsTransferHangUp() { // 人工介入挂断后更新hangup信息
      const { robotCallJobId, identifyId } = this.artiJoinModalData
      await updateCsTransferHangUpWithIdentifyId({
        robotCallJobId,
        identifyId,
        hangUpBy: this.hangupBy
      })
      this.$store.commit('SET_HANGUP_BY', 0)
    },
    getPhoneNumberFromSipInfo(header) { // 从from头的sip信息中取出电话号码
      const result = /sip:(\d+)@/.exec(header)
      return result ? result[1] : ''
    },
    async getCustomerPersonByPhoneNumber(phoneNumber) { // 根据手机号码获取客户姓名
      const { data } = await getCustomerPersonByPhoneNumber({
        phoneNumber
      })
      return data.data || {}
    },
    async getAreaByPhoneNumber(phoneNumber) { // 根据手机号码获取归属地
      const { data } = await fetchPhoneLocation({
        phoneNumber
      })
      const res = data.data
      if (res) {
        const { province, city } = res
        return {
          province,
          city
        }
      } else {
        return {}
      }
    }
  },
  beforeMount() {
    const self = this
    SIP.Web.Simple.prototype.call = function(destination, extraHeaders) { // 重写call方法支持传入extraHeaders并监听failed事件
      if (!this.ua || !this.checkRegistration()) {
        this.logger.warn('A registered UA is required for calling')
        return
      }
      // Safari hack, because you cannot call .play() from a non user action
      if (this.options.media.remote.audio) {
        this.options.media.remote.audio.autoplay = true
      }
      navigator.mediaDevices.getUserMedia({
        audio: true
      }).then(() => {
        this.session = this.ua.invite(destination, {
          sessionDescriptionHandlerOptions: {
            constraints: {
              audio: true,
              video: false
            }
          },
          extraHeaders
        })
        this.setupSession()
      })
      return this.session
    }
    SIP.Web.Simple.prototype.setupSession = function() {
      this.state = 1
      this.emit('new', this.session)
      this.session.on('progress', this.onProgress.bind(this))
      this.session.on('accepted', this.onAccepted.bind(this))
      this.session.on('rejected', this.onEnded.bind(this))
      this.session.on('failed', () => {
        this.onFailed()
        if (self.callType === 'out') { // 人工呼出需手动更新通话记录
          self.updateCallRecord(1)
        }
        this.ua.register()
      })
      this.session.on('terminated', this.onEnded.bind(this))
      this.session.on('bye', () => {
        this.ua.register()
        if (self.callType === 'out') {
          self.updateCallRecord(0)
        } else if (self.callType === 'in') {
          self.updateInComingCallRecord()
        } else if (self.callType === 'join') {
          self.updateCsTransferHangUp()
        }
      })
    }
    SIP.Web.Simple.prototype.reject = function() {
      if (this.state !== 1 && this.state !== 2) {
        this.logger.warn('Call is already answered')
        return
      }
      return this.session.reject({ // 拒绝返回486
        statusCode: 486,
        reasonPhrase: 'USER_BUSY'
      })
    }
  }
}
