import request from '@/utils/request'

export const formatData = (data) => {
  return request({
    url: `/apiEngine/callStatsIndex/dataFormat`,
    data
  })
}

export const formatData2 = (data) => {
  return request({
    url: `/apiEngine/callStatsIndex/dataFormat2`,
    data
  })
}
