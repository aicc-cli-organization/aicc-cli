const task = {
  state: {
    taskList: undefined,
    selectTaskId: undefined,
    selectIntentLevelTagId: undefined,
    editTaskId: undefined,
    refresh: undefined,
    taskDetail: {
      robotCallJob: {}
    },
    fullTaskInfo: {
      callJobStatsBrokenLine: {}
    },
    activeTab: 'overview',
    overviewJumpCalledWithCustomerCercorn: undefined,
    addTaskSuccess: false,
    humanIntervention: false, // 人工介入
    humanService: false // 转人工
  },
  mutations: {
    TASK_LIST: (state, list) => {
      state.taskList = list
    },
    SELECT_TASK_ID: (state, taskId) => {
      state.selectTaskId = taskId
    },
    EDIT_TASK_ID: (state, taskId) => {
      state.editTaskId = taskId
    },
    SELECT_INTENT_LEVEL_TAG_ID: (state, intentLevelTagId) => {
      state.selectIntentLevelTagId = intentLevelTagId
    },
    EDIT_INTENT_LEVEL_TAG_ID: (state, intentLevelTagId) => {
      state.selectIntentLevelTagId = intentLevelTagId
    },
    UPDATE_TASK_ITEM: (state, taskItem) => {
      const taskList = state.taskList
      for (const item of taskList) {
        if (item.robotCallJobId === taskItem.robotCallJobId) {
          Object.assign(item, taskItem)
          break
        }
      }
      state.taskList = taskList
    },
    REFRESH_TASK_LIST: (state, refresh) => {
      state.refresh = !!refresh
    },
    TASK_DETAIL: (state, taskDetail) => {
      state.taskDetail = taskDetail
    },
    UPDATE_TASK_DETAIL: (state, updateObj) => {
      const taskDetail = state.taskDetail
      state.taskDetail = { ...taskDetail, ...updateObj }
    },
    TASK_FULL_STATS_INFO: (state, fullTaskInfo) => {
      state.fullTaskInfo = fullTaskInfo
    },
    UPDATE_TASK_FULL_STATS_INFO: (state, updateObj) => {
      const fullTaskInfo = state.fullTaskInfo
      state.fullTaskInfo = { ...fullTaskInfo, ...updateObj }
    },
    UPDATE_TASK_TAB: (state, tab) => {
      state.activeTab = tab
    },
    UPDATE_OVERVIEW_JUMP_CALLED_WITH_CUSTOMER_CONCERN: (state, customerConcern) => {
      state.overviewJumpCalledWithCustomerCercorn = customerConcern
    },
    UPDATE_HUMAN_SERVICE: (state, data) => {
      state.humanIntervention = data.humanIntervention || false
      state.humanService = data.humanService || false
    },
    ADD_TASK_SUCCESS: (state, isSuccess) => {
      state.addTaskSuccess = isSuccess
    }
  }
}

export default task
