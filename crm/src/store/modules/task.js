const task = {
  state: {
    robotCallJobId: null,
    robotCallJobStatus: ''
  },
  mutations: {
    UPDATE_ROBOT_CALL_JOB_ID: (state, robotCallJobId) => {
      state.robotCallJobId = robotCallJobId
    },
    CLEAR_ROBOT_CALL_JOB_ID: (state, robotCallJobId) => {
      state.robotCallJobId = ''
    },
    UPDATE_ROBOT_CALL_JOB_STATUS: (state, robotCallJobStatus) => {
      state.robotCallJobStatus = robotCallJobStatus
    },
    CLEAR_ROBOT_CALL_JOB_STATUS: (state, robotCallJobStatus) => {
      state.robotCallJobStatus = ''
    }
  }
}

export default task
