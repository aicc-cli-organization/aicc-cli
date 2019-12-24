import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import qcTask from './modules/qcTask'
import permission from './modules/permission'
import user from './modules/user'
import talk from './modules/talk'
import task from './modules/task'
import tag from './modules/tag'
import getters from './getters'
import callDetail from './modules/callDetail'
import navbarDot from './modules/navbarDot'
import taskV2 from './modules/task-v2'
import intervalTag from './modules/intervalTag'
import artificial from './modules/artificial'
import smsTask from './modules/smsTask'
import gateway from './modules/gateway'
import customerFields from './modules/customerFields'
import ivr from './modules/ivr'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    qcTask,
    permission,
    user,
    talk,
    task,
    tag,
    navbarDot,
    callDetail,
    taskV2,
    intervalTag,
    artificial,
    smsTask,
    gateway,
    customerFields,
    ivr
  },
  getters
})

export default store
