<template>
<div class="sms">
  <chart-item-title
    title="短信发送状态"
  >
  </chart-item-title>
  <sms-count-list :smsSendList="smsSendList"></sms-count-list>
</div>
</template>

<script>
import ChartItemTitle from './chartItemTitle'
import SmsCountList from './smsCountList'

export default {
  props: {
    smsSendList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  components: {
    ChartItemTitle,
    SmsCountList
  }
}
</script>

<style lang="scss" scoped>
.sms {
  flex: 0;
  padding: 17px 20px;
  background-color: white;
  flex-basis: 188px;
  margin-left: 20px;
}
</style>
