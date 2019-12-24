import axios from 'axios'
import { Message } from 'element-ui'
import { removeToken } from '@/utils/auth'

import qs from 'qs'

const requestWhiteList = [
  '/apiOpe/dialogFlow/getDefaultRobotKnowledgeList',
  '/apiDialogFlow/dialogFlow/getRobotKnowledgeList',
  '/apiOpe/dialogFlow/getRobotKnowledgeList',
  '/apiBoss/dialogFlow/getRobotKnowledgeList',
  '/apiDialogFlow/dialogFlow/findKeywordOccurrence',
  '/apiOpe/dialogFlow/findKeywordOccurrence',
  '/apiBoss/dialogFlow/findKeywordOccurrence',
  '/apiEngine/callRecord/callDetailList',
  '/apiOpe/callRecord/callDetailList',
  '/apiBoss/callRecord/callDetailList',
  '/apiEngine/callRecord/readCallRecord',
  '/apiOpe/callRecord/readCallRecord',
  '/apiBoss/callRecord/readCallRecord',
  '/apiBoss/callRecord/queryCallRecord',
  '/apiBoss/phoneCard/query',
  '/apiPlatform/record/audioHandle/getAverageVolume',
  '/apiBoss/record/audioHandle/getAverageVolume',
  '/apiOpe/record/audioHandle/getAverageVolume',
  '/apiEngine/batchRecord/upload',
  '/apiBoss/batchRecord/upload',
  '/apiOpe/batchRecord/upload',
  '/apiDialogFlow/dialogFlow/getDialogFlowInfoList',
  '/apiBoss/dialogFlow/getTenantDialogFlowInfoList',
  '/apiOpe/dialogFlow/getTenantDialogFlowInfoList',
  '/apiEngine/unidentifiedCallDetail/list'
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
service.interceptors.request.use(
  config => {
    const source = CancelToken.source()
    config.cancelToken = source.token // 生成cancelToken

    if (
      config.method !== 'get' &&
      requestWhiteList.indexOf(config.url) === -1
    ) {
      if (requestList.has(config.url)) {
        // 请求的url作为请求唯一标识
        source.cancel('请勿重复操作')
      } else {
        requestList.add(config.url)
      }
    }
    if (config.type === 'json') {
      config.headers['Content-Type'] = 'application/json'
    }
    if (
      config.headers['Content-Type'] === 'application/x-www-form-urlencoded' &&
      !config.noParse &&
      (config.method === 'post' ||
        config.method === 'put' ||
        config.method === 'delete' ||
        config.method === 'patch')
    ) {
      config.data = qs.stringify(config.data)
    }

    return config
  },
  error => {
    // Do something with request error
    Promise.reject(error)
  }
)

// respone interceptor
service.interceptors.response.use(
  response => {
    const { config, data } = response

    // 打印接口调用信息
    const name = config.name
      ? `【${config.name}】数据(三端组件内)`
      : '地址(三端组件内)'
    let params = {}
    let dataType = ''
    if (config.method === 'get') {
      params = config.params || {}
    } else if (config.method === 'post') {
      if (config.headers['Content-Type'] === 'application/json') {
        dataType = '(JSON格式)'
        params = config.data ? JSON.parse(config.data) : {}
      } else {
        params = config.data ? qs.parse(config.data) : {}
      }
    }

    console.groupCollapsed(`%c 请求${name}：${config.url}`, 'color:#009a61')
    if (data.code === 200) {
      console.log(
        '请求方法：',
        config.method,
        `\n状态码：`,
        data.code,
        `\n参数${dataType}：`,
        params,
        '\n响应：',
        data.data
      )
    } else {
      console.log(
        '请求方法：',
        config.method,
        `\n状态码：`,
        data.code,
        `\n参数${dataType}：`,
        params,
        '\n错误信息：',
        data.errorStackTrace,
        '\n请求ID:',
        data.requestId
      )
    }
    console.groupEnd()

    const { code, resultMsg } = data
    requestList.delete(config.url) // 从列表中移除request
    if (code && code !== 200) {
      Message({
        message: resultMsg,
        type: 'error',
        duration: 1000
      })
      if (code === 400) {
        // 未登录，跳转到登录页
        removeToken()
        window.$nuxt.$router.push('/login')
      }
      return Promise.reject(data)
    }
    return response
  },
  async error => {
    console.error(error)
    const { response } = error
    if (axios.isCancel(error)) {
      // 若是取消请求
      return Promise.reject('重复接口调用')
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
