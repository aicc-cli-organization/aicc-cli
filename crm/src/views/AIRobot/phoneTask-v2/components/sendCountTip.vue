<template>
  <div class="send-count_tip" v-if="tipText">
    <i class="el-icon-warning const-icon-warning"></i>
    {{tipText}}
  </div>
</template>

<script>
import * as taskAPI from '@/api/task'

export default {
  props: {
    smsType: String,
    id: {
      type: [String, Number],
      default: undefined
    }
  },
  data() {
    return {
      tipText: undefined
    }
  },
  methods: {
    async loadSMSConfig() {
      if (this.smsType !== 'FINANCE') {
        this.tipText = ''
        return
      }
      const res = await taskAPI.getSmsConfig()
      const resMap = {}
      res.data.data.forEach(item => {
        resMap[item.configKey] = item.configValue
      })
      const { yd_send_count, lt_send_count, dx_send_count } = resMap
      const noLimit = +yd_send_count === 0 && +lt_send_count === 0 && +dx_send_count === 0
      if (noLimit) {
        this.tipText = ''
        return
      }
      this.tipText = `金融类短信将在任务完成后推送，且发送数量必须达到要求：移动${yd_send_count}条起，联通${lt_send_count}条起，电信${dx_send_count}条起！`
    }
  },
  watch: {
    id: {
      handler: function() {
        this.loadSMSConfig()
      }
    }
  },
  mounted() {
    this.loadSMSConfig()
  }
}
</script>

<style lang="scss" scoped>
@import "~src/styles/variables.scss";

.send-count_tip {
  margin-top: 8px;
  color: #E99209;
  line-height: 17px;
  .const-icon-warning {
    margin-right: 8px;
    font-size: 12px;
  }
}
</style>
