import request from '@/utils/request'

// 获取客户列表
export const getList = (data) => {
  return request({
    url: `/apiEngine/customerPerson/list`,
    data
  })
}

export const getIntentRecoveryList = (data, type) => {
  return request({
    url: '/apiEngine/callDetail/intentRecoveryList',
    method: 'get',
    params: data
  })
}

export const getVoiceRecoveryList = (data, type) => {
  return request({
    url: '/apiEngine/callDetail/voiceRecoveryList',
    method: 'get',
    params: data
  })
}

export const getLineStatsViewEnabled = () => {
  return request({
    url: `/apiEngine/lineStats/getLineStatsViewEnabled`,
    method: 'get'
  })
}

// 删除客户的客户分组
export const deleteCustomerGroup = (data) => {
  return request({
    url: `/apiEngine/customerPerson/deleteCustomerGroup`,
    params: data,
    method: 'get'
  })
}

export const getCustomerVarList = (data) => {
  return request({
    url: `/apiEngine/customerPersonExtraField/list`,
    params: data,
    method: 'get'
  })
}

export const addCustomerVar = (data) => {
  return request({
    url: `/apiEngine/customerPersonExtraField/save`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const updateCustomerVar = (data) => {
  return request({
    url: `/apiEngine/customerPersonExtraField/update`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const setDisplay = (data) => {
  return request({
    url: `/apiEngine/customerPersonExtraField/setDisplay`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const sort = (data) => {
  return request({
    url: `/apiEngine/customerPersonExtraField/sort`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const deleteField = (data) => {
  return request({
    url: `/apiEngine/customerPersonExtraField/delete`,
    params: data,
    method: 'get'
  })
}

export const getCustomerFields = (data) => {
  return request({
    url: `/apiEngine/customerPersonExtraField/list`,
    params: data,
    method: 'get'
  })
}

// 编辑客户
export const editCustomer = (data) => {
  return request({
    url: `/apiEngine/customerPerson/update`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const checkDeletable = (data) => {
  return request({
    url: `/apiEngine/customerGroup/checkDeletable`,
    params: data,
    method: 'get'
  })
}

export const deleteGroup = (data) => {
  return request({
    url: `/apiEngine/customerGroup/delete`,
    params: data,
    method: 'get'
  })
}

export const removeCustomer = (customerId) => {
  return request.delete(`/ai-call-platform-back/api/customerPersons/${customerId}`)
}

// 客户导入任务
export const addCustomertoJob = (data) => {
  return request({
    url: `/apiEngine/robotCallTask/addCustomerToJob`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// springBatchJob - 批量重新添加客户到当前任务
export const reAddCustomerToJob = (data) => {
  return request({
    url: `/apiEngine/robotCallTask/reAddCustomerToJob`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// springBatchJob - 导入客户到当前任务
export const addCustomerToJob1 = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/addCustomerToJob`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// springBatchJob - 批量重新添加客户到其他任务
export const reAddCustomerToOtherJob = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/reAddCustomerPerson`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// springBatchJob - 批量重新添加客户到其他任务
export const callRecordFromJobReAdd = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/callRecordFromJobReAdd`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// addTaskToJob
export const addTaskToJob = (data) => {
  return request({
    url: `/apiEngine/taskSpringBatch/addTaskToJob`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 从未开始的任务中删除客户
export const removeCustomerFromRobotCallJob = (data) => {
  return request({
    url: `/apiEngine/robotCallTask/deleteRobotCallTask`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 从客户列表中删除客户
export const deleteCustomer = (data) => {
  return request({
    url: `/apiEngine/customerPerson/delete`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 添加客户
export const addAndImportToRobotCallJob = (data) => {
  return request({
    url: `/apiEngine/customerPerson/addAndImportJob`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 添加客户
export const addCustomer = (data) => {
  return request({
    url: `/apiEngine/customerPerson/add`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 添加客户至白名单(批量)
export const addToWhiteList = (data) => {
  return request({
    url: `/apiEngine/customerWhiteList/add`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 添加客户至白名单(全部)
export const batchAddAndExport = (data) => {
  return request({
    url: `/apiEngine/customerWhiteList/batchAddAndExport`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 添加客户至白名单
export const deleteByQuery = (data) => {
  return request({
    url: `/apiEngine/customerWhiteList/deleteByQuery`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 从白名单中移除客户
export const removeFromWhiteList = (data) => {
  return request({
    url: `/apiEngine/customerWhiteList/delete`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 从某个用户的私海将客户导入另一个人的私海
export const moveCustomerListToOtherPerson = (data) => {
  return request({
    url: `/apiEngine/customerPerson/transfer/toOthers`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 从某个用户的私海将客户导入另一些人的私海
export const moveCustomerListToOtherPersons = (data) => {
  return request({
    url: `/apiEngine/customerPerson/transfer/toUsers`,
    data,
    method: 'post',
    type: 'json'
  })
}

// 从公海 分配给用户
export const distribute = (data) => {
  return request({
    url: `/apiEngine/customerPerson/transfer/toUsers`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 从公海将客户导入另一个人的私海
export const distributeCustomerListToUsers = (data) => {
  return request({
    url: `/apiEngine/customerPerson/transfer/toPrivateWaters`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 领取客户
export const moveToPrivateCustomerList = (data) => {
  return request({
    url: `/apiEngine/customerPerson/transfer/fromInternationalWaters`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 从某个用户的私海将客户导入公海
export const moveCustomerListToPublicSea = (data) => {
  // return request({
  //   url: `/apiEngine/customerPerson/transfer/toInternationalWaters`,
  //   data,
  //   method: 'post',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // })
  return request({
    url: `/apiEngine/customerPerson/transfer/toPublic`,
    data,
    method: 'post',
    type: 'json'
  })
}

// 添加客户分组
export const addCustomerGroup = (data) => {
  return request({
    url: `/apiEngine/customerGroup/add`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 加入白名单
export const addWhiteList = (data) => {
  return request({
    url: `/apiEngine/customerWhiteList/addone`,
    method: 'get',
    params: data
  })
}

export const updateCustomerGroup = (data) => {
  return request({
    url: `/apiEngine/customerGroup/update`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取客户分组
export const getCustomerGroupList = (data) => {
  return request({
    url: `/apiEngine/customerGroup/list`,
    data,
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 获取客户分组并限制数量
export const getCustomerGroupListLimit = (data) => {
  return request({
    url: `/apiEngine/customerGroup/list`,
    method: 'get',
    params: data
  })
}

// 获取客户跟进记录
export const getFollowedByUserList = (data) => {
  return request({
    url: '/apiEngine/customerFollowRecord/query',
    method: 'get',
    params: data
  })
}

// 获取客户跟进记录
export const addFollowRecord = (data) => {
  return request({
    url: '/apiEngine/customerFollowRecord/add',
    data,
    method: 'post'
  })
}

// 获取客户详情
export const getCustomerDetail = (data) => {
  return request({
    url: '/apiEngine/customerPerson/getCustomerPerson',
    method: 'get',
    params: data
  })
}

// 获取统计信息
export const getStatInfo = (data) => {
  return request({
    url: '/apiEngine/customerPerson/customerPersonCallRecordStatInfo',
    method: 'get',
    params: data
  })
}

// 改变用户等级
export const changeCustomerLevel = (data) => {
  return request({
    url: '/apiEngine/customerPerson/markCustomerLevel',
    method: 'post',
    data: data
  })
}

// 直接分配客户
export const distributeDirect = (data) => {
  return request({
    url: '/apiEngine/customerPerson/transfer/toUsersFixedNumber',
    method: 'post',
    type: 'json',
    data
  })
}

export const updateComment = (data) => {
  return request({
    url: '/apiEngine/customerWhiteList/updateComment',
    method: 'post',
    type: 'json',
    data
  })
}

export const updateCustomerValueRange = (data) => {
  return request({
    url: '/apiEngine/customerPersonExtraField/updateRange',
    method: 'post',
    type: 'json',
    data
  })
}

// 平均分配客户
export const distributeAverage = (data) => {
  return request({
    url: '/apiEngine/customerPerson/transfer/toUsers',
    method: 'post',
    type: 'json',
    data
  })
}

// 根据手机号获取客户信息
export const getCustomerPersonByPhoneNumber = params => {
  return request({
    url: '/apiEngine/customerPerson/getCustomerPersonByPhoneNumber',
    method: 'get',
    params
  })
}

// 批量导入白名单
export function batchimportToWhiteList(data) {
  return request({
    url: `/apiEngine/customerWhiteList/batchImportToWhiteList`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取客户标签列表(查询条件)
export const queryCustomerLevelTag = (data) => {
  return request({
    url: '/apiEngine/customerLevelTag/getCustomerLevelTagList',
    params: data,
    method: 'get'
  })
}

