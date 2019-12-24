const gateway = {
  state: {
    selectedDeviceId: undefined
  },
  mutations: {
    UPDATE_SELECTED_DEVICE_ID: (state, selectedDeviceId) => {
      state.selectedDeviceId = selectedDeviceId
    },
    CLEAR_SELECTED_DEVICE_ID: (state) => {
      state.selectedDeviceId = undefined
    }
  }
}

export default gateway
