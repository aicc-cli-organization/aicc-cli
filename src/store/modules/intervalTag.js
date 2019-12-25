import { getList, getTagList } from '@/api/intervalTag'

const talk = {
  state: {
    intervalTagList: [],
    innerTagList: [],
    curIntervalTagID: '',
    curIntervalTagName: '',
    auth_intentionTag_view: false, // 查看意向标签页面
    auth_intentionTag_addOrEdit: false // 新建/编辑/复制/删除标签分组
  },
  mutations: {
    UPDATE_INTENTION_AUTH: (state, auth) => {
      state.auth_intentionTag_addOrEdit = auth.auth_intentionTag_addOrEdit
      state.auth_intentionTag_view = auth.auth_intentionTag_view
    },
    UPDATE_INTERVALTAGLIST: (state, list) => {
      state.intervalTagList = list
    },
    UPDATE_CURINTERVAL: (state, params) => {
      state.curIntervalTagID = params.id
      state.curIntervalTagName = params.name
    },
    UPDATA_TAGLIST: (state, list) => {
      state.innerTagList = list
    }
  },
  actions: {
    async loadIntervalTagList({ commit, state }, appType) {
      try {
        const { data } = await getList({}, 'crm')
        commit('UPDATE_INTERVALTAGLIST', data.data.content || [])
      } catch (error) {
        return
      }
    },
    async loadInnerTagList({ commit }, {
      id,
      appType
    }) {
      try {
        const { data } = await getTagList({
          intentLevelTagId: id
        }, 'crm')
        commit('UPDATA_TAGLIST', data.data.details || [])
      } catch (error) {
        return
      }
    },
    updateCurInterval({ commit, state }, { id, name }) {
      commit('UPDATE_CURINTERVAL', {
        name: name,
        id: id
      })
    },
    initDialogFlow({ commit }) { // 路由切换时重置话术状态
      commit('UPDATE_INDUSTRY', [])
    }
  }
}

export default talk
