import request from '@/utils/request'

// 首页获取一天数据
export const getStats = (data) => {
  return request({
    url: `apiEngine/callStatsIndex/indexStatsInfo`,
    method: 'get',
    params: data
  })
}

export const getCallJobDateRoundStatsInfo = (data) => {
  return request({
    url: `/apiEngine/callStats/callStatsInfo`,
    method: 'get',
    params: data
  })
}

// 商机分析
export const businessAnalysisInfo = (data) => {
  return request({
    url: `/apiEngine/callStats/businessAnalysisInfo`,
    method: 'get',
    params: data
  })
}

// 时段分析
export const duringAnalysisInfo = (data) => {
  return request({
    url: `/apiEngine/callStats/duringAnalysisInfo`,
    method: 'get',
    params: data
  })
}

// 话单计费统计
export const costChartStats = (data) => {
  return request({
    url: `/apiEngine/callStats/callCostStatsInfo`,
    method: 'get',
    params: data
  })
}

// 话单计费统计 按月
export const costChartStatsByMonoth = (data) => {
  return request({
    url: `/apiEngine/callStats/callCostStatsMonthInfo`,
    method: 'get',
    params: data
  })
}

// 话单计费统计
export const getUserCallJobStatInfo = (data) => {
  return request({
    url: `/apiEngine/userCallJobStats/getUserCallJobStatInfo`,
    method: 'get',
    params: data
  })
}

// 话单计费统计 按月
export const getUserCallJobStatMonthInfo = (data) => {
  return request({
    url: `/apiEngine/userCallJobStats/getUserCallJobStatMonthInfo`,
    method: 'get',
    params: data
  })
}

// 短信费用列表
export const smsCost = (data) => {
  // begin: Date  , end: Date
  return request({
    url: `/apiEngine/callStats/everydaySmsStats`,
    method: 'get',
    params: data
  })
}

// 通话费用列表
export const phoneCost = (data) => {
  // begin: Date  , end: Date
  return request({
    url: `/apiEngine/callStats/everydayCallStats`,
    method: 'get',
    params: data
  })
}

// 导出通话统计
export const exportCallStatsInfo = (data) => {
  return request({
    url: `/apiEngine/callStats/exportCallStatsInfo`,
    method: 'get',
    params: data
  })
}

// 导出短信费用（按天）
export const exportMessageCostInfo = (data) => {
  return request({
    url: `/apiEngine/callStats/exportMessageCostInfo`,
    method: 'get',
    params: data
  })
}

// 导出短信费用（按月）
export const exportMessageCostMonthInfo = (data) => {
  return request({
    url: `/apiEngine/callStats/exportMessageCostMonthInfo`,
    method: 'get',
    params: data
  })
}

// 导出通话费用（按天）
export const exportCallCostInfo = (data) => {
  return request({
    url: `/apiEngine/callStats/exportCallCostInfo`,
    method: 'get',
    params: data
  })
}

// 导出话单明细（按天）
export const exportCallRecordAndCost = (data) => {
  return request({
    url: `/apiEngine/userCallJobStats/exportCallRecordAndCost`,
    method: 'get',
    params: data
  })
}

// 导出话单明细（按月）
export const exportCallRecordAndCostMonth = (data) => {
  return request({
    url: `/apiEngine/userCallJobStats/exportCallRecordAndCostMonth`,
    method: 'get',
    params: data
  })
}

// 导出通话费用（按月）
export const exportCallCostMonthInfo = (data) => {
  return request({
    url: `/apiEngine/callStats/exportCallCostMonthInfo`,
    method: 'get',
    params: data
  })
}

// 话单计费-表头统计
export const callCostTotalStatusInfo = (data) => {
  return request({
    url: `/apiEngine/callStats/callCostTotalStatusInfo`,
    method: 'get',
    params: data
  })
}

