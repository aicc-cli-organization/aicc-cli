import request from '@/utils/request'

// 删除策略组
export function deletePolicy(data) {
  return request({
    url: 'apiEngine/policyGroup/delete',
    method: 'post',
    data
  })
}
