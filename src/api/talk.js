import request from '@/utils/request'

const prefix = '/apiDialogFlow/dialogFlow'

export function fetchIndustryList() {
  return request({
    url: prefix + '/getIndustryList',
    method: 'get'
  })
}

export function getDialogFlowExtInfo(params) {
  return request({
    url: prefix + '/getDialogFlowExtInfo',
    method: 'get',
    params
  })
}

export function dialogFlowProperties(params) {
  return request({
    url: `/apiEngine/dialogFlowProperties/getWithName`,
    method: 'get',
    params
  })
}

export function fetchFlowList(data) {
  return request({
    url: prefix + '/getDialogFlowInfoList',
    method: 'post',
    type: 'json',
    data
  })
}

export function fetchFlowDetail(params) {
  return request({
    url: prefix + '/getDialogFlowInfo',
    method: 'get',
    params
  })
}

// 新增/编辑话术
export function operateFlow(data) {
  return request({
    url: prefix + '/postDialogFlow',
    method: 'post',
    type: 'json',
    data
  })
}

// 删除话术
export function deleteFlow(params) {
  return request({
    url: prefix + '/deleteDialogFlow',
    method: 'delete',
    params
  })
}

// 获取流程列表
export function fetchProcessList(params) {
  return request({
    url: prefix + '/getStepList',
    method: 'get',
    params
  })
}

// 新增流程
export function addProcess(data) {
  return request({
    url: prefix + '/createStep',
    method: 'post',
    type: 'json',
    data
  })
}

// 编辑流程
export function updateProcess(data) {
  return request({
    url: prefix + '/updateStepInfo',
    method: 'post',
    type: 'json',
    data
  })
}

// 删除流程
export function deleteProcess(params) {
  return request({
    url: prefix + '/deleteStep',
    method: 'delete',
    params
  })
}

// 流程排序
export function reorderProcess(data) {
  return request({
    url: prefix + '/rearrangeStep',
    method: 'post',
    type: 'json',
    data
  })
}

// 获取节点树
export function fetchGraph(params) {
  return request({
    url: prefix + '/getDialogFlowStep',
    method: 'get',
    params
  })
}

// 更新节点树
export function updateGraph(data) {
  return request({
    url: prefix + '/updateStepNodeTree',
    method: 'post',
    type: 'json',
    data
  })
}

// 获取知识库列表
export function fetchKnowledgeList(params) {
  return request({
    url: prefix + '/getRobotKnowledgeList',
    method: 'get',
    params
  })
}

// 操作问答知识
export function operateKnowledge(data) {
  return request({
    url: prefix + '/postRobotKnowledge',
    method: 'post',
    type: 'json',
    data
  })
}

// 获取知识详情
export function fetchKnowledgeDetail(params) {
  return request({
    url: prefix + '/getRobotKnowledge',
    method: 'get',
    params
  })
}

// 删除知识
export function deleteKnowledge(params) {
  return request({
    url: prefix + '/deleteRobotKnowledge',
    method: 'delete',
    params
  })
}

// 获取分支列表
export function fetchBranchList(params) {
  return request({
    url: prefix + '/getIntentBranchList',
    method: 'get',
    params
  })
}

// 操作分支
export function operateIntentBranch(data) {
  return request({
    url: prefix + '/postIntentBranch',
    method: 'post',
    type: 'json',
    data
  })
}

// 删除分支
export function deleteBranch(params) {
  return request({
    url: prefix + '/deleteIntentBranch',
    method: 'delete',
    params
  })
}

export function fetchMsgList() {
  return request({
    url: '/apiEngine/smsTemplate/list',
    method: 'get',
    params: {
      pageSize: 999
    }
  })
}

export function fetchRecordInfo(params) {
  return request({
    url: prefix + '/getDialogFlowRecordStats',
    method: 'get',
    params
  })
}

export function copyDialogFlow(params) {
  return request({
    url: prefix + '/copyDialogFlow',
    method: 'get',
    params
  })
}

export function publishDialogFlow(data) {
  return request({
    url: prefix + '/changeDialogFlowStatus',
    method: 'post',
    data
  })
}

// 获取sip账号信息
export function fetchAccountInfo() {
  return request({
    url: '/apiEngine/verbalTrickTraining/phoneNumber',
    method: 'get'
  })
}

// 获取话术设置
export function fetchDialogFlowConfig(params) {
  return request({
    url: prefix + '/getDialogFlowConfig',
    method: 'get',
    params
  })
}

// 设置话术配置
export function setDialogFlowConfig(data) {
  return request({
    url: prefix + '/postDialogFlowConfig',
    method: 'post',
    type: 'json',
    data
  })
}

// 获取话术变量
export function fetchDialogFlowProperties(params) {
  return request({
    url: '/apiEngine/dialogFlowProperties/get',
    method: 'get',
    params
  })
}

// 检查当前话术人工相关的状态
export const checkDialogFlowCsStatus = (data) => {
  return request({
    url: prefix + '/getDialogFlowCallJobRelatedInfo',
    method: 'post',
    data
  })
}
