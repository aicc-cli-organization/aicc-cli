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

export const START_MODE = {
  AUTO: '自动启动',
  MANUAL: '手动启动'
}

export const PHONE_TYPE = {
  MOBILE: '手机',
  LANDLINE: '固定电话',
  UNFIXED_CALL: '无主叫号码'
}

export const overviewDuration = [
  {
    backKey: 'LESS_10S',
    boxText: '<10s',
    'background-color': 'rgba(24, 144, 255, .6)',
    num: 0
  },
  {
    backKey: 'F10S_T1MIN',
    boxText: '10s～1min',
    'background-color': 'rgba(24, 144, 255, .5)',
    num: 0
  },
  {
    backKey: 'F1MIN_T2MIN',
    boxText: '1~2min',
    'background-color': 'rgba(24, 144, 255, .4)',
    num: 0
  },
  {
    backKey: 'F2MIN_T3MIN',
    boxText: '2~3min',
    'background-color': 'rgba(24, 144, 255, .3)',
    num: 0
  },
  {
    backKey: 'F3MIN_TMORE',
    boxText: '>3min',
    'background-color': 'rgba(24, 144, 255, .2)',
    num: 0
  }
]

export const overviewChatRound = [
  {
    backKey: 'LESS_3',
    boxText: '0~3轮',
    'background-color': 'rgba(184, 145, 221, .5)',
    num: 0
  },
  {
    backKey: 'F3_T6',
    boxText: '4～6轮',
    'background-color': 'rgba(184, 145, 221, .4)',
    num: 0
  },
  {
    backKey: 'F6_T10',
    boxText: '7～9轮',
    'background-color': 'rgba(184, 145, 221, .3)',
    num: 0
  },
  {
    backKey: 'F10_MORE',
    boxText: '10轮以上',
    'background-color': 'rgba(184, 145, 221, .2)',
    num: 0
  }
]

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
  SYSTEM_ERROR: '外呼失败'
}

export const CALL_STATUS_ARRAY = [
  ['ANSWERED'],
  [
    'NO_ANSWER',
    'POWER_OFF',
    'BUSY',
    'OUT_OF_SERVICE',
    'REFUSED',
    'VACANT_NUMBER',
    'CAN_NOT_CONNECT'
  ],
  [
    'FROM_PHONE_ERROR',
    'SYSTEM_ERROR'
  ]
]

export const SMS_STATUS_ENUM = {
  SEND_SUCCESSFUL: '发送成功',
  SENDING: '发送中',
  SEND_FAILURE: '发送失败',
  SEND_POSTPONE: '待发送'
}

export const SMS_STATUS_ARRAY = [
  ['SEND_SUCCESSFUL'],
  ['SENDING'],
  ['SEND_FAILURE'],
  ['SEND_POSTPONE']
]

const statusBgColorMap = {
  0: 'rgba(86, 198, 90, 0.14)',
  1: 'rgba(236, 184, 69, 0.2)',
  2: 'rgba(243, 55, 76, 0.1)'
}
const statusTxColorMap = {
  0: '#06AC0D',
  1: '#E99209',
  2: '#F3374C'
}
export const switchStatusColor = (status) => {
  let index = 0
  switch (status) {
    case 'IN_PROCESS': case 'COMPLETED': case 'RUNNABLE':
      index = 0
      break
    case 'TERMINATE': case 'SYSTEM_SUSPENDED': case 'WAITING_FOR_REDIAL':
      index = 2
      break
    default:
      index = 1
  }
  return { bgColor: statusBgColorMap[index], color: statusTxColorMap[index] }
}

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
  USER_PAUSE: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  ACCOUNT_DEBT: [{
    text: '开始任务',
    value: 'START',
    icon: 'icon-bofang'
  }],
  NO_ROBOT_AVAILABLE: [{
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

// 准备删除
export const EDIT_TYPE_LIST = [
  'USER_PAUSE',
  'NOT_STARTED',
  'ACCOUNT_DEBT',
  'NO_ROBOT_AVAILABLE',
  'SYSTEM_HANG_UP'
]

// 准备删除
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
  NO_ROBOT_AVAILABLE: '没有可用坐席',
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
  'tenantPhoneNumber': '主叫号码',
  'realIntentLevel': '客户意向',
  'customerConcern': '客户关注点',
  'properties': '自定义变量',
  'wechatPushUserName': '微信推送人',
  'customerGroupName': '客户分组',
  'wechatPushTime': '微信推送时间',
  'transferType': '转接人工',
  'transferPhoneNumber': '转人工号码'
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
    label: '客户名称',
    searchKey: 'customerPersonName',
    placeholder: '请输入客户名称'
  }
]

export const initFormFields = {
  admin: false, // 测试后门
  concurrencyQuota: 1, // 并发数
  enableConcurrency: false, // 开启多并发
  robotCallJob: {
    name: undefined, // 任务名称
    dialogFlowId: undefined, // 话术模版id
    mode: 'MANUAL', // 启动方式
    startTime: undefined, // 启动日期
    dailyStartTime: '09:00', // 可拨打时间段开始时间
    dailyEndTime: '20:00', // 可拨打时间段结束时间
    // inactiveStartTime: undefined,
    // inactiveEndTime: undefined,
    inactiveTimeList: [{ // 不可拨打时间段列表
      startTime: '',
      endTime: ''
    }],
    phoneType: 'MOBILE', // 坐席类型
    robotCount: 0, // 一线多并发数量，容易产生歧义，注意！，AI数量
    smsAlertLevelCode: [], // 短信推送意向类型
    smsTemplateId: undefined, // 短信模版id
    wechatAlertLevelCode: [], // 意向微信推送意向等级
    wechatConditionAlertLevelCode: [], // 时长意向微信推送意向等级
    wechatAlertChatDurationThreshold: 1, // 通话限制时长
    alertUsers: [], // 微信推送人
    wechatSendMethod: undefined, // 微信推送方式
    transferCustomer: false, // 同事将客户分配至对应推送人
    earlyWarningAlertUsers: [], // 预警消息推送人
    redialCondition: ['NO_ANSWER', 'BUSY'],
    redialInterval: 0.1,
    redialTimes: 1,
    transferPhoneChooseType: 'POLLING',
    description: undefined
  },
  jobPhoneNumberIdList: [], // 坐席列表
  // jobTasksFileUrl: undefined,
  transferPhoneNumber: [] // 转人工线路列表
}

