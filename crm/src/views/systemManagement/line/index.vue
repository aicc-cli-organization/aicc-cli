<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="线路列表" name="phoneNumberList">
      <phone-number-list v-if="activeName=='phoneNumberList'"/>
    </el-tab-pane>
    <el-tab-pane label="网关配置" name="gateway" v-show="showPolicyGroupAndGateway.containsGateway == true">
      <gateway v-if="activeName=='gateway'"/>
    </el-tab-pane>
     <!-- v-show="showPolicyGroupAndGateway.containsPolicyGroup == true" -->
    <el-tab-pane label="外呼策略组" name="policyGroup">
      <policy-group v-if="activeName=='policyGroup'"/>
    </el-tab-pane>
    <el-tab-pane label="线路监控" name="lineWatch" v-if="enableLineStatsView">
      <line-watch v-if="activeName=='lineWatch'"/>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import phoneNumberList from './phoneNumberList/index'
import gateway from './gateway/index'
import policyGroup from './policyGroup/index'
import lineWatch from './lineWatch/index'
import { mapGetters } from 'vuex'
import { containsPolicyGroupAndGateway } from '@/api/numberpool'

export default {
  name: 'lineMenu',
  components: {
    phoneNumberList, gateway, policyGroup, lineWatch
  },
  data() {
    return {
      showPolicyGroupAndGateway: {},
      activeName: 'phoneNumberList'
    }
  },
  computed: {
    ...mapGetters(['enableLineStatsView'])
  },
  mounted() {
    containsPolicyGroupAndGateway().then(({ data }) => {
      this.showPolicyGroupAndGateway = data.data
      // {
      //   containsPolicyGroup: true,
      //   containsGateway: true
      // }
    })
  }
}
</script>
<style lang="scss" scoped>
/deep/ .el-tabs__content {
  overflow: visible;
}
</style>