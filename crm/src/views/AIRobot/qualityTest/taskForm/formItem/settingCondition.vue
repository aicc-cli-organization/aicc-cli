<template>
  <span>
    <el-form-item
      v-for="(item, index) in selectedTypeList"
      :key="index"
    >
      <template v-if="isEdit">
        <div v-if="innerValue.csStaffIdList && innerValue.csStaffIdList.length">人工坐席 包括 {{csStaffText}}</div>
        <div v-if="innerValue.receptionList && innerValue.receptionList.length">接待场景 包括 {{receptionText}}</div>
        <div v-if="innerValue.startTime && innerValue.endTime">
          时间段 介于 {{timePeriodText}}
        </div>
      </template>
      <template v-else>
        <el-select class="w100" v-model="selectedTypeList[index]">
          <el-option
            v-for="(v, k) in typeMap"
            :key="k"
            :label="v"
            :value="k"
            :disabled="selectedTypeList.includes(k)"
          ></el-option>
        </el-select>
        <template v-if="selectedTypeList[index] === 'csStaffIdList'">
          <span>包括</span>
          <el-select
            class="w200"
            v-model="innerValue.csStaffIdList"
            multiple
            collapse-tags>
            <el-option
              v-for="(item, index) in csStaffList"
              :label="`${item.csName}-${item.csMobile}`"
              :key="index"
              :value="item.csStaffId"
            ></el-option>
          </el-select>
        </template>
        <template v-if="selectedTypeList[index] === 'receptionList'">
          <span>包括</span>
          <el-select
            v-model="innerValue.receptionList"
            multiple
            collapse-tags>
            <el-option
              v-for="(item, index) in receptionFullList"
              :label="item.label"
              :key="index"
              :value="item.callInReceptionId"
            ></el-option>
          </el-select>
        </template>
        <template v-if="selectedTypeList[index] === 'timePeriod'">
          <span>介于</span>
          <el-date-picker
            class="w200 date-picker"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            v-model="innerDate"
            :picker-options="{
              disabledDate(time) {
                return time.getTime() > Date.now();
              }
            }"
          ></el-date-picker>
          的
          <el-time-select
            class="w80 date-picker"
            v-model="innerValue.startTime"
            placeholder="开始时间"
            :picker-options="{
              start: '00:00',
              step: '00:10',
              end: '23:50',
              maxTime: innerValue.endTime
            }">
          </el-time-select>
          <span>-</span>
          <el-time-select
            class="w80 date-picker"
            v-model="innerValue.endTime"
            placeholder="结束时间"
            :picker-options="{
              start: '00:00',
              step: '00:10',
              end: '23:50',
              minTime: innerValue.startTime
            }">
          </el-time-select>
        </template>
        <a class="operation-icon iconfont icon-tianjiajiahaowubiankuang" v-if="index === 0" @click="onCloneItem"></a>
        <a class="operation-icon iconfont icon-changyonggoupiaorenshanchu" v-else @click="onDelItem(index)"></a>
      </template>
    </el-form-item>
  </span>
</template>

<script>
import * as numberpoolAPI from '@/api/numberpool'
import * as qcAPI from '@/api/qualityTest'

const calloutTypeMap = {
  csStaffIdList: '人工坐席',
  timePeriod: '时间段'
}
const callinTypeMap = {
  receptionList: '接待场景',
  timePeriod: '时间段'
}

