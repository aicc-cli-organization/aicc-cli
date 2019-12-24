import request from '@/utils/request'

// 添加 网关 账户
export function gatewayAddAccount(data) {
  return request({
    url: '/apiEngine/gateway/add',
    server: 'ope',
    method: 'post',
    data
  })
}

// 编辑网关
export function updateGateway(data) {
  return request({
    url: '/apiEngine/gateway/update',
    server: 'ope',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// 更换卡号
export function gatewayChangeCard(data) {
  return request({
    url: '/apiEngine/gateway/updatePhoneNumber',
    method: 'post',
    params: data
  })
}

// 拔卡
export function pullOutPhoneCard(data) {
  return request({
    url: '/apiEngine/gateway/pullOutPhoneCard',
    server: 'ope',
    method: 'post',
    params: data
  })
}

// 获取 端口 列表
export function gatewayPortList(data) {
  return request({
    url: '/apiEngine/gateway/list',
    server: 'ope',
    method: 'post',
    params: data
  })
}

// 获取 网关 列表
export function gatewayGetList(data) {
  return request({
    url: '/apiEngine/gateway/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

