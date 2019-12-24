import request from '@/utils/request'

// 查询所有系统消息
export function listSystemInfo(data) {
  return request({
    url: '/apiEngine/announcement/getAll',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 查询所有非系统消息
export function listAll(data) {
  return request({
    url: '/apiEngine/messageQueue/listAll',
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 设置已读
export function setRead(data) {
  return request({
    url: '/apiEngine/messageQueue/setMessageRead',
    method: 'post',
    data
  })
}
