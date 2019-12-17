export default {
  methods: {
    __updateTaskList(taskList) {
      this.$store.commit('TASK_LIST', taskList)
    },
    __updateEditTaskId(taskId) {
      this.$store.commit('EDIT_TASK_ID', taskId)
    },
    __updateTaskItem(taskItem) {
      this.$store.commit('UPDATE_TASK_ITEM', taskItem)
    },
    __refreshTaskList(refresh) {
      this.$store.commit('REFRESH_TASK_LIST', refresh)
    },
    __coverTaskDetail(taskDetail) {
      this.$store.commit('TASK_DETAIL', taskDetail)
    },
    __updateTaskDetail(updateObj) {
      this.$store.commit('UPDATE_TASK_DETAIL', updateObj)
    },
    __coverTaskFullStats(fullStats) {
      this.$store.commit('TASK_FULL_STATS_INFO', fullStats)
    },
    __updateTaskFullStats(updateObj) {
      this.$store.commit('UPDATE_TASK_FULL_STATS_INFO', updateObj)
    },
    __updateTaskTab(tab) {
      this.$store.commit('UPDATE_TASK_TAB', tab)
    },
    __updateOverviewJumpCalledWithCustomerConcern(customerConcern) {
      this.$store.commit('UPDATE_OVERVIEW_JUMP_CALLED_WITH_CUSTOMER_CONCERN', customerConcern)
    },
    __addTaskSuccess(isSuccess) {
      this.$store.commit('ADD_TASK_SUCCESS', isSuccess)
    }
  }
}
