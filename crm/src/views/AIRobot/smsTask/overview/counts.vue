<template>
  <div class="overview-counts">
    <div class="overview-item">
      <p>发送成功</p>
      <span class="num">{{smsTaskDetail.smsSuccessCount}}条</span>
    </div>
    <el-tooltip effect="dark" :content="`因运营商或${customerStr}手机号问题，导致发送失败。`" placement="top">
      <div class="overview-item">
        <p>
          发送失败
          <i class="el-icon-question const-icon-tip"></i>
        </p>
        <span class="num">{{smsTaskDetail.smsFailCount}}条</span>
      </div>
    </el-tooltip>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    smsTaskDetail: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ])
  }
}
</script>

<style lang="scss" scoped>
.overview-counts {
  overflow: hidden;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 10px;
  .overview-item {
    position: relative;
    float: left;
    width: 200px;
    border-radius: 4px;
    text-align: center;
    border: 1px solid #d8d8d8;
    margin-right: 10px;
    padding-bottom: 15px;
    .const-icon-tip {
      position: absolute;
      right: 20px;
      font-size: 16px;
    }
    .num {
      font-size: 16px;
    }
  }
}
</style>
