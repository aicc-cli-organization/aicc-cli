import axios from 'axios'
import { Message } from 'element-ui'
// import router from '@/router'
import { removeToken } from '@/utils/auth'

import qs from 'qs'

const requestWhiteList = [ // 请求白名单（可以重复操作）
  '/apiEngine/customerPerson/list',
  '/apiEngine/callRecord/getInfoList',
  '/apiEngine/robotCallJob/getSimpleInfoList',
  '/apiEngine/robotCallJob/getJobStatsInfoList',
  '/apiEngine/robotCallJob/checkAll',
  '/apiPlatform/user/bindWechat',
  '/apiDialogFlow/dialogFlow/getDialogFlowCallJobRelatedInfo',
  '/apiEngine/callRecord/getInfoListFromJob',
  '/apiEngine/callRecord/getInfoListFromDirectCall',
  '/apiEngine/callRecord/getInfoListFromTraining',
  '/apiEngine/node/connect',
  '/apiEngine/callIn/record/queryCallInRecordList'
]

const CancelToken = axios.CancelToken

// create an axios instance
const service = axios.create({
  timeout: 60000, // request timeout
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

const requestList = new Set() // 请求列表，防止重复提交

// request interceptor
service.interceptors.request.use(config => {
  const source = CancelToken.source()
  // const token = getToken()
  config.cancelToken = source.token // 生成cancelToken
  // if (token && (token !== window.token)) { // 若登录信息与当前用户不匹配
  //   source.cancel('账号信息已改变')
  //   MessageBox.confirm('您的登录信息已经改变，是否重新加载页面？', '提示', {
  //     type: 'warning'
  //   }).then(() => {
  //     location.reload()
  //   }).catch(err => {
  //     return err
  //   })
  // }
  if (config.method !== 'get' && requestWhiteList.indexOf(config.url) === -1) {
    if (requestList.has(config.url)) { // 请求的url作为请求唯一标识
      source.cancel('请勿重复操作')
      Message({
        message: '请勿重复操作',
        type: 'error',
        duration: 1000
      })
    } else {
      requestList.add(config.url)
    }
  }
  if (config.type === 'json') {
    config.headers['Content-Type'] = 'application/json'
  }
  if (config.headers['Content-Type'] === 'application/x-www-form-urlencoded' &&
  (config.method === 'post' || config.method === 'put' || config.method === 'delete' || config.method === 'patch')) {
    config.data = qs.stringify(config.data)
  }
  return config
}, error => {
  // Do something with request error
  Promise.reject(error)
})

// respone interceptor
service.interceptors.response.use(
  response => {
    const { config, data } = response
    const { code, resultMsg } = data
    requestList.delete(config.url) // 从列表中移除request
    if (code && code !== 200) {
      Message({
        message: resultMsg,
        type: 'error',
        duration: 3000
      })
      if (code === 400) { // 未登录，跳转到登录页
        removeToken()
        window.$nuxt.$router.push('/customer-center/login')
      }
      return Promise.reject(data)
    }
    return response
  },
  async(error) => {
    const { response } = error
    if (axios.isCancel(error)) { // 若是取消请求
      return Promise.reject()
    }
    if (response) {
      const { config, data } = response
      if (data) {
        const { code, resultMsg } = data
        requestList.delete(config.url)
        if (code) {
          Message({
            message: resultMsg,
            type: 'error',
            duration: 1000
          })
          return Promise.reject(error)
        }
      }
      Message({
        message: '服务器开小差啦~',
        type: 'error',
        duration: 1000
      })
    } else {
      requestList.clear()
      Message({
        message: '网络异常',
        type: 'error',
        duration: 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
