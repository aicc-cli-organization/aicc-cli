import { Message } from 'element-ui'

export function parseAudio(url) {
  return new Promise((resolve, reject) => {
    // 下载录音
    if (!url) {
      Message({
        type: 'error',
        message: '转换出错',
        duration: 1000
      })
      reject('转换出错')
      return
    }

    const saveExcelFile = (code, filename) => {
      code = atob(code.replace(/\r\n/g, '').replace(/\"/g, ''))
      var abuffer = new window.ArrayBuffer(code.length)
      var uBuffer = new window.Uint8Array(abuffer)
      for (var i = 0; i < code.length; i++) {
        uBuffer[i] = code.charCodeAt(i) & 0xff
      }
      var blob = new Blob([uBuffer], {
        type: 'audio/x-wav'
      })

      resolve(window.URL.createObjectURL(blob))
    }

    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      // 服务器返回值的处理函数，此处使用匿名函数进行实现
      if (xhr.readyState === 4 && xhr.status === 200) {
        const res = 'response' in xhr ? xhr.response : xhr.responseText // 不是responseText。
        saveExcelFile(res)
      }
    }
    xhr.open('POST', url, true) // 提交get请求到服务器
    // xhr.setRequestHeader('Content-Type', 'arraybuffer')
    // xhr.responseType = 'arraybuffer'
    xhr.send()
  })
}
