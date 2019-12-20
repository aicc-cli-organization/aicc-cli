// import Store from '../store'
// const Store = window.$nuxt.$store

const customerStr = '客户' // Store.getters.customerStr

// 文本内容为空时显示 '-'
export const emptyPlaceholder = '--'

// 主动话术
export const MAIN_DIALOG_FLOW = 'MAIN_DIALOG_FLOW'

// 问答知识
export const MULTI_ROUND_DIALOG = 'MULTI_ROUND_DIALOG'

//  任务状态
export const robotCallJobStatus = {
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
  EXPIRED: '系统暂停',
  ACCOUNT_DISABLE: '账户禁用',
  MAINTAIN: '系统维护'
}

// 任务状态
export const taskStatus = {
  CAN_NOT_START: '不可运行',
  CAN_START: '可运行',
  // NOT_STARTED: '未开始',
  // AUTO_RETRY: '未开始',
  IN_PROCESS: '进行中',
  COMPLETED: '已完成',
  APPOINTMENT_RETRY: '预约重播'
  // ALTERNATE: '未开始'
}

// 电话接听状态
export const resultStatus = {
  ANSWERED: '已接听',
  NO_ANSWER: '无应答',
  BUSY: '忙线中',
  POWER_OFF: '关机',
  OUT_OF_SERVICE: '停机',
  REFUSED: '拒接',
  VACANT_NUMBER: '空号',
  CAN_NOT_CONNECT: '无法接通',
  FROM_PHONE_ERROR: '主叫欠费',
  SYSTEM_ERROR: '外呼失败',
  CALL_LOSS: '多并发呼损',
  TRANSFER_ARTIFICIAL: '转人工呼损'
}

export const resultStatusMultipleOptions = [
  {
    value: 'ANSWERED',
    label: '已接听'
  }, {
    value: 'NO_ANSWER',
    label: '无应答'
  }, {
    value: 'BUSY',
    label: '忙线中'
  }, {
    value: 'POWER_OFF',
    label: '关机'
  }, {
    value: 'OUT_OF_SERVICE',
    label: '停机'
  }, {
    value: 'REFUSED',
    label: '拒接'
  }, {
    value: 'VACANT_NUMBER',
    label: '空号'
  }, {
    value: 'CAN_NOT_CONNECT',
    label: '无法接通'
  }, {
    value: 'FROM_PHONE_ERROR',
    label: '主叫欠费'
  }, {
    value: 'SYSTEM_ERROR',
    label: '外呼失败'
  }
]

// 短信模板类型
export const smsTemplateTypeENUM = {
  DIALOG: '挂机短信',
  NOTICE: '通知短信',
  CUSTOME: '自定义短信'
}

// 短信模板审核状态
export const smsTemplateCheckStatusENUM = {
  PENDING_APPROVAL: '等待审核',
  APPROVED: '审核通过',
  REJECTED: '拒绝'
}

// 客户来源
export const customerSourceENUM = {
  IMPORTED_FROM_INTERNATIONAL_WATERS: '公海导入',
  UPLOADED_BY_YOURSELF: '自主上传',
  TRANSFERED_FROM_OTHERS: '他人转入'
}

// 短信发送类型
export const messageSendStatusENUM = {
  SEND_SUCCESSFUL: '发送成功',
  SENDING: '发送中',
  SEND_FAILURE: '发送失败',
  SEND_WAIT: '待发送',
  SEND_POSTPONE: '延后发送',
  SEND_DEBT: '余额不足'
}

export const phoneTypeENUM = {
  LANDLINE: '固定电话',
  UNFIXED_CALL: '无主叫',
  MOBILE: '手机'
}

// 客户意向等级
export const intentLevelENUM = {
  A: 'A级(意向较强)',
  B: 'B级(意向一般)',
  C: 'C级(需筛选)',
  D: 'D级(意向较弱)',
  E: 'E级(需再跟进)',
  F: 'F级(无需跟进)'
}

