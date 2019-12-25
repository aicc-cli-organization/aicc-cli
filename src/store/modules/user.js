import { login, loginByCode, logout } from '@/api/login'
import { removeToken } from '@/utils/auth'
import { getUserInfo, getIntentInfo } from '@/api/personalInfo'
import { getLineStatsViewEnabled } from '@/api/customer'

const user = {
  state: {
    userId: '',
    tenantId: '',
    status: '',
    code: '',
    name: '',
    avatar: '',
    description: '', // 工作描述
    access: [],
    companyName: '', // 公司名称
    setting: {
      articlePlatform: []
    },
    distributorLevel: 0, // 客户级别 0 直销客户 1 代理商客户 2 二级代理商客户
    gender: '', // 性别
    position: '', // 职位
    phoneNumber: '', // 联系电话
    wechat: '', // 微信名
    wxHeadimgurl: '', // 微信头像
    wxOfficialAccountBinded: false, // 绑定微信
    username: '', // 用户名
    role: '', // 角色
    organization: '', // 部门
    manager: '', // 部门负责人
    aiConcurrencyLevel: 0, // 有效ai数量
    aiExpiredLevel: 0, // 过期ai数量
    accountFare: 0, // 账户余额
    expireTime: '', // 账号过期时间
    createTime: '', // 账号创建时间
    customerCountLimit: '', // 用户可拥有客户数量
    customerDaysLimit: '', // 用户拥有客户剩余的天数
    csAuth: {},
    dialIntervalStart: '',
    dialIntervalEnd: '',
    openISV: false,
    tenantSign: '',
    callbackUrl: '',
    smsCallbackUrl: '',
    enableLineStatsView: false,
    iconUrl: ''
  },

  mutations: {
    SET_ICONURL: (state, iconUrl) => {
      state.iconUrl = iconUrl
    },
    SET_OPENISV: (state, openISV) => {
      state.openISV = openISV
    },
    SET_LINEVIEW: (state, enableLineStatsView) => {
      state.enableLineStatsView = enableLineStatsView
    },
    SET_TS: (state, tenantSign) => {
      state.tenantSign = tenantSign
    },
    SET_CBURL: (state, callbackUrl) => {
      state.callbackUrl = callbackUrl
    },
    SET_SMSCBURL: (state, smsCallbackUrl) => {
      state.smsCallbackUrl = smsCallbackUrl
    },
    SET_USERID: (state, id) => {
      state.userId = id
    },
    SET_TENANTID: (state, id) => {
      state.tenantId = id
    },
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_DESCRIPTION: (state, description) => {
      state.description = description
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ACCESS: (state, access) => {
      state.access = access
    },
    SET_POSITION: (state, position) => {
      state.position = position
    },
    SET_PHONENUMBER: (state, phoneNumber) => {
      state.phoneNumber = phoneNumber
    },
    SET_WXBIND: (state, wxBind) => {
      state.wxOfficialAccountBinded = wxBind
    },
    SET_WEIXINNAME: (state, wxName) => {
      state.wechat = wxName
    },
    SET_WXHEADIMGURL: (state, wxHeadimgurl) => {
      state.wxHeadimgurl = wxHeadimgurl
    },
    SET_USERNAME: (state, username) => {
      state.username = username
    },
    SET_ROLE: (state, role) => {
      state.role = role
    },
    SET_ORGANIZATION: (state, organization) => {
      state.organization = organization
    },
    SET_MANAGER: (state, manager) => {
      state.manager = manager
    },
    SET_GENDER: (state, gender) => {
      state.gender = gender
    },
    SET_AIEXPIREDLEVEL: (state, aiExpiredLevel) => {
      state.aiExpiredLevel = aiExpiredLevel
    },
    SET_AICOUNT: (state, aiConcurrencyLevel) => {
      state.aiConcurrencyLevel = aiConcurrencyLevel
    },
    SET_AICOUNTFARE: (state, accountFare) => {
      state.accountFare = accountFare
    },
    SET_EXPIRETIME: (state, expireTime) => {
      state.expireTime = expireTime
    },
    SET_CREATETIME: (state, createTime) => {
      state.createTime = createTime
    },
    SET_CUSTOMERCOUNTLIMIT: (state, customerCountLimit) => {
      state.customerCountLimit = customerCountLimit
    },
    SET_CUSTOMEDAYSLIMIT: (state, customerDaysLimit) => {
      state.customerDaysLimit = customerDaysLimit
    },
    SET_COMPANYNAME: (state, companyName) => {
      state.companyName = companyName
    },
    SET_CS_AUTH: (state, auth) => {
      state.csAuth = auth || {}
    },
    SET_DIAL_INTERVAL_START: (state, dialIntervalStart) => {
      state.dialIntervalStart = dialIntervalStart || {}
    },
    SET_DIAL_INTERVAL_END: (state, dialIntervalEnd) => {
      state.dialIntervalEnd = dialIntervalEnd || {}
    },
    SET_DISTRIBUTORLEVEL: (state, distributorLevel) => {
      state.distributorLevel = distributorLevel || 0
    }
  },

  actions: {
    // 用户名登录
    async LoginByUsername({ commit }, userInfo) {
      try {
        await login({
          phoneNumber: userInfo.username,
          password: userInfo.password
        })
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 验证码登录
    async LoginByCode({ commit }, userInfo) {
      try {
        await loginByCode({
          phoneNumber: userInfo.phoneNumber,
          code: userInfo.code
        })
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },
    // ["crm_index_view", "crm_callTask_view", "crm_callTask_addOrEdit", "crm_callTask_del", "crm_callTask_startOrStop", "crm_callTask_importCus", "crm_callTask_addOrImportToTask", "crm_callTask_downAudio", "crm_callTask_exportAudio", "crm_callTask_exportCus", "crm_callInRecp_view", "crm_callInRecp_addOrEdit", "crm_callInRecp_enableOrforbidden", "crm_SMS_view", "crm_SMSHistory_view", "crm_SMSTemplate_view", "crm_SMSTemplate_addOrEdit", "crm_SMSTemplate_del", "crm_SMSSign_add", "crm_dialDesign_view", "crm_dialDesign_addOrEditOrCopy", "crm_dialDesign_delOrExport", "crm_DefaultBranch_view", "crm_DefaultBranch_edit", "crm_dialDesign_uploadAudio", "crm_intentionTag_view", "crm_intentionTag_addOrEdit", "crm_private_view", "crm_private_importCus", "crm_private_addOrEdit", "crm_private_exportCus", "crm_private_importToTask", "crm_private_transferOrDel", "crm_private_addToWhiteList", "crm_private_backToPublic", "crm_private_viewDialHis", "crm_private_dial", "crm_publicSea_view", "crm_publicSea_viewCompletePhone", "crm_publicSea_import", "crm_publicSea_addOrEdit", "crm_publicSea_export", "crm_publicSea_receive", "crm_publicSea_distribute", "crm_publicSea_del", "crm_publicSea_addToWhiteList", "crm_dialHistory_view", "crm_dialHistory_exportDialHis", "crm_dialHistory_downAudio", "crm_dialHistory_viewDialDetail", "crm_allCus_view", "crm_allCus_del", "crm_allCus_addToWhiteList", "crm_allCus_edit", "crm_statisticsDial_view", "crm_statisticsDial_export", "crm_statisticsBusi_viewBusi", "crm_intentionAnals_view", "crm_timeAnals_view", "crm_statisticsBill_view", "crm_dialBill_view", "crm_dialDetail_view", "crm_chargeRecord_view", "crm_subAccountDial_view", "crm_statisticsBill_export", "crm_teamManage_view", "crm_depart_view", "crm_depart_addOrEditOrDel", "crm_teamManage_addOrEditOrEnablePerson", "crm_roleManage_view", "crm_seatManage_view", "crm_cusSeat_view", "crm_cusSeat_addOrEditOrStop", "crm_AISeat_view", "crm_seatGroup_view", "crm_seatGroup_addOrEdit", "crm_seatGroup_stopStart", "crm_lineList_view", "crm_lineList_balanceTransfer", "crm_whiteList_view", "crm_group_view"]
    // 获取用户信息
    async getUserInfo({ commit, state }) {
      try {
        const { data } = await getUserInfo()
        const res = await getLineStatsViewEnabled()
        if (data.data) {
          const { nickname, name, authorityCodeList, userId, tenantId, comment, gender, phoneNumber, tenantSign, callbackUrl, smsCallbackUrl,
            organizationName, organizationManagerUser, roleName, job, wxPublicAccountOpenId, wxNickName, wxHeadImgUrl, enabledStatus, iconUrl,
            aiConcurrencyLevel, aiExpiredLevel, accountFareView, expireTime, createTime, customerCountLimit, customerDaysLimit, companyName, csAuth,
            distributorLevel } = data.data
          commit('SET_USERID', userId)
          commit('SET_DISTRIBUTORLEVEL', distributorLevel)
          commit('SET_TENANTID', tenantId)
          commit('SET_USERNAME', nickname)
          commit('SET_ACCESS', authorityCodeList)
          commit('SET_NAME', name)
          commit('SET_DESCRIPTION', comment)
          commit('SET_GENDER', gender)
          commit('SET_PHONENUMBER', phoneNumber)
          commit('SET_ORGANIZATION', organizationName)
          commit('SET_MANAGER', organizationManagerUser)
          commit('SET_ROLE', roleName)
          commit('SET_POSITION', job)
          commit('SET_WXHEADIMGURL', wxHeadImgUrl)
          commit('SET_WXBIND', !!wxPublicAccountOpenId)
          commit('SET_WEIXINNAME', wxNickName)
          commit('SET_AICOUNT', aiConcurrencyLevel)
          commit('SET_AIEXPIREDLEVEL', aiExpiredLevel)
          commit('SET_AICOUNTFARE', accountFareView)
          commit('SET_EXPIRETIME', expireTime)
          commit('SET_CREATETIME', createTime)
          commit('SET_CUSTOMERCOUNTLIMIT', customerCountLimit)
          commit('SET_CUSTOMEDAYSLIMIT', customerDaysLimit)
          commit('SET_COMPANYNAME', companyName)
          commit('SET_CS_AUTH', csAuth)
          commit('SET_TS', tenantSign)
          commit('SET_CBURL', callbackUrl)
          commit('SET_SMSCBURL', smsCallbackUrl)
          commit('SET_ICONURL', iconUrl)
          commit('SET_LINEVIEW', res.data.data)
          commit('SET_OPENISV', enabledStatus === 'ENABLE')

          // 组件库权限点初始化
          commit('UPDATE_DIALOG_AUTH', {
            auth_addOrEditOrCopy: authorityCodeList.includes('crm_dialDesign_addOrEditOrCopy'),
            auth_delOrExport: authorityCodeList.includes('crm_dialDesign_delOrExport'),
            auth_DefaultBranch_view: true,
            auth_DefaultBranch_edit: true,
            auth_uploadAudio: authorityCodeList.includes('crm_dialDesign_uploadAudio')
          })
          commit('UPDATE_INTENTION_AUTH', {
            auth_intentionTag_addOrEdit: authorityCodeList.includes('crm_intentionTag_addOrEdit'),
            auth_intentionTag_view: authorityCodeList.includes('crm_intentionTag_view')
          })
          commit('UPDATE_MSG_AUTH', {
            auth_warnMsg_view: authorityCodeList.includes('crm_warnMsg_view'),
            auth_sysMsg_view: authorityCodeList.includes('crm_sysMsg_view'),
            crm_early_warning_view: authorityCodeList.includes('crm_early_warning_view')
          })

          const z = await getIntentInfo({
            tenantId
          })
          const { allAgentCount, dialIntervalStart, dialIntervalEnd } = z.data.data
          data.data.csAuth.enableCsSeat = (allAgentCount || 0) > 0
          commit('SET_DIAL_INTERVAL_START', dialIntervalStart)
          commit('SET_DIAL_INTERVAL_END', dialIntervalEnd)
        }
        return Promise.resolve(data)
      } catch (error) {
        console.error(error)
        return Promise.reject(error)
      }
    },

    // 登出
    async logout({ commit, state }) {
      try {
        await logout()
        removeToken()
        return Promise.resolve()
      } catch (error) {
        return Promise.reject()
      }
    }
  }
}

export default user
