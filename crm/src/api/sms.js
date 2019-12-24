import request from '@/utils/request'

export const getSmsTemplateList = (data) => {
  return request({
    url: '/apiEngine/smsTemplate/list',
    method: 'get',
    params: data
  })
}

export const getSmsList = (data) => {
  return request({
    url: '/apiEngine/smsTemplate/searchByName',
    method: 'get',
    params: data
  })
}

export const getSmsTemplateDetail = (params) => {
  if (!params.smsTemplateId) {
    return new Promise(resolve => resolve({
      data: {
        data: {}
      }
    }))
  }
  return request({
    url: '/apiEngine/smsTemplate',
    method: 'get',
    params
  })
}

// 新建短信模板
export const addSmsTemplate = (data) => {
  return request({
    method: 'post',
    url: `/apiEngine/smsTemplate/add`,
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 短信模板类型
export const getSmsTemplateType = (data) => {
  return request({
    method: 'get',
    url: `/apiEngine/channel/getSmsDefaultChannelList`,
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export const deleteSmsTemplate = (id) => {
  return request.delete(`/ai-call-platform-back/api/sms/templates/${id}`)
}

// 编辑短信模板
export const editSmsTemplate = (data) => {
  return request({
    method: 'patch',
    url: `/apiEngine/smsTemplate/update`,
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export const getSmsSignatureList = (data) => {
  return request({
    url: '/apiEngine/smsSignature/list',
    method: 'get',
    params: data
  })
}

export const addSmsSignature = (data) => {
  return request({
    url: '/apiEngine/smsSignature/add',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export const updateSmsSignature = (data) => {
  return request({
    url: '/apiEngine/smsSignature/update',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export const deleteSmsSignature = (data) => {
  return request({
    url: '/apiEngine/smsSignature/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export const deleteTemplate = (data) => {
  return request({
    url: '/apiEngine/smsTemplate/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export const editSmsSignature = (id, data) => {
  return request.patch(`/ai-call-platform-back/api/sms/signatures/${id}`, data)
}

/**
 * 创建短信任务
 * @param { object } params
 */
export const createSmsTask = (params) => {
  return request({
    url: '/apiEngine/smsJob/createSmsJob',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 修改短信任务
 * @param { object } params
 */
export const editSmsTask = (params) => {
  return request({
    url: '/apiEngine/smsJob/modifySmsJob',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

/**
 * 删除短信任务
 * @param { Number } smsJobId 短信任务ID
 */
export const deleteSmsTask = (smsJobId) => {
  return request({
    url: `/apiEngine/smsJob/delete?smsJobId=${smsJobId}`,
    method: 'post'
  })
}

/**
 * 获取短信任务列表
 * @param { object } params
 */
export const getSmsTaskList = (params) => {
  return request({
    url: '/apiEngine/smsJob/list',
    method: 'get',
    params
  })
}

/**
 * 获取短信任务详情
 * @param { Number } smsJobId
 */
export const getSmsTaskDetail = (smsJobId) => {
  return request({
    url: `/apiEngine/smsJob/getSmsJobInfo?smsJobId=${smsJobId}`
  })
}

// 短信任务状态流转
export const flowSms = (smsJobId, operation) => {
  return request({
    url: `/apiEngine/smsJob/execute?smsJobId=${smsJobId}&operation=${operation}`,
    method: 'post'
  })
}

// 手动添加导入
export const manualImportSms = (params) => {
  return request({
    url: '/apiEngine/customerPerson/addAndImportSmsJob',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 短信任务操作日志列表
export const getSmsJobLogList = (params) => {
  return request({
    url: '/apiEngine/smsJob/jobLogList',
    params
  })
}

// 模糊搜索任务列表
export const getSimpleSmsJobList = (params) => {
  return request({
    url: '/apiEngine/smsJob/searchSmsJob',
    params
  })
}

// 获取金融短信条数
export const getSmsMobileOperatorStats = (params) => {
  return request({
    url: '/apiEngine/smsJob/smsMobileOperatorStats',
    params
  })
}

export const exportSmsMsg = (params) => {
  return request({
    url: '/apiEngine/smsJob/exportMsg',
    method: 'get',
    params
  })
}

export const exportIntentSmsMsg = (params) => {
  return request({
    url: '/apiEngine/intentMessage/exportMsg',
    method: 'post',
    params
  })
}
