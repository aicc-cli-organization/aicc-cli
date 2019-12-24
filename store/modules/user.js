import { login, logout, getUserInfo, loginCode } from '@aicc/api/user'
import { removeToken } from '@/utils/auth'

const user = {
  state: {
    userId: '',
    roleId: '',
    name: '', // 用户名
    phoneNumber: '', // 联系电话
    roleName: '', // 角色名称
    csAuth: {}
  },

  mutations: {
    SET_USERID: (state, id) => {
      state.userId = id
    },
    SET_ROLEID: (state, roleId) => {
      state.roleId = roleId
    },
    SET_PHONENUMBER: (state, phoneNumber) => {
      state.phoneNumber = phoneNumber
    },
    SET_USERNAME: (state, userName) => {
      state.name = userName
    },
    SET_ROLENAME: (state, roleName) => {
      state.roleName = roleName
    },
    SET_CS_AUTH: (state, auth) => {
      state.csAuth = auth
    }
  },

  actions: {
    // 用户名登录
    async LoginByUsername({ commit }, userInfo) {
      try {
        await login({
          phoneNumber: userInfo.phoneNumber,
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
        await loginCode({
          phoneNumber: userInfo.phoneNumber,
          code: userInfo.code
        })
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async getUserInfo({ commit, state }) {
      try {
        const { data } = await getUserInfo()
        if (data.data) {
          const { name, userId, phoneNumber, roleId, roleName } = data.data
          commit('SET_USERID', userId)
          commit('SET_USERNAME', name)
          commit('SET_PHONENUMBER', phoneNumber)
          commit('SET_ROLENAME', roleName)
          commit('SET_ROLEID', roleId)
        }
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 登出
    async logout({ commit, state }) {
      try {
        await logout()
        commit('SET_PHONENUMBER', '')
        removeToken()
        return Promise.resolve()
      } catch (error) {
        return Promise.reject()
      }
    }
  }
}

export default user
