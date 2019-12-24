// import { asyncRouterMap, constantRouterMap } from '@/router'
import { hasPermission } from '@/utils/access'
const asyncRouterMap = []
const constantRouterMap = []

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param access
 */
function filterAsyncRouter(asyncRouterMap, access) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(access, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, access)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    personalizedData: {}
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    SET_PERSONALIZED: (state, data) => {
      state.personalizedData = data.information || {}
    }
  },
  actions: {
    generateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { access, csAuth = {}} = data
        const authArr = []
        for (const auth in csAuth) {
          if (csAuth[auth] === true) {
            authArr.push(auth)
          }
        }

        const accessedRouters = filterAsyncRouter(asyncRouterMap, [...access, ...authArr])
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    },
    personalizedRoutes({ commit }, data) {
      commit('SET_PERSONALIZED', data)
    }
  }
}

export default permission
