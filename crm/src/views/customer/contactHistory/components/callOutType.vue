<template>
  <div style="margin-right:20px">
    <el-radio-group v-model="innerCallOutType">
      <el-radio-button v-for="(item) in callOutTypeList" :key="item.label"  :label="item.value">{{item.label}}</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

const constCallOutTypeList = [
  {
    label: 'AI外呼',
    value: 'AI_CALL_OUT'
  },
  {
    label: '快速拨打',
    value: 'FAST_CALL_OUT'
  }
]

export default {
  props: {
    callOutType: String
  },
  computed: {
    ...mapGetters([
      'userEnableCsSeat',
      'enableCsSeat'
    ]),
    callOutTypeList() {
      const tmp = constCallOutTypeList.slice()
      if (this.enableCsSeat || this.userEnableCsSeat) {
        tmp.splice(1, 0, {
          label: '人工外呼',
          value: 'CS_CALL_OUT'
        })
        return tmp
      }
      return tmp
    },
    innerCallOutType: {
      get() {
        return this.callOutType
      },
      set(newVal) {
        this.$emit('update:callOutType', newVal)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.callout-type-select {
  margin-right: 20px;
  width: 120px;
}
/deep/ .el-radio-button--small .el-radio-button__inner {
  padding:9px 10px
}
</style>
