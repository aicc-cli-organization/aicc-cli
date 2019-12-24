<template>
  <div class="fake-tooltip">
    <i class="el-icon-question icon-tip" @mouseover="onShow" @mouseout="onHide"></i>
    <div class="content" :class="location" v-if="visible">
      当前短信余额：{{accountFare}}元，共可发送短信{{remainCount}}条。余额不足将导致短信发送失败！请保持短信费用充足！
      <em></em>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

const FINANCE_SALE = '0.07'
const OTHER_SALE = '0.05'
const WARNING_REMAIN_COUNT = 10
const MSECONDS_HIDE = 3000

export default {
  props: {
    smsType: String,
    id: [String, Number],
    location: {
      type: String,
      default: 'top'
    }
  },
  data() {
    return {
      visible: true,
      timer: null
    }
  },
  computed: {
    ...mapGetters([
      'accountFare' // 账户余额
    ]),
    remainCount() {
      const sale = this.smsType === 'FINANCE' ? FINANCE_SALE : OTHER_SALE
      const count = Math.floor(this.accountFare / sale)
      this.setTimeoutHide(count)
      return count
    }
  },
  methods: {
    onShow() {
      this.visible = true
    },
    onHide() {
      this.visible = this.remainCount >= WARNING_REMAIN_COUNT ? false : true
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    setTimeoutHide(remainCount) {
      if (remainCount >= WARNING_REMAIN_COUNT) {
        this.timer = setTimeout(() => {
          this.visible = false
          clearTimeout(this.timer)
          this.timer = null
        }, MSECONDS_HIDE)
      }
    }
  },
  watch: {
    id: {
      handler: function(newVal) {
        this.visible = true
        this.setTimeoutHide(this.remainCount)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.fake-tooltip {
  position: relative;
  display: inline-block;
  margin-left: 30px;
  .content {
    position: absolute;
    width: 400px;
    left: -10px;
    padding: 10px;
    background-color: #666666;
    color: #ffffff;
    border-radius: 4px;
    line-height: 1.5;
    z-index: 1;
    white-space: normal;
    em {
      position: absolute;
      left: 14px;
      width: 8px;
      height: 8px;
      background-color: #666666;
      transform: rotate(45deg);
    }
    &.top {
      top: -60px;
      em {
        bottom: -4px;
      }
    }
    &.bottom {
      em {
        top: -4px;
      }
    }
  }
  .icon-tip {
    font-size: 18px;
    margin-left: 0 !important;
  }
}
</style>


