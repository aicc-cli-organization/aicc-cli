const app = {
  state: {
    curEditGroupId: null
  },
  mutations: {
    SET_CURGROURPID: (state, id) => {
      state.curEditGroupId = id
    }
  },
  actions: {
    setCurGroupID({ commit }, id) {
      commit('SET_CURGROURPID', id)
    }
  }
}

export default app
