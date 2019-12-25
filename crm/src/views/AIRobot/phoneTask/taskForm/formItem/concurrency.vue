<template>
  <el-form-item label="使用多并发" v-if="visible" :style="{'margin-bottom': '0px'}">
    <el-col :span="4">
      <el-form-item prop="enableConcurrency">
        <el-radio-group v-model="innerEnableConcurrency">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-col>
    <el-col :span="20" v-if="innerEnableConcurrency">
      <el-form-item label="并发数量" prop="concurrencyQuota" class="concurrency-form-item">
        <el-input-number v-model="innerConcurrencyQuota"
          :min="concurrencyRange.min" :max="concurrencyRange.max" size="mini"
        ></el-input-number>
        <span v-if="showRange">请选择{{concurrencyRange.min}}~{{concurrencyRange.max}}个并发数</span>
        <el-tooltip effect="dark" placement="top-start">
          <div slot="content">使用多并发功能，系统将按照您设置的并发数量调度资源外呼{{customerStr}}，待{{customerStr}}接听后再对接AI坐席，大大提高坐席使用效率！</div>
          <i class="el-icon-question icon-tip"></i>
        </el-tooltip>
        <span v-if="concurrencyTip">请选择大于1个坐席，才可以使用多并发功能</span>
      </el-form-item>
    </el-col>
  </el-form-item>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    phoneType: String,
    robotCount: Number,
    jobPhoneNumberIdList: {
      type: Array,
      default() {
        return []
      }
    },
    AICount: {
      type: Object,
      default() {
        return {}
      }
    },
    visible: Boolean,
    enableConcurrency: Boolean,
    concurrencyQuota: Number
  },
  data() {
    return {
    }
  },
  methods: {
    canuseConcurrency() {
      if (this.jobPhoneNumberIdList.length <= 1 && this.phoneType === 'MOBILE') {
        return false
      }
      if (this.robotCount <= 1 && this.phoneType !== 'MOBILE') {
        return false
      }
      return true
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    innerEnableConcurrency: {
      get() {
        return this.enableConcurrency
      },
      set(newVal) {
        this.$emit('update:enableConcurrency', newVal)
      }
    },
    innerConcurrencyQuota: {
      get() {
        return this.concurrencyQuota
      },
      set(newVal) {
        this.$emit('update:concurrencyQuota', newVal)
      }
    },
    concurrencyRange() {
      let max = 0
      let min = 0
      if (!this.canuseConcurrency()) {
        return { max, min }
      }
      if (this.phoneType === 'MOBILE') {
        max = Math.min(Math.max(this.jobPhoneNumberIdList.length - 1, 0), this.AICount.total)
        min = Math.min(1, max)
      } else {
        max = 2 * this.robotCount
        min = this.robotCount + 1
      }
      return { min, max }
    },
    concurrencyTip() {
      if (!this.enableConcurrency) return false
      if (this.phoneType === 'MOBILE') {
        return this.jobPhoneNumberIdList.length <= 1
      }
      return this.robotCount <= 1
    },
    showRange() {
      return !(this.concurrencyRange.min === 0 && this.concurrencyRange.max === 0)
    }
  },
  watch: {
    concurrencyRange: {
      handler(value) {
        this.innerConcurrencyQuota = value.min
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .concurrency-form-item {
  .el-form-item__label {
    width: 60px !important;
  }
  .el-form-item__content {
    margin-left: 60px !important;
  }
  .el-tooltip {
    margin-left: 0;
    vertical-align: text-top;
  }
}
</style>
