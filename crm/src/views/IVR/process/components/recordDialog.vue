<template>
  <yiwise-dialog
    :visible.sync="innerVisible"
    title="听录音"
    :hasFooter="false"
    :append-to-body="true"
    class="record"
    @open="handleDialogOpen"
    @close="handleDialogClose"
  >
    <YiwiseAudio
      class="audio"
      v-loading="url === 'loading'"
      v-for="url in innerAudioUrl"
      :key="url"
      :src="url"
      :controls="true"
      :id="`audio_${url}`"
      :ref="`audio_${url}`"
      @play="e => handleAduioPlay(url)"
    >
    </YiwiseAudio>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog, YiwiseAudio } from 'yiwise-components'

export default {
  name: 'RecordDialog',
  components: {
    YiwiseDialog,
    YiwiseAudio
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    defaultData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    }
  },
  data() {
    return {
      innerAudioUrl: [],
      currentPlayUrl: '' // 当前播放的录音url
    }
  },
  watch: {
    defaultData() {
      this.innerAudioUrl = this.defaultData.prefixAudioUrl || []
    }
  },
  methods: {
    handleDialogOpen() {
      this.innerAudioUrl = this.defaultData.prefixAudioUrl || []
    },
    handleDialogClose() {
      this.checkAndPause()
      this.innerAudioUrl = []
    },
    handleAduioPlay(url) {
      if (this.currentPlayUrl !== url) {
        this.checkAndPause()
        this.currentPlayUrl = url
      }
    },
    checkAndPause() {
      // 检测当前是否存在正在播放的录音
      if (this.currentPlayUrl) {
        let currentAudio = this.$refs[`audio_${this.currentPlayUrl}`] // document.getElementById(`audio_${this.currentPlayUrl}`)
        currentAudio = currentAudio[0]
        if (currentAudio && !currentAudio.paused) {
          currentAudio.pause()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.record {
  /deep/ .el-dialog__body {
    padding: 0 25% 20px !important;
  }
  .audio {
    &:nth-of-type(n + 2) {
      margin-top: 10px;
    }
  }
}
</style>
