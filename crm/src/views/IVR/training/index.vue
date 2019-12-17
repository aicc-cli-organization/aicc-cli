<template>
  <div class="section-ivr-test">
    <div class="call-pane">
      <div class="call-pane-box">
        <a class="call-btn" v-if="callStatus === 'pickup'" @click="hangup">
          <img src="/static/ivr/guaduan@2x.png" alt="">
        </a>
        <a
          :disabled="callBtnLoading"
          v-else
          class="call-btn"
          @click="innerConnect"
        >
          <img src="/static/ivr/bohao@2x.png" alt="" v-if="!callBtnLoading">
          <i class="el-icon-loading" v-else></i>
        </a>
        <div class="btn-tip">{{callText}}</div>
        <div class="monitor-box">
          <div class="monitor-title">测试模拟机</div>
          <div class="dial-keyboard">
            <a v-for="(item, index) in keyboardNumList" :key="index">
              <div class="dial-keyboard-item" @click="onNavigationNum(item[0])">
                <p class="main">{{item[0]}}</p>
                <p v-if="item[1]" class="sub">{{item[1]}}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
      <audio
        controls
        ref="audio"
        class="audio"
      >
      </audio>
    </div>
    <call-record-list
      :dataSource="dialogDataList"
      trainingType="ivr"
      class="record-list"
      :keepScrollIntoView="true"
    ></call-record-list>
  </div>
</template>

<script>
import { CallRecordList } from 'yiwise-components'
import * as IVRAPI from '@/api/ivr'
import SIP from '@/assets/sip'
import IVRTraningWebSocket from '@/mixins/ivrTraningWebSocket'

const keyboardNumList = [
  [1], [2, 'ABC'], [3, 'DEF'],
  [4, 'GHI'], [5, 'JKL'], [6, 'MNO'],
  [7, 'PQRS'], [8, 'TUV'], [9, 'WXYZ'],
  ['*'], [0, '+'], ['#']
]

export default {
  mixins: [IVRTraningWebSocket],
  components: {
    CallRecordList
  },
  data() {
    return {
      keyboardNumList,
      simple: null
    }
  },
  methods: {
    async getAccountAndRegister() {
      const res = await IVRAPI.fetchAccountInfo()
      const { sipAccount, sipPassword } = res.data.data
      let freeSwitchIP = ''
      const freeSwitchPort = '7443'
      if (location.origin.indexOf('.tanyibot') !== -1) {
        freeSwitchIP = 'training.tanyibot.com'
      } else {
        freeSwitchIP = 'training.yiwise.com'
      }
      const uaOptions = {
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
      this.simple.on('ringing', () => {
        // 监听呼入事件
        this.simple.answer()
      })
      this.simple.ua.on('registrationFailed', () => {
        // 监听ua注册失败事件
        this.$message.error('通信设备注册失败，请联系管理员')
      })
    },
    innerConnect() {
      if (this.disconnect) {
        this.disconnect()
        if (this.simple) {
          this.simple.ua.stop() // 断开上一次sip连接
          this.getAccountAndRegister() // 重新注册fs
        }
      }
      if (this.connect) {
        this.connect({
          sendUrl: '/app/ivrVerbalTrickTraining',
          ivrNavigationId: this.selectIVRId
        })
      }
    },
    onNavigationNum(num) {
      this.simple.sendDTMF(num)
    },
    hangup() {
      if (this.simple && this.callStatus === 'pickup') {
        this.simple.hangup()
      }
    }
  },
  computed: {
    callText() {
      // 提示文案
      switch (this.callStatus) {
        case 'none':
          return '点击拨打，进行训练测试'
        case 'call-success':
        case 'ringing':
          return '发起成功，正在呼叫...'
        case 'pickup':
          return '训练中，点此可随时挂机'
        default:
          return ''
      }
    },
    selectIVRId() {
      return this.$store.state.ivr.selectIVRId
    }
  },
  mounted() {
    this.getAccountAndRegister()
  },
  watch: {
    selectIVRId() {
      this.callStatus = 'none'
      this.callBtnLoading = false
      this.dialogDataList = []
      this.disconnect()
      if (this.simple) {
        this.simple.ua.stop() // 断开上一次sip连接
        this.getAccountAndRegister() // 重新注册fs
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

.section-ivr-test {
  display: flex;
  background-color: #f9f9f9;
  height: 100%;
  .call-pane {
    width: 357px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background-color: white;
    .call-pane-box {
      flex: 1;
      padding: 50px 18px 0;
      width: 100%;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
      text-align: center;
    }
    .call-btn {
      display: inline-block;
      width: 64px;
      height: 64px;
      line-height: 62px;
      border-radius:16px;
      text-align: center;
      background: linear-gradient(180deg,rgba(103,255,129,1) 0%,rgba(1,180,31,1) 100%);
      > i {
        font-size: 40px;
        color: white;
        line-height: inherit !important;
      }
      > img {
        width: 64px;
        height: 64px;
      }
    }
    .btn-tip {
      margin-top: 10px;
    }
    .monitor-box {
      position: relative;
      border: 7px solid #E3E3E3;
      box-shadow: 4px 4px 6px 0px rgba(157,157,157,0.5);
      border-radius: 41px;
      height: 634px;
      margin-top: 32px;
      overflow: hidden;
      &::before {
        content: '';
        display: block;
        position: absolute;
        width: 50%;
        left: 50%;
        transform: translate(-50%, -20px);
        background-color: #E3E3E3;
        border-radius: 12px;
        height: 40px;

      }
      .monitor-title {
        font-size: 14px;
        color: #666666;
        line-height: 20px;
        margin-top: 79px;
        margin-bottom: 70px;
      }
    }
    .dial-keyboard {
      margin-top: 30px;
      display: grid;
      grid-template-columns: 33% 33% 33%;
      grid-template-rows: 64px 64px 64px 64px;
      grid-gap: 13px 0px;
      > a {
        display: flex;
        justify-content: center;
        &:hover {
          .dial-keyboard-item {
            background-color: #C2C2C2;
          }
        }
      }
      .dial-keyboard-item {
        width: 64px;
        height: 64px;
        background-color: #E5E5E5;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        > p {
          padding: 0;
          margin: 0;
          &.main {
            font-size: 31px;
            font-weight: 700;
          }
        }
      }
    }
    > .audio {
      opacity: 0;
      position: absolute;
      z-index: -1;
    }
  }
  > .record-list {
    flex-grow: 1;
    background: $bodyBg;
    // margin-bottom: 10px;
  }
}
</style>
