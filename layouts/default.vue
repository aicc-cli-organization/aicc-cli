<template>
  <div>
    <base-top-nav />
    <div class="container">
      <Sidebar class="side-bar" v-if="$route.path !== '/customer-center/login'" />
      <div class="app">
        <nuxt/>
      </div>
    </div>
  </div>
</template>

<script>
import '../crm/src/main.js'
import Sidebar from '@/components/Sidebar'
import { getToken } from '@/utils/auth'
import { BaseTopNav } from '@aicc/components'

export default {
  components: { Sidebar, BaseTopNav },
  created() {
    console.log(this.$route)

    const token = getToken()

    console.log('token: ' + token)

    if (token) {
      this.$store.dispatch('loadCustomerFields') // 获取客户模块客户自定义字段
    } else {
      if (this.$route.fullPath !== '/customer-center/login') {
        this.$router.push({name: 'customer-center-login'})
      }
    }
  },
  beforeMount() {
    console.log(this.$router)
    this.$store.commit('SET_CLIENTHEIGHT', document.documentElement.clientHeight)
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  overflow: auto;
  .side-bar {
    width: 170px;
    flex: 170px 0 0;
  }
  .app {
    flex: 1;
    overflow: auto;
  }
}
</style>

<style>
#__nuxt, #__layout {
  height: 100%;
}
#__layout > div {
  height: 100%;
}
</style>
