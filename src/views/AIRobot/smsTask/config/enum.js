// 所有的状态枚举
export const SMS_TASK_STATUS = {
  NOT_STARTED: '未开始',
  IN_PROCESS: '进行中',
  COMPLETED: '已完成',
  RUNNABLE: '可运行',
  USER_PAUSE: '用户暂停',
  SYSTEM_SUSPENDED: '系统暂停',
  IN_QUEUE: '排队中',
  ACCOUNT_DEBT: '短信欠费',
  SYSTEM_HANG_UP: '系统挂起'
}

// 筛选框状态枚举
export const FILTER_TASK_STATUS = {
  NOT_STARTED: '未开始',
  IN_PROCESS: '进行中',
  COMPLETED: '已完成',
  USER_PAUSE: '用户暂停',
  SYSTEM_SUSPENDED: '系统暂停',
  IN_QUEUE: '排队中',
  ACCOUNT_DEBT: '短信欠费',
  SYSTEM_HANG_UP: '系统挂起'
}

export const TASK_OPERATION_FLOW = {
  NOT_STARTED: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  IN_PROCESS: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  IN_QUEUE: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  USER_PAUSE: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  SYSTEM_SUSPENDED: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  SYSTEM_HANG_UP: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }]
}

// 发送状态枚举
export const SMS_SEND_MAP = {
  SEND_SUCCESSFUL: '发送成功',
  SENDING: '发送中',
  SEND_FAILURE: '发送失败',
  SEND_WAIT: '待发送',
  SEND_POSTPONE: '延后发送',
  SEND_DEBT: '余额不足'
}

// 短信任务可编辑状态集合
export const EDIT_SMS_STATUSES = [
  'NOT_STARTED',
  'IN_QUEUE',
  'USER_PAUSE',
  'SYSTEM_SUSPENDED',
  'SYSTEM_HANG_UP'
]

// 短信任务 不可删除 状态集合
export const REVERSE_DELETE_SMS_STATUSES = [
  'IN_PROCESS'
]

// 短信任务 操作类型
export const LOG_TYPE_MAP = {
  ROBOTCALLJOB_CREATE: '创建',
  ROBOTCALLJOB_UPDATE: '更新',
  ROBOTCALLJOB_DELETE: '删除',
  ROBOTCALLJOB_START: '任务开始',
  ROBOTCALLJOB_PAUSE: '任务暂停',
  ROBOTCALLJOB_TERMINATE: '任务停止'
}
