import request from '@/utils/request'

// 获取所有线路列表
export const getList = (data) => {
  return request({
    url: `/apiEngine/tenantPhoneNumber/get`,
    method: 'get',
    params: data
  })
}

// 获取线路列表
export const getActiveTenantPhoneNumberList = (data) => {
  return request({
    url: `/apiEngine/tenantPhoneNumber/getActive`,
    method: 'get',
    params: data
  })
}

export const selectSupportCallInList = (data) => {
  return request({
    url: `/apiEngine/tenantPhoneNumber/selectSupportCallInList`,
    method: 'get',
    params: data
  })
}

// 获得一个租户的线路列表
export const getTenantPhoneNumberList = (data) => {
  return request({
    url: `/apiEngine/tenantPhoneNumber/list`,
    method: 'get',
    params: data
  })
}

// 获得一个租户自有的线路列表
export const getOwnerLineList = (data) => {
  return request({
    url: `/apiEngine/tenantPhoneNumber/getOwnerLineList`,
    method: 'get',
    params: data
  })
}

// 获得一个租户绑定的线路列表
export const getBindLineList = (data) => {
  return request({
    url: `/apiEngine/tenantPhoneNumber/getBindLineList`,
    method: 'get',
    params: data
  })
}

// 拉取公司所分配的人工坐席账号
export const csAccountList = (data) => {
  return request({
    url: `/apiEngine/csRobot/csAccountList`,
    method: 'get',
    params: data
  })
}

// 更新线路
export const updateNumber = (data) => {
  return request({
    url: `/apiEngine/tenantPhoneNumber/modify`,
    method: 'patch',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 线路余额转移
export const transferLineMoney = (data) => {
  return request({
    url: `/apiEngine/tenantPhoneNumber/transferLineMoney`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 新建或者添加人工坐席
export const createOrUpdateAccount = (data) => {
  return request({
    url: '/apiEngine/csRobot/createOrUpdateAccount',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

export const getCsGroupAndStaff = (params) => {
  return request({
    url: '/apiEngine/csRobot/getCsGroupAndStaff',
    method: 'get',
    params
  })
}

// 新建或者添加人工坐席
export const addOrUpdateGroup = (data) => {
  return request({
    url: '/apiEngine/csRobot/addOrUpdateGroup',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 更新人工坐席状态
export const updateCsStaffStatus = (data) => {
  return request({
    url: '/apiEngine/csRobot/updateCsStaffStatus',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 更新人工坐席组 状态
export const updateGroupStatus = (data) => {
  return request({
    url: '/apiEngine/csRobot/updateGroupStatus',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 获取呼入线路列表
export const fetchCallInLineList = params => {
  return request({
    url: '/apiEngine/tenantPhoneNumber/selectNoUseSupportCallInList',
    method: 'get',
    params
  })
}

// 获取坐席组列表
export const fetchStaffGroupList = (params, urlParams) => {
  return request({
    url: '/apiEngine/csRobot/staffGroupList' + (urlParams ? '?' + urlParams : ''),
    method: 'get',
    params
  })
}

export const getUserAllByTenant = data => {
  return request({
    url: '/apiPlatform/user/getUserAllByTenant',
    method: 'post',
    data
  })
}

// 查询外呼策略组列表
export const getPolicyGroupList = params => {
  return request({
    url: '/apiEngine/policyGroup/getList',
    method: 'get',
    params
  })
}

// 检查是否有网关和策略组
export const containsPolicyGroupAndGateway = params => {
  return request({
    url: '/apiEngine/policyGroup/containsPolicyGroupAndGateway',
    method: 'get',
    params
  })
}
