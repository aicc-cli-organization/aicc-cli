export default {
  state: {
    selectIVRId: undefined
  },
  mutations: {
    IVR_SELECT_ID: (state, selectIVRId) => {
      state.selectIVRId = selectIVRId
    }
  }
}
