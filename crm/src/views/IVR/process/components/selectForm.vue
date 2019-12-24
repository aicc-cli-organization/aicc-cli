<template>
  <div class="form-con">
    <el-form ref="form" :model="form" :rules="rules" label-width="0">
      <div class="head">
        <div class="title">选择节点名称</div>
        <el-form-item label="" prop="nodeName">
          <el-input v-model="form.nodeName" placeholder="请输入节点名称"></el-input>
        </el-form-item>
      </div>
      <div class="content">
        <div class="title no-border">选择提示音
          <el-tooltip class="item" effect="dark" content="进入节点即播放该音频，一般为可选内容的描述" placement="top">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
        <div class="time-container">
          <el-form-item label="" prop="chatAudio">
            <luyin
              ref="chatAudioLuyin"
              :nodeId="editData.id"
              :initialAudio="chatAudio.audio"
              :initialAudioType="chatAudio.audioType"
              :initialTtsName="chatAudio.audioName"
              :initialAudioText="chatAudio.audioText"
              @success="handleChatLuyinSuccess"
            ></luyin>
          </el-form-item>
        </div>
        <div class="border-after">
          <el-checkbox v-model="chatAudio.interrupt">允许打断</el-checkbox>
        </div>

        <div class="BFC block">
          <div class="title">按键/识别分支配置</div>
          <div>
            <el-checkbox v-model="form.buttonRecognize" label="按键">按键</el-checkbox>
            <el-checkbox v-model="form.aiRecognize" label="AI">AI</el-checkbox>
          </div>
        </div>

        <div class="keyboard-container border-after">
          <div class="keyboard flex-center" :title="item.code + item.name" v-for="(item, key) in dtmfmap" :key="key">
            <el-checkbox :label="item.code" v-model="item.enabledStatus">{{item.code + item.name}}</el-checkbox>
            <i class="iconfont icon-edited pointer" :style="{'marginRight': item.name.length ? '9px' : '9px'}" @click="handleEditBranch(item)"></i>
          </div>
        </div>

        <div class="BFC block no-border border-after">
          <div class="title">按错/未识别提示音配置
            <el-tooltip class="item" effect="dark" content="按错键或未成功识别语音时播放该音频" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </div>
          <div class="time-container">
            <el-form-item label="" prop="unRecognizeAudio">
              <luyin
                ref="unRecognizeAudioluyin"
                :nodeId="editData.id"
                :initialAudio="unRecognizeAudio.audio"
                :initialAudioType="unRecognizeAudio.audioType"
                :initialTtsName="unRecognizeAudio.audioName"
                :initialAudioText="unRecognizeAudio.audioText"
                @success="handleunRecognizeAudioSuccess"
              ></luyin>
            </el-form-item>
          </div>
          <div>
            <el-checkbox v-model="unRecognizeAudio.interrupt">允许打断</el-checkbox>
          </div>
          <el-input-number class="mt14" v-model="form.unRecognizeTimes" controls-position="right" :min="1" :max="5"></el-input-number>
          <span>次按错/未识别走按错节点</span>
        </div>

        <div class="BFC block no-border">
          <div class="title">超时配置</div>
          <el-input-number v-model="form.noResponseSecond" controls-position="right" :min="1" :max="10"></el-input-number>
          <span>秒未按键/未听到语音 判定为无响应</span>
          <div class="title">无响应提示音
            <el-tooltip class="item" effect="dark" :content="`当${customerStr}无响应时播放该音频`" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </div>
          <div class="time-container">
            <el-form-item label="" prop="noResponseAudio">
              <luyin
                ref="noResponseAudioLuyin"
                :nodeId="editData.id"
                :initialAudio="noResponseAudio.audio"
                :initialAudioType="noResponseAudio.audioType"
                :initialTtsName="noResponseAudio.audioName"
                :initialAudioText="noResponseAudio.audioText"
                @success="handlenoResponseAudioSuccess"
              ></luyin>
            </el-form-item>
          </div>
          <div>
            <el-checkbox v-model="noResponseAudio.interrupt">允许打断</el-checkbox>
          </div>
          <el-input-number class="mt14" v-model="form.noResponseTimes" controls-position="right" :min="1" :max="5"></el-input-number>
          <span>次无响应，判定为超时</span>
        </div>
          
      </div>
      <div class="footer">
        <div class="title">最后修改</div>
        <div class="info">
          <span>{{editData.updateUserName}}</span>
          <span>{{editData.updateTime}}</span>
        </div>
      </div>
    </el-form>
    <div class="footer-btns">
      <el-button @click="cancel">重置</el-button>
      <el-button type="primary" @click="submitTime">确定</el-button>
    </div>
    <yiwise-dialog
      class="yuyin-dialog"
      title="语音设置"
      :visible.sync="dialogVisible"
      @open="handleDialogOpen"
      @close="handleDialogClose"
      @confirm="handleSubmit"
    >
      <el-form
        ref="yuyinForm"
        label-width="100px"
        :model="formData"
        :rules="rules1"
      >
        <el-form-item label="分支名称：" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分支名称">
            <span slot="prepend" v-if="form.buttonRecognize || !form.aiRecognize">{{formData.code}}</span>
          </el-input>
        </el-form-item>
        <el-form-item label="关键词">
          <keyword-input
            ref="keywordInput"
            :tagList.sync="formData.keyWords"
            :fetchWords="false"
            :disabled="!form.aiRecognize"
          >
          </keyword-input>
        </el-form-item>
      </el-form>
    </yiwise-dialog>
  </div>
