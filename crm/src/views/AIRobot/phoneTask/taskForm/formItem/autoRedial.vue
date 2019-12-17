<template>
  <span>
    <el-form-item label="自动重拨设置">
      <el-radio-group v-model="innerAutoRedialSwitch">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item prop="robotCallJob.redialCondition" v-if="innerAutoRedialSwitch">
      <el-checkbox label="all" v-model="autoRecalledIsCheckAll" :indeterminate="autoRecalledIsIndeterminate">全选</el-checkbox>
      <el-checkbox-group v-model="innerRedialCondition" class="autorecall-checkbox-group">
        <el-checkbox :label="key" v-for="(value, key) in redialConditionMap" :key="key">{{value}}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item v-if="innerAutoRedialSwitch">
      <el-col :span="12">
        <el-form-item label="间隔时长" prop="robotCallJob.redialInterval" class="redial-interval-times" required>
          <el-input type="number" min="0.1" max="24" step="0.1" v-model.number="innerRedialInterval"></el-input>小时
          <el-tooltip effect="dark" placement="top-start">
            <div slot="content">设置完成后，需要重拨的每通通话将在间隔时长后拨打，谨慎设置时长。</div>
            <i class="el-icon-question icon-tip"></i>
          </el-tooltip>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="重拨次数" prop="robotCallJob.redialTimes" class="redial-interval-times" required>
          <el-select v-model="innerRedialTimes">
            <el-option v-for="item in redialTimesMap" :key="item" :label="item" :value="item"></el-option>
          </el-select>次
        </el-form-item>
      </el-col>
    </el-form-item>
  </span>
</template>

<script>
import { redialConditionMap, redialTimesMap } from '../../utils/enum'

export default {
  props: {
    autoRedialSwitch: Boolean,
    redialCondition: {
      type: Array,
      default() {
        return []
      }
    },
    redialInterval: [Number, String],
    redialTimes: Number
  },
  data() {
    return {
      // autoRedial: false,
      redialConditionMap,
      redialTimesMap
    }
  },
  computed: {
    innerAutoRedialSwitch: {
      get() {
        return this.autoRedialSwitch
      },
      set(newVal) {
        this.$emit('update:autoRedialSwitch', newVal)
      }
    },
    innerRedialCondition: {
      get() {
        return this.redialCondition
      },
      set(newVal) {
        this.$emit('update:redialCondition', newVal)
      }
    },
    innerRedialInterval: {
      get() {
        return this.redialInterval
      },
      set(newVal) {
        this.$emit('update:redialInterval', newVal)
      }
    },
    innerRedialTimes: {
      get() {
        return this.redialTimes
      },
      set(newVal) {
        this.$emit('update:redialTimes', newVal)
      }
    },
    autoRecalledIsCheckAll: {
      get() {
        const redialConditionLength = this.redialCondition.length
        return redialConditionLength > 0 && redialConditionLength === Object.keys(redialConditionMap).length
      },
      set(isCheckAll) {
        const redialCondition = isCheckAll ? Object.keys(redialConditionMap) : []
        this.innerRedialCondition = redialCondition
        // this.$set(this.formFields.robotCallJob, "redialCondition", redialCondition)
      }
    },
    autoRecalledIsIndeterminate() {
      const redialConditionLength = this.redialCondition.length
      return redialConditionLength > 0 && redialConditionLength < Object.keys(redialConditionMap).length
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .autorecall-checkbox-group {
  display: inline-block;
  margin-left: 15px;
  .el-checkbox + .el-checkbox {
    margin-left: 10px;
  }
}
/deep/ .redial-interval-times {
  .el-form-item__label {
    width: 72px !important;
  }
  .el-form-item__content {
    margin-left: 80px !important;
  }
  .el-input {
    width: 80px;
    margin-right: 10px;
  }
  .el-select {
    width: 120px;
    margin-right: 10px;
    .el-input {
      width: 120px;
    }
  }
}
</style>
