import request from '@/utils/request'

// 获取客户列表
export const getList = (data) => {
  return request({
    url: `/apiEngine/intentLevelTag/list`,
    params: data,
    method: 'get'
  })
}

// 删除客户的客户分组
export const addGroup = (data) => {
  return request({
    url: `/apiEngine/intentLevelTag/create`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const addTags = (data) => {
  return request({
    url: `/apiEngine/intentLevelTagDetail/updateOrSave`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 编辑客户
export const editGroup = (data) => {
  return request({
    url: `/apiEngine/intentLevelTag/updateIntentLevelTag`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const delGroup = (data) => {
  return request({
    url: `/apiEngine/intentLevelTag/delete`,
    params: data,
    method: 'get'
  })
}

export const copyGroup = (data) => {
  return request({
    url: `/apiEngine/intentLevelTag/copy`,
    params: data,
    method: 'get'
  })
}

export const setDefault = (data) => {
  return request({
    url: `/apiEngine/intentLevelTag/setDefaultIntentLevelTag`,
    params: data,
    method: 'get'
  })
}
