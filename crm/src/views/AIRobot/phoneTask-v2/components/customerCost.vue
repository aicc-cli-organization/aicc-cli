<template>
  <div class="customer-cost" v-if="showCustomer">
    <span class="label">获客成本：</span>
    <span class="value" v-if="robotCallJobDetail.robotCallJob.status === 'COMPLETED'">{{customerCostStr}}元/人</span>
    <span class="value" v-else>换算中</span>
    <el-tooltip effect="dark" placement="top-start">
      <div slot="content">获客成本=该任务AI使用费/该任务推送{{customerStr}}数。如果任务运行中间有过暂停，计算的成本将偏高。粗略统计，仅供参考！</div>
      <i class="el-icon-question icon-tip const-icon-tip"></i>
    </el-tooltip>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    robotCallJobDetail: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    showCustomer() {
      const {
        robotCallJob: {
          wechatAlertLevelCode = [],
          wechatConditionAlertLevelCode = []
        },
        customerCost
      } = this.robotCallJobDetail
      return (!!wechatAlertLevelCode.length || !!wechatConditionAlertLevelCode.length) && customerCost >= 0
    },
    customerCostStr() {
      const originCost = this.robotCallJobDetail.customerCost
      return originCost ? Number(originCost).toFixed(2) : 0
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-cost {
  margin-bottom: -12px;
  line-height: 20px;
  text-align: right;
  .label {
    color: #666666;
    font-size: 14px;
  }
  .value {
    color: #333333;
    font-size: 20px;
  }
  .const-icon-tip {
    font-size: 20px;
  }
}
</style>

