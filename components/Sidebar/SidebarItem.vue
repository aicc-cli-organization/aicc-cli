<template>
  <div class="menu-wrapper">
    <template 
      v-for="item in routes" 
      v-if="showMenu(item)&&item.children">

      <nuxt-link 
        v-if="hasOneShowingChildren(item.children) && !item.children[0].children&&!item.alwaysShow" 
        :to="{ name: item.children[0].name }"
        :key="item.children[0].name">
        <el-menu-item 
          :index="item.children[0].name" 
          :class="{'submenu-title-noDropdown':!isNest}">
          <i 
            v-if="item.children[0].meta&&item.children[0].meta.iconfont" 
            :class="'iconfont ' + item.children[0].meta.iconfont" 
            :style="item.children[0].meta.iconStyle"/>
          <span 
            v-if="item.children[0].meta&&item.children[0].meta.title" 
            slot="title">{{ item.children[0].meta.title }}</span>
        </el-menu-item>
      </nuxt-link>

      <el-submenu 
        v-else 
        :index="item.name||item.path" 
        :key="item.name">
        <template slot="title">
          <i 
            v-if="item.meta&&item.meta.iconfont" 
            :class="'iconfont ' + item.meta.iconfont" 
            :style="item.meta.iconStyle"/>
          <span 
            v-if="item.meta&&item.meta.title" 
            slot="title">{{ item.meta.title }}</span>
        </template>

        <template 
          v-for="(child) in item.children" 
          v-if="showMenu(child)">
          <sidebar-item 
            v-if="child.children&&child.children.length>0" 
            :is-nest="true"
            :routes="[child]" 
            :key="child.path" 
            class="nest-menu"/>
          <a 
            v-else-if="child.outerLink" 
            :key="child.name" 
            :href="child.outerLink" 
            target="_blank">
            <el-menu-item 
              :index="''+child.name" 
              class="menu-item">
              <i 
                v-if="child.meta&&child.meta.iconfont" 
                :class="'iconfont '+ child.meta.iconfont" 
                :style="child.meta.iconStyle"/>
              <span 
                v-if="child.meta&&child.meta.title" 
                slot="title">{{ child.meta.title }}</span>
            </el-menu-item>
          </a>
          <nuxt-link 
            v-else 
            :to="{ name: child.name }" 
            :key="child.name">
            <el-menu-item 
              :index="child.name" 
              class="menu-item">
              <i 
                v-if="child.meta&&child.meta.iconfont" 
                :class="'iconfont '+ child.meta.iconfont" 
                :style="child.meta.iconStyle"/>
              <span 
                v-else 
                class="empty-span"/>
              <span 
                v-if="child.meta&&child.meta.title" 
                slot="title">{{ child.meta.title }}</span>
            </el-menu-item>
          </nuxt-link>
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
      type: Array,
      default: () => []
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
@import '@aicc/styles/variables.scss';

.iconfont {
  font-size: 16px !important;
}
.menu-wrapper {
  margin-bottom: 20px;

  /deep/ .el-submenu__title {
    height: 50px;

    line-height: 50px;
    margin-top: 20px;
    > .iconfont {
      margin-right: 10px;
    }
    > span {
      font-size: 12px;
      color: #040404;
    }
  }
  .el-submenu {
    .el-menu-item {
      height: 42px;
      line-height: 42px;
      margin-top: 0 !important;
    }
  }
  // /deep/ li:nth-of-type(1) .el-submenu__title {
  //   margin-top: 10px;
  // }
  /deep/ .el-menu-item {
    font-size: 12px !important;
    .empty-span {
      width: 18px;
      height: 18px;
      margin-right: 10px;
    }
    &.is-active {
      > span {
        font-weight: 600;
      }
    }
  }
}
.menu-wrapper::-webkit-scrollbar {
  display: none !important;
}
</style>
