<template>
  <el-form-item
    label="预警接收人"
    prop="jobAlertUserList">
    <el-select
      @visible-change="loadAlertUserList"
      v-model="innerValue"
      multiple
      filterable
      collapse-tags>
      <el-option v-for="(item, index) in alertUserList"
        :key="index"
        :label="item.name"
        :value="item.userId"
      ></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
import FormItemCommon from './common'
import * as usersAPI from '@/api/users'

export default {
  mixins: [FormItemCommon],
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      alertUserList: []
    }
  },
  methods: {
    async loadAlertUserList() {
      this.alertUserList = (await usersAPI.getAllUserList()).data.data
    }
  }
}
</script>
