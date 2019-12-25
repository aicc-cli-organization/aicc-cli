<template>
  <el-form-item label="人工介入坐席组" v-if="visible" prop="robotCallJob.csStaffGroupId" required>
    <el-select
      v-model="innerValue"
      @visible-change="loadHumanIntervention"
      :disabled="!enableCsTransfer">
      <el-option
        v-for="(item, index) in staffGroupList"
        :key="index"
        :label="item.groupName"
        :value="item.csStaffGroupId">
      </el-option>
    </el-select>
    <el-tooltip effect="dark" placement="top-start" v-if='!enableCsTransfer'>
      <div slot="content">未开启人工介入权限, 如有需要请联系{{customerStr}}经理为您开启</div>
      <i class="el-icon-question icon-tip const-cs-group-icon"></i>
    </el-tooltip>
    <span v-if="csGrouponLineTip" class="red-tip">当前坐席组无在线坐席，消息将无法推送，请谨慎选择！</span>
  </el-form-item>
</template>

<script>
import FormItemCommon from '../mixins/formItemCommon'
import { mapGetters } from 'vuex'
import * as taskAPI from '@/api/task'

export default {
  mixins: [FormItemCommon],
  props: {
    dialogFlowId: Number,
    humanInterventionExist: Boolean,
    value: Number
  },
  data() {
    return {
      staffGroupList: []
    }
  },
  computed: {
    ...mapGetters([
      'enableCsTransfer', 'customerStr'
    ]),
    visible() {
      return this.dialogFlowId && this.humanInterventionExist
    },
    csGrouponLineTip() {
      const staffGroupList = this.staffGroupList
      const selectStaffGroupId = this.value
      if (Array.isArray(staffGroupList) && staffGroupList.length && selectStaffGroupId) {
        const selectItem = staffGroupList.find(item => item.csStaffGroupId === selectStaffGroupId)
        return selectItem ? selectItem.onlineCount <= 0 : false
      }
      return false
    }
  },
  methods: {
    async loadHumanIntervention(visible) {
      if (!visible) {
        return
      }
      taskAPI.getcsRototStaffGroupList({
        pageNum: 1,
        pageSize: 999,
        enabledStatus: 'ENABLE',
        groupType: 'CS'
      }).then(res => {
        const { content } = res.data.data
        this.staffGroupList = content.map(item => ({
          groupName: item.groupName,
          csStaffGroupId: item.csStaffGroupId,
          onlineCount: item.onlineCount,
        }))
      })
    },
    initData() {
      this.loadHumanIntervention(true)
    }
  }
}
</script>

<style lang="scss" scoped>
.icon-tip {
  margin-left: 30px;
  font-size: 18px;
  vertical-align: middle;
  &.const-cs-group-icon {
    margin-left: 0;
  }
}
.red-tip {
  color: #f56c6c;
  font-size: 14px;
}
</style>
