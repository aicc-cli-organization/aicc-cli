import request from '@/utils/request'

// 恢复任务
export const resumeJob = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/resumeJob`,
    method: 'get',
    params: data
  })
}

// 暂停任务
export const stopJob = (data) => {
  return request({
    url: `/apiEngine/springBatchJob/stopJob`,
    method: 'get',
    params: data
  })
}
