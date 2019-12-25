import request from '@/utils/request'

const prefix = '/apiPlatform/user'

export const getUserList = (params) => {
  return request({
    url: prefix + '/list',
    method: 'get',
    params
  })
}

export const getInterceptInfo = () => {
  return request({
    url: '/apiEngine/callIntercept/getTenantInterceptList',
    method: 'get'
  })
}

export const updateIntercept = data => {
  return request({
    url: '/apiEngine/callIntercept/updateIntercept',
    method: 'post',
    type: 'json',
    data
  })
}

export const setDefaultTenantIntercept = params => {
  return request({
    url: '/apiEngine/callIntercept/setDefaultTenantIntercept',
    method: 'get',
    params
  })
}

export const deleteTenantIntercept = params => {
  return request({
    url: '/apiEngine/callIntercept/deleteTenantIntercept',
    method: 'get',
    params
  })
}

export const selectPolicyList = params => {
  return request({
    url: '/apiEngine/tenant/selectPolicyList',
    method: 'get',
    params
  })
}

// 获取所有用户列表（不分页）
export const getAllUserList = (data) => {
  return request({
    url: prefix + '/listOrganizationManager',
    method: 'get',
    params: data
  })
}

// 获取所有用户列表（分页）
export const getUserListPage = (data) => {
  return request({
    url: prefix + '/getUserList',
    method: 'get',
    params: data
  })
}

// 获取所有用户列表（不分页）
export const getUserByTenant = (data) => {
  return request({
    url: prefix + '/getUserByTenant',
    method: 'post',
    data
  })
}

// 获取所有用户列表（不分页，数据全）
export const getWholeUserList = () => {
  return request({
    url: prefix + '/all',
    method: 'get'
  })
}

// 获取微信推送的用户
export const getUserListByWechat = () => {
  return request({
    url: prefix + '/getUserByWechat',
    method: 'get'
  })
}

// 获取成员详情
export const getUserDetail = (params) => {
  return request({
    url: prefix + '/updateUserInfoList',
    method: 'get',
    params
  })
}

// 获取具有短信签名的客户
export const getSmsTemplateUserList = (data) => {
  return request({
    url: '/apiEngine/users?hasSmsTemplate=1',
    method: 'get',
    params: data
  })
}

export const addUser = (data) => {
  return request({
    url: prefix + '/add',
    method: 'post',
    type: 'json',
    data
  })
}
// 停用用户
export const stopUser = (data) => {
  return request({
    url: prefix + '/blockUp',
    method: 'post',
    data
  })
}

// 启用用户
export const enableUser = (data) => {
  return request({
    url: prefix + '/enable',
    method: 'post',
    data
  })
}

// 删除用户
export const delUser = (data) => {
  return request({
    url: prefix + '/delete',
    method: 'post',
    data
  })
}

// 设为部门负责人
export const promotion = (data) => {
  return request({
    url: prefix + '/promotion',
    method: 'post',
    params: data
  })
}

// 取消部门负责人
export const demotion = (data) => {
  return request({
    url: prefix + '/demotion',
    method: 'post',
    params: data
  })
}

export const editUser = (data) => {
  return request({
    url: prefix + '/update',
    method: 'post',
    type: 'json',
    data
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: prefix + '/updatePassword',
    method: 'post',
    data
  })
}

// 重置密码
export const resetPassword = (data) => {
  return request({
    url: prefix + '/resetPassword',
    method: 'post',
    data
  })
}

// 获取人工坐席相关信息
export const getArtificialInfo = params => {
  return request({
    url: '/apiEngine/user/csRobotInfo',
    method: 'get',
    params
  })
}

// 获取人工坐席的拨号信息
export const getArtificialDialInfo = params => {
  return request({
    url: '/apiEngine/user/csDialInfo',
    method: 'get',
    params
  })
}

// 在线时轮询坐席状态
export const updateOnlineStatus = data => {
  return request({
    url: '/apiEngine/callIn/dispatch/updateOnLineStatus',
    method: 'post',
    data
  })
}
