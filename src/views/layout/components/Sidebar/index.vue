<template>
  <el-scrollbar wrapClass="scrollbar-wrapper" class="sidebar-container">
    <el-menu
      mode="vertical"
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="false"
      :default-openeds="permission_routers.map(item => item.name || item.path)"
      background-color="#fff"
      text-color="#a7a9b3"
      :collapse-transition="true"
    >
      <sidebar-item :routes="permission_routers"></sidebar-item>
    </el-menu>
  </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem },
  computed: {
    ...mapGetters([
      'permission_routers',
      'sidebar'
    ]),
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

$menuHover:#e9f5ff;

.sidebar-container {
  height: 100%;
  z-index: $--index-top;
  overflow: hidden;
  background-color: $--color-white;
  /deep/ .scrollbar-wrapper {
    overflow-x: hidden!important;
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
    .el-menu-item[role="menuitem"] {
      color: $--color-black!important;
      i {
        margin-right: 6px;
        display: inline-block;
        font-size: $--font-size-small;
      }
    }
    .el-menu-item i{
      color: $--color-text-regular;
      position: relative;
    }
    .el-menu-item {
      height: 30px;
      line-height: 30px;
      padding: 0 28px !important;
      font-size: 13px;
      display: flex;
    }
    .el-menu-item.is-active {
      color: #1890ff!important;
      i {
        color: #1890ff!important;
      }
      background-color: $menuHover!important;
      &:before {
        display: block;
        position: absolute;
        content: '';
        height: 30px;
        width: 4px;
        right: 0px;
        background: $--color-primary;
      }
    }
    .el-submenu__title {
      color: $--color-text-regular!important;
      font-size: $--font-size-small;
      padding-left: 28px!important;
      &:hover {
        background: $--color-white!important;
      }
    }
    .nest-menu .el-submenu>.el-submenu__title,
    .el-submenu .el-menu-item {
      min-width: 165px !important;
      &:hover {
        background-color: $menuHover!important;
      }
    }
    .el-menu--collapse .el-menu .el-submenu {
      min-width: 165px!important;
    }
    .el-menu-item:hover {
      background-color: $menuHover!important;
    }
  }
  .el-menu::-webkit-scrollbar {
    display: none!important;
  }
}
</style>

