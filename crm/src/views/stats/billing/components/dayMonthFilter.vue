<template>
  <div>
    <el-radio-group v-model="innerTimeType" class="mr10">
      <el-radio :label="'BY_DATE'">按日期汇总</el-radio>
      <el-radio :label="'BY_MONTH'">按月汇总</el-radio>
    </el-radio-group>
    <el-date-picker
      v-if="innerTimeType === 'BY_DATE'"
      class="right"
      v-model="innerStartEndTime"
      type="daterange"
      align="right"
      unlink-panels
      range-separator="-"
      start-placeholder="开始日期"
      end-placeholder="结束日期">
    </el-date-picker>
    <el-select
      v-else
      style="width: 350px"
      v-model="innerMonthCount">
      <el-option
        v-for="item in monthOptions"
        :key="item.key"
        :value="item.key"
        :label="item.value"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script>
const monthOptions = [
  { key: 3, value: '近三个月' },
  { key: 6, value: '近半年' },
  { key: 12, value: '近一年' }
]

export default {
  props: {
    timeType: String,
    monthCount: [String, Number],
    startEndTime: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      monthOptions
    }
  },
  computed: {
    innerTimeType: {
      get() {
        return this.timeType
      },
      set(newVal) {
        this.$emit('update:timeType', newVal)
      }
    },
    innerMonthCount: {
      get() {
        return this.monthCount
      },
      set(newVal) {
        this.$emit('update:monthCount', newVal)
      }
    },
    innerStartEndTime: {
      get() {
        return this.startEndTime
      },
      set(newVal) {
        this.$emit('update:startEndTime', newVal)
      }
    }
  }
}
</script>
