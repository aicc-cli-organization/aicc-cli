import request from '@/utils/request'

const prefix = '/apiPlatform/user'

// 获取个人信息
export function getUserInfo() {
  return request({
    url: prefix + '/getUserInfo',
    method: 'get'
  })
}

// 获取功能信息
export function getIntentInfo(params) {
  return request({
    url: '/apiEngine/tenant/getIntentInfo',
    method: 'post',
    params
  })
}

// 获取isv
export function updateIsv(data) {
  return request({
    url: '/apiEngine/isvInfo/updateIsv',
    method: 'post',
    type: 'json',
    data
  })
}

// 修改个人信息
export function updateUserInfo(data) {
  return request({
    url: prefix + '/renewUser',
    method: 'post',
    type: 'json',
    data
  })
}

// 获取绑定二维码
export const fetchQrCode = () => {
  return request({
    url: prefix + '/bindWechat',
    method: 'post'
  })
}

export const checkUserIsDefaultPassword = () => {
  return request({
    url: prefix + '/checkUserIsDefaultPassword',
    method: 'get'
  })
}

// 取消绑定微信
export const cancelBind = () => {
  return request({
    url: prefix + '/unbindWechat',
    method: 'post',
    data: {
      bindType: 'officialAccount'
    }
  })
}

// 获取ai等待时长
export const getTaskWaitingTimeout = () => {
  return request({
    url: '/apiPlatform/tenant/getTaskWaitingTimeout',
    method: 'get'
  })
}

export const updateTaskWaitingTimeout = (data) => {
  return request({
    url: '/apiPlatform/tenant/updateTaskWaitingTimeout',
    method: 'post',
    data
  })
}
