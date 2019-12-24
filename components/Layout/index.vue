<template>
  <div id="app-container">
    <base-top-nav />
    <div
      id="app-main"
    >
      <transition name="fade-transform" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import { BaseTopNav } from '@aicc/components'

export default {
  props: {
  },

  components: {
    BaseTopNav
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/variables.scss";

#app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  #app-main {
    flex: 1;
    overflow: auto;
  }
}
</style>
