import request from '@/utils/request'

// 获取省份信息
export function getProvinceList() {
  return request({
    url: '/apiEngine/gateway/getProvinces',
    server: 'ope',
    method: 'get'
  })
}

// 获取 市 信息
export function getCityList(data) {
  return request({
    url: '/apiEngine/gateway/getCitiesByProvince',
    server: 'ope',
    method: 'get',
    params: data
  })
}

// 获取修改信息
export function updateConfig(data) {
  return request({
    url: '/apiEngine/gateway/updatePort',
    server: 'ope',
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'post',
    data
  })
}

// 设置拨打时间间隔
export function updateCallInterval(data) {
  return request({
    url: '/apiEngine/tenantPhoneNumber/updateCallInterval',
    method: 'post',
    params: data
  })
}

// 获取设备列表
export function getPhoneNumberList(data) {
  return request({
    url: '/apiEngine/phoneCard/getPortList',
    server: 'ope',
    method: 'get',
    params: data
  })
}

// 添加账户
export function addAccount(data) {
  return request({
    url: '/apiEngine/phoneCard/add',
    server: 'ope',
    method: 'post',
    data
  })
}

// 线路归属者列表
export function getOwnerList(data) {
  return request({
    url: '/apiEngine/phoneCard/getOwnerList',
    server: 'ope',
    method: 'get',
    params: data
  })
}

// freeswitch服务器列表
export function freeswitchGroupList(data) {
  return request({
    url: '/apiEngine/phoneCard/freeswitchGroupList',
    server: 'ope',
    method: 'get',
    params: data
  })
}

// 线路接通率统计
export function getPhoneNumberAnsweredRate(data) {
  return request({
    url: '/apiEngine/phoneNumberStats/getPhoneNumberAnsweredRate',
    server: 'ope',
    method: 'get',
    params: data
  })
}
