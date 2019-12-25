<template>
  <span>
    <el-form-item
      :label="index === 0 ? '不可拨打时间段' : ''" class="form-item-double-time"
      v-for="(item, index) in innerValue" :key="index">
      <el-col :span="11">
        <el-form-item label="" :prop="'robotCallJob.inactiveTimeList.'+index+'.startTime'">
          <el-time-select class="daily-time-select" placeholder="开始时间"
            v-model="innerValue[index].startTime"
            :picker-options="{
              start: '09:00',
              step: '00:15',
              end: dailyEndTime,
              minTime: index > 0 ? innerValue[index - 1].endTime : '8:45',
              maxTime: index > 0 ? innerValue[index].endTime : dailyEndTime
            }">
          </el-time-select>
        </el-form-item>
      </el-col>
      <el-col class="line" :span="2">-</el-col>
      <el-col :span="11">
        <el-form-item :prop="'robotCallJob.inactiveTimeList.'+index+'.endTime'">
          <el-time-select class="daily-time-select" placeholder="结束时间"
            v-model="innerValue[index].endTime"
            :picker-options="{
              start: '09:15',
              step: '00:15',
              end: dailyEndTime,
              minTime: innerValue[index].startTime,
              maxTime: isAdmin ? '23:55' : '20:05'
            }">
          </el-time-select>
        </el-form-item>
      </el-col>
      <a class="edit-group iconfont icon-tianjiajiahaowubiankuang" @click="onCloneInactiveTimeGroup" v-if="index === 0"></a>
      <span class="edit-group-tip" v-if="index === 0">请按时间顺序依次设置</span>
      <a class="edit-group iconfont icon-changyonggoupiaorenshanchu" @click="onRemoveInactiveTimeGroup(index)" v-else></a>
    </el-form-item>
  </span>
</template>

<script>
import FormItemCommon from '../mixins/formItemCommon'

export default {
  mixins: [FormItemCommon],
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    },
    dailyEndTime: String
  },
  computed: {
    isAdmin() {
      return this.$route.query.isAdmin === 'true'
    }
  },
  methods: {
    onCloneInactiveTimeGroup () {
      const inactiveTimeList = this.value.slice()
      if (inactiveTimeList.length >= 3) {
        this.$message({
          message: '最多有3个不可拨打时段',
          type: 'error'
        })
        return
      }
      inactiveTimeList.push({
        startTime: '',
        endTime: ''
      })
      this.innerValue = inactiveTimeList
    },
    onRemoveInactiveTimeGroup (index) {
      const inactiveTimeList = this.value.slice()
      inactiveTimeList.splice(index, 1)
      this.innerValue = inactiveTimeList
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item-double-time {
  white-space: nowrap;
}
.edit-group {
  margin-left: 10px;
}
.edit-group-tip {
  display: inline-block;
  vertical-align: text-top;
  font-size: 12px;
  line-height: 16px;
  padding-top: 1px;
  color: #666666;
}
.line {
  text-align: center;
}
</style>
