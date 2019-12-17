import request from '@/utils/request'

const prefix = '/apiEngine/callIn/reception'

// 更新接待状态
export function updateReceptionStatus(data) {
  return request({
    url: prefix + '/updateStatus',
    method: 'post',
    data
  })
}

// 添加接待场景
export function addReception(data) {
  return request({
    url: prefix + '/create',
    method: 'post',
    type: 'json',
    data
  })
}

// 更新接待场景
export function updateReception(data) {
  return request({
    url: prefix + '/update',
    method: 'post',
    type: 'json',
    data
  })
}

// 获取接待场景列表的统计信息
export function fetchSummaryInfo(params) {
  return request({
    url: prefix + '/summaryInfo',
    method: 'get',
    params
  })
}

// 删除接待场景
export function deleteReception(data) {
  return request({
    url: prefix + '/delete',
    method: 'post',
    data
  })
}
