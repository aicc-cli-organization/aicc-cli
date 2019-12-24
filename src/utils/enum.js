// import Store from '../store'
// const Store = window.$nuxt.$store

const customerStr = '客户' // Store.getters.customerStr

// 跳转结点action
export const jumpNodeActionEnum = {
  HANGUP: '挂机',
  NEXT_STEP: '下一主动流程',
  SPECIFIED_STEP: '指定主动流程'
}

// 话术审核状态
export const checkStatus = {
  DRAFT: '草稿',
  PENDING_APPROVAL: '待审核',
  APPROVED: '已审核'
}

// 问答知识类型
export const knowledgeTypeEnum = {
  GENERAL: '一般问题',
  BUSINESS: '业务问题',
  DEFAULT: '内置问题'
}

// 问答知识action
export const knowledgeActionEnum = {
  HANG_UP: '挂机',
  WAIT: '等待用户应答',
  ORIGINAL: '回到原主动流程',
  USER_SPECIFIED: '跳转到用户指定流程'
}

// 查看状态
export const readStatusEnum = {
  NOT_READ: '未读',
  HAS_READ: '已读'
}
// 人工外呼
export const noticeStatusEnum = {
  NOTIFY_SUCCESS: '已通知',
  NOTIFY_FAIL: '通知失败',
  NOTIFY_NOT_EXIST: '未通知'
}

export const knowledgeAnswerTypeEnum = {
  DIRECT_ANSWER: '直接回答',
  DIALOG_FLOW_ANSWER: '问答知识流程'
}

export const intentLevelEnum = {
  A: {
    text: 'A级',
    type: 'success'
  },
  B: {
    text: 'B级',
    type: 'primary'
  },
  C: {
    text: 'C级',
    type: 'warning'
  },
  D: {
    text: 'D级',
    type: 'warning'
  },
  E: {
    text: 'E级',
    type: 'danger'
  },
  F: {
    text: 'F级',
    type: 'danger'
  }
}

export const branchPropertyEnum = {
  DEFINITE: '肯定',
  NEGATIVE: '否定',
  DECLINE: '拒绝',
  COLLECT_DATA: '收集信息'
}

export const addTypeEnum = {
  OTHER: '其他',
  INTENT: '意向',
  DECLINE: '拒绝'
}

export const auditsEnum = {
  CREATE: '创建话术',
  UPDATE: '更新话术',
  RECORD: '录音',
  PUBLISH_APPLY: '申请上线',
  APPROVAL: '审核通过',
  REJECT: '审核未通过'
}

// 账号状态
export const userStatusEnum = {
  ENABLED: '正常',
  CLOSED: '停止'
}

// 性别
export const genderEnum = {
  MALE: '男',
  FEMALE: '女'
}

// 搜索类型
export const searchEnum = {
  BUY: '购买',
  DALATATION: '扩容',
  DELAY: '延期',
  ADJUST_SERVICE_CYCLE: '调整服务周期与并发数'
}

// 挂断状态
export const hangupEnum = {
  REMOTE_HANGUP: `${customerStr}挂断`,
  INITIAL_HANGUP: 'AI挂断',
  CS_HANGUP: '客服挂断'
}

// 语音类型
export const voiceTypeEnum = {
  'MAN_MADE': '真人语音',
  'COMPOSE': 'AI合成音'
}

// 客户等级
export const customerLevelEnum = {
  GOOD: {
    text: '优质',
    type: 'success'
  },
  GENERAL: {
    text: '一般',
    type: 'primary'
  },
  POOR: {
    text: '较差',
    type: 'danger'
  },
  UNKNOWN: {
    text: '未分类',
    type: 'label'
  }
}

// 分配方式
export const distributeTypes = {
  RANDOM: '随机分配',
  FREE: '空闲分配',
  FAMILIAR: '熟客分配'
}

// 客户来源
export const customerSourceEnum = {
  IMPORTED_FROM_INTERNATIONAL_WATERS: '公海导入',
  UPLOADED_BY_YOURSELF: '自主上传',
  TRANSFERED_FROM_OTHERS: '他人转入',
  IMPORTED_FROM_CALL_IN: '呼入指定',
  BACK_TO_PUBLIC: '退回公海',
  IMPORTED_FROM_PUSH: '推送指定'
}

// 分配方式
export const csDistributionMethodEnum = {
  FREE: '空闲分配',
  RANDOM: '随机分配',
  FOLLOW: '熟客分配'
}

// 人工坐席接听情况
export const trackStatusEnum = {
  CLUE: '线索',
  PEOPLE_INITIAL_VISIT: '人工初访',
  PEOPLE_FOLLOW_UP: '人工持续跟进',
  QUOTE: '报价',
  DEAL: '成交',
  LOSS: '流失'
}

// 交易渠道
export const payMethodsEnum = {
  OFF_LINE: '线下充值',
  ALI_PAY: '支付宝在线支付'
}

// 交易状态
export const payStatusEnum = {
  SUCCESS: '成功',
  WAITING: '待支付',
  FAILED: '失败'
}

// 通话状态
export const callStatusEnum = {
  ANSWERED: '已接听',
  NO_ANSWER: '无应答',
  BUSY: '忙线中',
  POWER_OFF: '关机',
  OUT_OF_SERVICE: '停机',
  REFUSED: '拒接',
  VACANT_NUMBER: '空号',
  CAN_NOT_CONNECT: '无法接通',
  FROM_PHONE_ERROR: '主叫欠费',
  SYSTEM_ERROR: '外呼失败'
}

