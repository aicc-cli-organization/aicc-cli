import request from '@/utils/request'

export function addOrUpdateQualityTestRule(data) {
  return request({
    url: '/apiEngine/qcRule/createOrUpdate',
    method: 'post',
    type: 'json',
    data
  })
}

export function pagingRuleEngineList(params) {
  return request({
    url: '/apiEngine/qcRule/ruleList',
    params
  })
}

export function updateRuleStatus(params) {
  return request({
    url: '/apiEngine/qcRule/updateRuleStatus',
    method: 'post',
    params
  })
}

export function getQCRuleDetail(params) {
  return request({
    url: '/apiEngine/qcRule/ruleInfo',
    method: 'get',
    params
  })
}

export function addQCTask(data) {
  return request({
    url: '/apiEngine/qcJob/add',
    method: 'post',
    type: 'json',
    data
  })
}

export function getQCTaskList(data) {
  return request({
    url: '/apiEngine/qcJob/list',
    method: 'post',
    type: 'json',
    data
  })
}

export function delQCTask(params) {
  return request({
    url: '/apiEngine/qcJob/delete',
    method: 'get',
    params
  })
}

export function getQCTaskDetail(params) {
  return request({
    url: '/apiEngine/qcJob/query',
    method: 'get',
    params
  })
}

export function getUncheckedRecordList(data) {
  return request({
    url: '/apiEngine/qcJobRecord/notQcRecordList',
    method: 'post',
    type: 'json',
    data
  })
}

export function flowQCTask(params) {
  return request({
    url: '/apiEngine/qcJob/execute',
    method: 'post',
    params
  })
}

export function getCheckedRecordList(data) {
  return request({
    url: '/apiEngine/qcJobRecord/qcRecordList',
    method: 'post',
    type: 'json',
    data
  })
}

export function getQCRecordDetail(params) {
  return request({
    url: '/apiEngine/qcJobRecord/qcRecordDetail',
    method: 'get',
    params
  })
}

export function recheckQCJobRecord(params) {
  return request({
    url: '/apiEngine/qcJobRecord/made',
    method: 'get',
    params
  })
}

export function getCallInReceptionList(params) {
  return request({
    url: '/apiEngine/callIn/reception/list',
    method: 'get',
    params
  })
}

export function editQCJob(data) {
  return request({
    url: '/apiEngine/qcJob/edit',
    method: 'post',
    data,
    type: 'json'
  })
}

export function deleteUncheckItem(params) {
  return request({
    url: '/apiEngine/qcJobRecord/deleteRecord',
    params
  })
}
