import request from '@/utils/request'

const prefix = '/apiPlatform/organization'

/* organizations  */
export const getOrganizationList = () => {
  return request({
    url: prefix + '/listOrganization',
    method: 'get'
  })
}

export const getOrganizationTree = () => {
  return request({
    url: prefix + '/treeOrganization',
    method: 'get'
  })
}

export const getOrganizationDetail = (params) => {
  return request({
    url: prefix + '/getOrganizationInfo',
    method: 'get',
    params
  })
}

export const deleteOrganization = (params) => {
  return request({
    url: prefix + '/deleteOrganization',
    method: 'delete',
    params
  })
}

export const addOrganization = (data) => {
  return request({
    url: prefix + '/createOrganization',
    method: 'post',
    type: 'json',
    data
  })
}
export const editOrganization = (data) => {
  return request({
    url: prefix + '/updateOrganization',
    method: 'post',
    type: 'json',
    data
  })
}
