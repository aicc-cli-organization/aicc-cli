import SockJs from 'sockjs-client'
import Stomp from 'stompjs'
import { dialogFlowProperties } from '@/api/talk'

export default {
  name: 'CallWebSocket',
  data() {
    return {
      dialogDataList: [],
      dialogDataInfo: {},
      stompClient: null, // stomp客户端实例
      infoLoading: false, // 加载info的loading
      callBtnLoading: false, // 拨打按钮的loading
      callStatus: 'none', // 通话状态 none, call-success, ringing, pickup
      propertyList: [], // 变量列表
      hasNameProperty: false, // 话术中是否有姓名变量
      propertyDialogVisible: false
    }
  },
  methods: {
    async connect({
      sendUrl,
      flowId,
      customerPersonId,
      tenantPhoneNumberId,
      checkIfHasProperty = true
    } = {}) { // 检查变量并连接websocket
      if (checkIfHasProperty) {
        this.callBtnLoading = true
        const customerName = this.customerData.name
        const { data } = await this.getProperty(flowId)

        this.hasNameProperty = data && data.length ? data.includes('姓名') : false
        if (customerName && data && data.length && data.includes('姓名')) {
          data.splice(data.indexOf('姓名'), 1)
        }

        if (data && data.length > 0) {
          if (data.length === 1 && data[0] === '性别' && ['MALE', 'FEMALE'].includes(this.customerData.gender)) {
            this.buildWebsocket({
              sendUrl: '/app/directlyCallCustomerPerson',
              flowId: this.dialogFlowId,
              customerPersonId: this.customerPersonId,
              tenantPhoneNumberId: this.tenantPhoneNumberId,
              propertyData: {
                '性别': this.customerData.gender
              }
            })
          } else {
            this.propertyList = data
            this.propertyDialogVisible = true
            this.callBtnLoading = false
          }
        } else {
          this.buildWebsocket({ sendUrl, flowId, customerPersonId, tenantPhoneNumberId })
        }
      } else {
        this.buildWebsocket({ sendUrl, flowId, customerPersonId, tenantPhoneNumberId })
      }
    },
    disconnect() {
      if (this.stompClient) {
        this.stompClient.disconnect(() => {
          this.dialogDataList = []
          this.dialogDataInfo = {}
          this.infoLoading = false
          this.callBtnLoading = false
          this.$emit('disconnected')
        })
      }
    },
    buildWebsocket({ sendUrl, flowId, customerPersonId, tenantPhoneNumberId, propertyData = {}} = {}) { // ws连接
      this.callBtnLoading = true
      const random = this.generateRandom()
      const socket = new SockJs('/apiEngine/webSocket/userClient', [], {
        sessionId: () => {
          return random
        }
      })
      this.stompClient = Stomp.over(socket)
      this.stompClient.connect({ 'Cookie': document.cookie }, () => {
        this.$emit('connected') // 连接成功
        this.stompClient.subscribe(`/user/queue/callTaskInfoMsg`, (res) => {
          this.parseData(res)
        })
        const params = {
          tenantPhoneNumberId
        }
        if (flowId) {
          params.dialogFlowId = flowId
        }
        if (customerPersonId) {
          params.customerPersonId = customerPersonId
        }
        this.stompClient.send(sendUrl, {}, JSON.stringify({
          ...params,
          properties: propertyData
        }))
      }, () => {
        this.callBtnLoading = false
        this.$emit('error')
      })
    },
    async getProperty(flowId) { // 获取话术变量
      if (flowId) {
        try {
          const { data } = await dialogFlowProperties({
            dialogFlowId: flowId
          })
          return Promise.resolve(data)
        } catch (error) {
          return Promise.reject(error)
        }
      }
    },
    parseData(res) { // 解析data
      if (res.body) {
        const body = JSON.parse(res.body)
        const { code, data, resultMsg } = body
        if (code === 200) {
          if (data.type === 'SystemMsg') {
            if (data.info === 'SUCCESS') { // 外呼成功
              this.callStatus = 'call-success'
            }
            if (data.info === 'RINGING') { // 正在呼叫
              this.callStatus = 'ringing'
            }
            if (data.info === 'CALLEE_PICKUP') { // 已接听
              this.callBtnLoading = false
              this.callStatus = 'pickup'
            }
            if (data.info === 'CALL_FINISHED') { // 通话结束
              this.infoLoading = true
              this.callStatus = 'none'
              this.$message.success('通话结束')
            }
            if (data.info === 'CALL_FAILURE') { // 通话失败
              this.callBtnLoading = false
              this.callStatus = 'none'
              this.$message.error(data.msg)
            }
          } else if (data.type === 'CallDetailMsg') {
            this.dialogDataList.push({
              msgType: 'CallDetailMsg',
              ...data.info
            })
          } else if (data.type === 'CallRecordInfoMsg') {
            this.dialogDataInfo = {
              ...data.info,
              customerConcern: data.info.customerConcern,
              chatRound: data.info.chatRound,
              realIntentLevel: data.info.manualMarked ? data.info.realIntentLevel : ''
            }
            this.infoLoading = false
          }
        } else {
          this.callBtnLoading = false
          this.$message.error(resultMsg)
        }
      }
    },
    generateRandom() { // 生成随机字符串作为ws唯一标识
      const randomStr = Math.random().toString().slice(-6)
      const timeStamp = Date.parse(new Date()).toString()
      return randomStr + timeStamp
    }
  },
  destroyed() { // 销毁时断开连接
    this.disconnect()
  }
}

