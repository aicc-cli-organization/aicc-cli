export default {
  state: {
    selectSmsTaskId: undefined,
    refreshTask: false,
    taskList: undefined,
    notSendTotal: 0
  },
  mutations: {
    SMS_SELECT_TASKID: (state, selectTaskId) => {
      state.selectSmsTaskId = selectTaskId
    },
    REFRESH_SMS_TASK_LIST: (state, refreshTask) => {
      state.refreshTask = refreshTask
    },
    UPDATE_SMS_TASK_LIST: (state, taskList) => {
      state.taskList = taskList
    },
    UPDATE_NOTSEND_TOTAL: (state, total) => {
      state.notSendTotal = total
    }
  },
  actions: {
    refreshSmsTask({ commit }, refreshTask) {
      commit('REFRESH_SMS_TASK_LIST', refreshTask)
    }
  }
}
