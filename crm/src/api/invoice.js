import request from '@/utils/request'

// 新建发票
export const create = (data) => {
  return request({
    url: '/apiEngine/rechargeBillApply/create',
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获得某个充值记录的发票信息
export const get = (data) => {
  return request({
    url: `/apiEngine/rechargeBillApply/get`,
    params: data,
    method: 'get'
  })
}

// 撤回发票
export const updateStatus = (data) => {
  return request({
    url: '/apiEngine/rechargeBillApply/updateStatus',
    data,
    method: 'post'
  })
}
