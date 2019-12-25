import request from '@/utils/request'

// 获取租户默认标签组
export const getTenantDefaultIntentLevelTag = (data) => {
  return request({
    url: `/apiEngine/intentLevelTag/getTenantDefault`,
    method: 'get',
    params: data
  })
}

//  获取简要意向分类标签列表
export const getSimpleIntentLevelTagList = (data) => {
  return request({
    url: `/apiEngine/intentLevelTag/getSimpleIntentLevelTagList`,
    method: 'get',
    params: data
  })
}

//  获取意向标签分组
export const getIntentLevelTag = (data) => {
  return request({
    url: `/apiEngine/intentLevelTag/getIntentLevelTag`,
    method: 'get',
    params: data
  })
}
