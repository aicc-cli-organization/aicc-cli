<template>
  <div>
    <el-button class="yuyin-config" type="primary" @click="addAudio" v-if="!initialAudioUrl" :loading="ttsCompositing">{{ttsCompositing ? 'tts合成中' : '语音配置'}}</el-button>
    <template v-else>
      <div class="relative yuyin-container">
        <luyinTemp :type="initialAudioType === 'MAN_MADE' ? '' : 'tts'" :url="initialAudioUrl" :audioName="initialAudioName" v-if="initialAudioUrl"></luyinTemp>
      </div>
      <el-button class="yuyin-config" type="primary" @click="editAudio" :loading="ttsCompositing">{{ttsCompositing ? 'tts合成中' : '修改语音配置'}}</el-button>
    </template>
    <yiwise-dialog
      class="yuyin-dialog"
      title="语音设置"
      :visible.sync="dialogVisible"
      @close="handleDialogClose"
      @open="handleDialogOpen"
      @confirm="handleSubmit"
    >
      <el-form
        ref="yuyinForm"
        label-width="100px"
        :model="formData"
        :rules="rules"
      >
        <el-form-item label="选择线路：" prop="voiceType">
          <el-radio-group v-model="formData.voiceType" @change="handleVoiceTypeChange">
            <el-radio v-for="(value, key) in voiceTypeEnum" :label="key" :key="key">{{value}}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="_voiceName1" v-show="formData.voiceType === 'MAN_MADE'">
          <span slot="label"><span class="red-star">*</span> 语音名称：</span>
          <el-input v-model="formData.voiceName" placeholder="请输入语音名称"></el-input>
        </el-form-item>
        <el-form-item label="语音内容：" prop="_voiceStr1" v-show="formData.voiceType === 'MAN_MADE'">
          <el-input type="textarea" resize="none" v-model="formData.voiceStr" placeholder="请输入需要合成的文本内容"></el-input>
        </el-form-item>
        <el-form-item label="" label-width="0" prop="audio" v-show="formData.voiceType === 'MAN_MADE'">
          <el-upload
            class="upload"
            ref="upload"
            action="/apiEngine/upload/uploadRecord"
            :show-file-list="false"
            :data="{
              ivrNavigationInfoId: selectIVRId,
              nodeId: nodeId || null
            }"
            :before-upload="beforeAvatarUpload"
            :limit="10000"
            :on-error="handleUploadError"
            :on-success="handleAvatarSuccess"
            :on-exceed="handleExceed"
            :on-remove="handleRemove"
          >
            <el-button slot="trigger" size="small" type="primary">{{audio ? '重新上传' : '点击上传'}}</el-button>
            <luyinTemp ref="realPersonAudio" :url="audio" :audioName="formData.voiceName || '请输入语音名称'" v-if="audio"></luyinTemp>
            <div slot="tip" class="el-upload__tip">只能上传格式为wav的音频文件，不超过 20 MB大小！</div>
          </el-upload>
        </el-form-item>

        <el-form-item prop="_voiceName" v-show="formData.voiceType !== 'MAN_MADE'">
          <span slot="label"><span class="red-star">*</span> 语音名称：</span>
          <el-input v-model="formData.voiceName" placeholder="请输入语音名称"></el-input>
        </el-form-item>
        <el-form-item prop="_voiceStr" v-show="formData.voiceType !== 'MAN_MADE'">
          <span slot="label"><span class="red-star">*</span> AI合成话术：</span>
          <el-input type="textarea" resize="none" v-model="formData.voiceStr" placeholder="请输入需要合成的文本内容"></el-input>
        </el-form-item>
        <el-form-item v-show="formData.voiceType !== 'MAN_MADE'">
          <div class="tts-container">
            <el-button size="small" type="primary" :disabled="!formData.voiceStr" @click="ttsListening" :loading="ttsCompositing">{{ttsCompositing ? 'tts合成中' : '合成试听'}}</el-button>
            <luyinTemp ref="ttsPersonAudio" type="tts" :url="ttsAudio" :audioName="ttsAudioName" v-if="ttsAudio"></luyinTemp>
          </div>
        </el-form-item>
      </el-form>
    </yiwise-dialog>
  </div>