// 话单计费-账户余额
export const getTenantAccountFare = (data) => {
  return request({
    url: `/apiEngine/costList/getAccountFare`,
    method: 'get',
    params: data
  })
}

// 话单计费-账户余额
export const getUserCallJobStatPhoneNumberInfo = (data) => {
  return request({
    url: `/apiEngine/userCallJobStats/getUserCallJobStatPhoneNumberInfo`,
    method: 'get',
    params: data
  })
}

// 首页坐席信息
export const freeRobot = (data) => {
  return request({
    url: `/apiEngine/robotCount/freeRobot`,
    method: 'get',
    params: data
  })
}

// 首页坐席信息
export const robotInfo = (data) => {
  return request({
    url: `/apiEngine/robotCount/robotInfo`,
    method: 'get',
    params: data
  })
}

// 首页任务坐席信息
export const getJobRobotStatusInfo = (data) => {
  return request({
    url: `/apiEngine/robotStats/getJobRobotStatusInfo`,
    method: 'get',
    params: data
  })
}

// 首页任务坐席信息
export const getFollowStatusStats = (data) => {
  return request({
    url: `/apiEngine/customerPerson/getFollowStatusStats`,
    method: 'get',
    params: data
  })
}

// 子账号话单-消费总额
// 子账号 导出通话费用（按天）
export const exportUserCallJobStatInfo = (data) => {
  return request({
    url: `/apiEngine/userCallJobStats/exportUserCallJobStatInfo`,
    method: 'get',
    params: data
  })
}

// 子账号 导出通话费用（按月）
export const exportUserCallJobStatMonthInfo = (data) => {
  return request({
    url: `/apiEngine/userCallJobStats/exportUserCallJobStatMonthInfo`,
    method: 'get',
    params: data
  })
}

// 子账号 导出短信费用（按天）
export const exportUserSmsJobStatInfo = (data) => {
  return request({
    url: `/apiEngine/userCallJobStats/exportUserSmsJobStatInfo`,
    method: 'get',
    params: data
  })
}

// 子账号 导出短信费用（按月）
export const exportUserSmsJobStatMonthInfo = (data) => {
  return request({
    url: `/apiEngine/userCallJobStats/exportUserSmsJobStatMonthInfo`,
    method: 'get',
    params: data
  })
}

// 获取按天短信费用统计数据
export const getSmsStatsByDate = (params) => {
  return request({
    url: '/apiEngine/smsStats/smsStats',
    method: 'get',
    params
  })
}

// 获取按月短信费用统计数据
export const getSmsStatsByMonth = (params) => {
  return request({
    url: '/apiEngine/smsStats/smsMonthStats',
    method: 'get',
    params
  })
}

export const getQcStatsByDay = (params) => {
  return request({
    url: '/apiEngine/qcJob/qcStats',
    method: 'get',
    params
  })
}

export const getQcStatsByMonth = (params) => {
  return request({
    url: '/apiEngine/qcJob/qcMonthStats',
    method: 'get',
    params
  })
}

export const getQcTableByDay = (params) => {
  return request({
    url: '/apiEngine/qcJob/qcJobList',
    method: 'get',
    params
  })
}

export const getQcTableByMonth = (params) => {
  return request({
    url: '/apiEngine/qcJob/qcMonthJobList',
    method: 'get',
    params
  })
}

// 按日导出话费统计
export const exportSmsStatsByDate = (params) => {
  return request({
    url: '/apiEngine/smsStats/exportSmsStats',
    method: 'get',
    params
  })
}

// 按月导出话费统计
export const exportSmsStatsByMonth = (params) => {
  return request({
    url: '/apiEngine/smsStats/exportSmsMonthStats',
    method: 'get',
    params
  })
}

// 计费汇总-话单详情导出
export const exportCallCost = (data) => {
  return request({
    url: '/apiEngine/springBatchJob/exportCallCost',
    method: 'post',
    type: 'json',
    data
  })
}

