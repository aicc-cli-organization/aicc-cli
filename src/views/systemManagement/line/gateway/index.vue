<template>
  <div id="gateway">
    <div class="flex-container">
      <gateway-list></gateway-list>
      <port-list class="port-list"></port-list>
    </div>
  </div>
</template>

<script>
import gatewayList from './components/gatewayList'
import portList from './components/portList'
export default {
  name: 'gateway',
  components: {
    gatewayList,
    portList
  },
  data() {
    return {}
  }
}
</script>
<style lang="scss" scoped>
  .flex-container {
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
  .port-list {
    flex: 1;
    width: calc(100vw - 561px);
    margin-left: 10px;
    background: #f9f9f9;
  }
</style>