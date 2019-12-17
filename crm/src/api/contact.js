import request from '@/utils/request'

export const getDataByFilter = (data) => {
  return request({
    url: '/apiEngine/callRecord/getInfoList',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const getInfoListFromJob = (data) => {
  return request({
    url: '/apiEngine/callRecord/getInfoListFromJob',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const getInfoListFromDirectCall = (data) => {
  return request({
    url: '/apiEngine/callRecord/getInfoListFromDirectCall',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const getInfoListFromTraining = (data) => {
  return request({
    url: '/apiEngine/callRecord/getInfoListFromTraining',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const getInfoList = (data) => {
  return request({
    url: '/apiEngine/callRecord/getInfoList',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const searchCsRecord = (data) => {
  return request({
    url: '/apiEngine/csRobot/searchCsRecord',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const queryCallInRecordList = (data) => {
  return request({
    url: '/apiEngine/callIn/record/queryCallInRecordList',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
