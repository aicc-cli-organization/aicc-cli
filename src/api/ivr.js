import request from '@/utils/request'

// 获取sip账号信息
export function fetchAccountInfo(type) {
  return request({
    url: '/apiEngine/verbalTrickTraining/phoneNumber',
    method: 'get'
  })
}

// 分页查询ivr列表
export function pagingIVRInfo(data) {
  return request({
    url: '/apiEngine/ivrNavigationInfo/list',
    method: 'POST',
    type: 'json',
    data
  })
}

export function addIVRInfo(data) {
  return request({
    url: '/apiEngine/ivrNavigationInfo/add',
    method: 'post',
    type: 'json',
    data
  })
}

export function updateIVRInfo(data) {
  return request({
    url: '/apiEngine/ivrNavigationInfo/update',
    method: 'post',
    type: 'json',
    data
  })
}

export function copyIVRInfo(data) {
  return request({
    url: '/apiEngine/ivrNavigationInfo/copy',
    method: 'post',
    type: 'json',
    data
  })
}

export function checkIVRNameExist(params) {
  return request({
    url: '/apiEngine/ivrNavigationInfo/checkNameExist',
    method: 'get',
    params
  })
}

export function getStaffGroupInfo(params) {
  return request({
    url: '/apiEngine/csRobot/staffGroupInfo',
    method: 'get',
    params
  })
}

export function delIVRInfo(params) {
  return request({
    url: '/apiEngine/ivrNavigationInfo/delete',
    method: 'post',
    params
  })
}

export function saveNode(data) {
  return request({
    url: '/apiEngine/node/save',
    method: 'post',
    type: 'json',
    data
  })
}

export function updateNode(data) {
  return request({
    url: '/apiEngine/node/update',
    method: 'post',
    type: 'json',
    data
  })
}

export function saveLink(data) {
  return request({
    url: '/apiEngine/node/connect',
    method: 'post',
    type: 'json',
    data
  })
}

export function getNodes(params) {
  return request({
    url: '/apiEngine/node/get',
    method: 'get',
    params
  })
}

export function uploadAudio(data) {
  return request({
    url: '/apiEngine/upload/uploadRecord',
    method: 'post',
    type: 'json',
    data
  })
}

export function ttsListening(params) {
  return request({
    url: '/apiEngine/upload/ttsListening',
    method: 'post',
    params
  })
}

export function publishIvr(params) {
  return request({
    url: '/apiEngine/node/publish',
    method: 'get',
    params
  })
}

export function delNode(params) {
  return request({
    url: '/apiEngine/node/delete',
    method: 'get',
    params
  })
}