export const followTypeEnum = {
  PHONE_VISIT: '电话拜访',
  SMS_VISIT: '短信拜访',
  FACE_TO_FACE_VISIT: '当面拜访',
  INTERNET_VISIT: '网络拜访',
  AI_VISIT: 'AI拜访'
}

// 白名单时长
export const whiteListReleaseCountEnum = {
  ONE_DAY: '1天',
  SEVEN_DAYS: '7天',
  HALF_MONTH: '半个月',
  ONE_MONTH: '一个月',
  ONE_SEASON: '一个季度',
  HALF_YEAR: '半年',
  ONE_YEAR: '一年',
  NO_AUTO_RELEASE: '不自动解除'
}

// 系统词典
export const systemDictionaryEnum = {
  TIME: '时间',
  ADDRESS: '地址'
}

// 坐席组类型
export const staffGroupTypeEnum = {
  AI: 'AI',
  CS: '人工'
}

// 坐席分配方式
export const staffDistributeTypeEnum = {
  RANDOM: '随机分配',
  FREE_PRIORITY: '空闲分配',
  FOLLOWER_PRIORITY: '熟客分配'
}

// 坐席组分配方式1
export const staffGroupDistributeTypeEnum = {
  RANDOM: '随机分配',
  FREE: '空闲分配',
  FOLLOW: '熟客分配'
}

// 客户自定义变量类型
export const ONE_LINE = 'SINGLE_LINE'
export const MULT_ILINE = 'MULTI_LINE'
export const DROPDOWN = 'DROP_DOWN'
export const RADIO = 'CHOICE'
export const CHECKBOX = 'CHECK_BOX'
export const SYSTEM = 'SYSTEM'
export const varTypeEnum = {
  [ONE_LINE]: {
    label: '单行文本',
    type: 'input',
    placeholder: '请输入',
    memo: '支持输入少量文字，支持属性收集，最多100字'
  },
  [MULT_ILINE]: {
    label: '多行文本',
    type: 'textarea',
    placeholder: '请输入',
    memo: '支持输入大量文字，支持属性收集，最多500字'
  },
  [DROPDOWN]: {
    label: '下拉列表',
    type: 'select',
    placeholder: '请选择',
    options: [{
      key: 'v1',
      value: '选项1'
    }, {
      key: 'v2',
      value: '选项2'
    }],
    memo: '下拉列表，多个选项中选择一个'
  },
  [RADIO]: {
    label: '单选框',
    type: 'radio',
    options: [{
      key: 'v1',
      value: '选项1'
    }, {
      key: 'v2',
      value: '选项2'
    }],
    memo: '单选，多个选项中选择一个'
  },
  [CHECKBOX]: {
    label: '复选框',
    type: 'checkbox',
    options: [{
      key: 'v1',
      value: '选项1'
    }, {
      key: 'v2',
      value: '选项2'
    }],
    memo: '多选，可以选择多个选项'
  },
  [SYSTEM]: {
    label: '系统生成',
    type: 'system'
  }
}

export const staffGroupEnum = {
  AI: 'AI',
  CS: '人工',
  TEL: '移动',
  IVR: 'ivr',
  THIRD_PARTY: '第三方呼叫中心'
}

export const SMS_STATS_MAP = {
  cmcc: '移动',
  cucc: '联通',
  cnc: '电信'
}

export const transferStatus = {
  YES: '成功',
  NO: '失败'
}

export const answerModelEnum = {
  MANUAL: '手动',
  AUTO: '自动'
}

// 批量外呼任务状态
export const batchJobStatusEnum = {
  NOT_STARTED: {
    text: '未开始',
    type: 'info',
    desc: '未开始'
  },
  IN_PROCESS: {
    text: '进行中',
    type: 'success',
    desc: '正在批量外呼'
  },
  COMPLETED: {
    text: '已完成',
    type: 'success'
  },
  RUNNABLE: {
    text: '可运行',
    type: 'primary',
    desc: '正在批量外呼'
  },
  USER_PAUSE: {
    text: '用户暂停',
    type: 'warning',
    desc: '批量外呼已暂停'
  },
  SYSTEM_SUSPENDED: {
    text: '系统暂停',
    type: 'warning',
    desc: '批量外呼已暂停'
  },
  TERMINATE: {
    text: '终止运行',
    type: 'danger'
  },
  IN_QUEUE: {
    text: '排队中',
    type: 'warning',
    desc: '排队中'
  },
  SYSTEM_HANG_UP: {
    text: '系统挂起',
    type: 'danger',
    desc: '批量外呼已挂起'
  }
}

export const EMOTION_DESC_ENUM = {
  HAPPY: '态度温柔，应该积极跟进',
  ANGRY: '言辞激烈，最近不宜再打扰'
}

export const phoneTypeEnum = {
  MOBILE: '手机',
  LANDLINE: '固话',
  UNFIXED_CALL: '无主叫'
}

export const rechargeBillApplyStatusEnum = {
  BILL_ENABLE: '开发票',
  BILL_APPLYED: '已申请',
  BILL_BACK: '撤回',
  BILL_SUCCESS: '完成',
  BILL_SEND: '已寄出'
}