</template>

<script>
import { YiwiseDialog, KeywordInput } from 'yiwise-components'
import voiceTypeEnum from '@/utils/enum'
import { cloneJSON } from '@/utils'
import { getChooseIntentBranches } from '../utils'
import { saveNode, updateNode } from '@/api/ivr'
import luyin from './luyin'
import { mapGetters } from 'vuex'

export default {
  props: {
    editData: [Object],
    nodeIndex: [Number],
    type: [String],
    myDiagram: [Object, undefined]
  },
  components: { luyin, YiwiseDialog, KeywordInput },
  data() {
    const validAudio = (audioDataKey) => {
      return (rule, value, callback) => {
        const { audioType, audio, audioText } = this[audioDataKey]

        if ((audioType === 'MAN_MADE' && !audio) || (audioType === 'COMPOSE' && !audioText)) {
          callback(new Error('请上传录音文件'))
        } else {
          callback()
        }
      }
    }

    return {
      form: {
        nodeName: '',
        buttonRecognize: true,
        aiRecognize: false,
        unRecognizeTimes: 3,
        noResponseSecond: 5,
        noResponseTimes: 3
      },
      rules: {
        nodeName: [
          { required: true, message: '请输入节点名称' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ],
        unRecognizeAudio: [
          { validator: validAudio('unRecognizeAudio') }
        ],
        noResponseAudio: [
          { validator: validAudio('noResponseAudio') }
        ],
        chatAudio: [
          { validator: validAudio('chatAudio') }
        ]
      },
      formData: {
        code: '',
        keyWords: [],
        name: ''
      },
      rules1: {
        name: [
          // { required: true, message: '请输入分支名称' },
          { min: 1, max: 8, message: '长度在1到8个字符' }
        ]
      },
      dialogVisible: false,
      chatAudio: {
        audioType: 'MAN_MADE',
        audioName: '',
        audioText: '',
        audio: '',
        interrupt: true
      },
      unRecognizeAudio: {
        audioType: 'MAN_MADE',
        audioName: '',
        audioText: '',
        audio: '',
        interrupt: true
      },
      noResponseAudio: {
        audioType: 'MAN_MADE',
        audioName: '',
        audioText: '',
        audio: '',
        interrupt: false
      },
      btnKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '#'],
      dtmfmap: {}
    }
  },
  computed: {
    ...mapGetters(['customerStr']),
    selectIVRId() {
      return this.$store.state.ivr.selectIVRId
    }
  },
  watch: {
    editData() {
      this.initData()
    }
  },
  methods: {
    submitTime() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          let { data } = await (this.editData.id ? updateNode : saveNode)({
            ivrNavigationInfoId: this.selectIVRId,
            data: {
              id: this.editData.id || undefined,
              name: this.form.nodeName,
              type: 'CHOOSE', // 节点类型 START 开始节点 TIME 时间节点 AUDIO 语音节点 CHOOSE 选择节点 RECEPTION 接待节点 HANGUP 挂断节点
              webData: this.myDiagram.model.findNodeDataForKey(this.editData.key).loc,
              aiRecognize: false,
              buttonRecognize: this.form.buttonRecognize,
              aiRecognize: this.form.aiRecognize,
              unRecognizeTimes: this.form.unRecognizeTimes,
              noResponseSecond: this.form.noResponseSecond,
              noResponseTimes: this.form.noResponseTimes,
              dtmfmap: this.dtmfmap,
              nodeMap: this.editData.nodeMap || undefined,
              chatAudio: {
                audioUrls: this.chatAudio.audio ? [this.chatAudio.audio] : undefined,
                interrupt: this.chatAudio.interrupt,
                audioType: this.chatAudio.audioType,
                audioName: this.chatAudio.audioName,
                audioText: this.chatAudio.audioText,
                // prefixAudioUrls: this.chatAudio.audio ? [this.chatAudio.audio] : undefined
              },
              unRecognizeAudio: {
                audioUrls: this.unRecognizeAudio.audio ? [this.unRecognizeAudio.audio] : undefined,
                interrupt: this.unRecognizeAudio.interrupt,
                audioType: this.unRecognizeAudio.audioType,
                audioName: this.unRecognizeAudio.audioName,
                audioText: this.unRecognizeAudio.audioText,
                // prefixAudioUrls: this.unRecognizeAudio.audio ? [this.unRecognizeAudio.audio] : undefined
              },
              noResponseAudio: {
                audioUrls: this.noResponseAudio.audio ? [this.noResponseAudio.audio] : undefined,
                interrupt: this.noResponseAudio.interrupt,
                audioType: this.noResponseAudio.audioType,
                audioName: this.noResponseAudio.audioName,
                audioText: this.noResponseAudio.audioText,
                // prefixAudioUrls: this.noResponseAudio.audio ? [this.noResponseAudio.audio] : undefined
              }
            }
          })
          data = data.data

          this.$message.success('保存成功')

          const intentBranches = getChooseIntentBranches(data)
          this.$emit('succuss', {
            ...data,
            loc: data.webData,
            id: data.id,
            nodeName: data.name,
            preKey: this.editData.key,
            dtmfmap: data.dtmfmap,
            intentBranches,
            chatAudio: {
              ...data.chatAudio,
              lastAudioText: data.chatAudio.audioText,
              ttsAudio: this.$refs.chatAudioLuyin.ttsAudio
            },
            unRecognizeAudio: {
              ...data.unRecognizeAudio,
              lastAudioText: data.unRecognizeAudio.audioText,
              ttsAudio: this.$refs.unRecognizeAudioluyin.ttsAudio
            },
            noResponseAudio: {
              ...data.noResponseAudio,
              lastAudioText: data.noResponseAudio.audioText,
              ttsAudio: this.$refs.noResponseAudioLuyin.ttsAudio
            }
          })
        }
      })
    },
    handleDialogOpen() {
      
    },
    handleDialogClose() {
      this.audio = ''
    },
    handleSubmit() {
      this.$refs.yuyinForm.validate(async(valid) => {
        if (valid) {
          this.dtmfmap[this.formData.code].name = this.formData.name
          this.dtmfmap[this.formData.code].keyWords = this.formData.keyWords
          this.dialogVisible = false
        }
      })
    },
    handleEditBranch(item) {
      this.formData.name = item.name
      this.formData.code = item.code
      this.formData.keyWords = item.keyWords || []
      this.dialogVisible = true
    },
    cancel() {
      this.initData()
    },
    handleChatLuyinSuccess({ audio, audioType, audioName, audioText }) {
      this.chatAudio.audio = audio
      this.chatAudio.audioType = audioType
      this.chatAudio.audioName = audioName
      this.chatAudio.audioText = audioText
      this.$refs.form.validateField('chatAudio')
    },
    handleunRecognizeAudioSuccess({ audio, audioType, audioName, audioText }) {
      this.unRecognizeAudio.audio = audio
      this.unRecognizeAudio.audioType = audioType
      this.unRecognizeAudio.audioName = audioName
      this.unRecognizeAudio.audioText = audioText
      this.$refs.form.validateField('unRecognizeAudio')
    },
    handlenoResponseAudioSuccess({ audio, audioType, audioName, audioText }) {
      this.noResponseAudio.audio = audio
      this.noResponseAudio.audioType = audioType
      this.noResponseAudio.audioName = audioName
      this.noResponseAudio.audioText = audioText
      this.$refs.form.validateField('noResponseAudio')
    },
    hasWrongData(hasWrongcb, noWrongcb) {
      if (this.type === 'add') {
        hasWrongcb()
      } else {
        let dtmfmapChanged = false
        for (const code in this.dtmfmap) {
          if (['name', 'enabledStatus'].find(key => this.dtmfmap[code][key] !== this.editData.dtmfmap[code][key])) {
            dtmfmapChanged = true
            break
          }
          if (this.dtmfmap[code].keyWords.toString() !== this.editData.dtmfmap[code].keyWords.toString()) {
            dtmfmapChanged = true
            break
          }
        }

        let audioChanged = false
        ;['chatAudio', 'unRecognizeAudio', 'noResponseAudio'].forEach(audioKey => {
          const audio = this[audioKey]
          const initialAudio = this.editData[audioKey]

          if (audio.interrupt !== initialAudio.interrupt ||
            audio.audioType !== initialAudio.audioType ||
            audio.audioName !== initialAudio.audioName ||
            audio.audioText !== initialAudio.audioText ||
            (((!initialAudio.prefixAudioUrls || !initialAudio.prefixAudioUrls.length) && audio.audio)
              || (initialAudio.prefixAudioUrls && initialAudio.prefixAudioUrls.length && initialAudio.prefixAudioUrls[0] !== audio.audio))) {
            audioChanged = true
          }
        })

        if(Object.keys(this.form).find(key => this.form[key] !== this.editData[key]) || dtmfmapChanged || audioChanged) {
          hasWrongcb()
        } else {
          noWrongcb()
        }
      }
    },
    initData() {
      this.savedOrSaving = false
      this.$refs.form.resetFields()

      if (this.type === 'add') {
        this.form = {
          nodeName: '选择节点' + this.nodeIndex,
          buttonRecognize: true,
          aiRecognize: false,
          unRecognizeTimes: 3,
          noResponseSecond: 5,
          noResponseTimes: 3
        }

        this.dtmfmap = (initialObj => {
          this.btnKeys.forEach(btnKey => {
            initialObj[btnKey] = {
              code: btnKey,
              name: '',
              keyWords: [],
              enabledStatus: false
            }
          })
          return initialObj
        })({});

        ['chatAudio', 'unRecognizeAudio', 'noResponseAudio'].forEach(audioKey => {
          const audio = this[audioKey]
          audio.audioType = 'MAN_MADE'
          audio.audioName = ''
          audio.audioText = ''
          audio.audio = ''
          audio.interrupt = true
        })
      } else {
        Object.keys(this.form).forEach(key => this.form[key] = this.editData[key])

        this.dtmfmap = cloneJSON(this.editData.dtmfmap);

        ['chatAudio', 'unRecognizeAudio', 'noResponseAudio'].forEach(audioKey => {
          const audio = this[audioKey]

          const { audioType, audioName, audioText, prefixAudioUrls, interrupt } = (this.editData[audioKey] || {})
          audio.audioType = audioType || ''
          audio.audioName = audioName || ''
          audio.audioText = audioText || ''
          audio.audio = prefixAudioUrls ? prefixAudioUrls[0] || '' : ''
          audio.interrupt = !!interrupt
        })
      }
    }
  },
  mounted() {
    this.initData()
  }
}
</script>

<style lang="scss" scoped>
  @import 'src/styles/placeholder.scss';
  $--color-borer: #d8d9de;
  
  .keyboard-container {
    display: flex;
    flex-wrap: wrap;
    .keyboard {
      max-width: 63px;
      flex: 1 1 33%;
      justify-content: space-between;
      .icon-edited {
        font-size: 12px;
        margin-right: 0px;
        margin-top: -2px;
        font-weight: 500;
      }
      .el-checkbox {
        max-width: 51px;
        @extend %ellipsis;
      }
      /deep/ .el-checkbox__label {
        padding-left: 5px;
      }
    }
  }
  .time-container {
    border: none !important;
    margin-bottom: 0 !important;
  }
  .mt14 {
    margin-top: 14px;
  }
</style>

