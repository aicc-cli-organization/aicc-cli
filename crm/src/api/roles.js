import request from '@/utils/request'

const prefix = '/apiPlatform/role'

export function fetchRoleList() {
  return request({
    url: prefix + '/listRoles',
    method: 'get'
  })
}

export function fetchRoleDetail(params) {
  return request({
    url: prefix + '/authorityList',
    method: 'get',
    params
  })
}

export function updateRole(data) {
  return request({
    url: prefix + '/update',
    method: 'post',
    type: 'json',
    data
  })
}

export function addRole(data) {
  return request({
    url: prefix + '/add',
    method: 'post',
    type: 'json',
    data
  })
}

export function deleteRole(params) {
  return request({
    url: prefix + '/delete',
    method: 'delete',
    params
  })
}

// 保存权限
export function saveAuthority(data) {
  return request({
    url: '/apiPlatform/authority/insertOrUpdateAuthority',
    method: 'post',
    type: 'json',
    data
  })
}
