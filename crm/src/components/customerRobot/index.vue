<template>
    <div>
        <div class="btn-container">
            <img @click="showDialog = !showDialog" src="/static/img/common_kefuxiaozhi.png" />
        </div>
        <transition name="fade">
        <div v-show="showDialog" class="layout-container">
            <div class="title">
                <div v-if="!loading">
                    客服小知
                </div>
                <div v-else>
                    客服小知正在回复您...
                </div>
                <div class="close" @click="showDialog = false">
                    关闭
                </div>
            </div>
            <div class="body" ref="msgContainer">
                <call-record-list
                  :dataSource="chatList"
                  :canListen="false"
                  robotAvatar="/static/img/common_kefuxiaozhi_touxiang.png"
                >
                </call-record-list>
            </div>
            <div class="input">
                <textarea v-model="data"
                @keydown.enter.exact.prevent
                @keyup.enter.exact="sendMessage"
                @keydown.enter.shift.exact="newLine"
                placeholder="输入您的问题"></textarea>
                <div class="send-container">
                    <div class="hint">
                        按Enter发送
                    </div>
                    <div @click="sendMessage()" class="btn">
                        发送
                    </div>
                </div>
            </div>
        </div>
        </transition>
    </div>

</template>

<script>
import { CallRecordList } from 'yiwise-components'
import * as chatBotAPI from '@/api/chatBot'
export default {
  name: 'customerRobot',
  components: {
    CallRecordList
  },
  data() {
    return {
      chatList: [{
        type: 'ROBOT',
        text: '您好，我是探意CRM的客服小知，请问有什么可以帮您？'
      }],
      data: '',
      showDialog: false,
      loading: false
    }
  },
  methods: {
    newLine() {
      this.data = `${this.data}\n`
    },
    async sendMessage() {
      const container = this.$refs.msgContainer
      // this.data = ''
      if (!this.data) {
        return
      }
      this.loading = true
      const question = `${this.data}`
      this.data = ''
      this.chatList.push({
        text: question
      })
      this.$nextTick(() => {
        container.scrollTop = container.scrollHeight
      })
      try {
        const { data } = (await chatBotAPI.ask({
          question
        })).data
        this.chatList.push({
          type: 'ROBOT',
          text: data
        })
        this.loading = false
        this.$nextTick(() => {
          container.scrollTop = container.scrollHeight
        })
      } catch (error) {
        console.log(error)
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.out {
    transform: translateX(0px);
}
.btn-container {
    box-shadow: -1px 2px 10px 0px
		rgba(77, 77, 77, 0.26);
	border-radius: 20px 0px 0px 20px;
    display: flex;
    align-items: center !important;
    position: fixed;
    width: 60px;
    height: 41px;
    bottom: 20px;
    right: 0px;
    z-index: 3000;
    border-radius: 100px 0px 0px 100px;
    background-color: #ffffff;
    transform: translateX(30px);
    transition: transform 0.8s;
    cursor: pointer;
    img {
        height: 30px;
        cursor: pointer;
        margin-left: 8px;
    }
}
.btn-container:hover {
    transform: translateX(0px);
}
.layout-container {
    box-shadow: -1px 2px 20px 0px
		rgba(59, 71, 118, 0.3);
	border-radius: 4px;
    position: fixed;
    width: 469px;
    height: 519px;
    bottom: 20px;
    right: 10px;
    background-color: #f9f9f9;
    z-index: 3000;

    .title {
        font-size: 15px;
        color: #ffffff;
        padding: 0px 20px;
        height: 49px;
        background-color: #00c14d;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .close {
            cursor: pointer;
        }
    }
    .body {
        height: 374px;
        overflow: auto;
        /deep/ .record-item-right .text {
                background-color: #00c14d;
        }
        /deep/ .record-item-right .text::after {
            border-top: 4px solid #00c14d;
            border-left: 4px solid #00c14d;
        }
    }
    .input {
        position: relative;
        height: 96px;
        background-color: #ffffff;
        textarea {
            padding: 12px;
            font-size: 16px;
            height: 52px;
            width: 100%;
            border: none;
            outline:none;
            resize: none;
        }
        .send-container {
            position: absolute;
            right: 10px;
            bottom: 10px;
            display: flex;
            .hint {
                font-size: 12px;
                color: #6e6b6b;
                display: flex;
                align-items: center;
                padding-right: 10px;
            }
            .btn {
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 14px;
                color: #ffffff;
                width: 67px;
                height: 33px;
                background-image: linear-gradient(
                    #00c14d,
                    #00c14d),
                linear-gradient(
                    #ffffff,
                    #ffffff);
                background-blend-mode: normal,
                    normal;
                border-radius: 3px;
                align-items: center;
            }
        }
    }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
