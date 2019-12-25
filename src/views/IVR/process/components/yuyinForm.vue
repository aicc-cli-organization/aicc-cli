<template>
  <commonForm
    ref="form"
    firstLabel="语音节点名称"
    :form="form"
    :rules="rules"
    :editData="editData"
    @cancel="cancel"
    @submit="submitTime"
  >
    <div class="title">播放内容</div>
    <div class="time-container">
      <luyin
        ref="luyin"
        :nodeId="editData.id"
        :initialAudio="audio"
        :initialAudioType="audioType"
        :initialTtsName="audioName"
        :initialAudioText="audioText"
        @success="handleLuyinSuccess"
      ></luyin>
    </div>
    <div>
      <el-checkbox v-model="form.interrupt">允许打断</el-checkbox>
    </div>
  </commonForm>
</template>

<script>
import voiceTypeEnum from '@/utils/enum'
import luyin from './luyin'
import { cloneJSON } from '@/utils'
import { saveNode, updateNode } from '@/api/ivr'
import commonForm from './commonForm'

export default {
  props: {
    editData: [Object],
    nodeIndex: [Number],
    type: [String],
    myDiagram: [Object, undefined]
  },
  components: { luyin, commonForm },
  data() {
    return {
      form: {
        nodeName: '',
        interrupt: true
      },
      rules: {
        nodeName: [
          { required: true, message: '请输入节点名称' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ]
      },
      audioType: 'MAN_MADE',
      audioName: '',
      audioText: '',
      audio: ''
    }
  },
  watch: {
    editData() {
      this.initData()
    }
  },
  computed: {
    selectIVRId() {
      return this.$store.state.ivr.selectIVRId
    }
  },
  methods: {
    handleLuyinSuccess({ audio, audioType, audioName, audioText }) {
      this.audio = audio
      this.audioType = audioType
      this.audioName = audioName
      this.audioText = audioText
    },
    submitTime() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          let { data } = await (this.editData.id ? updateNode : saveNode)({
            ivrNavigationInfoId: this.selectIVRId,
            data: {
              id: this.editData.id || undefined,
              name: this.form.nodeName,
              type: 'AUDIO', // 节点类型 START 开始节点 TIME 时间节点 AUDIO 语音节点 CHOOSE 选择节点 RECEPTION 接待节点 HANGUP 挂断节点
              webData: this.myDiagram.model.findNodeDataForKey(this.editData.key).loc,
              audio: {
                audioUrls: this.audio ? [this.audio] : undefined, // .replace(/https:\/\/.*\.aliyuncs\.com/, '')
                interrupt: this.form.interrupt,
                audioType: this.audioType,
                audioName: this.audioName,
                audioText: this.audioText
                // ,
                // prefixAudioUrls: this.audio ? [this.audio] : undefined
              }
            }
          })
          data = data.data

          this.$message.success('保存成功')

          this.$emit('succuss', {
            ...data,
            loc: data.webData,
            id: data.id,
            nodeName: data.name,
            preKey: this.editData.key,
            audio: {
              ...data.audio,
              lastAudioText: data.audio.audioText,
              ttsAudio: this.$refs.luyin.ttsAudio
            }
          })
        }
      })
    },
    cancel() {
      this.initData()
    },
    hasWrongData(hasWrongcb, noWrongcb) {
      if (this.type === 'add') {
        hasWrongcb()
      } else {
        const { audioType, audioName, audioText, prefixAudioUrls, interrupt } = (this.editData.audio || {})

        if(this.form.nodeName !== this.editData.nodeName ||
          this.form.interrupt !== interrupt ||
          this.audioType !== audioType ||
          this.audioName !== audioName ||
          this.audioText !== audioText ||
          (((!prefixAudioUrls || !prefixAudioUrls.length) && this.audio)
              || (prefixAudioUrls && prefixAudioUrls.length && prefixAudioUrls[0] !== this.audio))) {
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
          nodeName: '语音节点' + this.nodeIndex,
          interrupt: true
        }
        this.audioType = 'MAN_MADE'
        this.audioName = ''
        this.audioText = ''
        this.audio = ''
      } else {
        Object.keys(this.form).forEach(key => this.form[key] = this.editData[key])

        const { audioType, audioName, audioText, prefixAudioUrls, interrupt } = (this.editData.audio || {})
        this.audioType = audioType || ''
        this.audioName = audioName || ''
        this.audioText = audioText || ''
        this.audio = prefixAudioUrls ? prefixAudioUrls[0] || '' : ''
        this.form.interrupt = !!interrupt
      }
    }
  },
  mounted() {
    this.initData()
  }
}
</script>

<style lang="scss" scoped>
  $-yuyin-hover-bg: #f2f2f2;
  .yuyin-container {
    height: 56px;
    .yuyin-container-inner {
      position: absolute;
      left: -12px;
      right: -12px;
      padding: 0 12px;
      height: 56px;
      display: flex;
      align-items: center;
      &:hover {
        background: $-yuyin-hover-bg;
      }
      img {
        width: 20px;
        height: 20px;
      }
      .audio-name {
        margin-left: 11px;
      }
      .right-img {
        position: absolute;
        right: 12px;
      }
    }
  } 
</style>

