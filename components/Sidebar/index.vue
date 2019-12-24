<template>
  <div class="sidebar-container">
    <el-menu
      :show-timeout="200"
      :default-active="$route.name"
      :collapse="collapse"
      :default-openeds="routes.map(item => item.name || item.path)"
      :collapse-transition="true"
      mode="vertical"
      background-color="#fff"
      text-color="#a7a9b3"
    >
      <sidebar-item 
        :routes="routes" 
        v-bind="$attrs"/>
    </el-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem },
  props: {
    collapse: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      routes: [
        // {
        //   path: '/customer-center',
        //   redirct: '/customer-center/customer-center/',
        //   children: [
        //     {
        //       path: '/contact-history/',
        //       redirct: '/customer-center/contact-history/dial',
        //       meta: {
        //         title: '联系历史',
        //         iconfont: 'icon-hujiaorenwux'
        //       },
        //       children: [
        //         {
        //           path: '/dial',
        //           name: 'customer-center-contact-history-dial',
        //           meta: {
        //             title: '通话历史',
        //             iconStyle: { 'font-size': '24px', 'margin-right': '10px' },
        //             breadcrumb: [
        //               {
        //                 name: '通话历史',
        //                 path: '#'
        //               }
        //             ],
        //             noCache: true
        //           }
        //         }
        //       ]
        //     },
        //     {
        //       path: '/customer-center/',
        //       redirct: '/customer-center/customer-center/private',
        //       meta: {
        //         title: '客户中心',
        //         iconfont: 'icon-hujiaorenwux'
        //       },
        //       children: [
        //         {
        //           path: '/private',
        //           name: 'customer-center-customer-center-private',
        //           meta: {
        //             title: '我的客户',
        //             iconStyle: { 'font-size': '24px', 'margin-right': '10px' },
        //             breadcrumb: [
        //               {
        //                 name: '我的客户',
        //                 path: '#'
        //               }
        //             ],
        //             noCache: true
        //           }
        //         }, {
        //           path: '/public',
        //           name: 'customer-center-customer-center-public',
        //           meta: {
        //             title: '客户公海',
        //             iconStyle: { 'font-size': '24px', 'margin-right': '10px' },
        //             breadcrumb: [
        //               {
        //                 name: '客户公海',
        //                 path: '#'
        //               }
        //             ],
        //             noCache: true
        //           }
        //         }
        //       ]
        //     }
        //   ]
        // }
        {
          path: '/customer-center/',
          redirct: '/customer-center/customer-center/',
          meta: {
            title: '客户中心',
            iconfont: 'icon-hujiaorenwux'
          },
          children: [
            {
              path: '/customer-center',
              name: 'customer-center-customer-center',
              meta: {
                title: '我的客户',
                iconStyle: { 'font-size': '24px', 'margin-right': '10px' },
                breadcrumb: [
                  {
                    name: '我的客户',
                    path: '#'
                  }
                ],
                noCache: true
              }
            }, {
              path: '/customer-center/public',
              name: 'customer-center-customer-center-public',
              meta: {
                title: '客户公海',
                iconStyle: { 'font-size': '24px', 'margin-right': '10px' },
                breadcrumb: [
                  {
                    name: '客户公海',
                    path: '#'
                  }
                ],
                noCache: true
              }
            }
          ]
        }, {
          path: '/customer-center1', // path并不重要，随便写个不同的就好了
          alwaysShow: true,
          meta: {
            title: '联系历史',
            iconfont: 'icon-hujiaorenwux'
          },
          children: [
            {
              path: '/contact-history',
              name: 'customer-center-contact-history',
              meta: {
                title: '通话历史',
                iconStyle: { 'font-size': '24px', 'margin-right': '10px' },
                breadcrumb: [
                  {
                    name: '通话历史',
                    path: '#'
                  }
                ],
                noCache: true
              }
            }
          ]
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['sidebar']),
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@aicc/styles/variables.scss';

$menuHover: #edf8f8;
$menuItemHeight: 42px;

.sidebar-container {
  height: 100%;
  z-index: $--index-top;
  overflow: auto;
  background-color: $--color-white;
  /deep/ .scrollbar-wrapper {
    overflow-x: hidden !important;
    .el-scrollbar__view {
      height: 100%;
    }
  }
  .el-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .is-horizontal {
    display: none;
  }
  a {
    display: inline-block;
    width: 100%;
    overflow: hidden;
  }
  .el-menu /deep/ {
    border: none;
    width: 100% !important;
    .el-menu-item[role='menuitem'] {
      color: $--color-black !important;
      i {
        margin-right: 6px;
        display: inline-block;
        font-size: $--font-size-small;
      }
    }
    .el-menu-item i {
      color: $--color-black;
      position: relative;
    }
    .el-menu-item {
      height: $menuItemHeight;
      line-height: $menuItemHeight;
      padding: 0 28px !important;
      font-size: 14px;
      display: flex;
      margin-top: 20px;
    }
    .el-menu-item.is-active {
      color: #17a1ad !important;
      i {
        color: #17a1ad !important;
      }
      background-color: $menuHover !important;
      &:before {
        display: block;
        position: absolute;
        content: '';
        height: $menuItemHeight;
        width: 4px;
        right: 0px;
        background: $--color-primary;
      }
    }
    .el-submenu__title {
      color: $--color-text-regular !important;
      font-size: 0px;
      padding-left: 28px !important;
      &:hover {
        background: $--color-white !important;
      }
    }
    .nest-menu .el-submenu > .el-submenu__title,
    .el-submenu .el-menu-item {
      min-width: 165px !important;
      &:hover {
        background-color: $menuHover !important;
      }
    }
    .el-menu--collapse .el-menu .el-submenu {
      min-width: 165px !important;
    }
    .el-menu-item:hover {
      background-color: $menuHover !important;
    }
  }
  .el-menu::-webkit-scrollbar {
    display: none !important;
  }
}
</style>
