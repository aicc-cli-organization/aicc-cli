import request from '@/utils/request'

const apiObj = {
  crm: {
    dialogFlowPrefix: '/apiEngine/intentLevelTag',
    enginePrefix: '/apiEngine'
  },
  ope: {
    dialogFlowPrefix: '/apiOpe/intentLevelTag',
    enginePrefix: '/apiOpe'
  },
  boss: {
    dialogFlowPrefix: '/apiBoss/intentLevelTag',
    enginePrefix: '/apiBoss'
  }
}

export function getList(data, type) {
  return request({
    url: apiObj[type]['dialogFlowPrefix'] + '/list',
    params: data,
    method: 'get'
  })
}

export function getTagList(data, type) {
  return request({
    url: apiObj[type]['dialogFlowPrefix'] + '/getIntentLevelTag',
    params: data,
    method: 'get'
  })
}
