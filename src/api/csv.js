import request from '@/utils/request'

export const uploadQCJobRecord = (data) => {
  return request({
    url: '/apiEngine/qcJobRecord/addJobRecordWithUploadUrl',
    method: 'post',
    type: 'json',
    data
  })
}

export const getCsvTemplate = (data) => {
  return request({
    url: `/apiEngine/customerPersonTemplate/get`,
    method: 'get',
    params: data
  })
}

export const getCsvTemplateNew = (data) => {
  return request({
    url: `/apiEngine/customerPersonTemplate/customerPersonList`,
    method: 'get',
    params: data
  })
}

export const getCsvTemplateBeforeCallJob = (data) => {
  return request({
    url: `/apiEngine/customerPersonTemplate/getBeforeCallJob`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 在客户列表中 批量导入客户
export const uploadCustomerPersonCsv = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/importCustomerPerson`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 在客户列表中 批量导入客户
export const cancelJob = (params) => {
  return request({
    url: `/apiEngine/springBatchJob/cancelJob`,
    method: 'get',
    params
  })
}

// 在任务中批量导入客户
// export const customerPersonToRobotCallJob = (data) => {
//   return request({
//     url: `/customerPersonToRobotCallJob/import`,
//     method: 'post',
//     server: 'engine',
//     params: data
//   })
// }

export const uploadUserCsv = (data) => {
  return request({
    url: `/ai-call-platform-back/api/csv/uploader/user`,
    method: 'post',
    params: data
  })
}

// 暂停任务
export const stopJob = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/stopJob`,
    method: 'get',
    params: data
  })
}

// 恢复任务
export const resumeJob = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/resumeJob`,
    method: 'get',
    params: data
  })
}

// 获取省份
export const getProvinces = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/getProvinces`,
    method: 'get',
    params: data
  })
}

// 获取城市列表
export const getCitiesByProvince = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/getCitiesByProvince`,
    method: 'get',
    params: data
  })
}

// 邹遥 新接口

// 在任务中批量导入客户
export const customerPersonToRobotCallJob = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/importCustomerPerson`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 短信群发 excel导入模版
export const getSmsExcelTemplate = (smsJobId) => {
  return request({
    url: `/apiEngine/smsJob/getTemplate?smsJobId=${smsJobId}`
  })
}

// 批量上传
export const smsJobExceImport = (params) => {
  return request({
    url: '/apiEngine/springBatchJob/importSmsJobPhoneNumber',
    method: 'post',
    params
  })
}
