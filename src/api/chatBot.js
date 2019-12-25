import request from '@/utils/request'

export const ask = (data) => {
  return request({
    url: '/apiEngine/chatBot/ask',
    data,
    method: 'post'
  })
}
