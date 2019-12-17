import Vue from 'vue'
import Router from 'vue-router'
// import Store from '../store'
const Store = window.$nuxt.$store
import { hasAccess } from '../utils/access'

import { SystemSetting, IdentifyList, KnowledgeShare } from 'yiwise-components'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

const customerStr = Store.getters.customerStr

/** note: submenu only apppear when children.length>=1
*   detail see  https://panjiachen.github.io/vue-element-admin-site/#/router-and-nav?id=sidebar
**/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    roles: ['admin','editor']     will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    faIcon: 'font-awesome'       the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '',
    component: Layout,
    redirect: '/index',
    meta: {
      access: ['crm_index_view']
    },
    children: [{
      path: 'index',
      component: () => import('@/views/homePage/index'),
      name: 'homePage',
      meta: {
        title: '首页',
        iconfont: 'icon-shouyex',
        access: ['crm_index_view'],
        iconStyle: { 'font-size': '12px', 'margin-right': '6px' },
        noCache: true
      }
    }]
  },
  {
    path: '/callcenter',
    component: Layout,
    redirect: '/callcenter/task',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: '呼叫中心',
      access: ['crm_callTask_view', 'crm_SMS_view', 'enableVoiceQualityControl']
    },
    hidden: () => hasAccess('crm_callTask_view') || hasAccess('crm_SMS_view') || hasAccess('enableVoiceQualityControl') ? false
      : !hasAccess('enableCallIn') ? true : !hasAccess('crm_callInRecp_view'),
    children: [{
      path: 'task',
      component: () => import('@/views/AIRobot/phoneTask-v2/index'),
      name: 'task',
      meta: {
        title: '呼叫任务',
        iconfont: 'icon-hujiaorenwux',
        iconStyle: { 'font-size': '12px', 'margin-right': '6px' },
        access: ['crm_callTask_view']
      }
    }, {
      path: 'reception',
      component: () => import('@/views/AIRobot/Reception/index'),
      name: 'reception',
      meta: {
        title: '呼入接待',
        noCache: true,
        iconfont: 'icon-hurujiedaix',
        iconStyle: { 'font-size': '14px', 'margin-right': '5px' },
        access: [['enableCallIn', 'crm_callInRecp_view']]
      },
      hidden: () => !hasAccess('enableCallIn') || !hasAccess('crm_callInRecp_view')
    }, {
      path: 'numberPool',
      component: () => import('@/views/systemManagement/seat/index'),
      name: 'numberPool',
      meta: {
        title: '坐席管理',
        iconfont: 'icon-zuoxiguanlix',
        access: ['crm_seatManage_view']
      }
    }, {
      path: 'qualityTest',
      component: () => import('@/views/AIRobot/qualityTest/index'),
      name: 'qualityTest',
      meta: {
        title: '智能质检',
        noCache: true,
        iconfont: 'icon-quality',
        access: ['enableVoiceQualityControl']
      },
      hidden: () => !hasAccess('enableVoiceQualityControl') ? true : (!hasAccess('crm_qc_job_view') && !hasAccess('crm_qc_rule_view'))
    }, {
      path: 'intentMessage',
      component: () => import('@/views/AIRobot/intentMessage/index'),
      name: 'intentMessage',
      meta: {
        title: '短信管理',
        noCache: true,
        iconfont: 'icon-yixiangduanxinx',
        access: ['crm_SMS_view']
      },
      hidden: Store.getters.isLocal
    }]
  },
  {
    path: '/AIRobot',
    component: Layout,
    redirect: '/AIRobot/dialog/flow',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: 'AI机器人',
      access: ['crm_dialDesign_view', 'crm_intentionTag_view', 'enabledViewIntent', 'share_knowledge', 'share_knowledge_view', 'share_knowledge_edit_and_group']
    },
    hidden: () => !(
      hasAccess('crm_dialDesign_view') ||
      hasAccess('crm_share_knowledge') || hasAccess('crm_share_knowledge_view') || hasAccess('crm_share_knowledge_edit_and_group') ||
      hasAccess('crm_intentionTag_view') ||
      (hasAccess('enableIvr') && hasAccess('crm_ivr_view')) ||
      (hasAccess('enabledViewIntent') && hasAccess('crm_intent_learning_view'))
    ),
    children: [{
      path: 'dialog/flow',
      component: () => import('@/views/DialogFlow'),
      name: 'dialogFlow',
      meta: {
        title: '话术设计',
        iconfont: 'icon-huashushejix',
        iconStyle: { 'font-size': '14px', 'margin-right': '5px' },
        access: ['crm_dialDesign_view']
      },
      props: () => ({
        type: 'crm',
        isLocal: Store.getters.isLocal
      })
    }, {
      path: 'knowledgeShare',
      component: KnowledgeShare,
      name: 'knowledgeShare',
      meta: {
        title: '知识共享',
        iconfont: 'icon-zhishigongxiangx',
        iconStyle: { 'font-size': '12px', 'margin-right': '7px' },
        access: ['crm_share_knowledge', 'crm_share_knowledge_view', 'crm_share_knowledge_edit_and_group']
      }
    }, {
      path: 'sysSettings',
      component: SystemSetting,
      name: 'sysSettings',
      meta: {
        title: '意向标签',
        iconfont: 'icon-yixiangbiaoqianx1',
        iconStyle: { 'font-size': '14px', 'margin-right': '5px' },
        access: ['crm_intentionTag_view']
      },
      props: () => ({
        appType: 'crm'
      })
    }, {
      path: 'IVRDesign',
      component: () => import('@/views/IVR'),
      name: 'IVRDesign',
      meta: {
        title: '语音导航',
        iconfont: 'icon-ivrdaohangx',
        iconStyle: { 'font-size': '12px', 'margin-right': '1px', 'position': 'relative', 'left': '-2px' },
        access: ['enableIvr', 'crm_ivr_view']
      },
      hidden: () => !(hasAccess('enableIvr') && hasAccess('crm_ivr_view'))
    }, {
      path: 'identifyList',
      component: IdentifyList,
      name: 'identifyList',
      meta: {
        title: '意图学习',
        iconfont: 'icon-yituxuexix',
        iconStyle: { 'font-size': '14px', 'margin-right': '5px' },
        access: ['enabledViewIntent', 'crm_intent_learning_view']
      },
      hidden: () => !(hasAccess('enabledViewIntent') && hasAccess('crm_intent_learning_view'))
    }]
  },
  {
    path: '/customer',
    component: Layout,
    redirect: '/customer/privateSea',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: `${customerStr}管理`,
      access: [
        'crm_private_view',
        'crm_publicSea_view',
        'crm_dialHistory_view',
        'crm_allCus_view'
      ]
    },
    children: [{
      path: 'privateSea',
      component: () => import('@/views/customer/PrivateSea'),
      name: 'privateSea',
      meta: {
        title: `我的${customerStr}`,
        iconfont: 'icon-wodekehux',
        iconStyle: { 'font-size': '12px', 'margin-right': '6px' },
        access: ['crm_private_view']
      }
    }, {
      path: 'publicSea',
      component: () => import('@/views/customer/publicSea'),
      name: 'publicSea',
      meta: {
        title: `${customerStr}公海`,
        iconfont: 'icon-kehugonghaix',
        iconStyle: { 'font-size': '14px', 'margin-right': '4px' },
        access: ['crm_publicSea_view']
      }
    }, {
      path: 'contactHistory',
      component: () => import('@/views/customer/contactHistory'),
      name: 'contactHistory',
      meta: {
        title: '联系历史',
        iconfont: 'icon-lianxilishix1',
        iconStyle: { 'font-size': '12px', 'margin-right': '7px' },
        access: ['crm_dialHistory_view']
      }
    },
    // {
    //   path: 'allCustomers',
    //   component: () => import('@/views/customer/allCustomers'),
    //   name: 'allCustomers',
    //   meta: {
    //     title: `所有${customerStr}`,
    //     iconfont: 'icon-suoyoukehux',
    //     iconStyle: { 'font-size': '16px', 'margin-right': '4px' },
    //     access: ['crm_allCus_view']
    //   }
    // },
    {
      path: 'setVariables',
      component: () => import('@/views/customer/setVariables'),
      name: 'setVariables',
      meta: {
        title: '字段设置',
        iconfont: 'icon-ziduanshezhix1',
        iconStyle: { 'font-size': '12px', 'transform': 'scale(0.92, 0.92)', 'margin-right': '4px' },
        access: ['crm_customerAttribute_view']
      }
    }, {
      path: 'whiteList',
      component: () => import('@/views/customer/whiteList'),
      name: 'whiteList',
      meta: {
        title: `${customerStr}白名单`,
        iconfont: 'icon-menu-kehubaimingdan'
      },
      hidden: true
    }, {
      path: 'customerGroup',
      component: () => import('@/views/customer/customerGroup'),
      name: 'customerGroup',
      meta: {
        title: `${customerStr}分组`,
        iconfont: 'icon-menu-kehubaimingdan'
      },
      hidden: true
    }]
  },
  {
    path: '/stats',
    component: Layout,
    redirect: '/stats/callStats',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: '数据统计',
      access: ['crm_statisticsDial_view', 'crm_statisticsBusi_viewBusi', 'crm_statisticsBill_view']
    },
    children: [{
      path: 'callStats',
      component: () => import('@/views/stats/callStats'),
      name: 'callStats',
      meta: {
        title: '通话统计',
        iconfont: 'icon-tonghuatongjix',
        iconStyle: { 'font-size': '12px', 'margin-right': '6px' },
        access: ['crm_statisticsDial_view']
      }
    }, {
      path: 'businessAnalysis',
      component: () => import('@/views/stats/businessAnalysis/index'),
      name: 'businessAnalysis',
      meta: {
        title: '商机分析',
        iconfont: 'icon-shangjifenxix',
        iconStyle: { 'font-size': '12px', 'margin-right': '6px' },
        access: ['crm_statisticsBusi_viewBusi']
      },
      hidden: !Store.getters.needBusinessAnalysis
    }, {
      path: 'billing',
      component: () => import('@/views/stats/billing/index'),
      name: 'billing',
      meta: {
        title: '计费汇总',
        iconfont: 'icon-jifeihuizongx1',
        iconStyle: { 'font-size': '12px', 'margin-right': '6px' },
        access: ['crm_statisticsBill_view']
      }
    }]
  },
  {
    path: '/systemManagement',
    component: Layout,
    redirect: '/systemManagement/index',
    alwaysShow: true, // will always show the root menu
    meta: {
      title: '系统管理'
    },
    children: [{
      path: 'teamManagement',
      component: () => import('@/views/systemManagement/teamManagement/index'),
      name: 'teamManagement',
      meta: {
        title: '团队管理',
        iconfont: 'icon-tuanduiguanlix',
        iconStyle: { 'font-size': '14px', 'margin-right': '5px' },
        access: ['crm_teamManage_view']
      }
    }, {
      path: 'line',
      component: () => import('@/views/systemManagement/line/index'),
      name: 'line',
      meta: {
        title: '线路管理',
        iconfont: 'icon-zuoxiguanlix'
      }
    }, {
      path: 'systemSettings',
      component: () => import('@/views/systemManagement/setting'),
      name: 'systemSettings',
      meta: {
        title: '账号设置',
        iconfont: 'icon-zhanghaoshezhix',
        iconStyle: { 'font-size': '14px', 'margin-right': '5px' }
      }
    }, {
      path: 'role',
      component: () => import('@/views/systemManagement/roleManagement'),
      name: 'roleManagement',
      hidden: true,
      meta: {
        title: '角色管理',
        access: ['crm_roleManage_view'],
        noCache: true
      },
      props: () => ({
        appType: 'crm'
      })
    }, {
      path: 'messageCenter',
      component: () => import('@/views/systemManagement/messageCenter/index'),
      name: 'messageCenter',
      meta: {
        title: '消息中心',
        iconfont: 'icon-xiaoxizhongxinx',
        access: ['crm_msgCenter_view']
      }
    }]
  }
]

