<template>
    <yiwise-pop-confirm
      label="确认取消下载？"
      v-if="downloadingAudio"
      @submit="stopDownload()"
    >
      <el-button type="primary" icon="el-icon-loading" :disabled="disabled">{{downloadStr}}</el-button>
    </yiwise-pop-confirm>
    <el-button v-else type="primary" @click="IPCSend" :icon="downloadingAudio ? 'el-icon-loading' : ''" :disabled="disabled">
      {{downloadStr}}
      <el-tooltip placement="top" content="录音将保存90天，如有需要请及时下载。">
        <i class="el-icon-warning"></i>
      </el-tooltip>
    </el-button>
</template>

<script>
import * as contactAPI from '@/api/contact'
// import './jszip'
// import * as saveAs from './FileSaver'
import { YiwisePopConfirm } from 'yiwise-components'
import { mapGetters, mapActions } from 'vuex'
import { downloadAudios, cloneData, cancelDownload } from '@/utils/downloadAudio'

export default {
  components: {
    YiwisePopConfirm
  },
  data() {
    return {
      // downloadingAudio: false,
      // downloadingCur: 1,
      // downloadingTotal: 0
    }
  },
  props: {
    multipleSelection: {
      type: Array,
      default() {
        return []
      }
    },
    paginationParams: {
      type: Object,
      default() {
        return {}
      }
    },
    allChecked: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: [String],
    tag: {},
    seatType: String
  },
  computed: {
    downloadStr() {
      const pre = this.downloadingAudio ? '取消' : '下载通话录音'
      const second = this.downloadingAudio ? '(' + this.downloadingCur + '/' + this.downloadingTotal + ')' : ''
      return this.disabled ? '一次下载量不能超过10000' : pre + second
    },
    ...mapGetters([
      'downloadingAudio', 'downloadingCur', 'downloadingTotal'
    ])
  },
  methods: {
    stopDownload() {
      cancelDownload()
    },
    // ...mapActions(['setDownloaingAudioState']),
    // praseIPCData(array) {
    //   return array.map(item => {
    //     return {
    //       callRecordId: item.callRecordId,
    //       personName: item.personName || '未知',
    //       url: item.fullAudioUrl,
    //       calledPhoneNumber: item.calledPhoneNumber || '未知电话',
    //       robotCallJobName: item.robotCallJobName || '未命名任务',
    //       realIntentLevel: item.realIntentLevel
    //     }
    //   })
    // },
    // requestFile(src) {
    //   return new Promise((resolve, reject) => {
    //     if (!src) {
    //       console.log('不存在音频文件: ' + src)
    //       reject('不存在音频文件:' + src)
    //       return
    //     }

    //     var xhr = new XMLHttpRequest()
    //     xhr.onreadystatechange = e => { // 服务器返回值的处理函数，此处使用匿名函数进行实现
    //       if (xhr.readyState === 4) {
    //         if (xhr.status === 200) {
    //           const res = 'response' in xhr ? xhr.response : xhr.responseText // 不是responseText。
    //           resolve(res)
    //         } else {
    //           console.log('文件请求出错: ' + src)
    //           reject('请求出错')
    //         }
    //       }
    //     }
    //     xhr.onerror = (e) => {
    //       console.log('文件请求出错: ' + src)
    //       console.log(e)
    //       reject('请求出错')
    //     }
    //     xhr.open('GET', src, true) // 提交get请求到服务器
    //     xhr.setRequestHeader('Content-Type', 'arraybuffer')
    //     xhr.responseType = 'arraybuffer'
    //     xhr.send()
    //   })
    // },
    // addFile(imgFolder, url, filename) {
    //   return new Promise(async(resolve, reject) => {
    //     try {
    //       const arraybuffer = await this.requestFile(url)
    //       imgFolder.file(filename, arraybuffer)
    //     } catch (e) {
    //       console.log(e)
    //     }

    //     // 设置全局下载状态，用于离开页面重新进入时对下载按钮进行控制
    //     this.setDownloaingAudioState({
    //       downloadingAudio: this.downloadingAudio,
    //       downloadingCur: this.downloadingCur + 1,
    //       downloadingTotal: this.downloadingTotal
    //     })
    //     resolve()
    //   })
    // },
    // downloadFiles(imgFolder, arr) {
    //   return Promise.all(
    //     arr.map(
    //       item => this.addFile(imgFolder, item.url, `${item.callRecordId}-${item.personName}-${item.calledPhoneNumber}-${item.robotCallJobName}-${item.realIntentLevel}.wav`)
    //     )
    //   )
    // },
    async IPCSend(command) {
      if (this.downloadingAudio) {
        // this.stopDownload()
      } else {
        downloadAudios(this.allChecked, cloneData(this.multipleSelection), this.type, cloneData(this.paginationParams), this.tag, this.seatType)
      }
      // if (!this.allChecked) {
      //   if ((this.multipleSelection).length === 0) {
      //     this.$message({
      //       message: '请选择需要下载的通话记录',
      //       type: 'error'
      //     })
      //     return
      //   }
      //   this.$notify({
      //     title: '下载中...',
      //     message: '正在将所选录音加入下载列表',
      //     showClose: false
      //   })

      //   this.setDownloaingAudioState({
      //     downloadingAudio: true,
      //     downloadingCur: 1,
      //     downloadingTotal: this.multipleSelection.length
      //   })

      //   await this.downloadFiles(this.praseIPCData(this.multipleSelection))
      //   this.zip.generateAsync({ type: 'blob' })
      //     .then(function(content) {
      //       // see FileSaver.js
      //       saveAs(content, 'example.zip')
      //     })
      // } else {
      //   let number = 1
      //   const getDataFn = contactAPI[{
      //     'callTask': 'getInfoListFromJob',
      //     'fastCall': 'getInfoListFromDirectCall',
      //     'wordsTraining': 'getInfoListFromTraining'
      //   }[this.type]]

      //   const { data: res } = await getDataFn({
      //     ...this.paginationParams,
      //     number,
      //     pageSize: 1000
      //   })
      //   const { data } = res
      //   const { pages, totalElements } = data

      //   this.setDownloaingAudioState({
      //     downloadingAudio: true,
      //     downloadingCur: 1,
      //     downloadingTotal: totalElements
      //   })

      //   while (number <= pages) {
      //     var imgFolder = this.zip.folder('audios')
      //     const { data: res } = await getDataFn({
      //       ...this.paginationParams,
      //       pageNum: number,
      //       pageSize: 1000
      //     })

      //     this.$notify({
      //       title: '下载中...',
      //       message: `正在将第${number}组任务加入下载列表`,
      //       showClose: false
      //     })

      //     await this.downloadFiles(imgFolder, this.praseIPCData(res.data.content))
      //     const content = await this.zip.generateAsync({ type: 'blob' })

      //     // 不能一次性下载全部，否则会占用过大内存 1000音频个大概4,5百兆
      //     saveAs(content, 'example.zip')
      //     this.zip.remove('audios')
      //     // 释放内存
      //     saveAs.unload && saveAs.unload()

      //     this.$notify({
      //       title: '下载中...',
      //       message: `第${number}组任务已经下载完成`,
      //       showClose: false
      //     })
      //     number++
      //   }
      // }

      // this.setDownloaingAudioState({
      //   downloadingAudio: false,
      //   downloadingCur: 0,
      //   downloadingTotal: 0
      // })

      // this.$notify.success({
      //   title: '下载完成',
      //   message: '下载任务已经成功完成啦~',
      //   showClose: false
      // })
    }
  },
  mounted() {
    // this.zip = new JSZip()
  }
}
</script>
