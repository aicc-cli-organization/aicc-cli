import cookie from 'js-cookie'

export function getToken() {
  return cookie.get('token')
}

export function removeToken() {
  window.token = undefined
  cookie.remove('token')
  cookie.remove('refresh_token')
}
