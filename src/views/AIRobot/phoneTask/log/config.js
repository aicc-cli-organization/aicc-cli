// import Store from '@/store'
const Store = window.$nuxt.$store

const customerStr = Store.getters.customerStr

export const OPERATION_TYPE_LIST = [{
  key: null,
  value: '全部操作类型'
}, {
  key: 'ROBOTCALLJOB_CREATE',
  value: '创建'
}, {
  key: 'ROBOTCALLJOB_UPDATE',
  value: '更新'
}, {
  key: 'ROBOTCALLJOB_DELETE',
  value: '删除'
}, {
  key: 'ROBOTCALLJOB_START',
  value: '任务开始'
}, {
  key: 'ROBOTCALLJOB_PAUSE',
  value: '任务暂停'
}, {
  key: 'ROBOTCALLJOB_TERMINATE',
  value: '任务停止'
}, {
  key: 'ROBOTCALLJOB_READD',
  value: '重新添加拨打任务'
}, {
  key: 'ROBOTCALLJOB_IMPORT',
  value: `批量导入${customerStr}`
}, {
  key: 'ROBOTCALLJOB_ADD_ONE',
  value: `单个导入${customerStr}`
}]

export const OPERATION_TYPE_TEXT = {
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
