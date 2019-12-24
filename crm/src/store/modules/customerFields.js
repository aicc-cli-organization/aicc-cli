import { getCustomerFields } from '@/api/customer'
import { cloneJSON, getTableHeader, setTableHeader, addTableHeader, delTableHeader } from '@/utils'
import app from './app'

const customerStr = app.state.customerStr

const _localStorage = {
  // 获取表头选中展示项
  getTableHeader,
  // 设置表头选中展示项
  setTableHeader,
  // 增加表头选中展示项
  addTableHeader,
  // 删除表头选中展示项
  delTableHeader
}

const PRIVATE = 'PRIVATE_LIST'
const PUBLIC = 'PUBLIC_LIST'
const CONTACT_HISTORY = 'CALL_RECORD'
const ALL_CUSTOMER = 'ALL'

const mapToArr = mapData => {
  const arr = []
  for (const key in mapData) {
    arr.push({
      key: key + '',
      value: mapData[key]
    })
  }
  return arr
}

const staticTableHeaders = {
  [PRIVATE]: mapToArr({
    'customerLevel': `${customerStr}标签`,
    'followStatus': '跟进状态',
    'lastDialStatus': '最近通话状态',
    'lastIntentLevel': `最近${customerStr}意向`,
    'lastChatDuration': '最近呼叫时长',
    'attributes': `${customerStr}属性`,
    'properties': '自定义变量',
    'lastStartTime': '最近呼叫时间',
    'lastRobotCallJobName': '最近外呼任务',
    'lastFollowTime': '最近跟进时间',
    'assignTime': '领取时间'
  }),
  [PUBLIC]: mapToArr({
    'lastStartTime': '最近呼叫时间',
    'lastRobotCallJobName': '最近外呼任务',
    'lastDialStatus': '最近通话状态',
    'lastIntentLevel': `最近${customerStr}意向`,
    'lastChatDuration': '最近呼叫时长'
  }),
  [CONTACT_HISTORY]: mapToArr({
    'callRecordId': '通话记录id',
    'robotCallJobName': '任务名称',
    'dialogFlowName': '话术名称',
    'startTime': '呼叫时间',
    'tenantPhoneNumber': '主叫号码',
    'chatDuration': '呼叫时长',
    'resultStatus': '通话状态',
    'hangupBy': '挂断状态',
    'realIntentLevel': `${customerStr}意向`,
    'customerConcern': `${customerStr}关注点`,
    'attributes': `${customerStr}属性`,
    'properties': '自定义变量',
    'wechatPushUserName': '微信推送人',
    'personInvolved': '请求人工介入',
    'listened': '是否监听',
    'cutOver': '是否切入',
    'listenPerson': '介入人员',
    'wechatPushTime': '微信推送时间',
    'transferType': '转接人工',
    'transferPhoneNumber': '转人工号码'
  })
}

const strKeyMap = {
  [PRIVATE]: 'PRIVATE',
  [PUBLIC]: 'PUBLIC',
  [CONTACT_HISTORY]: 'CALL',
  [ALL_CUSTOMER]: 'ALL'
}

