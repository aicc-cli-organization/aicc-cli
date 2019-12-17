import Store from '@/store'
const customerStr = Store.getters.customerStr

export const TASK_STATUS = {
  NOT_STARTED: '未开始',
  IN_PROCESS: '进行中',
  COMPLETED: '已完成',
  RUNNABLE: '可运行',
  USER_PAUSE: '用户暂停',
  SYSTEM_SUSPENDED: '系统暂停',
  IN_QUEUE: '排队中',
  ACCOUNT_DEBT: '账户欠费',
  SYSTEM_HANG_UP: '系统挂起'
}

export const FRONT_UPLOAD_SINGLE = 'FRONT_UPLOAD_SINGLE' // 这个key前端定的；后端要求双声道和单声道是一样的；
export const UPLOAD_RECORD = 'UPLOAD'
export const conditionRanges = ['CS_CALL_OUT', 'CALLIN_TO_CS']
export const disableCsSeatRangeEnum = {
  [UPLOAD_RECORD]: '上传双声道录音',
  [FRONT_UPLOAD_SINGLE]: '上传单声道录音'
}
export const QUALITY_RANGE = {
  CS_CALL_OUT: '人工外呼',
  CALLIN_TO_CS: '呼入接待',
  ...disableCsSeatRangeEnum
}

export const QUALITY_TYPE = {
  CALLING: '事中',
  CALL_AFTER: '事后'
}

export const RULE_TYPE = {
  CS_STANDARD: '客服规范',
  STANDARD_TALK: '标准话术',
  POLITE_WORDS: '礼貌用语',
  FORBID_WORDS: '服务禁语',
  OVER_PROMISE: '过度承诺',
  COMPLAIN: '投诉倾向'
}

export const RULE_PROPERTY = {
  KEY_WORDS: '质检关键词',
  FOCUS: '业务关注点'
}

export const RULE_WEIGHT = {
  1: '加分项',
  '-1': '减分项'
}

export const RULE_ENABLE = {
  DISABLE: '否',
  ENABLE: '是'
}

export const DELETE_STATUSES = [
  'NOT_STARTED',
  'USER_PAUSE',
  'COMPLETED'
]

export const RULE_RATE = {
  UNIT_CALL: '每通电话',
  ONCE: '每次'
}

export const QC_STATUS = {
  NOT_START: '未开始',
  PENDING: '处理中',
  COMPLETED: '处理完成'
}

export const DEL_UNCHECKED_STATUSED = [
  'NOT_START'
]

export const LOG_TYPE_MAP = {
  QC_CREATE: '新建',
  QC_UPDATE: '更新',
  QC_DELETE: '删除',
  QC_START_PAUSE: '开始/暂停任务',
  QC_VIEW_DETAIL: '查看通话详情',
  QC_MADE: '人工复核'
}

export const CHANNEL_VALUE_MAP = {
  CUSTOMER: customerStr,
  CS: '客服'
}

export const UPLOAD_RECORD_STATUSES = [
  'NOT_STARTED',
  'USER_PAUSE',
  'SYSTEM_SUSPENDED',
  'COMPLETED'
]

export const EDIT_STATUES = [
  'NOT_STARTED',
  'USER_PAUSE',
  'SYSTEM_HANG_UP'
]

export const HANDLE_STATUS = {
  NOT_START: '未开始',
  PENDING: '处理中',
  COMPLETED: '处理完成',
  FAIL: '处理失败'
}
