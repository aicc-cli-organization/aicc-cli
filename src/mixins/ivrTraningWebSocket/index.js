import SockJs from 'sockjs-client'
import Stomp from 'stompjs'

export default {
  name: 'ivrTraningWebSocket',
  data() {
    return {
      dialogDataList: [],
      stompClient: null, // stomp客户端实例
      infoLoading: false, // 加载info的loading
      callBtnLoading: false, // 拨打按钮的loading
      callStatus: 'none' // 通话状态 none, call-success, ringing, pickup
    }
  },
  methods: {
    async connect({
      sendUrl,
      ivrNavigationId,
      tenantPhoneNumberId
    } = {}) { // 检查变量并连接websocket
      this.buildWebsocket({ sendUrl, ivrNavigationId, tenantPhoneNumberId })
    },
    disconnect() {
      if (this.stompClient) {
        this.stompClient.disconnect(() => {
          this.dialogDataList = []
          this.infoLoading = false
          this.callBtnLoading = false
          this.$emit('disconnected')
        })
      }
    },
    buildWebsocket({ sendUrl, ivrNavigationId = 36, tenantPhoneNumberId } = {}) { // ws连接
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
        if (ivrNavigationId) {
          params.dialogFlowId = ivrNavigationId // 后端需要的是dialogFlowId
        }
        this.stompClient.send(sendUrl, {}, JSON.stringify({
          ...params
        }))
      }, () => {
        this.callBtnLoading = false
        this.$emit('error')
      })
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

