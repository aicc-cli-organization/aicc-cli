import { Message, Notification } from 'element-ui'
import * as contactAPI from '@/api/contact'
import JSZip from '@/assets/jszip'
import saveAs from '@/assets/FileSaver'
// import '@/assets/streamSaver'
// import streamBrowserify from 'stream-browserify'
// import 'buffer'
// console.log(streamBrowserify)

// const JSZip = require('@/assets/jszip')
// if (typeof JSZip === 'undefined') {
//   var JSZip = function() {}
// }
console.log(JSZip)

console.log(typeof JSZip)
// if (typeof window === 'undefined') {
//   var window = { $nuxt: { $store: {}}}
// }

let stoped = false

const zip = new JSZip()
const count_download_once = 100
let innerTag = ''
let callRecordIdLabel = ''
let calledPhoneNumberLable = ''

const utils = {
  manageName(v) {
    return String(v || '').replace(/\//g, '')
      .replace(/\\/g, '')
      .replace(/\:/g, '')
      .replace(/\*/g, '')
      .replace(/\?/g, '')
      .replace(/\"/g, '')
      .replace(/\</g, '')
      .replace(/\>/g, '')
      .replace(/\|/g, '')
  },
  praseIPCData(array) {
    return array.map(item => {
      return {
        callRecordId: item[callRecordIdLabel],
        personName: utils.manageName(item.customerPersonName || '未知姓名'),
        url: item.fullAudioUrl,
        calledPhoneNumber: utils.manageName(item[calledPhoneNumberLable] || '未知电话'),
        robotCallJobName: utils.manageName(item.robotCallJobName || '未命名任务'),
        realIntentLevel: item.realIntentLevel
      }
    })
  },
  requestFile(src) {
    return new Promise((resolve, reject) => {
      if (!src) {
        console.log('不存在音频文件: ' + src)
        reject('不存在音频文件:' + src)
        return
      }

      var xhr = new XMLHttpRequest()
      xhr.onreadystatechange = e => { // 服务器返回值的处理函数，此处使用匿名函数进行实现
        if (stoped) {
          xhr.abort()
          reject('请求暂停')
          return
        }

        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const code = 'response' in xhr ? xhr.response : xhr.responseText // 不是responseText。

            const length = code.length

            var abuffer = code // new window.ArrayBuffer(length)
            var uBuffer = new window.Uint8Array(abuffer)
            for (var i = 0; i < length; i++) {
              uBuffer[i] = code.charCodeAt(i) & 0xff
            }
            var blob = new Blob([uBuffer], {
              // type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
              type: 'audio/x-wav'
            })

            resolve(blob)
          } else {
            console.log('文件请求出错: ' + src)
            reject('请求出错')
          }
        }
      }
      xhr.onerror = (e) => {
        console.log('文件请求出错: ' + src)
        console.log(e)
        reject('请求出错')
      }
      xhr.open('GET', src, true) // 提交get请求到服务器
      // xhr.setRequestHeader('Content-Type', 'arraybuffer')
      xhr.responseType = 'arraybuffer'
      xhr.send()
    })
  },
  addFile(imgFolder, url, filename) {
    return new Promise(async(resolve, reject) => {
      try {
        if (stoped) {
          resolve('请求暂停')
          return
        }

        const arraybuffer = await utils.requestFile(url)

        if (stoped) {
          resolve('请求暂停')
          return
        }

        imgFolder.file(filename, arraybuffer)
      } catch (e) {
        console.log(e)
      }

      // 设置全局下载状态，用于离开页面重新进入时对下载按钮进行控制
      window.$nuxt.$store.dispatch('setDownloaingAudioState', {
        downloadingAudio: window.$nuxt.$store.getters.downloadingAudio,
        downloadingCur: window.$nuxt.$store.getters.downloadingCur + 1,
        downloadingTotal: window.$nuxt.$store.getters.downloadingTotal
      })
      resolve()
    })
  },
  downloadFiles(imgFolder, arr, seatType) {
    return Promise.all(
      arr.map(
        item => utils.addFile(
          imgFolder,
          item.url,
          seatType === 'IVR' ? `${item.callRecordId}.wav` : `${item.callRecordId}-${item.personName}-${item.calledPhoneNumber}-${item.robotCallJobName}-${item.realIntentLevel}.wav`
        )
      )
    )
  }
}

export const cloneData = (data) => JSON.parse(JSON.stringify(data))

