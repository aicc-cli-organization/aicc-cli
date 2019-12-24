import request from '@/utils/request'

// 查询一个客户的所有历史通话记录
export const fetchContactHistoryList = (data) => {
  return request({
    url: '/apiEngine/customerPerson/call/callRecordList',
    params: data,
    method: 'get'
  })
}

// 查询单个聊天记录
export const fetchCallRecordDetail = (data) => {
  return request({
    url: '/apiEngine/callRecord/callDetailList',
    data,
    method: 'post'
  })
}

// 修改人工意向
export const changeIntentLevel = (data) => {
  return request({
    url: '/apiEngine/callRecord/markIntentLevel',
    data,
    method: 'post'
  })
}

export const fetchCallInRecordDetail = (data) => {
  return request({
    url: '/apiEngine/callIn/record/queryRecordDetail',
    params: data,
    method: 'get'
  })
}

// 修改已读和未读状态
export const changeReadStatus = (data) => {
  return request({
    url: '/apiEngine/callRecord/readCallRecord',
    data,
    method: 'post'
  })
}

// 创建人工外呼通话记录
export const addArtificialCallRecord = data => {
  return request({
    url: '/apiEngine/csRecord/createRecord',
    data,
    method: 'post',
    type: 'json'
  })
}

// 更新人工外呼通话记录
export const updateArtificialCallRecord = data => {
  return request({
    url: '/apiEngine/csRecord/updateRecordOnHangup',
    data,
    method: 'post',
    type: 'json'
  })
}

// 更新人工呼入通话记录
export const updateInComingArtificialCallRecord = data => {
  return request({
    url: '/apiEngine/callIn/record/updateResultStatusToAnswered',
    data,
    method: 'post'
  })
}

// 获取人工介入临时通话记录
export const getRobotJobCallDetailWithIdentifyId = params => {
  return request({
    url: '/apiEngine/csRobot/getRobotJobCallDetailWithIdentifyId',
    method: 'get',
    params
  })
}
