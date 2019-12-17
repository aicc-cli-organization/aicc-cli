import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import 'yiwise-components/dist/yiwise-components.common.css'

import Element from 'element-ui'

import '@/theme/index.scss' // 重写element样式
import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import request from './utils/request'
import { hasAccess, hasOneAccessOf } from './utils/access'

import './permission' // permission control

import * as filters from './filters' // global filters

import * as utils from './utils'
import * as validate from './utils/validate'

Vue.use(Element, {
  size: 'small' // set element-ui default size
})

import VueChatScroll from 'vue-chat-scroll'
Vue.use(VueChatScroll)

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

Vue.prototype.$request = request
Vue.prototype.$utils = utils
Vue.prototype.hasAccess = hasAccess
Vue.prototype.hasOneAccessOf = hasOneAccessOf
Vue.prototype.$validate = validate

// 生产环境不打印console
if (window.location.host.toLowerCase() === 'crm.tanyibot.com') {
  console.log = function() {
    return false
  }
  console.groupCollapsed = function() {
    return false
  }
}

new Vue({
  el: '#app',
  router,
  store,
  utils,
  validate,
  template: '<App/>',
  components: { App }
})
