<template>
  <span>
    <el-select v-if="historyType === 'intentMessage'"
      v-model="innerValue"
      placeholder="呼叫任务名称" class="ml5"
      filterable
      remote
      clearable
      :remote-method="getRobotCallJobList"
      @visible-change="onRobotVisibleChange">
      <el-option
        v-for="item in nameOptions"
        :key="item.robotCallJobId"
        :label="item.name"
        :value="item.robotCallJobId">
      </el-option>
    </el-select>
    <el-select v-else
      v-model="innerValue"
      placeholder="短信任务名称"
      class="m15"
      filterable
      clearable
      remote
      :remote-method="getSmsJobList"
      @visible-change="onSmsVisibleChange"
    >
      <el-option
        v-for="item in nameOptions"
        :key="item.smsJobId"
        :label="item.name"
        :value="item.smsJobId">
      </el-option>
    </el-select>
  </span>
</template>

<script>
import * as taskAPI from '@/api/task'
import * as smsAPI from '@/api/sms'

export default {
  props: {
    value: [String, Number],
    historyType: String
  },
  data() {
    return {
      nameOptions: []
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
    }
  },
  methods: {
    onRobotVisibleChange(visible) {
      if (!visible || this.value) return
      this.getRobotCallJobList()
    },
    onSmsVisibleChange(visible) {
      if (!visible || this.value) return
      this.getSmsJobList()
    },
    async getRobotCallJobList(val) {
      const res = await taskAPI.getSimpleList({ searchWords: val })
      this.nameOptions = res.data.data
    },
    async getSmsJobList(val) {
      const res = await smsAPI.getSimpleSmsJobList({ name: val })
      this.nameOptions = res.data.data.content
    }
  }
}
</script>
