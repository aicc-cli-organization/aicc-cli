<template>
  <span class="account-fare">{{label}}: {{accountFare}}元</span>
</template>

<script>
export default {
  props: {
    accountFare: [String, Number],
    label: String
  }
}
</script>

<style lang="scss" scoped>
.account-fare {
  font-size: 16px;
  font-weight: 600;
}
</style>
