import request from '@/utils/request'

// 查询所有系统消息
export function listSystemInfo(data, appType) {
  const url =
    appType === 'crm'
      ? '/apiEngine/announcement/getAll'
      : '/apiBoss/msgNotify/getSystemMsgList'

  return request({
    url,
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 查询所有非系统消息
export function listAll(data, appType) {
  const url =
    appType === 'crm'
      ? '/apiEngine/messageQueue/listAll'
      : '/apiBoss/msgNotify/getAlertMsgList'

  return request({
    url,
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    params: data
  })
}

// 设置已读
export function setRead(data, appType) {
  const url =
    appType === 'crm'
      ? '/apiEngine/messageQueue/setMessageRead'
      : '/apiBoss/msgNotify/setMessageRead'

  return request({
    url,
    method: 'post',
    data
  })
}

//设置全部已读
export function setAllMessageRead(data, appType) {
  const url =
    appType === 'crm'
      ? '/apiEngine/messageQueue/setAllMessageRead '
      : '/apiBoss/msgNotify/setAllMessageRead '

  return request({
    url,
    method: 'post',
    data
  })
}
