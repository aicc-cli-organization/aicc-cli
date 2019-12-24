import request from '@/utils/request'

const prefix = '/apiPlatform/user'
const entryPrefix = '/apiPlatform/entry'

export function login(data) {
  return request({
    url: entryPrefix + '/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: entryPrefix + '/logout',
    method: 'post'
  })
}

// 获取个人信息
export function getUserInfo() {
  return request({
    url: `${prefix}/getUserInfo`
  })
}

// 在线时轮询坐席状态
export const updateOnlineStatus = data => {
  return request({
    url: '/apiEngine/callIn/dispatch/updateOnLineStatus',
    method: 'post',
    data
  })
}

// 验证码登录
export function loginCode(data) {
  return request({
    url: entryPrefix + '/loginBySmsVerificationCode',
    method: 'post',
    data
  })
}
