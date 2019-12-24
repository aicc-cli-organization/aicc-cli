<template>
  <el-form-item label="AI数量" v-if="['LANDLINE', 'UNFIXED_CALL'].includes(this.phoneType)"
    class="inline-block ai-form-item" prop="robotCallJob.robotCount">
    <el-input-number v-model="innerValue"
      :min="1" :max="AICount.total" size="mini"
    ></el-input-number>
    <span>剩余AI数量{{AICount.free}}个，AI总量{{AICount.total}}个</span>
    <el-tooltip effect="dark" placement="top-start" v-if="AICount.AITip">
      <div slot="content">{{AICount.AITip}}</div>
      <i class="el-icon-question icon-tip"></i>
    </el-tooltip>
  </el-form-item>
</template>

<script>
import FormItemCommon from '../mixins/formItemCommon'

export default {
  mixins: [FormItemCommon],
  props: {
    phoneType: String,
    value: Number,
    AICount: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-form-item {
  /deep/ .el-form-item__label {
    width: 60px !important;
  }
  /deep/ .el-form-item__content {
    margin-left: 60px !important;
  }
  /deep/ .el-tooltip {
    margin-left: 0;
    vertical-align: text-top;
  }
}
</style>