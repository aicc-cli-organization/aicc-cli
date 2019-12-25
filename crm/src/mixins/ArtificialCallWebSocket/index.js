import SockJs from 'sockjs-client'
import Stomp from 'stompjs'

export default {
  name: 'artificialWebSocketMixin',
  data() {
    return {
      dialogDataList: [],
      dialogDataInfo: {},
      stompClient: null, // stomp客户端实例
      infoLoading: false, // 加载info的loading
      callStatus: 'none' // 通话状态 none, call-success, ringing, pickup
    }
  },
  methods: {
    async connect(params) { // 检查变量并连接websocket
      const random = this.generateRandom()
      const socket = new SockJs('/apiEngine/webSocket/userClient', [], {
        sessionId: () => {
          return random
        }
      })
      this.stompClient = Stomp.over(socket)
      this.stompClient.connect({ 'Cookie': document.cookie }, () => {
        this.$emit('connected') // 连接成功
        this.stompClient.subscribe('/user/queue/callAIAssistantMsg', (res) => {
          this.parseData(res)
        })
        this.stompClient.send('/app/startAIAssistant', {}, JSON.stringify(params))
      }, () => {
        this.$emit('error')
      })
    },
    disconnect() {
      if (this.stompClient) {
        this.stompClient.disconnect(() => {
          this.dialogDataList = []
          this.dialogDataInfo = {}
          this.infoLoading = false
          this.$emit('disconnected')
        })
      }
    },
    parseData(res) { // 解析data
      if (res.body) {
        const body = JSON.parse(res.body)
        const { code, data, resultMsg } = body
        if (code === 200) {
          const { type, info = {}} = data
          if (type === 'AssistantDetailMsg') {
            const { text, type, debugLog, answers } = info
            this.dialogDataList.push({
              text,
              type,
              debugLog
            })
            if (answers) {
              answers.forEach(item => {
                this.dialogDataList.push({
                  text: `参考回复：${item || '无'}`,
                  type: 'ROBOT'
                })
              })
            } else {
              this.dialogDataList.push({
                text: '参考回复：无',
                type: 'ROBOT'
              })
            }
          }
        } else {
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

