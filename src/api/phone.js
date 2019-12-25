import request from '@/utils/request'

export function fetchPhoneLocation(params) {
  return request({
    url: '/apiEngine/phoneLocation/query',
    method: 'get',
    params
  })
}
