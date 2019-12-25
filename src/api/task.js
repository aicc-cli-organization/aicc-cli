import request from '@/utils/request'

// 获取外呼策略组列表
export function getPolicyGroupList() {
  return request({
    url: 'apiEngine/policyGroup/getIdAndNamePairList'
  })
}

export const taskMode = {
  AUTO: '自动启动',
  MANUAL: '手动启动'
}
export function getRobotCallJobList(data) {
  return request({
    url: '/apiEngine/robotCallJob/list',
    method: 'get',
    params: data
  })
}

export function getRedialLimit(data) {
  return request({
    url: '/apiEngine/robotCallJob/getRedialLimit',
    method: 'get',
    params: data
  })
}

// 获取话术设置
export function fetchDialogFlowConfig(params) {
  return request({
    url: '/apiDialogFlow/dialogFlow/getDialogFlowConfig',
    method: 'get',
    params
  })
}

export function getMobileCallJobStats(params) {
  return request({
    url: '/apiEngine/callStats/callMobileOperatorStats',
    method: 'get',
    params
  })
}

export function updateJobCancelSend(params) {
  return request({
    url: '/apiEngine/robotCallJob/updateJobCancelSend',
    method: 'post',
    params
  })
}

// 根据id数组获取任务进度
export function getRobotCallJobProgressList(data) {
  return request({
    url: '/apiEngine/robotCallJob/getJobStatsInfoList',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export function getSimpleList(data) {
  return request({
    url: '/apiEngine/robotCallJob/getSimpleInfoList',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function getRobotCallJobStats(id) {
  // 整个任务统计数据
  return request({
    url: `/apiEngine/callStats/callJobFullStatsInfo`,
    method: 'get',
    params: {
      robotCallJobId: id
    }
  })
}

// 获取任务的详情
export function getRobotCallJobDetail(id) {
  return request({
    url: `/apiEngine/robotCallJob/getById`,
    method: 'get',
    params: {
      robotCallJobId: id
    }
  })
}

export function getFreeRobotCount() {
  return request({
    url: `/apiEngine/robotCount/freeRobot`,
    method: 'get'
  })
}

export function getTenantPhoneNumber() {
  return request({
    url: `/apiEngine/tenantPhoneNumber/get`,
    method: 'get'
  })
}

// 添加robotcalljob
export function addRobotCallJob(data) {
  return request({
    url: `/apiEngine/robotCallJob/create`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 删除robotcalljob
export function deleteRobotCallJob(data) {
  return request({
    url: `/apiEngine/robotCallJob/delete`,
    method: 'post',
    data
  })
}

// 编辑任务
export function editRobotCallJob(data) {
  return request({
    url: `/apiEngine/robotCallJob/modify`,
    method: 'patch',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 查询单个任务
export function getRobotCallJob(data) {
  return request({
    url: `/apiEngine/robotCallJob/getById`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      ...data
    }
  })
}

// 查看操作日志列表
export const operationLogList = (data) => {
  return request({
    url: `/apiEngine/operationLog/jobLogList`,
    data,
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 获取简要用户列表
export const listAllBrief = (data) => {
  return request({
    url: `/apiPlatform/user/listAllBrief`,
    data,
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 条件查询任务列表
export const robotCallJobList = (data) => {
  return request({
    url: `/apiEngine/robotCallJob/list`,
    data,
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 查询所有任务  是否  可执行/可暂停
export const checkAllRobotCallJobList = (data) => {
  return request({
    url: `/apiEngine/robotCallJob/checkAll`,
    data,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
    // params: data
  })
}

// 执行/暂停 所有任务
export const executeAllRobotCallJobList = (data) => {
  return request({
    url: `/apiEngine/robotCallJob/executeJobs`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 任务执行
export const executeRobotCallJob = (data) => {
  return request({
    url: `/apiEngine/robotCallJob/execute`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 获取话术启动任务相关信息
export const getDialogFlowCallJobRelatedInfo = (data) => {
  return request({
    url: `/apiDialogFlow/dialogFlow/getDialogFlowCallJobRelatedInfo`,
    params: data,
    method: 'post'
  })
}

// 呼叫任务已呼客户名单、联系历史  中导出客户
export const exportCustomerPerson = (data, listName) => {
  // listName : ['PUBLIC_LIST', 'PRIVATE_LIST', 'HISTORY_LIST', 'CALLED_LIST']
  let url = '/apiEngine/springBatchJob/exportCustomerPerson' // 已呼叫列表、联系历史
  if (['CALLED_LIST', 'HISTORY_LIST'].includes(listName)) {
    url = '/apiEngine/springBatchJob/exportCallRecord' // 客户公海或者私海
  } else if (['UNCALLED_LIST'].includes(listName)) {
    url = '/apiEngine/taskSpringBatch/exportTask'
  }
  return request({
    url,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 联系历史导出通话记录
export const exportDialogHistory = (data, type) => {
  const url = type === 'callTask' ? '/apiEngine/springBatchJob/exportCallRecordFromJob'
    : type === 'fastCall' ? '/apiEngine/springBatchJob/exportCallRecordFromDirectCall'
      : '/apiEngine/springBatchJob/exportCallRecordFromTraining'

  return request({
    url: url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export const fetchProperties = (robotCallJobId) => { // 获取某任务下的自定义变量
  return request({
    url: '/apiEngine/robotCallJobProperties/getAll',
    method: 'get',
    params: {
      robotCallJobId
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 创建默认分组
export const addUserPushGroups = (data) => {
  return request({
    url: `/apiEngine/userPushGroups/add`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 获取分组用户的列表
export function getUserPushGroupsList(data) {
  return request({
    url: '/apiEngine/userPushGroups/list',
    method: 'get',
    params: data
  })
}

/**
 * 根据任务ID拿取状态
 * @param {array} robotCallJobIds
 */
export function getTaskStatusList(robotCallJobIds) {
  return request({
    url: `/apiEngine/robotCallJob/getStatus?robotCallJobIds=${robotCallJobIds}`,
    method: 'get'
  })
}

/**
 * 批量删除未呼客户
 */
export function batchDeleteTobeCalled(params) {
  return request({
    url: '/apiEngine/robotCallTask/deleteRobotCallTaskList',
    params,
    method: 'get'
  })
}

/**
 * 获取人工坐席列表
 */
export function getcsRototStaffGroupList(params) {
  return request({
    url: '/apiEngine/csRobot/callJobStaffGroupList',
    method: 'get',
    params
  })
}

/**
 * 获取自定义标签分组下的所有标签
 */
export function getIntentLevelTag(intentLevelTagId = 0) {
  return request({
    url: `/apiEngine/intentLevelTag/getIntentLevelTag?intentLevelTagId=${intentLevelTagId}`,
    method: 'get'
  })
}

/**
 * 获取任务重发送短信状态数量
 */
export function getIntentMessage(robotCallJobId) {
  return request({
    url: `/apiEngine/intentMessage/jobStatusCount?robotCallJobId=${robotCallJobId}`,
    method: 'get'
  })
}

// 获取话术模版关联的短信模版
export function getDialogFlowSmsTemplate(dialogFlowId) {
  return request({
    url: `/apiDialogFlow/dialogFlow/checkDialogFlowSMSTemplate?dialogFlowId=${dialogFlowId}`
  })
}

/**
 * 修改自定义变量
 */
export function updateProperties(params) {
  return request({
    url: '/apiEngine/robotCallTask/updateProperties',
    data: params,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取短信数量配置
export function getSmsConfig() {
  return request({
    url: '/apiEngine/config/getConfigMap'
  })
}
