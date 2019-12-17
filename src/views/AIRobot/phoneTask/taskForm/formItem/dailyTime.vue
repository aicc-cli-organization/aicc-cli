<template>
  <el-form-item label="可拨打时间段" class="form-item-double-time">
    <el-col :span="11">
      <el-form-item prop="robotCallJob.dailyStartTime">
        <el-time-select class="daily-time-select" placeholder="开始时间"
          v-model="innerDailyStartTime"
          :picker-options="{
            start: isAdmin ? '00:00' : '09:00',
            step: '00:10',
            end: isAdmin ?'23:50' : '20:00',
            maxTime: innerDialyEndTime
          }">
        </el-time-select>
      </el-form-item>
    </el-col>
    <el-col class='line' :span="2">-</el-col>
    <el-col :span="11">
      <el-form-item label="" prop="robotCallJob.dailyEndTime">
        <el-time-select class="daily-time-select" placeholder="结束时间"
          v-model="innerDialyEndTime"
          :picker-options="{
            start: isAdmin ? '00:00' : '09:00',
            step: '00:10',
            end: isAdmin ? '23:50' : '20:00',
            minTime: innerDailyStartTime
          }">
        </el-time-select>
      </el-form-item>
    </el-col>
  </el-form-item>
</template>

<script>
export default {
  props: {
    dailyStartTime: String,
    dailyEndTime: String
  },
  computed: {
    isAdmin() {
      return this.$route.query.isAdmin === 'true'
    },
    innerDailyStartTime: {
      get() {
        return this.dailyStartTime
      },
      set(newVal) {
        this.$emit('update:dailyStartTime', newVal)
      }
    },
    innerDialyEndTime: {
      get() {
        return this.dailyEndTime
      },
      set(newVal) {
        this.$emit('update:dailyEndTime', newVal)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.line {
  text-align: center;
}
</style>