const helpCenter = {
  path: '/help',
  component: Layout,
  redirect: '/help/index',
  alwaysShow: true, // will always show the root menu
  meta: {
    title: '帮助中心'
  },
  children: [{
    path: 'quickStart',
    outerLink: 'http://confluence.yiwise.net/x/EYBZ',
    name: 'quickStart',
    meta: {
      title: '快速入门',
      iconfont: 'icon-kuaisurumenx',
      iconStyle: { 'font-size': '12px', 'margin-right': '5px' }
    }
  }, {
    path: 'feedback',
    component: () => import('@/views/help/feedback/index'),
    name: 'feedback',
    meta: {
      title: '问题反馈',
      iconfont: 'icon-wentifankuix',
      iconStyle: { 'font-size': '12px', 'margin-right': '5px' }
    }
  }, {
    path: 'apiDoc',
    outerLink: 'http://api.tanyibot.com',
    name: 'apiDoc',
    meta: {
      title: 'API文档',
      iconfont: 'icon-API'
    }
  }, {
    path: 'formatData',
    component: () => import('@/views/help/formatData/index'),
    name: 'formatData',
    meta: {
      title: 'formaData',
      iconfont: 'icon-menu-tuanduiguanli'
    },
    hidden: true
  }, {
    path: 'formatData2',
    component: () => import('@/views/help/formatData2/index'),
    name: 'formatData2',
    meta: {
      title: 'formaData2',
      iconfont: 'icon-menu-tuanduiguanli'
    },
    hidden: true
  }]
}

// 不需要logo的情况下也移除快速入门和API文档
if (Store.getters.NoLogoNorWx) {
  helpCenter.children.splice(0, 1)
  helpCenter.children.splice(1, 1)
}

// 荣联公司不需要快速入门、API文档和消息中心
if (Store.getters.isRongLian) {
  helpCenter.children.splice(0, 1)
  helpCenter.children.splice(1, 1)
  asyncRouterMap[asyncRouterMap.length - 1].children.splice(4, 1)
}

if (!Store.getters.isLocal) {
  asyncRouterMap.push(helpCenter)
}