function loadAudio(number, paginationParams, getDataFn, seatType) {
  return new Promise(async(resolve, reject) => {
    var imgFolder = zip.folder('audios')
    console.log('---------------------------getDataFn-----------------------------')
    const { data: res } = await getDataFn({
      ...paginationParams,
      pageNum: number,
      pageSize: count_download_once
    })

    if (stoped) {
      resolve('任务中止')
      return
    }

    Notification({
      title: '下载中...',
      message: `正在将第${number}组任务加入下载列表`,
      showClose: false
    })
    console.log('---------------------------downloadFiles-----------------------------')
    const managedData = utils.praseIPCData(res.data.content)
    const idArea = managedData[0].callRecordId + '__' + managedData[managedData.length - 1].callRecordId
    await utils.downloadFiles(imgFolder, managedData, seatType)

    if (stoped) {
      resolve('任务中止')
      return
    }

    console.log('---------------------------zip-----------------------------')
    const content = await zip.generateAsync({ type: 'blob' })

    if (stoped) {
      resolve('任务中止')
      return
    }

    // 不能一次性下载全部，否则会占用过大内存 1000音频个大概4,5百兆
    saveAs(content, `audios${idArea}.zip`)
    zip.remove('audios')
    // 释放内存
    saveAs.unload && saveAs.unload()

    Notification({
      title: '下载中...',
      message: `第${number}组任务已经下载完成`,
      showClose: false
    })

    setTimeout(function() {
      console.log('---------------------------next-----------------------------')
      resolve()
    }, 5000)
  })
}

export async function downloadAudios(allChecked, multipleSelection, type, paginationParams, tag, seatType) {
  stoped = false
  innerTag = tag
  callRecordIdLabel = innerTag && innerTag === 'callOutSide' ? 'csRecordId'
    : innerTag && innerTag === 'callIn' ? 'callInRecordId' : 'callRecordId'
  calledPhoneNumberLable = innerTag && innerTag === 'callIn' ? 'customerPhoneNumber' : 'calledPhoneNumber'

  if (!allChecked) {
    if (multipleSelection.length === 0) {
      Message({
        message: '请选择需要下载的通话记录',
        type: 'error'
      })
      return
    }
    Notification({
      title: '下载中...',
      message: '正在将所选录音加入下载列表',
      showClose: false
    })

    window.$nuxt.$store.dispatch('setDownloaingAudioState', {
      downloadingAudio: true,
      downloadingCur: 1,
      downloadingTotal: multipleSelection.length
    })

    var imgFolder = zip.folder('audios')

    await utils.downloadFiles(imgFolder, utils.praseIPCData(multipleSelection), seatType)
    const idArea = multipleSelection[0][callRecordIdLabel] + '__' + multipleSelection[multipleSelection.length - 1][callRecordIdLabel]

    if (stoped) return

    zip.generateAsync({ type: 'blob' })
      .then(function(content) {
        if (stoped) return
        // see FileSaver.js
        saveAs(content, `audios${idArea}.zip`)
        zip.remove('audios')
        // 释放内存
        saveAs.unload && saveAs.unload()
      })
  } else {
    let number = 1
    console.log(type)
    const getDataFn = contactAPI[{
      'callTask': 'getInfoListFromJob',
      'fastCall': 'getInfoListFromDirectCall',
      'wordsTraining': 'getInfoListFromTraining',
      'completeCallList': 'getInfoList',
      'CS_CALL_OUT': 'searchCsRecord',
      'AI_CALL_IN': 'queryCallInRecordList'
    }[type]]

    const { data: res } = await getDataFn({
      ...paginationParams,
      number,
      pageSize: count_download_once
    })
    const { data } = res
    const { pages, totalElements } = data

    window.$nuxt.$store.dispatch('setDownloaingAudioState', {
      downloadingAudio: true,
      downloadingCur: 1,
      downloadingTotal: totalElements
    })

    if (stoped) return

    while (number <= pages) {
      if (stoped) return
      await loadAudio(number, paginationParams, getDataFn, seatType)
      if (stoped) return
      number++
      // if (number > 1) return
    }
  }

  window.$nuxt.$store.dispatch('setDownloaingAudioState', {
    downloadingAudio: false,
    downloadingCur: 0,
    downloadingTotal: 0
  })

  Notification({
    type: 'success',
    title: '下载完成',
    message: '下载任务已经成功完成啦~',
    showClose: false
  })
}

export const cancelDownload = () => {
  stoped = true
  zip.remove('audios')
  saveAs.unload && saveAs.unload()

  window.$nuxt.$store.dispatch('setDownloaingAudioState', {
    downloadingAudio: false,
    downloadingCur: 0,
    downloadingTotal: 0
  })
}
