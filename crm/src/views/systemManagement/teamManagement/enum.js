// import Store from '@/store'
const Store = window.$nuxt.$store
const customerStr = Store.getters.customerStr

export const tableHeaders = {
  'nickname': '用户名',
  'name': '姓名',
  'phoneNumber': '联系电话',
  'roleName': '角色',
  'customerCountLimit': `可领取${customerStr}数`,
  'customerDaysLimit': `可拥有${customerStr}天数`,
  'robotCountLimit': '可拥有坐席数',
  'gender': '性别',
  'job': '职位',
  'comment': '工作描述',
  'status': '使用状态'
}

export const optionList = [
  {
    label: '姓名',
    searchKey: 'name',
    placeholder: '请输入姓名'
  },
  {
    label: '用户名',
    searchKey: 'nickName',
    placeholder: '请输入用户名'
  },
  {
    label: '联系电话',
    searchKey: 'phoneNumber',
    placeholder: '请输入联系电话'
  }
]