const maxConditions = Object.values(calloutTypeMap).length
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {}
      }
    },
    jobProperty: String,
    isEdit: Boolean
  },
  data() {
    return {
      selectedTypeList: [''],
      csStaffList: [],
      receptionFullList: []
    }
  },
  computed: {
    innerValue: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    },
    // selectedTypeList() {
    //   const { startDate, endDate, startTime, endTime, csStaffIdList, receptionList } = this.value
    //   const hasRece = receptionList && receptionList.length
    //   const hasTime = startDate && endDate || (startTime && endTime)
    //   const hasStaff = csStaffIdList && csStaffIdList.length
    //   const tmpArr = []
    //   if (hasRece) {
    //     tmpArr.push('receptionList')
    //   }
    //   if (hasTime) {
    //     tmpArr.push('timePeriod')
    //   }
    //   if (hasStaff) {
    //     tmpArr.push('csStaffIdList')
    //   }
    //   return tmpArr.length > 0 ? tmpArr : ['']
    // },
    innerDate: {
      get() {
        return this.innerValue.startDate || this.innerValue.endDate ? [this.innerValue.startDate, this.innerValue.endDate] : undefined
      },
      set(newVal) {
        if (newVal && newVal.length) {
          this.innerValue.startDate = newVal[0]
          this.innerValue.endDate = newVal[1]
        } else {
          this.innerValue.startDate = undefined
          this.innerValue.endDate = undefined
        }
      }
    },
    csStaffText() {
      if (!this.isEdit) return
      console.log(this.innerValue)
      return this.csStaffList.filter(item => this.innerValue.csStaffIdList.includes(item.csStaffId))
        .map(item => `${item.csName}-${item.csMobile}`)
        .join(',')
    },
    receptionText() {
      if (!this.isEdit) return
      return this.receptionFullList.filter(item => this.innerValue.receptionList.includes(item.callInReceptionId))
        .map(item => item.label)
        .join(',')
    },
    timePeriodText() {
      if (!this.isEdit) return
      const { startDate, endDate, startTime, endTime } = this.innerValue
      if (startDate && endDate) {
        return `${startDate}~${endDate}的${startTime}~${endTime}`
      }
      return `${startTime}~${endTime}`
    },
    typeMap() {
      if (this.jobProperty === 'CS_CALL_OUT') {
        return calloutTypeMap
      } else if (this.jobProperty === 'CALLIN_TO_CS') {
        return callinTypeMap
      }
      return {}
    }
  },
  methods: {
    async loadCsGroupList() {
      const res = await numberpoolAPI.csAccountList({
        pageNum: 1,
        pageSize: 999
      })
      this.csStaffList = res.data.data.content
    },
    async loadReceptionList() {
      const res = await qcAPI.getCallInReceptionList({
        pageNum: 1,
        pageSize: 999
      })
      const receptionFullList = res.data.data.content.map(item => {
        const { tenantPhoneNumberInfo, callInReceptionId } = item
        const hasAccount = tenantPhoneNumberInfo && tenantPhoneNumberInfo.sipAccount
        const hasPhone = tenantPhoneNumberInfo && tenantPhoneNumberInfo.phoneNumber
        if (hasAccount && hasPhone) {
          item.label = `${tenantPhoneNumberInfo.sipAccount}-${tenantPhoneNumberInfo.phoneNumber}`
        } else if (hasAccount) {
          item.label = tenantPhoneNumberInfo.sipAccount
        } else if (hasPhone) {
          item.label = tenantPhoneNumberInfo.phoneNumber
        }
        item.label = `id: ${callInReceptionId}`
        return item
      })
      this.receptionFullList = receptionFullList
    },
    onCloneItem() {
      if (this.selectedTypeList.length === maxConditions) {
        this.$message({
          message: `最多添加${maxConditions}个`,
          type: 'error'
        })
        return
      }
      this.selectedTypeList.push('')
    },
    onDelItem(index) {
      this.selectedTypeList.splice(index, 1)
    },
    resetData() {
      Object.assign(this.$data, this.$options.data())
    }
  },
  mounted() {
    this.loadCsGroupList()
    this.loadReceptionList()
  }
}
</script>

<style lang="scss" scoped>
.operation-icon {
  // float: right;
  margin-left: 10px;
}
.w80 {
  width: 80px;
}
.w100 {
  width: 100px;
}
.w200 {
  width: 200px;
}
.date-picker {
  /deep/ .el-icon-date {
    display: none;
  }
  /deep/ .el-icon-time {
    display: none;
  }
  /deep/ .el-range-input {
    width: 80px;
  }
  /deep/ .el-input__inner {
    padding: 0 10px;
  }
}
</style>
