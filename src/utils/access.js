import store from '@/store'

export const hasAccess = (access) => {
  const csAuth = store.getters.csAuth
  const authArr = []
  for (const auth in csAuth) {
    if (csAuth[auth] === true) {
      authArr.push(auth)
    }
  }
  return [...store.getters.access, ...authArr].indexOf(access) !== -1
}

export const hasOneAccessOf = (accessArr) => {
  return accessArr.some(access => hasAccess(access))
}

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param access
 * @param route
 */
export function hasPermission(access, route) {
  if (route.meta && route.meta.access) {
    let hasAccess = false
    for (let i = 0; i < route.meta.access.length; i++) {
      const item = route.meta.access[i]
      if (Array.isArray(item)) {
        hasAccess = item.every(authd => access.includes(authd))
        break
      } else if (access.includes(item)) {
        hasAccess = true
        break
      }
    }

    return hasAccess

    // return access.some(role => {
    //   return route.meta.access.indexOf(role) >= 0
    // })
  } else {
    return true
  }
}