export const phoneTypeRadioGroup = {
  MOBILE: '手机',
  LANDLINE: '固话',
  UNFIXED_CALL: '无主叫'
}

export const redialConditionMap = {
  'NO_ANSWER': '无应答',
  'BUSY': '忙线中',
  'POWER_OFF': '关机',
  'OUT_OF_SERVICE': '停机',
  'REFUSED': '拒接',
  'CAN_NOT_CONNECT': '无法接通',
  'FROM_PHONE_ERROR': '主叫欠费',
  'SYSTEM_ERROR': '外呼失败'
}

export const redialTimesMap = [
  1,
  2,
  3
]

const phoneNumberregex = /^((852|853|010|02\d|0[3-9]\d{2})\d{7,8}$)|(^1[3456789]\d{9}$)/
export const transferPhoneNumberValidator = (rule, value, callback) => {
  let isPhoneNumber = true
  for (let i = 0; i < value.length; i++) {
    if (!phoneNumberregex.test(value[i])) {
      isPhoneNumber = false
      break
    }
  }
  if (value.length === 0) {
    callback(new Error('请选择转人工号码'))
  } else if (!isPhoneNumber) {
    callback(new Error('转人工号码必须为手机格式或座机号'))
  } else {
    callback()
  }
}

export const formRules = {
  'robotCallJob.name': [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在1到20个字符', trigger: 'blur' }
  ],
  'robotCallJob.dialogFlowId': [{ required: true, message: '请选择话术模板', trigger: 'change' }],
  'robotCallJob.mode': [{ required: true, message: '请选择启动方式', trigger: 'change' }],
  'robotCallJob.startTime': [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  'robotCallJob.dailyStartTime': [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  'robotCallJob.dailyEndTime': [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  jobPhoneNumberIdList: [{ required: true, message: '请选择线路', trigger: 'change' }],
  'robotCallJob.smsAlertLevelCode': [{ type: 'array', required: true, message: '请选择短信推送人', trigger: 'change' }],
  'robotCallJob.smsTemplateId': [{ required: true, message: '请选择短信模板', trigger: 'change' }],
  'robotCallJob.alertUsers': [{ required: true, message: '请选择微信推送人', trigger: 'change' }],
  'robotCallJob.wechatSendMethod': [{ required: true, message: '请选择推送方式', trigger: 'change' }],
  'robotCallJob.earlyWarningAlertUsers': [{ required: true, message: '请选择预警消息推送人', trigger: 'change' }],
  'robotCallJob.redialCondition': [{ type: 'array', required: true, message: '请选择自动重拨设置', trigger: 'change' }],
  'robotCallJob.redialInterval': [
    { required: true, message: '请输入间隔时长', trigger: ['change', 'blur'] },
    { pattern: /^0(\.\d)$|^0?[1-9](\.\d)?$|^1[0-9](\.\d)?$|^2[0-3](\.\d)?$|^24$/, message: '请输入0-24的数字，最多一位小数' }
  ],
  'robotCallJob.redialTimes': [
    { required: true, message: '请输入重拨次数', trigger: 'change' }
  ],
  'robotCallJob.csStaffGroupId': [{ required: true, message: '请选择人工介入坐席组', trigger: 'change' }]
}

export const formFields = {
  admin: false, // 测试后门
  concurrencyQuota: 1, // 并发数
  enableConcurrency: false, // 开启多并发
  robotCallJob: {
    name: undefined, // 任务名称
    dialogFlowId: undefined, // 话术模版id
    mode: 'MANUAL', // 启动方式
    startTime: null, // 启动日期
    dailyStartTime: '09:00', // 可拨打时间段开始时间
    dailyEndTime: '20:00', // 可拨打时间段结束时间
    inactiveTimeList: [{ // 不可拨打时间段列表
      startTime: '',
      endTime: ''
    }],
    phoneType: 'MOBILE', // 坐席类型
    robotCount: 0, // 一线多并发数量，容易产生歧义，注意！，AI数量
    smsAlertLevelCode: [], // 短信推送意向类型
    smsTemplateId: undefined, // 短信模版id
    wechatAlertLevelCode: [], // 意向微信推送意向等级
    wechatConditionAlertLevelCode: [], // 时长意向微信推送意向等级
    wechatAlertChatDurationThreshold: 1, // 通话限制时长
    alertUsers: [], // 微信推送人
    wechatSendMethod: undefined, // 微信推送方式
    transferCustomer: false, // 同事将客户分配至对应推送人
    earlyWarningAlertUsers: [], // 预警消息推送人
    redialCondition: ['NO_ANSWER', 'BUSY'],
    redialInterval: 0.1,
    redialTimes: 1,
    transferPhoneChooseType: 'POLLING',
    description: undefined
  },
  jobPhoneNumberIdList: [], // 坐席列表
  transferPhoneNumber: [] // 转人工线路列表
}
