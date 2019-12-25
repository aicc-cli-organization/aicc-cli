<template>
  <div>
    <div class="time-result-wrapper">
      <span class="edit pointer" @click="edit"><i class="iconfont icon-edited" @click="edit"></i>编辑</span>
      <div>{{datePeriod}}</div>
      <div>{{weekPeriod}}</div>
      <div>{{hourPeriod}}</div>
    </div>
    <el-dialog
      title="可拨打时间段设置"
      :visible.sync="dialogVisible"
      @open="onOpen"
      width="760px"
      append-to-body
    >
      <el-form
        ref="form"
        label-width="147px"
        :model="dialTimePeriod"
        :rules="formRules"
      >
        <span v-if="isValidate" class="empty-tip">请至少选择一个重复周期</span>
        <el-form-item label="可拨打时间段:" class="form-item-double-time" required>
          <el-col style="width:140px">
            <el-form-item prop="dailyStartTime">
              <el-time-select class="daily-time-select" placeholder="开始时间"
                style="width:140px"
                v-model="dialTimePeriod.dailyStartTime"
                :picker-options="{
                  start: dialTimePeriod.dialIntervalStart,
                  step: '00:10',
                  end: dialTimePeriod.dialIntervalEnd,
                  maxTime: dialTimePeriod.dailyEndTime
                }">
              </el-time-select>
            </el-form-item>
          </el-col>
          <el-col class='line' style="width:24px;text-align:center;">-</el-col>
          <el-col style="width:140px">
            <el-form-item label="" prop="dailyEndTime">
              <el-time-select class="daily-time-select" placeholder="结束时间"
                style="width:140px"
                v-model="dialTimePeriod.dailyEndTime"
                :picker-options="{
                  start: dialTimePeriod.dialIntervalStart,
                  step: '00:10',
                  end: dialTimePeriod.dialIntervalEnd,
                  minTime: dialTimePeriod.dailyStartTime
                }">
              </el-time-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item :label="index === 0 ? '不可拨打时间段: ' : ''" class="form-item-double-time" v-for="(item, index) in dialTimePeriod.inactiveTimeList" :key="index">
          <el-col style="width:140px">
            <el-form-item label="" :prop="'inactiveTimeList.'+index+'.startTime'">
              <el-time-select class="daily-time-select" placeholder="开始时间"
                style="width:140px"
                v-model="dialTimePeriod.inactiveTimeList[index].startTime"
                :picker-options="{
                  start: dialTimePeriod.dialIntervalStart,
                  step: '00:10',
                  end: dialTimePeriod.dialIntervalEnd,
                  minTime: index > 0 ? dialTimePeriod.inactiveTimeList[index - 1].endTime : dialTimePeriod.dailyStartTime,
                  maxTime: dialTimePeriod.dailyEndTime
                }">
              </el-time-select>
            </el-form-item>
          </el-col>
          <el-col class="line" style="width:24px;text-align:center;">-</el-col>
          <el-col  style="width:140px">
            <el-form-item :prop="'inactiveTimeList.'+index+'.endTime'">
              <el-time-select class="daily-time-select" placeholder="结束时间"
                style="width:140px"
                v-model="dialTimePeriod.inactiveTimeList[index].endTime"
                :picker-options="{
                  start: dialTimePeriod.dialIntervalStart,
                  step: '00:10',
                  end: dialTimePeriod.dialIntervalEnd,
                  minTime: dialTimePeriod.inactiveTimeList[index].startTime || '00:00',
                  maxTime: dialTimePeriod.dailyEndTime
                }">
                <!-- end: '18:30', -->
              </el-time-select>
            </el-form-item>
          </el-col>
          <a class="edit-group iconfont icon-tianjiajiahaowubiankuang" @click="onCloneInactiveTimeGroup" v-if="index === 0"></a>
          <span class="edit-group-tip" v-if="index === 0">请按时间顺序依次设置</span>
          <a class="edit-group iconfont icon-changyonggoupiaorenshanchu" @click="onRemoveInactiveTimeGroup(index)" v-else></a>
        </el-form-item>
        <el-form-item label="可拨打周期：" class="form-item-double-time">
           <el-checkbox-group v-model="dialTimePeriod.daysOfWeek" style="display:inline-block">
            <el-checkbox v-for="item in timeList" :key="item.value" :label="item.key">{{item.value}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="开始日期:" prop="startTime"
          v-if="mode === 'AUTO'" required>
          <el-date-picker value-format="yyyy-MM-dd" placeholder="选择日期"
            style="width:310px"
            :picker-options="startPickerOptions"
            v-model="dialTimePeriod.startTime"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期:" prop="endTime">
          <el-date-picker value-format="yyyy-MM-dd" placeholder="选择日期"
            style="width:310px"
            :picker-options="dialTimePeriod.mode === 'MANUAL' ? endPickerOptions : endPickerFromStartOptions"
            v-model="dialTimePeriod.endTime">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const timeList = [
  {
    value: '周一',
    key: 'MONDAY'
  }, {
    value: '周二',
    key: 'TUESDAY'
  }, {
    value: '周三',
    key: 'WEDNESDAY'
  }, {
    value: '周四',
    key: 'THURSDAY'
  }, {
    value: '周五',
    key: 'FRIDAY'
  }, {
    value: '周六',
    key: 'SATURDAY'
  }, {
    value: '周日',
    key: 'SUNDAY'
  }
]
const timeListEnum = {
  'MONDAY': '周一',
  'TUESDAY': '周二',
  'WEDNESDAY': '周三',
  'THURSDAY': '周四',
  'FRIDAY': '周五',
  'SATURDAY': '周六',
  'SUNDAY': '周日'
}
const timeListSortEnum = {
  'MONDAY': 1,
  'TUESDAY': 2,
  'WEDNESDAY': 3,
  'THURSDAY': 4,
  'FRIDAY': 5,
  'SATURDAY': 6,
  'SUNDAY': 7
}

export default {
  components: {
    
  },
  props: {
    mode: {
      type: String,
      default: ''
    },
    timePeriod: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    datePeriod() {
      const startDate = this.timePeriod.startTime ? this.timePeriod.startTime.split(' ')[0] + '开始' : ''
      const endDate = this.timePeriod.endTime ? this.timePeriod.endTime.split(' ')[0] + '结束' : ''
      return startDate + ' ' + endDate
    },
    weekPeriod() {
      const daysOfWeek =  this.timePeriod.daysOfWeek
      if(daysOfWeek.length === 7) {
        return '每天'
      }
      if(JSON.stringify(daysOfWeek) == JSON.stringify(['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'])) {
        return '工作日'
      }
      if(JSON.stringify(daysOfWeek) == JSON.stringify(['SATURDAY', 'SUNDAY'])) {
        return '周末'
      }
      let str = ''
      daysOfWeek.sort((a,b) => {
          return timeListSortEnum[a] -  timeListSortEnum[b]
        })
      daysOfWeek.map(item => {
        str += ' '+ timeListEnum[item]
      })
      return str
    },
    hourPeriod() {
      const list = []
      const inactiveTimeList = this.timePeriod.inactiveTimeList
      if (this.timePeriod.dailyStartTime === "23:59") {
        this.timePeriod.dailyStartTime = "24:00"
      }
      if (this.timePeriod.dailyEndTime === "23:59") {
        this.timePeriod.dailyEndTime = "24:00"
      }
      list.push(this.timePeriod.dailyStartTime)
      if(inactiveTimeList.length > 0) {
        inactiveTimeList.map(item => {
          if(item.startTime && item.endTime) {
            list.push(item.startTime)
            list.push(item.endTime)
          }
        })
      }
      list.push(this.timePeriod.dailyEndTime)
      let str = ''
      list.map((item,index) => {
        if(index%2 === 0) { 
          str+= item + '~' + list[index+1] + ' 和 '
        }
      })
      str = str.substring(0,str.length-2)
      return str
    }
  },
  data() {
    return {
      timeList,
      formRules: {
        startTime: [{ required: true, message: '请选择开始日期', trigger: ['change','blur'] }],
        dailyStartTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        dailyEndTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
      },
      isValidate: false,
      dialTimePeriod: {},
      dialogVisible: false,
      startPickerOptions: {
        disabledDate: (startTime) => {
          return this.isDisabledSDate(startTime) 
        }
      },
      endPickerOptions: { //若为手动方式，不受开始时间限制
        disabledDate: (endTime) => {
          return endTime.getTime() < Date.now() - 8.64e7
        }
      },
      endPickerFromStartOptions: { 
        disabledDate: (endTime) => {
          return this.isDisabledEDate(endTime) 
        }
      }
    }
  },
  methods: {
    onOpen() {
      this.isValidate = false
      this.dialTimePeriod = JSON.parse(JSON.stringify(this.timePeriod))
      if (this.dialTimePeriod.dialIntervalStart.substring(0,5) === "23:59") {
        this.dialTimePeriod.dialIntervalStart = "24:00"
      } else this.dialTimePeriod.dialIntervalStart = this.dialTimePeriod.dialIntervalStart.substring(0,5)
      if (this.dialTimePeriod.dialIntervalEnd.substring(0,5) === "23:59") {
        this.dialTimePeriod.dialIntervalEnd = "24:00"
      } else this.dialTimePeriod.dialIntervalEnd = this.dialTimePeriod.dialIntervalEnd.substring(0,5)
    },
    confirm() {
       this.$refs.form.validate(valid => {
        if (valid) {
          if(this.dialTimePeriod.daysOfWeek.length == 0) {
            this.isValidate = true
            return
          }
          this.dialogVisible = false
          this.dialTimePeriod = {
            ...this.dialTimePeriod,
            startTime : this.dialTimePeriod.startTime ? this.dialTimePeriod.startTime.split(' ')[0] + ' ' + '00:00:00' : null,
            endTime : this.dialTimePeriod.endTime ? this.dialTimePeriod.endTime.split(' ')[0] + ' ' + '23:59:59' : null
          }
          this.$emit('update:timePeriod', this.dialTimePeriod)
        }
      })
    },
    isDisabledEDate(endTime) {
      if(this.dialTimePeriod.startTime) {
        return endTime.getTime() < new Date(this.dialTimePeriod.startTime).getTime() 
      }else {
        return false
      }
    },
    isDisabledSDate(startTime) {
      if(this.dialTimePeriod.endTime) {
        return startTime.getTime() > new Date(this.dialTimePeriod.endTime).getTime()
      }else {
        return false
      }
    },
    edit() {
      this.dialogVisible = true
    },
    onCloneInactiveTimeGroup() {
      const inactiveTimeList = this.dialTimePeriod.inactiveTimeList
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
    },
    onRemoveInactiveTimeGroup(index) {
      const inactiveTimeList = this.dialTimePeriod.inactiveTimeList
      inactiveTimeList.splice(index, 1)
      this.$set(this.dialTimePeriod, 'inactiveTimeList', inactiveTimeList)
    }
  },
  mounted() {
    
  }
}
</script>

<style lang="scss" scoped>
.time-result-wrapper {
  position: relative;
  width:380px;
  padding: 7px 15px;
  background: #f7f7f7;
  .edit {
    position: absolute;
    top: 0px;
    right: -65px;
    color: #1890ff;
  }
  .iconfont {
    margin-right: 5px;
  }
}
.empty-tip {
  color: rgb(245, 108, 108);
  font-weight: normal;
  position: absolute;
  top: 43px;
  left: 0px;
  width: 100%;
  padding: 5px 0;
  background: #fbebea;
  text-align: center;
}
/deep/ .el-dialog__header {
  padding: 12px 20px;
}
/deep/ .el-dialog__body {
  padding: 40px 30px !important;
  .edit-group {
    margin-left: 5px;
  }
}
</style>

