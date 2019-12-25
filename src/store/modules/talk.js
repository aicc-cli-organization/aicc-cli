import { fetchFlowList, deleteFlow, fetchIndustryList, fetchBranchList, checkDialogFlowCsStatus, fetchFlowDetail } from '@/api/talk'
import { Message } from 'element-ui'
import Vue from 'vue'

const talk = {
  state: {
    flowData: [],
    flowItem: {},
    stepId: '',
    intentBranchList: [],
    industryList: [],
    nodeDataArray: [], // 话术结点集合
    linkDataArray: [], // 话术link集合
    totalNodeCount: 0, // 总话术结点
    recordNodeCount: 0, // 已录音结点
    isModified: false,
    flowParams: {}, // dialog flow的filter参数信息
    appType: 'crm', // 区分crm和ope
    hasBranchUpdateAccess: true,
    hasEditAccess: true,
    hasDeleteAccess: true,
    isLocal: process.env.ENV_CONFIG === 'private',
    jumpToHumanServiceCount: 0,
    humanInterventionCount: 0,
    redialTimeExist: false,
    voiceType: '',
    auth_addOrEditOrCopy: false, // 新建/编辑/复制话术
    auth_delOrExport: false, // 删除/导出话术
    auth_DefaultBranch_view: false, // 查看默认分支
    auth_DefaultBranch_edit: false, // 编辑默认分支
    auth_uploadAudio: false // 录音上传
  },
  mutations: {
    // 更新话术权限
    UPDATE_DIALOG_AUTH: (state, auth) => {
      state.auth_addOrEditOrCopy = auth.auth_addOrEditOrCopy
      state.auth_delOrExport = auth.auth_delOrExport
      state.auth_DefaultBranch_view = auth.auth_DefaultBranch_view
      state.auth_DefaultBranch_edit = auth.auth_DefaultBranch_edit
      state.auth_uploadAudio = auth.auth_uploadAudio
    },
    // 更新话术列表
    UPDATE_FLOWDATA: (state, flowData) => {
      state.flowData = flowData
    },
    UPDATE_INDUSTRY: (state, list) => {
      state.industryList = list
    },
    UPDATE_VOICETYPE: (state, voiceType) => {
      state.voiceType = voiceType
    },
    UPDATE_FLOWITEM: (state, item) => {
      state.flowItem = item
    },
    // 更新stepId
    UPDATE_STEPID: (state, stepId) => {
      state.stepId = stepId
    },
    UPDATE_NODE_DATA_ARRAY: (state, nodeDataArray) => {
      state.nodeDataArray = nodeDataArray
    },
    UPDATE_LINK_DATA_ARRAY: (state, linkDataArray) => {
      state.linkDataArray = linkDataArray
    },
    UPDATE_TOTAL_NODE_COUNT: (state, totalNodeCount) => {
      state.totalNodeCount = totalNodeCount
    },
    UPDATE_RECORD_NODE_COUNT: (state, recordNodeCount) => {
      state.recordNodeCount = recordNodeCount
    },
    UPDATE_ISMODIFIED: (state, isModified) => {
      state.isModified = isModified
    },
    UPDATE_BRANCHLIST: (state, branchList) => {
      state.intentBranchList = branchList
    },
    UPDATE_FLOWPARAMS: (state, params) => {
      state.flowParams = params
    },
    UPDATE_APPTYPE: (state, type) => {
      state.appType = type
    },
    UPDATE_BRANCH_UPDATE_ACCESS: (state, access) => {
      state.hasBranchUpdateAccess = access
    },
    UPDATE_EDIT_ACCESS: (state, access) => {
      state.hasEditAccess = access
    },
    UPDATE_DELETE_ACCESS: (state, access) => {
      state.hasDeleteAccess = access
    },
    UPDATE_PRIVATE: (state, isLocal) => {
      state.isLocal = isLocal
    },
    UPDATE_HUMAN_INTERVENTION_COUNT: (state, count) => {
      state.humanInterventionCount = count
    },
    UPDATE_REDIALTIMEEXIST: (state, redialTimeExist) => {
      state.redialTimeExist = redialTimeExist
    },
    UPDATE_JUMP_TO_HUMAN_SERVICE_COUNT: (state, count) => {
      state.jumpToHumanServiceCount = count
    }
  },
  actions: {
    async loadDialogFlowList({ commit, state, dispatch }, { // 加载话术列表
      initFlowId = true,
      params = {}
    } = {}) {
      const newParams = Object.assign({ pageNum: 1, pageSize: 10 }, state.flowParams, params) // 拼接新旧参数
      commit('UPDATE_FLOWPARAMS', newParams)
      try {
        const { data } = await fetchFlowList(newParams, state.appType)
        if (data.data) {
          commit('UPDATE_FLOWDATA', data.data)
          const { content } = data.data

          if (!initFlowId) {
            commit('UPDATE_FLOWITEM', (content || []).find(item => item.id === state.flowItem.id) || {})
          }

          if (initFlowId && content) { // 重置flowId为默认第一条信息
            commit('UPDATE_FLOWITEM', content[0] || {})
            commit('UPDATE_VOICETYPE', (content[0] || {}).voiceType)
            if (content[0]) {
              dispatch('loadInnerTagList', {
                id: content[0].intentLevelTagId,
                appType: state.appType
              })
              dispatch('updateCurInterval', {
                id: content[0].intentLevelTagId,
                name: content[0].intentLevelTagName
              })
            }
          }
        }
      } catch (error) {
        return
      }
    },
    async deleteDialogFlow({ state, dispatch }, id) { // 删除话术
      try {
        await deleteFlow({
          dialogFlowId: id
        }, state.appType)
        Message.success('删除成功')
        dispatch('loadDialogFlowList', {
          initFlowId: state.flowItem.id === id
        })
      } catch (error) {
        return
      }
    },
    async loadIndustryList({ commit, state }) { // 加载行业列表
      try {
        const { data } = await fetchIndustryList(state.appType)
        commit('UPDATE_INDUSTRY', data.data || [])
      } catch (error) {
        return
      }
    },
    async loadIntentBranch({ commit, state }, params) { // 加载分支列表
      try {
        if (params.flowId) {
          const { data } = await fetchBranchList({
            dialogFlowId: params.flowId
          }, state.appType)
          const defaultArr = [{
            uid: 'default',
            name: '默认',
            type: 'DEFAULT'
          }]
          if (data.data) {
            commit('UPDATE_BRANCHLIST', data.data.concat(defaultArr))
          }
        }
      } catch (error) {
        return
      }
    },
    async loadDialogFlowCsInfo({ commit, state }, params) { // 获取话术转人工和启用人工介入相关信息
      const { dialogFlowId } = params
      if (dialogFlowId) {
        const { data } = await checkDialogFlowCsStatus({
          dialogFlowId
        }, state.appType)
        const { jumpToHumanServiceCount = 0, humanInterventionCount = 0, redialTimeExist = false } = data.data || {}
        commit('UPDATE_HUMAN_INTERVENTION_COUNT', humanInterventionCount)
        commit('UPDATE_REDIALTIMEEXIST', redialTimeExist)
        commit('UPDATE_JUMP_TO_HUMAN_SERVICE_COUNT', jumpToHumanServiceCount)
      }
    },
    async updateDialogFlowStatus({ commit, state }) {
      const { data } = await fetchFlowDetail(
        {
          // 获取话术审核状态
          dialogFlowId: state.flowItem.id
        },
        state.appType
      )
      if (data.data) {
        commit('UPDATE_FLOWITEM', { // 更新话术状态
          ...state.flowItem,
          status: data.data.status
        })
        const { content } = state.flowData
        const i = content.findIndex(item => {
          return item.id === state.flowItem.id
        })
        Vue.set(content, i, {
          ...content[i],
          status: data.data.status
        })
      }
    },
    initDialogFlow({ commit }) { // 路由切换时重置话术状态
      commit('UPDATE_FLOWDATA', [])
      commit('UPDATE_INDUSTRY', [])
      commit('UPDATE_FLOWITEM', {})
      commit('UPDATE_VOICETYPE', '')
      commit('UPDATE_STEPID', '')
      commit('UPDATE_FLOWPARAMS', {})
      commit('UPDATE_NODE_DATA_ARRAY', [])
      commit('UPDATE_LINK_DATA_ARRAY', [])
      commit('UPDATE_TOTAL_NODE_COUNT', 0)
      commit('UPDATE_RECORD_NODE_COUNT', 0)
      commit('UPDATE_ISMODIFIED', false)
      commit('UPDATE_HUMAN_INTERVENTION_COUNT', 0)
      commit('UPDATE_JUMP_TO_HUMAN_SERVICE_COUNT', 0)
      commit('UPDATE_REDIALTIMEEXIST', false)
    }
  }
}

export default talk
