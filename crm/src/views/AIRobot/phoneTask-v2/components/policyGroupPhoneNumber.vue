<template>
  <el-popover
    placement="bottom"
    trigger="hover"
    v-model="visible"
  >
    <div class="phone-list">
      <div
        v-for="(item, index) in policyGroupPhoneNumberList"
        :key="index"
        class="phone-item"
      >
        {{item.phoneNumber}}({{locationDisplayTypeMap[item.locationDisplayType] || ((item.province || '-') + (item.city || '-'))}})
      </div>
    </div>
    <i slot="reference" :class="visible ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
  </el-popover>
</template>

<script>
const locationDisplayTypeMap = {
  RANDOM: '全国随机显',
  NO_DISPLAY: '不显示归属地'
}

export default {
  props: {
    policyGroupPhoneNumberList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      visible: false,
      locationDisplayTypeMap
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
