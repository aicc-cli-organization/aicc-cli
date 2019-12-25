<template>
  <div class="menu-wrapper">
    <template v-for="item in routes" v-if="showMenu(item)&&item.children">

      <router-link v-if="hasOneShowingChildren(item.children) && !item.children[0].children&&!item.alwaysShow" :to="item.path+'/'+item.children[0].path"
        :key="item.children[0].name">
        <el-menu-item :index="item.path+'/'+item.children[0].path" :class="{'submenu-title-noDropdown':!isNest}">
          <i v-if="item.children[0].meta&&item.children[0].meta.iconfont" :class="'iconfont ' + item.children[0].meta.iconfont" :style="item.children[0].meta.iconStyle"></i>
          <span v-if="item.children[0].meta&&item.children[0].meta.title" slot="title">{{item.children[0].meta.title}}</span>
        </el-menu-item>
      </router-link>

      <el-submenu v-else :index="item.name||item.path" :key="item.name">
        <template slot="title">
          <i v-if="item.meta&&item.meta.iconfont" :class="'iconfont ' + item.meta.iconfont" :style="item.meta.iconStyle"></i>
          <span v-if="item.meta&&item.meta.title" slot="title">{{item.meta.title}}</span>
        </template>

        <template v-for="(child, index) in item.children" v-if="showMenu(child)">
          <sidebar-item :is-nest="true" class="nest-menu"
            v-if="child.children&&child.children.length>0" :routes="[child]" :key="child.path">
          </sidebar-item>
          <a v-else-if="child.outerLink" :key="child.name" :href="child.outerLink" target="_blank">
            <el-menu-item  :index="''+index" class="menu-item">
              <i v-if="child.meta&&child.meta.iconfont" :class="'iconfont '+ child.meta.iconfont" :style="child.meta.iconStyle"></i>
              <span v-if="child.meta&&child.meta.title" slot="title">{{child.meta.title}}</span>
            </el-menu-item>
          </a>
          <router-link v-else :to="item.path+'/'+child.path" :key="child.name">
            <el-menu-item :index="item.path+'/'+child.path" class="menu-item">
              <i v-if="child.meta&&child.meta.iconfont" :class="'iconfont '+ child.meta.iconfont" :style="child.meta.iconStyle"></i>
              <span v-if="child.meta&&child.meta.title" slot="title">{{child.meta.title}}</span>
            </el-menu-item>
          </router-link>
        </template>
      </el-submenu>

    </template>
  </div>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    routes: {
      type: Array
    },
    isNest: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    hasOneShowingChildren(children) {
      const showingChildren = children.filter(item => {
        return this.showMenu(item)
      })
      if (showingChildren.length === 1) {
        return true
      }
      return false
    },
    showMenu(child) {
      if (typeof child.hidden === 'function') {
        return !child.hidden()
      } else {
        return !child.hidden
      }
    }
  }
}
</script>


<style lang="scss" scoped>
  @import 'src/styles/variables.scss';

  .iconfont{
    font-size: 18px;
  }
  .menu-wrapper {
    padding-top: 10px;
    margin-bottom: 20px;
    /deep/ .el-submenu__title {
      height: 13px;
      line-height: 13px;
      margin-top: 20px;
      margin-bottom: 5px;
    }
    /deep/ li:nth-of-type(1) .el-submenu__title {
      margin-top: 10px;
    }
  }
  .menu-wrapper::-webkit-scrollbar {
    display: none!important;
  }
</style>
