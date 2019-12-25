import request from '@/utils/request'

export function getCsLineList(params) { // 获取坐席可外呼的线路列表
  return request({
    url: '/apiEngine/user/csLineList',
    method: 'get',
    params
  })
}

export function getLineList(params) { // 获取坐席可外呼的线路列表
  return request({
    url: '/apiEngine/tenantPhoneNumber/list',
    method: 'get',
    params
  })
}

export function updateRobotJobCallCsTransferMonitorFlagWithIdentifyId(data) { // 介入之后更新状态
  return request({
    url: '/apiEngine/csRobot/updateRobotJobCallCsTransferMonitorFlagWithIdentifyId',
    method: 'post',
    data
  })
}

export function updateCsTransferHangUpWithIdentifyId(data) { // 人工介入挂断后更新hangup信息
  return request({
    url: '/apiEngine/csRobot/updateCsTransferHangUpWithIdentifyId',
    method: 'post',
    data
  })
}

export function importCustomerPersonToBatchJob(data) { // 批量人工外呼
  return request({
    url: '/apiEngine/csRobot/importCustomerPersonToBatchJob',
    method: 'post',
    type: 'json',
    data
  })
}

export function getDownloadTemplate() { // 获取批量外呼下载模板链接
  return request({
    url: '/apiEngine/customerPersonTemplate/customerPersonList?customerPersonList=PRIVATE_LIST',
    method: 'get'
  })
}

export function getCsBatchJobInfo(params) { // 获取批量任务详情
  return request({
    url: '/apiEngine/csRobot/getCsBatchJobInfo',
    method: 'get',
    params
  })
}

export function executeBatchJob(data) {
  return request({
    url: '/apiEngine/csRobot/execute',
    method: 'post',
    data
  })
}

export function updateJob(data) {
  return request({
    url: '/apiEngine/csRobot/updateJob',
    method: 'post',
    type: 'json',
    data
  })
}

// 正在外呼的人工坐席组的信息
export function getCurrentCsStaffGroupInfo() {
  return request({
    url: '/apiEngine/csRobot/getCurrentCsStaffGroupInfo',
    method: 'get'
  })
}

export function csNotify(params) {
  return request({
    url: '/apiEngine/csRecord/csNotify',
    method: 'post',
    params
  })
}
