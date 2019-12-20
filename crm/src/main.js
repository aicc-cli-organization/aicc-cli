import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import 'yiwise-components/dist/yiwise-components.common.css'

import request from './utils/request'
import { hasAccess, hasOneAccessOf } from './utils/access'

import * as filters from './filters' // global filters

import * as utils from './utils'
import * as validate from './utils/validate'

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

// // 生产环境不打印console
// if (window.location.host.toLowerCase() === 'crm.tanyibot.com') {
//   console.log = function() {
//     return false
//   }
//   console.groupCollapsed = function() {
//     return false
//   }
// }
