import SockJs from 'sockjs-client'
import Stomp from 'stompjs'

export default {
  name: 'PhoneTaskWebSocket',
  data() {
    return {
      stompClient: null, // stomp客户端实例
      infoLoading: false // 加载info的loading
    }
  },
  computed: {
    fullStatsInfo() {
      return this.$store.state.taskV2.fullTaskInfo
    },
    taskList() {
      return this.$store.state.taskV2.taskList
    }
  },
  methods: {
    webSocketChatRound2BackKey(chatRound) {
      if (chatRound <= 3) {
        return 'LESS_3'
      } else if (chatRound >= 4 && chatRound <= 6) {
        return 'F3_T6'
      } else if (chatRound >= 7 && chatRound <= 9) {
        return 'F6_T10'
      } else {
        return 'F10_MORE'
      }
    },
    webSocketChatDuration2BackKey(chatDuration) {
      const chatDurationSec = chatDuration / 1000
      if (chatDurationSec < 10) {
        return 'LESS_10S'
      } else if (chatDurationSec >= 10 && chatDurationSec < 60) {
        return 'F10S_T1MIN'
      } else if (chatDurationSec >= 60 && chatDurationSec < 120) {
        return 'F1MIN_T2MIN'
      } else if (chatDurationSec >= 120 && chatDurationSec < 180) {
        return 'F2MIN_T3MIN'
      } else {
        return 'F10_MORE'
      }
    },
    async connect() { // 检查变量并连接websocket
      this.buildWebsocket()
    },
    disconnect() {
      if (this.stompClient) {
        this.stompClient.disconnect(() => {
        })
      }
    },
    buildWebsocket() { // ws连接
      const random = this.generateRandom()
      const socket = new SockJs('/apiEngine/webSocket/tenant', [], {
        sessionId: () => {
          return random
        }
      })
      this.stompClient = Stomp.over(socket)
      this.stompClient.connect({ 'Cookie': document.cookie }, () => {
        // 前端mock去刷新
        // setInterval(() => {
        //   const res = {
        //     "body": {
        //       "code": 200,
        //       "data": {
        //         "robotCallJobId":1196,
        //         "chatRound" : 3,
        //         "chatDuration":1000,
        //         "resultStatus":"ANSWERED",
        //         "intentLevel": "A"
        //       }
        //     }
        //   }
        //   const data = res.body.data
        //   data.chatRoundBackKey = this.webSocketChatRound2BackKey(data.chatRound)
        //   data.chatDurationBackKey = this.webSocketChatDuration2BackKey(data.chatDuration)
        //   this.syncRefreshTask(data)
        // }, 2000)
        this.stompClient.subscribe('/user/queue/callStatsUpdateInfo', (res) => {
          this.parseData(res)
        })
      }, () => {
      })
    },
    parseData(res) { // 解析data
      if (res.body) {
        const body = JSON.parse(res.body)
        const { code, data } = body
        if (code === 200) {
          const info = data.info
          info.chatRoundBackKey = this.webSocketChatRound2BackKey(info.chatRound)
          info.chatDurationBackKey = this.webSocketChatDuration2BackKey(info.chatDuration)
          this.syncRefreshTask(info)
        }
      }
    },
    generateRandom() { // 生成随机字符串作为ws唯一标识
      const randomStr = Math.random().toString().slice(-6)
      const timeStamp = Date.parse(new Date()).toString()
      return randomStr + timeStamp
    },
    syncRefreshTask(syncCallStatusInfo) {
      const {
        robotCallJobId,
        chatRoundBackKey,
        chatDurationBackKey,
        intentLevel: intentLevelKey,
        resultStatus
      } = syncCallStatusInfo
      let completedTask = 0
      for (const item of this.taskList) {
        if (item.robotCallJobId === robotCallJobId) {
          completedTask = item.completedTask + 1
          break
        }
      }
      this.__updateTaskItem({ robotCallJobId, completedTask })
      if (robotCallJobId !== this.fullStatsInfo.robotCallJobId) {
        return
      }
      const {
        chatRound,
        chatDuration,
        intentLevel,
        dialResult,
        taskCallTotal = 0,
        answeredTask = 0
      } = this.fullStatsInfo
      let realAnswerTask = answeredTask
      let realTaskCallTotal = taskCallTotal
      const chatRoundNum = (chatRound[chatRoundBackKey] || 0) + 1
      const chatDurationNum = (chatDuration[chatDurationBackKey] || 0) + 1
      const intentLevelNum = (intentLevel[intentLevelKey] || 0) + 1
      const dialNum = (dialResult[resultStatus] || 0) + 1
      realTaskCallTotal += 1
      // 电话接通率
      if (resultStatus === 'ANSWERED') {
        realAnswerTask = answeredTask + 1
      }
      this.__updateTaskFullStats({
        taskCallTotal: realTaskCallTotal,
        answeredTask: realAnswerTask,
        chatRound: {
          ...chatRound,
          [chatRoundBackKey]: chatRoundNum
        },
        chatDuration: {
          ...chatDuration,
          [chatDurationBackKey]: chatDurationNum
        },
        intentLevel: {
          ...intentLevel,
          [intentLevelKey]: intentLevelNum
        },
        dialResult: {
          ...dialResult,
          [resultStatus]: dialNum
        }
      })
    }
  },
  destroyed() { // 销毁时断开连接
    this.disconnect()
  }
}