export const intentLevelArray = [
  { key: 'A', value: 'A级(意向较强)' },
  { key: 'B', value: 'B级(意向一般)' },
  { key: 'C', value: 'C级(需筛选)' },
  { key: 'D', value: 'D级(意向较弱)' },
  { key: 'E', value: 'E级(需再跟进)' },
  { key: 'F', value: 'F级(无需跟进)' }
]

export const wechatAlertTypeENUM = [
  {
    key: 'SENDTOALL',
    value: '全部推送'
  }, {
    key: 'SENDTOONE',
    value: '依次推送'
  }, {
    key: 'SENDTOTRANSFER',
    value: '优先推送介入人'
  }
]

// 导入导出任务 状态列表
export const springBatchJobENUM = {
  UNKNOWN: '未知',
  EXECUTING: '正在运行',
  COMPLETED: '已经完成',
  COMPLETED_WITH_SKIPS: '已经完成，由于运行过程中出现错误，有些记录被跳过，点击下载查看具体原因',
  STOPPING: '正在停止',
  STOPPED: '已经停止',
  FAILED: '运行失败',
  UPLOAD_FILE: '上传文件中',
  QUEUEING: '排队中'
}

// 转移
export const transferType = {
  NO_TRANSFER: '无转人工',
  TRANSFERED: '已转人工',
  TRANSFER_CUSTOMER_FAILED: `${customerStr}未等待`,
  TRANSFER_MANUAL_FAILED: '人工未应答',
  TRANSFER_ERROR: '转人工失败'
}

// 导入导出任务 类型
export const springBatchJobTypeENUM = {
  IMPORT_PRIVATE_CUSTOMERS: `我的${customerStr}导入${customerStr}`,
  EXPORT_PRIVATE_CUSTOMERS: `我的${customerStr}导出${customerStr}`,
  CRM_EXPORT_BATCH_IMPORT_WHITE_LINE: '批量导入白名单',
  IMPORT_CUSTOMERS_TO_JOB: `导入${customerStr}到任务`,
  EXPORT_CALL_RECORDS: '导出联系历史',
  EXPORT_CALL_RECORDS_FROM_JOB: `已呼${customerStr}列表导出通话记录`,
  EXPORT_CALL_COST: '导出话费详单',
  EXPORT_CALL_STATUS_INFO: '导出通话统计信息',
  EXPORT_CALL_COST_INFO: '导出通话费用信息（按日期汇总）',
  EXPORT_MESSAGE_COST_INFO: '导出短信费用信息（按日期汇总）',
  EXPORT_CALL_COST_MONTH_INFO: '导出通话费用信息（按月汇总）',
  EXPORT_MESSAGE_COST_MONTH_INFO: '导出短信费用信息（按月汇总）',
  IMPORT_CUSTOMERS_RE_ADD_JOB: `已呼${customerStr}列表重新添加${customerStr}到任务`,
  IMPORT_CUSTOMERS_ADD_JOB: `我的${customerStr}导入到任务`,
  EXPORT_TENANT_COST_LIST_LINE: '导出租户线路消费流水',
  EXPORT_DISTRIBUTOR_CUSTOMER: `导出分销商${customerStr}`,
  EXPORT_DIRECT_CUSTOMER: `导出直销${customerStr}`,
  IMPORT_PUBLIC_CUSTOMERS: `${customerStr}公海导入${customerStr}`,
  EXPORT_PUBLIC_CUSTOMERS: `${customerStr}公海导出${customerStr}`,
  IMPORT_FROM_TASK_TO_JOB: `导入未呼${customerStr}列表到其他任务`,
  EXPORT_TENANT_COST_LIST_MESSAGE: '导出租户短信消费流水',
  EXPORT_DISTRIBUTOR: '导出分销商',
  EXPORT_TENANT_CALL_STATUS: `导出${customerStr}统计分析`,
  EXPORT_DETAIL_CALL_STATUS: `导出${customerStr}统计分析详情`,
  EXPORT_ALL_RECHARGE_RECORD: '导出充值记录',
  IMPORT_LAST_RECORD_RE_ADD_JOB: `已呼${customerStr}列表重新添加${customerStr}到任务`,
  EXPORT_LAST_CALL_RECORDS: '导出联系历史',
  EXPORT_CALL_RECORDS_FROM_ROBOT_CALL_JOB: '导出呼叫任务的联系历史',
  EXPORT_CALL_RECORDS_FROM_TRAINING: '导出话术训练的联系历史',
  EXPORT_CALL_RECORDS_FROM_DIRECT_CALL: '导出快速拨打的联系历史',
  EXPORT_RECHARGE_DISTRIBUTE_STREAM: '导出充值记录',
  EXPORT_SUB_ACCOUNT_CALL_COST: '导出子账号线路计费',
  EXPORT_SUB_ACCOUNT_SMS_COST: '导出子账号短信计费',
  EXPORT_SUB_ACCOUNT_CALL_RECORD: '导出子账号话单明细',
  IMPORT_CALL_RECORD_FROM_JOB_RE_ADD_JOB: `呼叫任务联系历史重新添加${customerStr}到任务`,
  EXPORT_TO_BE_CALLED_TASK: `导出未呼${customerStr}列表`,
  IMPORT_PHONE_NUMBER_TO_JOB: '导入手机号码到短信任务',
  EXPORT_SMS_STATS_JOB: '导出短信统计',
  IMPORT_FROM_EXCEL: `excel导入${customerStr}`,
  EXPORT_CALL_IN_COST_INFO: '导出呼入通话费用信息（按日汇总）',
  EXPORT_CALL_IN_COST_MONTH_INFO: '导出呼入通话费用信息（按月汇总）',
  CS_BATCH_IMPORT_EXCEL: `导入${customerStr}到人工外呼批量任务`,
  EXPORT_UNIDENTIFIED_CALL_DETAIL_MACHINE: '导出机器判定记录',
  EXPORT_UNIDENTIFIED_CALL_DETAIL_MAN: '导出人工巡检记录'
}

