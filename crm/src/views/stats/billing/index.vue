<template>
  <div id="task-detail" class="yw-container">
    <el-tabs class="shadow-box" v-model="activeName">
      <el-tab-pane label="话单计费" name="cost" lazy v-if="hasAccess('crm_dialBill_view')">
        <cost v-if="activeName=='cost'"></cost>
      </el-tab-pane>
      <el-tab-pane label="话单详情" name="costDetail" v-if="hasAccess('crm_dialDetail_view')">
        <cost-detail v-if="activeName=='costDetail'"></cost-detail>
      </el-tab-pane>
      <el-tab-pane label="子账号话单" name="subAccountCost" v-if="hasAccess('crm_subAccountDial_view')">
        <sub-account-cost v-if="activeName=='subAccountCost'"/>
      </el-tab-pane>
      <el-tab-pane label="短信费用" name="smsCost" lazy v-if="hasAccess('crm_sms_bill_view')">
        <sms-cost :messageAccountFare="messageAccountFare"></sms-cost>
      </el-tab-pane>
      <el-tab-pane label="质检计费" name="qcCost" lazy v-if="hasAccess('crm_qc_bill')">
        <qc-cost :qcAccountFare="qcAccountFare" v-if="hasAccess('crm_qc_bill_view')"></qc-cost>
      </el-tab-pane>
      <el-tab-pane label="充值记录" name="rechargeRecord" v-if="hasAccess('crm_chargeRecord_view')">
        <recharge-record v-if="activeName=='rechargeRecord'"></recharge-record>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import cost from './components/cost'
  import costDetail from './components/costDetail'
  import rechargeRecord from './components/rechargeRecord'
  import subAccountCost from './components/subAccountCost'
  import smsCost from './sms/index'
  import qcCost from './qc/index'
  import { mapGetters } from 'vuex'
  import * as statsAPI from '@/api/stats'

  export default {
    name: 'speechCraft',
    computed: {
      ...mapGetters(['enableCsSeat']),
      taskId() {
        return this.$store.state.task.taskId
      }
    },
    components: {
      cost,
      costDetail,
      rechargeRecord,
      subAccountCost,
      smsCost,
      qcCost
    },
    data() {
      return {
        activeName: 'cost',
        messageAccountFare: 0,
        qcAccountFare: 0
      }
    },
    created() {
    },
    methods: {
      handleClick() {},
      async loadAccountFare() {
        const res = await statsAPI.getTenantAccountFare()
        const backMessageAccountFare = res.data.data.messageAccountFare
        const backQcAccountFare = res.data.data.qcAccountFare
        this.messageAccountFare = backMessageAccountFare ? backMessageAccountFare / 1000 : 0
        this.qcAccountFare = backQcAccountFare ? backQcAccountFare / 1000 : 0
      }
    },
    mounted() {
      if (!this.hasAccess('crm_dialBill_view')) {
        if (this.hasAccess('crm_dialDetail_view')) {
          this.activeName = 'costDetail'
        } else if (this.hasAccess('crm_chargeRecord_view')) {
          this.activeName = 'rechargeRecord'
        } else if (this.hasAccess('crm_subAccountDial_view')) {
          this.activeName = 'subAccountCost'
        }
      }
      this.loadAccountFare()
    }
  }
</script>

<style lang="scss">
#task-detail {
  margin-bottom: 15px;
}
  #task-detail .el-tabs{
    background: #fff;
  }

  #task-detail .el-tabs__nav {
    left: 20px;
  }
</style>
