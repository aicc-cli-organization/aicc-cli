const callDetail = {
  state: {
    isPlaying: true // 控制通话详情页每个播放器的总开关
  },
  mutations: {
    STOP: (state) => {
      state.isPlaying = false
    },
    PLAY: state => {
      state.isPlaying = true
    }
  }
}

export default callDetail
