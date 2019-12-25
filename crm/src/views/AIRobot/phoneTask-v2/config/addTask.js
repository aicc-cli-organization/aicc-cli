import { phoneNumberregex } from '@/utils/regexp'

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

export const wechatPushConditionListValidator = (rule, value, callback) => {
  for (const item of value) {
    if (!item.intentLevelCodes.length) {
      callback(new Error('请选择意向标签'))
      break
    }
    if (!item.durationThreshold) {
      callback(new Error('请输入通话时长'))
      break
    }
    if (!/^[1-9]\d*$/.test(item.durationThreshold)) {
      callback(new Error('通话时长仅支持正整数'))
      break
    }
    if (!item.wechatSendMethod) {
      callback(new Error('请选择微信推送方式'))
      break
    }
    if (!item.userIds.length) {
      callback(new Error('请选择微信推送人'))
      break
    }
  }
  callback()
}
export const formRules = {
  'robotCallJob.name': [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在1到20个字符', trigger: 'blur' }
  ],
  'robotCallJob.dialogFlowId': [{ required: true, message: '请选择话术模板', trigger: 'change' }],
  'robotCallJob.mode': [{ required: true, message: '请选择启动方式', trigger: 'change' }],
  'robotCallJob.startTime': [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  'robotCallJob.endTime': [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  'robotCallJob.dailyStartTime': [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  'robotCallJob.dailyEndTime': [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  jobPhoneNumberIdList: [{ required: true, message: '请选择线路', trigger: 'change' }],
  'robotCallJob.smsAlertLevelCode': [{ type: 'array', required: true, message: '请选择短信推送人', trigger: 'change' }],
  'robotCallJob.smsTemplateId': [{ required: true, message: '请选择短信模板', trigger: 'change' }],
  'robotCallJob.alertUsers': [{ required: true, message: '请选择微信推送人', trigger: 'change' }],
  'robotCallJob.wechatSendMethod': [{ required: true, message: '请选择推送方式', trigger: 'change' }],
  'robotCallJob.earlyWarningAlertUsers': [{ required: true, message: '请选择预警消息推送人', trigger: 'change' }],
  'robotCallJob.redialCondition': [{ type: 'array', message: '请选择自动重拨设置', trigger: 'change' }],
  'robotCallJob.redialInterval': [
    { required: true, message: '请输入间隔时长', trigger: ['change', 'blur'] },
    { pattern: /^0(\.\d)$|^0?[1-9](\.\d)?$|^1[0-9](\.\d)?$|^2[0-3](\.\d)?$|^24|^0$/, message: '请输入0-24的数字，最多一位小数' }
  ],
  'robotCallJob.redialTimes': [
    { required: true, message: '请输入重拨次数', trigger: 'change' }
  ],
  'robotCallJob.csStaffGroupId': [{ required: true, message: '请选择人工介入坐席组', trigger: 'change' }],
  'robotCallJob.csDistributionMethod': [{ required: true, message: '请选择分配方式', trigger: 'change' }],
  'robotCallJob.callCenterStaffGroupId': [{ required: true, message: '请选择转第三方呼叫中心', trigger: 'change' }],
  'robotCallJob.transferTenantPhoneNumberId': [{ required: true, message: '请选择呼叫人工使用的线路', trigger: 'change' }]
  // 'robotCallJob.wechatPushConditionList': [{ validator: wechatPushConditionListValidator }]
}

export const getWechatPushConditionItem = () => ({
  intentLevelCodes: [],
  durationThreshold: undefined,
  userIds: [],
  wechatSendMethod: undefined,
  transferCustomer: false
})
const wechatPushConditionItem = getWechatPushConditionItem()

export const getInitFormFields = () => ({
  admin: false,
  concurrencyQuota: 1,
  enableConcurrency: false,
  robotCallJob: {
    name: undefined,
    useFreeAi: false,
    dialogFlowId: undefined,
    csStaffGroupId: undefined,
    mode: 'MANUAL',
    startTime: '',
    endTime: '',
    dailyStartTime: '09:00',
    dailyEndTime: '20:00',
    inactiveStartTime: undefined,
    inactiveEndTime: undefined,
    inactiveTimeList: [{
      startTime: '',
      endTime: ''
    }],
    inactiveDateList: [{
      datePicker: []
    }],
    csDistributionMethod: '',
    phoneType: 'MOBILE',
    robotCount: 0,
    smsAlertLevelCode: [],
    smsTemplateId: undefined,
    // alertUsers: [], // 去掉
    // wechatSendMethod: undefined, // 去掉
    earlyWarningAlertUsers: [],
    // wechatAlertChatDurationThreshold: 1, // 去掉
    // wechatAlertLevelCode: [], // 去掉
    // wechatConditionAlertLevelCode: [], // 去掉
    wechatPushConditionList: [wechatPushConditionItem],
    description: undefined,
    redialCondition: ['CALL_LOSS', 'NO_ANSWER', 'BUSY'],
    redialInterval: 0.1,
    redialTimes: 1,
    // transferCustomer: false, // 去掉
    transferPhoneChooseType: 'POLLING',
    transferTenantPhoneNumberId: undefined,
    daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    connectRedialCondition: [],
    tenantCallInterceptId: undefined
  },
  jobPhoneNumberIdList: [],
  jobTasksFileUrl: undefined,
  transferPhoneNumber: []
})

export const jobPhoneNumberSelectConfig = {
  MOBILE: {
    label: '手机坐席',
    options: [],
    multipleLimit: 100,
    placeholder: '请选择手机坐席'
  },
  LANDLINE: {
    label: '固话坐席',
    options: [],
    multipleLimit: 1,
    placeholder: '请选择固话坐席'
  },
  UNFIXED_CALL: {
    label: '无主叫坐席',
    options: [],
    multipleLimit: 1,
    placeholder: '请选择无主叫坐席'
  },
  CALL_POLICY_GROUP: {
    label: '策略组名',
    options: [],
    multipleLimit: 1,
    placeholder: '请选择策略组'
  }
}
