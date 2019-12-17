import Store from '@/store'

const customerStr = Store.getters.customerStr

export const TASK_STATUS = {
  NOT_STARTED: '未开始',
  IN_QUEUE: '排队中',
  IN_PROCESS: '进行中',
  USER_PAUSE: '用户暂停',
  SYSTEM_SUSPENDED: '系统暂停',
  COMPLETED: '已完成',
  TERMINATE: '已终止',
  SYSTEM_HANG_UP: '系统挂起'
}

export const FILTER_TASK_STATUS = {
  NOT_STARTED: '未开始',
  IN_QUEUE: '排队中',
  IN_PROCESS: '进行中',
  USER_PAUSE: '用户暂停',
  'SYSTEM_SUSPENDED,MAINTAIN,WAITING_FOR_REDIAL,EXPIRED': '系统暂停',
  COMPLETED: '已完成',
  SYSTEM_HANG_UP: '系统挂起'
}

export const START_MODE = {
  AUTO: '自动启动',
  MANUAL: '手动启动'
}

export const PHONE_TYPE = {
  MOBILE: '手机',
  LANDLINE: '固定电话',
  UNFIXED_CALL: '无主叫号码',
  CALL_POLICY_GROUP: '外呼策略组'
}

// 接听状态
export const CALL_RECORD_STATUS = {
  ANSWERED: '已接听',
  NO_ANSWER: '无应答',
  BUSY: '忙线中',
  POWER_OFF: '关机',
  OUT_OF_SERVICE: '停机',
  REFUSED: '拒绝接听',
  VACANT_NUMBER: '空号',
  CAN_NOT_CONNECT: '无法连接',
  FROM_PHONE_ERROR: '主叫欠费',
  SYSTEM_ERROR: '外呼失败',
  TRANSFER_ARTIFICIAL: '转人工呼损',
  CALL_LOSS: '多并发呼损'
}

export const ANSWER_STATUS_ARRAY = [
  ['ANSWERED', 'TRANSFER_ARTIFICIAL'],
  [
    'NO_ANSWER',
    'POWER_OFF',
    'BUSY',
    'OUT_OF_SERVICE',
    'REFUSED',
    'VACANT_NUMBER',
    'CAN_NOT_CONNECT',
    'CALL_LOSS'
  ],
  [
    'FROM_PHONE_ERROR',
    'SYSTEM_ERROR'
  ]
]
export const ANSWER_STATUS_COLOR_ENUM = {
  0: '#5BD360',
  1: '#F7BE43',
  2: '#F3F3F3'
}

export const SMS_STATUS_ENUM = {
  SEND_SUCCESSFUL: '发送成功',
  SENDING: '发送中',
  SEND_FAILURE: '发送失败',
  SEND_POSTPONE: '待发送',
  SEND_CANCEL: '取消发送'
}

export const SMS_STATUS_ARRAY = [
  ['SEND_SUCCESSFUL'],
  ['SENDING'],
  ['SEND_FAILURE'],
  ['SEND_POSTPONE'],
  ['SEND_CANCEL']
]

// 准备删除
// 任务 - 可操作字段
export const TASK_OPERATION_ENUM = {
  NOT_STARTED: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  SYSTEM_SUSPENDED: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  WAITING_FOR_REDIAL: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  IN_QUEUE: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  IN_PROCESS: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  EXPIRED: [{
    text: '暂停任务',
    value: 'PAUSE',
    icon: 'icon-stop'
  }],
  USER_PAUSE: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  SYSTEM_HANG_UP: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  ACCOUNT_DISABLE: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }]
}

export const EDIT_TYPE_LIST = [
  'USER_PAUSE',
  'NOT_STARTED',
  'SYSTEM_HANG_UP'
]

export const nextStartTimePrefixMap = {
  WAITING_FOR_REDIAL: '未到重拨时间段, ',
  SYSTEM_SUSPENDED: '当前已不在可运行时间段, '
}

//  任务状态
export const STATUS_MAP = {
  NOT_STARTED: '未开始',
  IN_PROCESS: '进行中',
  COMPLETED: '已完成',
  RUNNABLE: '可运行',
  USER_PAUSE: '用户暂停',
  SYSTEM_SUSPENDED: '系统暂停',
  TERMINATE: '已终止',
  IN_QUEUE: '排队中',
  // ACCOUNT_DEBT: '账户欠费',
  // NO_ROBOT_AVAILABLE: '没有可用坐席',
  SYSTEM_HANG_UP: '系统挂起',
  WAITING_FOR_REDIAL: '系统暂停',
  ACCOUNT_DISABLE: '账户禁用'
}

// 微信推送方式
export const WECHAT_ALERT_MAP = {
  SENDTOALL: '全部推送',
  SENDTOONE: '依次推送'
}

// 自动重拨枚举
export const REDIAL_CONDITION_MAP = {
  'NO_ANSWER': '无应答',
  'BUSY': '忙线中',
  'POWER_OFF': '关机',
  'OUT_OF_SERVICE': '停机',
  'REFUSED': '拒接',
  'CAN_NOT_CONNECT': '无法接通',
  'FROM_PHONE_ERROR': '主叫欠费',
  'SYSTEM_ERROR': '外呼失败'
}

export const tableHeaders = {
  'callRecordId': '通话记录id',
  'name': '姓名',
  'phoneNumber': '联系电话',
  'chatDuration': '呼叫时长',
  'resultStatus': '通话状态',
  'hangupBy': '挂断状态',
  'startTime': '通话时间',
  'redialTimes': '自动重拨次数',
  'tenantPhoneNumber': '主叫号码',
  'realIntentLevel': `${customerStr}意向`,
  'customerConcern': `${customerStr}关注点`,
  'properties': '自定义变量',
  'wechatPushUserName': '微信推送人',
  'customerGroupName': `${customerStr}分组`,
  'wechatPushTime': '微信推送时间'
  // ,
  // 'transferType': '转接人工',
  // 'transferPhoneNumber': '转人工号码'
}

