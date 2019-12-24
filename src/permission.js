// import router from './router'
const router = window.$nuxt.$router
// import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken, removeToken } from '@/utils/auth' // getToken from cookie
import { personalizedIdList , personalizedUrlList } from '@/utils/personalized'
import { hasPermission } from '@/utils/access'
import * as loginAPI from '@/api/login'

NProgress.configure({ showSpinner: false })// NProgress Configuration

// 获取url参数
function geturl(name) {
  if (window.location.href.split('#/login?').length === 1) {
    return null
  } else {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.href.split('#/login')[1].substr(1).match(reg)
    if (r != null) return unescape(r[2]); return null
  }
}

const hasRouter = (r) => {
  // matched有值说明有匹配的路由，否则说明此路由为未注册的路由（包括没权限和没定义两种情况）
  return !!r.matched.length
}

const whiteList = ['/login']// no redirect whitelist

router.beforeEach(async(to, from, next) => {
  const store = window.$nuxt.$store

  NProgress.start() // start progress bar
  personalizedUrlList(window.location.host)
  const token = getToken()
  if (token) { // determine if there has token
    /* has token*/
    if (to.path === '/login') {
      if (geturl('tenantId')) {
        store.dispatch('logout').then(() => {
          next({ path: '/' })
          NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
        })
      } else {
        next({ path: '/' })
        NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
      }
    } else {
      if (!store.getters.personalizedData.enableStatus) {// 判断当前用户是否已拉取完个性化配置数据
        personalizedIdList(geturl('tenantId'))
      }
      if (!store.getters.phoneNumber) { // 判断当前用户是否已拉取完user_info信息
        window.token = token // 页面刷新重置全局保存的token，用于调用接口权限校验
        try {
          const { data } = await store.dispatch('getUserInfo')
          if (data) {
            const access = data.authorityCodeList || []
            const csAuth = data.csAuth || {}
            const enabledViewIntent = data.enabledViewIntent
            if (enabledViewIntent) {
              csAuth.enabledViewIntent = true
            }
            await store.dispatch('generateRoutes', { access, csAuth })
            router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
            next({ ...to, replace: true })
          }
          store.dispatch('loadCustomerFields') // 获取客户模块客户自定义字段
        } catch (error) {
          console.error(error)
          removeToken()
          next({ path: '/' })
        }
      } else {
        const { access, csAuth } = store.getters
        const authArr = []
        for (const auth in csAuth) {
          if (csAuth[auth] === true) {
            authArr.push(auth)
          }
        }
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        if (!hasRouter(to)) {
          // 跳到第一个有权限的页面
          const route = store.getters.addRouters[0]
          let path = route.path
          if (route && route.children) {
            path = path + '/' + route.children[0].path
          } else {
            // 此人所有页面都没有权限访问，暂无此情况
          }
          next({ path: path })
          if (from.path === '/index') {
            NProgress.done() // finish progress bar
          }
        } else if (hasPermission([...access, ...authArr], to)) {
          next()
        } else {
          next({ path: '/' })
        }
        // 可删 ↑
      }
    }
  } else {
    if (to.path === '/login' && geturl('tenantId')) {
      loginAPI.CRMUrl({
        tenantId: geturl('tenantId'),
        phoneNumber: geturl('phoneNumber') || undefined,
        opeToken: geturl('t') || undefined,
        opeRefreshToken: geturl('rt') || undefined
      }).then(({ data }) => {
        next({ path: '/' })
        return
      })
    }
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

router.onError(error => {
  console.error(error)
})
