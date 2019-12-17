import Store from '@/store'
const customerStr = Store.getters.customerStr

export const PRIVATE = 'PRIVATE_LIST'
export const PUBLIC = 'PUBLIC_LIST'
export const CONTACT_HISTORY = 'CALL_RECORD'
export const ALL_CUSTOMER = 'ALL_LIST'
export const modules = {
  [PRIVATE]: `我的${customerStr}`,
  [PUBLIC]: `${customerStr}公海`,
  [CONTACT_HISTORY]: '联系历史',
  [ALL_CUSTOMER]: `所有${customerStr}`
}
