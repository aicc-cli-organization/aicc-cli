import request from '@/utils/request'

// 创建一条反馈
export const create = (data) => {
  return request({
    url: `/apiEngine/feedback/create`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 对解决方案表示满意
export const like = (data) => {
  return request({
    url: `/apiEngine/feedback/like`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 对解决方案表示不满意
export const dislike = (data) => {
  return request({
    url: `/apiEngine/feedback/dislike`,
    data,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
