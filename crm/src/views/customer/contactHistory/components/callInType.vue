<template>
  <div style="margin-right:20px">
    <el-radio-group v-model="innerCallInType">
      <el-radio-button v-for="(item) in callInTypeList" :key="item.label"  :label="item.value">{{item.label}}</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

const constCallInTypeList = []

export default {
  props: {
    callInType: String
  },
  computed: {
    ...mapGetters([
      'userEnableCsSeat',
      'enableCallIn',
      'enableIvr'
    ]),
    callInTypeList() {
      const tmp = constCallInTypeList.slice()
      if (this.enableCallIn) {
        tmp.splice(0, 0, {
          label: 'AI接待',
          value: 'AI_CALL_IN'
        }, {
          label: '人工接待',
          value: 'CS_CALL_IN'
        })
      }

      if (this.enableIvr) {
        tmp.push({
          label: 'IVR接待',
          value: 'IVR_CALL_IN'
        })
      }

      return tmp
    },
    innerCallInType: {
      get() {
        return this.callInType
      },
      set(newVal) {
        this.$emit('update:callInType', newVal)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.callin-type-select {
  margin-right: 20px;
  width: 120px;
}
/deep/ .el-radio-button--small .el-radio-button__inner {
  padding:9px 10px
}
</style>