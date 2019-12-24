<template>
  <el-form-item>
    左声道: 
    <el-select class="w120" v-model="innerLeftChannel" :disabled="isEdit">
      <el-option
        v-for="(v, k) in CHANNEL_VALUE_MAP"
        :key="k"
        :label="v"
        :value="k"
      ></el-option>
    </el-select>
    右声道:
    <el-select class="w120" v-model="innerRightChannel" :disabled="isEdit">
      <el-option
        v-for="(v, k) in CHANNEL_VALUE_MAP"
        :key="k"
        :label="v"
        :value="k"
      ></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
import { CHANNEL_VALUE_MAP } from '../../utils/enum'

const CHANNEL_VALUE_LIST = Object.keys(CHANNEL_VALUE_MAP)

export default {
  props: {
    leftChannel: String,
    rightChannel: String,
    isEdit: Boolean
  },
  data() {
    return {
      CHANNEL_VALUE_MAP
    }
  },
  computed: {
    innerLeftChannel: {
      get() {
        return this.leftChannel
      },
      set(newVal) {
        this.$emit('update:leftChannel', newVal)
      }
    },
    innerRightChannel: {
      get() {
        return this.rightChannel
      },
      set(newVal) {
        this.$emit('update:rightChannel', newVal)
      }
    }
  },
  watch: {
    innerLeftChannel: {
      handler: function(newVal) {
        if (newVal) {
          const index = CHANNEL_VALUE_LIST.indexOf(newVal)
          this.innerRightChannel = CHANNEL_VALUE_LIST[CHANNEL_VALUE_LIST.length - 1 - index]
        }
      }
    },
    innerRightChannel: {
      handler: function(newVal) {
        if (newVal) {
          const index = CHANNEL_VALUE_LIST.indexOf(newVal)
          this.innerLeftChannel = CHANNEL_VALUE_LIST[CHANNEL_VALUE_LIST.length - 1 - index]
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.w120 {
  width: 120px;
}
</style>
