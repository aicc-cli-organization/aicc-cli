import request from '@/utils/request'

const prefix = '/apiPlatform/entry'

export function login(data) {
  return request({
    url: prefix + '/login',
    method: 'post',
    data
  })
}

export function relogin(refresh_token) {
  return request({
    url: '/ai-call-platform-back/api/oauth/token',
    method: 'post',
    data: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }
  })
}

export function logout() {
  return request({
    url: prefix + '/logout',
    method: 'post'
  })
}

// 获取crm链接
export function CRMUrl(data) {
  return request({
    url: '/apiEngine/loginToCrm/login',
    method: 'post',
    params: data
  })
}

export function loginByCode(data) {
  return request({
    url: prefix + '/loginBySmsVerificationCode',
    method: 'post',
    data
  })
}

export function sendLoginCode(data) {
  return request({
    url: prefix + '/sendLoginSmsVerificationCode',
    method: 'post',
    data
  })
}

export function getWechatLoginQrCode() {
  return request({
    url: prefix + '/getWechatLoginQrCode',
    method: 'get'
  })
}

export function loginPolling(data) {
  return request({
    url: prefix + '/loginPolling',
    method: 'get',
    params: data
  })
}

export function getPersonalization(params) {
  return request({
    url: '/apiEngine/personalization/getPersonalization',
    method: 'get',
    params
  })
}

export function getPersonalizationForDomain(params) {
  return request({
    url: '/apiEngine/personalization/getPersonalizationForDomain',
    method: 'get',
    params
  })
}

let freeSwitchIP = ''
let freeSwitchPort = ''
let importTemplateUrl = ''

export async function getFreeSwitchIP() {
  if (freeSwitchIP) {
    return {
      freeSwitchIP,
      freeSwitchPort,
      importTemplateUrl
    }
  }

  const { data } = await request({
    url: '/apiEngine/environment/envParams',
    method: 'get'
  })

  freeSwitchIP = data.data.freeswitchUrl
  freeSwitchPort = data.data.freeswitchPort
  importTemplateUrl = data.data.importTemplateUrl
  return {
    freeSwitchIP,
    freeSwitchPort,
    importTemplateUrl
  }
}