// 跟进状态
export const followStatusENUM = {
  CLUE: '线索',
  AI_INITIAL_VISIT: 'AI初访',
  AI_FOLLOW_UP: 'AI持续跟进',
  PEOPLE_INITIAL_VISIT: '人工初访',
  PEOPLE_FOLLOW_UP: '人工持续跟进',
  QUOTE: '报价',
  DEAL: '成交',
  LOSS: '流失'
}

export const followStatusOptions = [
  {
    key: 'AI_INITIAL_VISIT',
    label: 'AI初访'
  }, {
    key: 'PEOPLE_INITIAL_VISIT',
    label: '人工初访'
  }, {
    key: 'FOLLOW_UP',
    label: '持续跟进'
  }

]

// 对话轮次
export const roundToString = {
  LESS_3: '少于3轮',
  F3_T6: '3-6轮',
  F6_T10: '6-10轮',
  F10_MORE: '大于10轮'
}

// 通话时长
export const durationToString = {
  LESS_10S: '<10秒',
  F10S_T1MIN: '10秒-1分钟',
  F1MIN_T2MIN: '1分钟-2分钟',
  F2MIN_T3MIN: '2分钟-3分钟',
  F3MIN_TMORE: '>3分钟'
}

// export const durationToString = {
//   LESS_10S: '<10秒',
//   F10S_T1MIN: '10秒-1分钟',
//   F1MIN_T2MIN: '1分钟-2分钟',
//   F2MIN_T3MIN: '2分钟-3分钟',
//   F3MIN_TMORE: '>3分钟'
// }
export const durationOptions = [
  {
    key: 'LESS_10S',
    value: '<10秒'
  }, {
    key: 'F10S_T1MIN',
    value: '10秒-1分钟'
  }, {
    key: 'F1MIN_T2MIN',
    value: '1分钟-2分钟'
  }, {
    key: 'F2MIN_T3MIN',
    value: '2分钟-3分钟'
  }, {
    key: 'F3MIN_TMORE',
    value: '>3分钟'
  }
]

