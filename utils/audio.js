import { Message } from 'element-ui'

export function downloadAudioForFile(url, cb) {
  // 下载录音
  if (!url) {
    Message({
      type: 'error',
      message: '不存在音频文件',
      duration: 1000
    })
    return
  }

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  let sampleRate
  // var source = audioCtx.createBufferSource()

  const saveExcelFile = code => {
    // ie下去掉所有换行符，chrome下没有换行符
    // const code = atob(data.replace(/\r\n/g, ''))
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

    audioCtx.decodeAudioData(
      code,
      function(buffer) {
        sampleRate = buffer.sampleRate
        cb &&
          cb(
            new File([blob], 'file.wav', {
              type: 'audio/wav'
            }),
            sampleRate
          )
      },
      function(e) {
        console.error('Error with decoding audio data' + e.err)
        cb &&
          cb(
            new File([blob], 'file.wav', {
              type: 'audio/wav'
            }),
            1
          )
      }
    )
  }

  // url && (window.location.href = url)
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 404) {
        Message({
          type: 'error',
          message: '音频文件不存在',
          duration: 1000
        })
        return
      } else if (xhr.status !== 200) {
        Message({
          type: 'error',
          message: '下载音频失败',
          duration: 1000
        })
        return
      }
    }

    // 服务器返回值的处理函数，此处使用匿名函数进行实现
    if (xhr.readyState === 4 && xhr.status === 200) {
      const res = 'response' in xhr ? xhr.response : xhr.responseText // 不是responseText。
      saveExcelFile(res)
    }
  }
  xhr.open('GET', url, true) // 提交get请求到服务器
  xhr.responseType = 'arraybuffer'
  xhr.send()
}

export function downloadAudio(url, name = '') {
  // 下载录音
  if (!url) {
    Message({
      type: 'error',
      message: '不存在音频文件',
      duration: 1000
    })
    return
  }

  let uri = url.split('/').pop()
  const query_index = uri.indexOf('?')
  if (query_index > -1) {
    uri = uri.substring(0, query_index)
  }
  const downloadName = name + (uri || '_ai_user.wav')

  // var audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  // var source = audioCtx.createBufferSource()

  const saveExcelFile = (code, filename) => {
    // ie下去掉所有换行符，chrome下没有换行符
    // const code = atob(data.replace(/\r\n/g, ''))
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

    if (window.navigator.msSaveOrOpenBlob) {
      // iE下使用msSaveBlob进行导出
      navigator.msSaveBlob(blob, filename)
    } else {
      var href = window.URL.createObjectURL(blob)

      var save_link = document.createElementNS(
        'http://www.w3.org/1999/xhtml',
        'a'
      )
      save_link.href = href
      save_link.download = filename

      // 解决火狐兼容问题
      document.body.appendChild(save_link)

      var event = document.createEvent('MouseEvents')
      event.initMouseEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      )
      save_link.dispatchEvent(event)

      document.body.removeChild(save_link)
      window.URL.revokeObjectURL(href)
    }
  }

  // url && (window.location.href = url)
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 404) {
        Message({
          type: 'error',
          message: '音频文件不存在',
          duration: 1000
        })
        return
      } else if (xhr.status !== 200) {
        Message({
          type: 'error',
          message: '下载音频失败',
          duration: 1000
        })
        return
      }
    }

    // 服务器返回值的处理函数，此处使用匿名函数进行实现
    if (xhr.readyState === 4 && xhr.status === 200) {
      const res = 'response' in xhr ? xhr.response : xhr.responseText // 不是responseText。
      // audioCtx.decodeAudioData(res, function(buffer) {
      //   source.buffer = buffer;
      //   console.log(buffer)

      //   source.connect(audioCtx.destination);
      //   source.loop = true;
      // },

      // function(e){"Error with decoding audio data" + e.err});
      saveExcelFile(res, downloadName)
    }
  }
  xhr.open('GET', url, true) // 提交get请求到服务器
  xhr.responseType = 'arraybuffer'
  xhr.send()
}

// 转换音频时长显示
export function transTime(time) {
  var duration = parseInt(time)
  var minute = parseInt(duration / 60)
  var sec = (duration % 60) + ''
  var isM0 = ':'
  if (minute === 0) {
    minute = '00'
  } else if (minute < 10) {
    minute = '0' + minute
  }
  if (sec.length === 1) {
    sec = '0' + sec
  }

  if (minute === 'NaN') {
    minute = '00'
  }
  if (sec === 'NaN') {
    sec = '00'
  }

  return (minute || '00') + isM0 + (sec || '00')
}
