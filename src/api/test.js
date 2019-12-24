import request from '@/utils/request'

// import qs from 'qs'

export function test() {
  return request({
    url: '/local/user/error',
    method: 'post',
    data: { a: 'a' }
  })
}