const permission = {
  state: {
    private_checked_fields: [], // 我的客户 当前选中展示字段
    private_all_fields: {}, // 我的客户 所有表格字段

    public_checked_fields: [], // 客户公海 当前选中展示字段
    public_all_fields: {}, // 客户公海 所有表格字段

    call_checked_fields: [], // 联系历史 当前选中展示字段
    call_all_fields: {}, // 联系历史 所有表格字段

    customerFields_private: [], // 客户自定义字段 我的客户
    customerFields_public: [], // 客户自定义字段 客户公海
    customerFields_all: [], // 客户自定义字段 所有客户
    customerFields_contactHistory: [], // 客户自定义字段 联系历史
    customerFieldsList: [] // 所有客户自定义字段
  },
  mutations: {
    // 客户自定义字段 我的客户
    SET_CUSTOMER_PRIVATE_FIELDS(state, fields) {
      state.customerFields_private = fields
    },
    // 客户自定义字段 客户公海
    SET_CUSTOMER_PUBLIC_FIELDS(state, fields) {
      state.customerFields_public = fields
    },
    // 客户自定义字段 所有客户
    SET_CUSTOMER_ALL_FIELDS(state, fields) {
      state.customerFields_all = fields
    },
    // 客户自定义字段 联系历史
    SET_CUSTOMER_CALL_FIELDS(state, fields) {
      state.customerFields_contactHistory = fields
    },
    // 所有客户自定义字段
    SET_CUSTOMER_FIELDS_LIST(state, fields) {
      state.customerFieldsList = fields
    },

    // 我的客户
    ADD_PRIVATE_CHECKED_FIELD(state, field) {
      field && state.private_checked_fields.push(field)
      _localStorage.addTableHeader(PRIVATE, field)
    },
    DEL_PRIVATE_CHECKED_FIELD(state, field) {
      const arr = state.private_checked_fields

      if (arr.includes(field)) {
        field && arr.splice(arr.indexOf(field), 1)
      }

      _localStorage.delTableHeader(PRIVATE, field)
    },
    SET_PRIVATE_CHECKED_FIELDS(state, fields) {
      state.private_checked_fields = fields
      _localStorage.setTableHeader(PRIVATE, fields)
    },
    SET_PRIVATE_ALL_FIELDS(state, fields) {
      state.private_all_fields = fields
    },

    // 客户公海
    ADD_PUBLIC_CHECKED_FIELD(state, field) {
      field && state.public_checked_fields.push(field)
      _localStorage.addTableHeader(PUBLIC, field)
    },
    DEL_PUBLIC_CHECKED_FIELD(state, field) {
      const arr = state.public_checked_fields

      if (arr.includes(field)) {
        field && arr.splice(arr.indexOf(field), 1)
      }

      _localStorage.delTableHeader(PUBLIC, field)
    },
    SET_PUBLIC_CHECKED_FIELDS(state, fields) {
      state.public_checked_fields = fields
      _localStorage.setTableHeader(PUBLIC, fields)
    },
    SET_PUBLIC_ALL_FIELDS(state, fields) {
      state.public_all_fields = fields
    },

    // 联系历史
    ADD_CALL_CHECKED_FIELD(state, field) {
      field && state.call_checked_fields.push(field)
      _localStorage.addTableHeader(CONTACT_HISTORY, field)
    },
    DEL_CALL_CHECKED_FIELD(state, field) {
      const arr = state.call_checked_fields

      if (arr.includes(field)) {
        field && arr.splice(arr.indexOf(field), 1)
      }

      _localStorage.delTableHeader(CONTACT_HISTORY, field)
    },
    SET_CALL_CHECKED_FIELDS(state, fields) {
      state.call_checked_fields = fields
      _localStorage.setTableHeader(CONTACT_HISTORY, fields)
    },
    SET_CALL_ALL_FIELDS(state, fields) {
      state.call_all_fields = fields
    }
  },
  actions: {
    async loadCustomerFields({ commit, getters }) {
      const { data } = await getCustomerFields()
      // 客户自定义字段列表
      const customerFields = {
        [PRIVATE]: [],
        [PUBLIC]: [],
        [CONTACT_HISTORY]: [],
        [ALL_CUSTOMER]: []
      }

      // 客户自定义字段的 { key: customerPersonExtraFieldId, value: name } 键值对数组
      const fields_enum = {
        [PRIVATE]: [],
        [PUBLIC]: [],
        [CONTACT_HISTORY]: []
      }

      ;(data.data || []).forEach(item => {
        if (item.name === '微信' && getters.isLocal) return

        item = {
          ...item,
          name: item.name.replace('客户', customerStr),
          description: item.description.replace('客户', customerStr)
        }

        const field = { key: item.customerPersonExtraFieldId, value: item.name }

        item.callRecordDisplay && customerFields[CONTACT_HISTORY].push(item)
        item.callRecordDisplay && fields_enum[CONTACT_HISTORY].push(field)

        item.privateDisplay && customerFields[PRIVATE].push(item)
        item.privateDisplay && fields_enum[PRIVATE].push(field)

        item.publicDisplay && customerFields[PUBLIC].push(item)
        item.publicDisplay && fields_enum[PUBLIC].push(field)

        item.allDisplay && customerFields[ALL_CUSTOMER].push(item)
      })

      // 全部自定义字段
      commit('SET_CUSTOMER_FIELDS_LIST', cloneJSON(data.data || []))

      for (const key in strKeyMap) {
        // 设置相应模块客户自定义字段列表
        commit(`SET_CUSTOMER_${strKeyMap[key]}_FIELDS`, cloneJSON(customerFields[key]))

        // 所有客户页面不需要设置表头选中显示项，因为这个页面现在没有自定义表头特性
        if (key === ALL_CUSTOMER) continue

        // 设置相应模块所有字段的（customerPersonExtraFieldId=>name）键值对
        commit(`SET_${strKeyMap[key]}_ALL_FIELDS`, [
          ...fields_enum[key],
          ...staticTableHeaders[key]
        ])

        // 设置相应模块当前选中显示字段
        commit(
          `SET_${strKeyMap[key]}_CHECKED_FIELDS`,
          _localStorage.getTableHeader(key) || [
            ...customerFields[key].map(item => item.customerPersonExtraFieldId + ''),
            ...staticTableHeaders[key].map(item => item.key)
          ]
        )
      }
    }
  }
}

export default permission