// 跟踪状态
export const trackStatusOptions = [
  {
    key: 'DEFECT',
    value: '缺陷'
  }, {
    key: 'FOLLOWING',
    value: '跟进中'
  }, {
    key: 'LATER',
    value: '暂不处理'
  }, {
    key: 'IDLE',
    value: '未跟随'
  }, {
    key: 'DONE',
    value: '已解决'
  }, {
    key: 'CLOSED',
    value: '已关闭'
  }
]

export const customType = [{
  value: 'A',
  name: `A类${customerStr}`
}, {
  value: 'B',
  name: `B类${customerStr}`
}, {
  value: 'C',
  name: `C类${customerStr}`
}, {
  value: 'D',
  name: `D类${customerStr}`
}, {
  value: 'E',
  name: `E类${customerStr}`
}, {
  value: 'F',
  name: `F类${customerStr}`
}]

// 反馈状态枚举
export const feedbackStatusENUM = {
  WAITING: '待处理',
  DONE: '已解决',
  WRONG: '待解决',
  CHECKING: '待确认'
}

// 反馈状态
export const feedbackStatusOptions = [
  {
    key: 'WAITING',
    value: '待处理'
  }, {
    key: 'DONE',
    value: '已解决'
  }, {
    key: 'WRONG',
    value: '待解决'
  }, {
    key: 'CHECKING',
    value: '待确认'
  }
]

// 问题类型枚举
export const issueTypeENUM = {
  OFFICIAL: '事务性',
  ERROR: '故障类',
  ADVICE: '意见建议'
}

// 问题类型
export const issueTypeOptions = [
  {
    key: 'OFFICIAL',
    value: '事务性'
  }, {
    key: 'ERROR',
    value: '故障类'
  }, {
    key: 'ADVICE',
    value: '意见建议'
  }
]

// 缺陷状态
export const defectStatusENUM = [
  {
    key: 'TECHNOLOGY',
    value: '科技'
  }, {
    key: 'DIALOG',
    value: '话术'
  }, {
    key: 'KEYWORD',
    value: '关键字'
  }, {
    key: 'HOTWORD',
    value: '热词'
  }
]

// 归属地类型
export const callTypeOptions = [
  {
    key: 'LOCAL',
    value: '本地'
  }, {
    key: 'LONG',
    value: '外地'
  }
]

// 归属地类型（包含）
export const callTypeOptions2 = [
  {
    key: 'LOCAL',
    value: '本地'
  }, {
    key: 'LONG',
    value: '外地'
  }, {
    key: 'LONG2',
    value: '月租'
  }
]

// 分类
export const rechargeHandleTypeENUM = {
  TENANT_LINE_RECHARGE: `${customerStr}线路充值`,
  DISTRIBUTOR_LINE_RECHARGE: '代理商线路充值',
  DISTRIBUTOR_LINE_DISTRIBUTE: '代理商线路分配',
  TENANT_MESSAGE_RECHARGE: `${customerStr}短信充值`,
  DISTRIBUTOR_MESSAGE_RECHARGE: '代理商短信充值',
  DISTRIBUTOR_MESSAGE_DISTRIBUTE: '代理商短信分配',
  TRANSFER_LINE_MONEY: `${customerStr}线路转移余额`,
  TENANT_QC_RECHARGE: '质检账户充值'
}

export const smsTemplateTypeEnum = {
  NOTICE: '通知类',
  MARKETING: '营销类',
  FINANCE: '金融类',
  GAME: '游戏类',
  SOCIAL: '社交类',
  CREDIT_CARD: '信用卡类',
  COLLECTION: '催收类'
}

export const REGISTER_TYPE_MAP = {
  IP: 'ip对接',
  ACCOUNT: 'sip对接'
}

export const timeList = [
  {
    value: '周一',
    key: 'MONDAY'
  }, {
    value: '周二',
    key: 'TUESDAY'
  }, {
    value: '周三',
    key: 'WEDNESDAY'
  }, {
    value: '周四',
    key: 'THURSDAY'
  }, {
    value: '周五',
    key: 'FRIDAY'
  }, {
    value: '周六',
    key: 'SATURDAY'
  }, {
    value: '周日',
    key: 'SUNDAY'
  }
]

