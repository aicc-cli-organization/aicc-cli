const callDetail = {
  state: {
    fsUserAgent: null, // 人工外呼全局fs的ua实例
    artificialStatus: 'online', // 人工坐席状态 online 在线 offline 离线
    fsStatus: '',
    artiModalVisible: false, // 人工外呼联系历史modal是否显示
    artiCustomerData: {}, // 当前外呼的客户信息
    artiInfo: {}, // 人工坐席相关信息
    dialInfo: {}, // 拨号相关信息
    historyVisible: false, // 联系历史是否展开
    newCallRecordId: undefined, // 最新生成的人工外呼通话记录
    useAiAssistant: false, // 保存最新的外呼是否开启ai助理
    hangupBy: 0, // 挂断方 0 客户 1 客服
    assistantDialogFlowId: '', // ai助理话术id
    callType: 'out', // 外呼类型 in呼入 out呼出 join介入
    artiJoinList: [], // 人工介入通话列表
    artiJoinModalData: {}, // 当前介入的通话以及客户的信息
    artiJoinModalVisible: false, // 人工介入modal的visible状态
    artiJoinModalType: 'listen', // listen 监听状态 call 切入状态 offline 客户已离线
    knowledgeModalVisible: false, // 探意知识库弹框visible
    batchJobStatus: '', // 批量外呼任务状态
    batchJobVisible: false // 批量外呼状态显示或隐藏
  },
  getters: {
    artificialStatus: state => state.artificialStatus,
    fsUserAgent: state => state.fsUserAgent
  },
  mutations: {
    SET_FS_USERAGENT: (state, ua) => {
      state.fsUserAgent = ua
    },
    SET_ARTIFICIAL_STATUS: (state, status) => {
      state.artificialStatus = status
    },
    SET_FS_STATUS: (state, status) => {
      state.fsStatus = status
    },
    SET_ARTI_MODAL_VISIBLE: (state, visible) => {
      state.artiModalVisible = visible
    },
    SET_ARTI_CUSTOMER_DATA: (state, data) => {
      state.artiCustomerData = data
    },
    SET_ARTI_INFO: (state, info) => {
      state.artiInfo = info
    },
    SET_DIAL_INFO: (state, info) => {
      state.dialInfo = info
    },
    SET_HISTORY_VISIBLE: (state, visible) => {
      state.historyVisible = visible
    },
    SET_NEW_CALL_RECORD_ID: (state, id) => {
      state.newCallRecordId = id
    },
    SET_HANGUP_BY: (state, who) => {
      state.hangupBy = who
    },
    SET_USE_AI_ASSISTANT: (state, flag) => {
      state.useAiAssistant = flag
    },
    SET_ASSISTANT_DIALOGFLOW_ID: (state, id) => {
      state.assistantDialogFlowId = id
    },
    SET_CALLTYPE: (state, type) => {
      state.callType = type
    },
    PUSH_ARTI_JOIN_LIST: (state, data) => {
      state.artiJoinList.push(data)
    },
    DELETE_ARTI_JOIN_LIST: (state, index) => {
      state.artiJoinList.splice(index, 1)
    },
    SET_ARTI_JOIN_MODAL_DATA: (state, data) => {
      state.artiJoinModalData = data
    },
    SET_ARTI_JOIN_MODAL_VISIBLE: (state, visible) => {
      state.artiJoinModalVisible = visible
    },
    SET_ARTI_JOIN_MODAL_TYPE: (state, type) => {
      state.artiJoinModalType = type
    },
    SET_KNOWLEDGE_MODAL_VISIBLE: (state, visible) => {
      state.knowledgeModalVisible = visible
    },
    SET_BATCH_JOB_STATUS: (state, status) => {
      state.batchJobStatus = status
    },
    SET_BATCH_JOB_VISIBLE: (state, visible) => {
      state.batchJobVisible = visible
    }
  }
}

export default callDetail
