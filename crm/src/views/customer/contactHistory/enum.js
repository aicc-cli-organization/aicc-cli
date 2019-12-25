export const tableHeadersForSit = {
  'callRecordId': '通话记录id',
  'name': '姓名',
  'gender': '性别',
  'phoneNumber': '联系电话',
  'robotCallJobName': '坐席名称',
  'startTime': '呼叫时间',
  'tenantPhoneNumber': '主叫号码',
  'notifyType':'请求接听',
  'csName':'接入人员',
  'resultStatus': '通话状态',
  'chatDuration': '呼叫时长'
}

// export const tableHeadersForReceptions = {
//   'callRecordId': '通话记录id',
//   'name': '姓名',
//   'phoneNumber': '联系电话',
//   'line': '呼入线路',
//   'csName': '接听坐席',
//   'dialogFlowName': '应用话术',
//   'startTime': '呼入时间',
//   'resultStatus': '通话状态',
//   'chatDuration': '呼入时长'
// }
export const tableHeadersForReceptions = {
  'callRecordId': '通话记录id',
  'name': '姓名',
  'gender': '性别',
  'phoneNumber': '联系电话',
  'line': '呼入线路',
  'mode': '接待方式',
  'aiGroupNames': '接待AI坐席组',
  'csGroupNames': '接待人工坐席组',
  'csStatus': '人工坐席接听情况',
  'dialogFlowNames': '应用话术',
  'startTime': '呼入时间',
  'resultStatus': '通话状态',
  'chatDuration': '呼入时长'
}

export const optionList = [{
  label: '联系电话',
  searchKey: 'calledPhoneNumber',
  placeholder: '请输入联系电话'
}, {
  label: '通话记录id',
  searchKey: 'callRecordId',
  placeholder: '请输入通话记录id'
}, {
  label: '姓名',
  searchKey: 'customerPersonName',
  placeholder: '请输入姓名'
}, {
  label: '坐席名称',
  searchKey: 'robotName',
  placeholder: '请输入坐席名称'
}]

export const optionListForReceptions = [{
  label: '联系电话',
  searchKey: 'searchCustomerPhone',
  placeholder: '请输入联系电话'
}, {
  label: '通话记录id',
  searchKey: 'searchCallInRecordId',
  placeholder: '请输入通话记录id'
}, {
  label: '姓名',
  searchKey: 'searchCustomerName',
  placeholder: '请输入姓名'
}]

export const resultStatusMultipleOptions = {
  ANSWERED: '已接听',
  NO_ANSWER: '无应答'
}