export const optionList = [
  {
    label: '电话号码',
    searchKey: 'calledPhoneNumber',
    placeholder: '请输入电话号码'
  },
  {
    label: '通话记录ID',
    searchKey: 'callRecordId',
    placeholder: '请输入通话记录ID'
  },
  {
    label: `${customerStr}名称`,
    searchKey: 'customerPersonName',
    placeholder: `请输入${customerStr}名称`
  }
]

export const initFormFields = {
  admin: false,
  concurrencyQuota: 1,
  enableConcurrency: false,
  robotCallJob: {
    name: undefined,
    dialogFlowId: undefined,
    mode: 'MANUAL',
    startTime: undefined,
    dailyStartTime: '09:00',
    dailyEndTime: '20:00',
    inactiveStartTime: undefined,
    inactiveEndTime: undefined,
    inactiveTimeList: [{
      startTime: '',
      endTime: ''
    }],
    phoneType: 'MOBILE',
    robotCount: 0,
    smsAlertLevelCode: [],
    smsTemplateId: undefined,
    alertUsers: [],
    wechatSendMethod: undefined,
    earlyWarningAlertUsers: [],
    wechatAlertChatDurationThreshold: 1,
    wechatAlertLevelCode: [],
    wechatConditionAlertLevelCode: [],
    description: undefined,
    redialCondition: ['NO_ANSWER', 'BUSY'],
    redialInterval: 0.1,
    redialTimes: 1,
    transferCustomer: false,
    transferPhoneChooseType: 'POLLING'
  },
  jobPhoneNumberIdList: [],
  jobTasksFileUrl: undefined,
  transferPhoneNumber: []
}

// 人工坐席类型
export const CS_GROUP_MAP = {
  AI: 'AI',
  CS: '人工',
  TEL: '话机端',
  THIRD_PARTY: '呼叫中心'
}

export const OPERATOR_MAP = {
  yd_send_count: '移动',
  lt_send_count: '联通',
  dx_send_count: '电信'
}

export const LOG_TYPE_ENUM = {
  ROBOTCALLJOB_CREATE: '创建',
  ROBOTCALLJOB_UPDATE: '更新',
  ROBOTCALLJOB_DELETE: '删除',
  ROBOTCALLJOB_START: '任务开始',
  ROBOTCALLJOB_PAUSE: '任务暂停',
  ROBOTCALLJOB_TERMINATE: '任务停止',
  ROBOTCALLJOB_READD: '重新添加拨打任务',
  ROBOTCALLJOB_IMPORT: `批量导入${customerStr}`,
  ROBOTCALLJOB_ADD_ONE: `单个导入${customerStr}`
}

export const FILTER_LOG_TYPE_ENUM = {
  ...LOG_TYPE_ENUM
}

export const phoneTypeEnum = {
  MOBILE: '手机',
  LANDLINE: '固话',
  UNFIXED_CALL: '无主叫'
}

export const redialTimesEnum = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10
]

export const redialConditionEnum = {
  'CALL_LOSS': `呼损${customerStr}`,
  'NO_ANSWER': '无应答',
  'BUSY': '忙线中',
  'REFUSED': '拒接',
  'POWER_OFF': '关机',
  'OUT_OF_SERVICE': '停机',
  'CAN_NOT_CONNECT': '无法接通',
  'FROM_PHONE_ERROR': '主叫欠费',
  'SYSTEM_ERROR': '外呼失败'
}

export const timeListEnum = {
  'MONDAY': '星期一',
  'TUESDAY': '星期二',
  'WEDNESDAY': '星期三',
  'THURSDAY': '星期四',
  'FRIDAY': '星期五',
  'SATURDAY': '星期六',
  'SUNDAY': '星期日'
}

export const timeListSortEnum = {
  'MONDAY': 1,
  'TUESDAY': 2,
  'WEDNESDAY': 3,
  'THURSDAY': 4,
  'FRIDAY': 5,
  'SATURDAY': 6,
  'SUNDAY': 7
}

/**
 * 当前时间与某个时间点比较
 * @param {string} time "05:00:00"
 */
export const isAfterNow = (time) => {
  const date = new Date()
  const currHour = date.getHours()
  const currMinute = date.getMinutes()
  const currSecond = date.getSeconds()
  const endHour = time.split(':')[0]
  const endMinute = time.split(':')[1]
  const endSecond = time.split(':')[2]
  return (currHour * 3600 + currMinute * 60 + currSecond * 1) > (endHour * 3600 + endMinute * 60 + endSecond * 1)
}

/**
 * 合并times
 * eg: times = [0, 1, 2, 3]
 * return [0~1, 1~2, 2~3]
 */
export const getMergeTimes = (times) => {
  const tmpTimes = []
  for (let i = 0; i < times.length - 1; i++) {
    if (!(i % 2)) {
      tmpTimes.push(`${times[i]}~${times[i + 1]}`)
    }
  }
  return tmpTimes
}

/**
 * format 百分数
 */
export const getPercent = (numerator, denominator) => {
  if (!numerator || !denominator) return 0

  const digit = Math.min(numerator / denominator * 100, 100) // 最大展示100

  return Number.isInteger(digit) ? digit : digit.toFixed(2) // 小数的话保持小数点后两位
}
