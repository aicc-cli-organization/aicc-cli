export default {
  state: {
    selectedTaskId: undefined,
    taskDetail: {}
  },
  mutations: {
    QC_SELECT_TASKID: (state, selectedTaskId) => {
      state.selectedTaskId = selectedTaskId
    },
    QC_TASK_DETAIL: (state, taskDetail) => {
      state.taskDetail = taskDetail
    }
  }
}