</template>

<script>
import { voiceTypeEnum } from '@/utils/enum'
import { YiwiseDialog, YiwiseAudio } from 'yiwise-components'
import { uploadAudio, ttsListening } from '@/api/ivr'
import { parseAudio } from '../audio'
import { getTtsAudio } from '../utils'
import recordDialog from './recordDialog'
import myAudio from './myAudio'

export default {
  props: ['nodeId', 'initialAudio', 'initialAudioType', 'initialTtsName', 'initialAudioText'],
  components: {
    YiwiseDialog,
    luyinTemp: {
      components: { YiwiseAudio, recordDialog, myAudio },
      props: {
        type: {
          type: String,
          default: ''
        },
        url: {
          type: String,
          default: ''
        },
        audioName: {
          type: String,
          default: 'ivr导航录音文件'
        }
      },
      computed: {
        src() {
          return this.type === 'tts' ? '/static/img/tts.png' : '/static/img/realPerson.png'
        }
      },
      data() {
        return {
          playing: false,
          showAudioDialog: false
        }
      },
      methods: {
        play() {
          // this.$refs.audioTag.play()
          // this.playing = true
        },
        pause() {
          this.$refs.audioTag.pause()
          // this.playing = false
        },
        togglePlay() {
          // this.playing ? this.pause() : this.play()
          this.showAudioDialog = true
        }
      },
      //<recordDialog :defaultData="{ prefixAudioUrl: [url] }" :visible.sync="showAudioDialog"></recordDialog> <YiwiseAudio style="display:none" ref="audioTag" :src="url" crossorigin></YiwiseAudio><img class="right-img" @click="togglePlay" :src="playing ? '/static/img/zangting.png' : '/static/img/bofang.png'">
      template: `<div class="luyinTemp pointer">
        <div class="luyinTemp pointer" >
          <img :src="src" :style="{width: type === 'tts' ? '34px' : '20px'}">
          <span class="audio-name" :title="audioName" :style="{maxWidth: type === 'tts' ? '90px' : '125px'}">{{audioName}}</span>
          <myAudio ref="audioTag" :src="url" :name="audioName"></myAudio>
        </div>
      </div>`
    }
  },
  data() {
    const validateVoiceName = (rule, value, callback) => {
      value = this.formData.voiceName
      if (value && value.length > 20) {
        callback(new Error('语音名称不能超过20个字'))
      }

      if (!value) {
        callback(new Error('请输入语音名称'))
      } else {
        callback()
      }
    }

    const validateVoiceStr = (rule, value, callback) => {
      value = this.formData.voiceStr
      if (value && value.length > 200) {
        callback(new Error('不能超过200个字'))
      }

      if (this.formData.voiceType !== 'MAN_MADE') {
        if (!value) {
          callback(new Error('请输入文本'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      rules: {
        _voiceName: [
          // { required: true, message: '请输入语音名称' },
          // { max: 20, message: '语音名称不能超过20个字' }
          { validator: validateVoiceName }
        ],
        _voiceName1: [
          { validator: validateVoiceName }
        ],
        _voiceStr: [
          // { required: true, message: '请输入文本' },
          // { max: 200, message: '不能超过200个字' }
          { validator: validateVoiceStr }
        ],
        _voiceStr1: [
          // { required: true, message: '请输入文本' },
          // { max: 200, message: '不能超过200个字' }
          { validator: validateVoiceStr }
        ],
        audio: [
          { validator: (rule, value, callback) => {
            if (this.formData.voiceType === 'MAN_MADE') {
              if (!this.audio) {
                callback(new Error('请上传录音文件'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          } }
        ]
      },
      dialogVisible: false,
      audio: '',
      // realAudioName: '',
      ttsAudio: '',
      ttsAudioName: '',
      ttsCompositing: false,

      voiceTypeEnum,
      formData: {
        voiceType: 'MAN_MADE',
        voiceName: '',
        voiceStr: ''
      },
      tempFormData: {
        voiceName_ManMade: '',
        voiceStr_ManMade: '',
        voiceName_AI: '',
        voiceStr_AI: ''
      }
    }
  },
  computed: {
    selectIVRId() {
      return this.$store.state.ivr.selectIVRId
    },
    lastAudio() {
      return this.formData.voiceType === 'MAN_MADE' ? this.audio : this.ttsAudio
    },
    lastAudioName() {
      return this.formData.voiceType === 'MAN_MADE' ? this.formData.voiceName : this.ttsAudioName
    },
    innerParams() {
      return {
        'audio': this.initialAudio,
        'audioType': this.initialAudioType,
        'audioName': this.initialTtsName,
        'audioText': this.initialAudioText
      }
    },
    initialAudioUrl() {
      return this.initialAudioType === 'MAN_MADE' ? this.initialAudio : this.ttsAudio
    },
    initialAudioName() {
      if (this.initialAudioType === 'MAN_MADE') {
        // const audio = this.initialAudio
        // const filePath = audio ? audio.split('/') : []

        return this.formData.voiceName
      } else {
        return this.initialTtsName
      }
    }
  },
  watch: {
    innerParams() {
      this.resetData()
    }
  },
  methods: {
    handleVoiceTypeChange(v) {
      if (v === 'MAN_MADE') {
        this.tempFormData.voiceName_AI = this.formData.voiceName
        this.tempFormData.voiceStr_AI = this.formData.voiceStr
        this.formData.voiceName = this.tempFormData.voiceName_ManMade || ''
        this.formData.voiceStr = this.tempFormData.voiceStr_ManMade || ''
      } else {
        this.tempFormData.voiceName_ManMade = this.formData.voiceName
        this.tempFormData.voiceStr_ManMade = this.formData.voiceStr
        this.formData.voiceName = this.tempFormData.voiceName_AI || ''
        this.formData.voiceStr = this.tempFormData.voiceStr_AI || ''
      }
    },
    async resetData() {
      this.$refs.upload && this.$refs.upload.clearFiles()
      const { audio, audioType, audioName, audioText } = this.innerParams

      const filePath = audio ? audio.split('/') : []

      this.audio = audio
      // this.realAudioName = audio ? filePath[filePath.length - 1] : ''

      this.formData.voiceType = audioType
      this.formData.voiceName = audioName
      this.formData.voiceStr = audioText

      if (this.initialAudioType === 'COMPOSE') {
        this.ttsCompositing = true
        this.ttsAudio = audioText ? await parseAudio(`/apiEngine/upload/ttsListening?text=${audioText}`) : ''
        this.ttsCompositing = false
        this.ttsAudioName = audioName || ''
      } else {
        this.ttsCompositing = false
        this.ttsAudio = ''
        this.ttsAudioName = ''
      }
    },
    addAudio() {
      this.dialogVisible = true
    },
    editAudio() {
      this.dialogVisible = true
    },
    uploadAudio({ file }) {
      uploadAudio({
        ivrNavigationInfoId: this.selectIVRId,
        file
      })
    },
    clearFiles() {
      this.$refs.upload.clearFiles()
      // this.realAudioName = ''
      this.audio =''
    },
    async ttsListening() {
      this.$refs.yuyinForm.validate(async(valid) => {
        if (valid) {
          this.ttsCompositing = true
          this.ttsAudio = await parseAudio(`/apiEngine/upload/ttsListening?text=${this.formData.voiceStr}`)
          this.ttsCompositing = false
          this.ttsAudioName = this.formData.voiceName || '--'
        }
      })
    },
    handleUploadError() {
      console.log('-------------handleUploadError----------')
      console.log(arguments)
      this.$message.error('上传失败，请重试')
      this.clearFiles()
    },
    handleExceed() {
      this.$message.error('最多只能上传一个文件，请删除上一个文件再重新上传')
    },
    handleRemove() {
      // this.realAudioName = ''
      this.audio =''
    },
    handleAvatarSuccess(res, file) {
      if (res.code !== 200) {
        this.$message.error(res.resultMsg || '上传失败，请重试')
        this.clearFiles()
      } else {
        // this.realAudioName = file.name
        this.audio = res.data.prefixAudioUrl
      }
    },
    beforeAvatarUpload(file) {
      const isAudio = file.name.includes('.wav')
      const isLt2M = file.size / 1024 / 1024 < 20
      const hasSpecialVar = ['(', ')', ' '].find(v => file.name.includes(v))

      if (!isAudio) {
        this.$message.error('上传文件只能是wav格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 20MB!')
      }
      if (hasSpecialVar) {
        this.$message.error('文件名不能包含空格或括号!')
      }

      return isAudio && isLt2M && !hasSpecialVar
    },
    handleDialogOpen() {
      const { audio, audioType, audioName, audioText } = this.innerParams

      const filePath = audio ? audio.split('/') : []

      this.audio = audio
      // this.realAudioName = audio ? filePath[filePath.length - 1] : ''

      this.formData.voiceType = audioType
      this.formData.voiceName = audioName
      this.formData.voiceStr = audioText
    },
    handleDialogClose() {
      if (this.$refs.realPersonAudio) {
        this.$refs.realPersonAudio.pause()
      }
      if (this.$refs.ttsPersonAudio) {
        this.$refs.ttsPersonAudio.pause()
      }
      this.tempFormData = {
        voiceName_ManMade: '',
        voiceStr_ManMade: '',
        voiceName_AI: '',
        voiceStr_AI: ''
      }
    },
    handleSubmit() {
      this.$refs.yuyinForm.validate(async(valid) => {
        if (valid) {
          this.$emit('success', {
            audio: this.formData.voiceType === 'MAN_MADE' ? this.audio : '', // this.lastAudio, // audioUrls
            audioType: this.formData.voiceType,
            audioName: this.formData.voiceName,
            audioText: this.formData.voiceStr
          })
          this.dialogVisible = false
        }
      })
    }
  },
  mounted() {
    this.resetData()
  }
}
</script>

<style lang="scss" scoped>
  @import '~src/styles/placeholder.scss';
  $-yuyin-hover-bg: #f2f2f2;
  .yuyin-container {
    height: 56px;
    line-height: 56px;
    .luyinTemp {
      width: 100%;
    }
    .yuyin-container-inner {
      display: flex;
      position: absolute;
      left: -12px;
      right: -12px;
      padding: 0 12px;
      height: 56px;
    }
  }

  /deep/ .luyinTemp {
    display: inline-flex;
    align-items: center;
    flex: 1;
    &:hover {
      background: $-yuyin-hover-bg;
    }
    img {
      // width: 20px;
      height: 20px;
    }
    .audio-name {
      @extend %ellipsis;
      margin-left: 11px;
      flex: 1;
    }
    .right-img {
      position: absolute;
      right: 12px;
      width: 20px;
    }
  }

  .upload {
    display: flex;
    flex-wrap: wrap;
    padding-left: 29px;
    /deep/ .el-upload__tip {
      white-space: nowrap;
    }
    /deep/ .el-upload {
      .el-button {
        margin-right: 27px;
      }
    }
    /deep/ .luyinTemp {
      flex: 1;
    }
  }

  /deep/ .el-textarea__inner {
    height: 98px !important;
  }
  .tts-container {
    display: flex;
    align-items: center;
    .el-button {
      margin-right: 26px;
    }
  }

  .yuyin-dialog {
    /deep/ .el-dialog__body {
      padding: 0 20% !important;
    }
  }
</style>
