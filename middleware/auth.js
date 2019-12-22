import { getToken } from '@/utils/auth'

let hasLogin = false

export default async function({ route, store, redirect }) {
  // Server-side
  if (process.server) {
    // 打开的第一个页面一定是服务端，因为首页服务端渲染
  }

  // Client-side
  if (process.client) {
    // 客户端权限处理，但无法处理第一个页面，如果是第一个页面，只能等调用了接口才会被自动导航到登录
    const token = getToken()

    if (token) {
      if (!hasLogin) {
        store.dispatch('loadCustomerFields') // 获取客户模块客户自定义字段
      }

      hasLogin = true
    } else {
      hasLogin = false
      if (route.fullPath !== '/customer-center/login') {
        redirect('/customer-center/login')
      }
    }
  }
}
