<template>
  <div class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive>
        <router-view v-if="!$route.path.includes('customer/')" :key="key"></router-view>
      </keep-alive>
    </transition>
    <transition name="fade-transform" mode="out-in">
      <router-view v-if="$route.path.includes('customer/')" :key="key"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.fullPath
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  @import '~src/styles/variables.scss';
  .app-main {
    height: calc(100vh - 56px);
    min-width: 1195px;
    overflow: auto;
    padding: 14px;
  }
  .el-main{
    padding: 14px;
  }
</style>
