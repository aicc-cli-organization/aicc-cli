<template>
  <el-form-item label="预警消息推送人" prop="robotCallJob.earlyWarningAlertUsers">
    <el-select
      @visible-change="loadEarlyWarningAlertUsers"
      v-model="innerValue"
      multiple
      filterable
      collapse-tags>
      <el-option v-for="(item, index) in earlyWarningAlertUsers"
        :key="index"
        :label="item.name"
        :value="item.userId"
      ></el-option>
    </el-select>
    <default-group-setting
      groupType="EARLY_WARNING_PUSH"
      emptyTip="未选择预警消息推送人"
      v-model="innerValue"
    ></default-group-setting>
  </el-form-item>
</template>

<script>
import * as usersAPI from '@/api/users'
import FormItemCommon from '../mixins/formItemCommon'
import DefaultGroupSetting from '../defaultGroupSetting'

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
      earlyWarningAlertUsers: []
    }
  },
  components: {
    DefaultGroupSetting
  },
  methods: {
    async loadEarlyWarningAlertUsers(visible) {
      if (!visible) {
        return
      }
      this.earlyWarningAlertUsers = (await usersAPI.getAllUserList()).data.data
    },
    initData() {
      this.loadEarlyWarningAlertUsers(true)
    }
  }}
</script>
