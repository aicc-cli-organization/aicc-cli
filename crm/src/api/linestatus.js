import request from '@/utils/request'

// 获取sip账号信息
export function listLineStatus(params) {
  return request({
    url: '/apiEngine/lineStats/listLineStatus',
    method: 'get',
    params
  })
}
