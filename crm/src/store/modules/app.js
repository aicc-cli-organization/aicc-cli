import Cookies from 'js-cookie'

const isYuHangJianKongJu = window.location.href.includes(window.YuHangJianKongJuIP) // 余杭监控局
const isGongDaoBeiJingIP = window.location.href.includes(window.GongDaoBeiJingIP) // 共道北京
const isCourt = (window.courtIP || []).find(ip => window.location.href.includes(ip)) // 是否是法院项目
const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop',
    language: Cookies.get('language') || 'en',
    clientHeight: 0,
    downloadingAudio: false,
    downloadingCur: 0,
    downloadingTotal: 0,
    showResetPswTip: false,
    modalVisibleSwitch: true, // 控制所有modal隐藏的开关，置为false则关闭所有modal
    auth_warnMsg_view: false, // 查看预警消息
    auth_sysMsg_view: false, // 查看系统公告
    crm_early_warning_view: true, // 查看预警设置
    isRongLian: window.location.href.includes('47.98.67.68'), // 是否是荣联公司的定制
    NoLogoNorWx: (process.env.noLogoIP || []).find(ip => window.location.href.includes(ip)), // 是否要去掉探意logo和文字、微信、客服小知、快速入门、API文档
    isYuHangJianKongJu, // 余杭监控局 需要自定义登陆页
    isGongDaoBeiJingIP, // 共道北京 需要自定义登陆页
    customerStr: isCourt ? '用户' : '客户', // 用于显示的表示客户的文字，法院项目要求显示用户，正常显示客户
    needBusinessAnalysis: !isCourt, // 是否需要商机分析菜单 法院项目不需要此菜单
    isGongdao: isCourt, // 是否是共道公司的项目，当前三个法院项目都是共道的
    hasEnvironmentTest: false
  },
  mutations: {
    UPDATE_MSG_AUTH: (state, { auth_warnMsg_view, auth_sysMsg_view, crm_early_warning_view }) => {
      state.auth_warnMsg_view = auth_warnMsg_view
      state.auth_sysMsg_view = auth_sysMsg_view
      state.crm_early_warning_view = crm_early_warning_view
    },
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_LANGUAGE: (state, language) => {
      state.language = language
      Cookies.set('language', language)
    },
    SET_CLIENTHEIGHT: (state, height) => {
      state.clientHeight = height
    },
    SET_RESETPSW: (state, showResetPswTip) => {
      state.showResetPswTip = showResetPswTip 
    },
    SET_ENVIRONMENT: (state, hasEnvironmentTest) => {
      state.hasEnvironmentTest = hasEnvironmentTest 
    },
    SET_DOWNLOADAUDIO: (state, downState) => {
      state.downloadingAudio = downState.downloadingAudio
      state.downloadingCur = downState.downloadingCur
      state.downloadingTotal = downState.downloadingTotal
    },
    SET_MODAL_VISIBLE_SWITCH: (state, visible) => {
      state.modalVisibleSwitch = visible
    }
  },
  actions: {
    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    },
    set_resetPsw({ commit }, showResetPswTip) {
      commit('SET_RESETPSW', showResetPswTip)
    },
    set_environment({ commit }, hasEnvironmentTest) {
      commit('SET_ENVIRONMENT', hasEnvironmentTest)
    },
    setDownloaingAudioState({ commit }, downState) {
      commit('SET_DOWNLOADAUDIO', downState)
    }
  }
}

export default app
