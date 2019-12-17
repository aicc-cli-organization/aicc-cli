<template>
  <section class="container">
    <myCustomer />
  </section>
</template>

<script>
import Logo from '@@/components/Logo.vue'
import myCustomer from '../crm/src/views/customer/PrivateSea/index.vue'
import '../crm/src/main.js'
import Vue from 'vue'
console.log('pages index')

export default {
  components: {
    Logo,
    myCustomer
  },
  mounted() {
    console.log('outter this')
    console.log(this)
    console.log(this.$store)
    console.log(Vue)
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  /* display: flex;
  justify-content: center;
  align-items: center;
  text-align: center; */
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
