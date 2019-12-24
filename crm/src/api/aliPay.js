import request from '@/utils/request'

// 查询一个客户的所有历史通话记录
export const aliPay = (data) => {
  return request({
    url: '/apiEngine/aliPay/pay',
    data,
    type: 'json',
    method: 'post'
  })
}
