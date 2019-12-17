import SockJs from 'sockjs-client'
import Stomp from 'stompjs'
import { mapGetters } from 'vuex'
import { globalNotifyForArtiJoin } from '@/utils/notification'

export default {
  name: 'ArtificialJoinWebSocketMixin',
  computed: {
    ...mapGetters(['artificialStatus', 'enableCsTransfer', 'artiJoinList'])
  },
  methods: {
    async connect() { // 检查变量并连接websocket
      const random = this.generateRandom()
      const socket = new SockJs('/apiEngine/webSocket/userClient', [], {
        sessionId: () => {
          return random
        }
      })
      this.stompClient = Stomp.over(socket)
      this.stompClient.connect({ 'Cookie': document.cookie }, () => {
        this.$emit('connected') // 连接成功
        this.stompClient.subscribe('/user/queue/callJobCsStaffTransferMsg', (res) => {
          this.processData(res)
        })
      }, () => {
        this.$store.commit('SET_ARTIFICIAL_STATUS', 'offline')
        this.$emit('error')
      })
    },
    disconnect() {
      if (this.stompClient) {
        this.stompClient.disconnect(() => {
          this.$emit('disconnected')
        })
      }
    },
    generateRandom() { // 生成随机字符串作为ws唯一标识
      const randomStr = Math.random().toString().slice(-6)
      const timeStamp = Date.parse(new Date()).toString()
      return randomStr + timeStamp
    },
    processData(res) { // 处理返回的数据
      if (res.body) {
        const body = JSON.parse(res.body)
        const { code, data, resultMsg } = body
        if (code === 200) {
          const { info = {}} = data
          const { callStatus, identifyId } = info
          if (callStatus === 'HANGUP') { // 若为hangup类型，则遍历数组替换
            let index = -1
            this.artiJoinList.forEach((item, i) => {
              if (item.identifyId === identifyId) {
                index = i
              }
            })
            if (index !== -1) {
              this.$store.commit('DELETE_ARTI_JOIN_LIST', index)
            }
          } else { // 若为talking类型，则直接添加进数组
            const { customerPersonPhoneNumber } = info
            globalNotifyForArtiJoin(customerPersonPhoneNumber)
            this.$store.commit('PUSH_ARTI_JOIN_LIST', info)
          }
        } else {
          this.$message.error(resultMsg)
        }
      }
    }
  }
}
