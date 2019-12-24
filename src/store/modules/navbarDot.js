const navbarDot = {
  state: {
    showDownloadAndUploadDot: false,
    showWarnningMessageDot: false,
    showSystemAnnouncementDot: false
  },
  mutations: {
    SHOW_DOWNLOAD_AND_UPLOAD_DOT: (state) => {
      // 显示下载图标的红点
      state.showDownloadAndUploadDot = true
    },
    HIDE_DOWNLOAD_AND_UPLOAD_DOT: (state) => {
      // 隐藏下载图标的红点
      state.showDownloadAndUploadDot = false
    },
    SHOW_WARNNING_MESSAGE_DOT: (state) => {
      // 显示预警消息的红点
      state.showWarnningMessageDot = true
    },
    HIDE_WARNNING_MESSAGE_DOT: (state) => {
      // 隐藏预警消息的红点
      state.showWarnningMessageDot = false
    },
    SHOW_SYSTEM_ANNOUNCEMENT_DOT: (state) => {
      // 显示系统消息的红点
      state.showSystemAnnouncementDot = true
    },
    HIDE_SYSTEM_ANNOUNCEMENT_DOT: (state) => {
      // 隐藏系统消息的红点
      state.showSystemAnnouncementDot = false
    }
  }
}

export default navbarDot
