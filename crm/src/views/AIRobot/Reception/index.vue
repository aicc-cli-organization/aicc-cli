<template>
  <div class="reception yw-container">
    <div class="header">
      <div class="stats">共{{summaryInfo.sumReceptionCount || 0}}个接待场景/{{summaryInfo.sumEnableCount || 0}}个接待场景启用中</div>
      <el-button
        type="primary"
        class="add-btn"
        @click="handleAddReception"
        v-if="hasAccess('crm_callInRecp_addOrEdit')"
      >
        新增接待场景
      </el-button>
    </div>
    <pagination-table
      class="list"
      ref="table"
      url="/apiEngine/callIn/reception/list"
      method="get"
      :autoLoad="false"
    >
      <el-table-column
        label="外显号码"
        width="150px"
      >
        <template slot-scope="{ row }">
          {{row.tenantPhoneNumberInfo ? (row.tenantPhoneNumberInfo.sipAccount || emptyPlaceholder) : emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        label="号码名称"
        width="120px"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          {{row.tenantPhoneNumberInfo ? (row.tenantPhoneNumberInfo.phoneNumber || emptyPlaceholder) : emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        label="场景描述"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          {{row.remark || emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column label="使用导航名称">
        <template slot-scope="{ row }">
          {{row.ivrNavigationInfoId && row.ivrNavigationInfo ? row.ivrNavigationInfo.ivrNavigationName : emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column label="接待方式">
        <template slot-scope="{ row }">
          <template v-if="row.enabledIvr">
            {{getIVRMode(row.ivrNavigationInfo)}}
          </template>
          <template v-else>
            {{row.csStaffGroup ? staffGroupTypeEnum[row.csStaffGroup.groupType] : emptyPlaceholder}}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="AI坐席组">
        <template slot-scope="{ row }">
          <template v-if="row.enabledIvr">
            <template v-if="row.ivrNavigationInfo && row.ivrNavigationInfo.aiCsStaffGroupInfoList && row.ivrNavigationInfo.aiCsStaffGroupInfoList.length">
              <staff-group-pop
                v-for="(innerItem, innerIndex) in row.ivrNavigationInfo.aiCsStaffGroupInfoList"
                :key="innerIndex"
                popType="AI"
                :isLastEle="innerIndex === row.ivrNavigationInfo.aiCsStaffGroupInfoList.length - 1"
                :groupName="innerItem.csGroupName"
                :staffGroupId="innerItem.csGroupId">
              </staff-group-pop>
            </template>
            <template v-else>{{emptyPlaceholder}}</template>
          </template>
          <template v-else-if="row.csStaffGroup.groupType === 'AI'">
            <staff-group-pop
              popType="AI"
              :staffGroupId="row.csStaffGroup.csStaffGroupId"
              :isLastEle="true"
              :groupName="row.csStaffGroup.groupName"
            ></staff-group-pop>
          </template>
          <template v-else>{{emptyPlaceholder}}</template>
        </template>
      </el-table-column>
      <el-table-column label="人工坐席组">
        <template slot-scope="{ row }">
          <template v-if="row.enabledIvr">
            <template v-if="row.ivrNavigationInfo && row.ivrNavigationInfo.humanCsStaffGroupInfoList && row.ivrNavigationInfo.humanCsStaffGroupInfoList.length">
              <staff-group-pop
                v-for="(innerItem, innerIndex) in row.ivrNavigationInfo.humanCsStaffGroupInfoList"
                :key="innerIndex"
                popType="CS"
                :isLastEle="innerIndex === row.ivrNavigationInfo.humanCsStaffGroupInfoList.length - 1"
                :groupName="innerItem.csGroupName"
                :groupTypeVisible="false"
                :staffGroupId="innerItem.csGroupId">
              </staff-group-pop>
            </template>
            <template v-else>{{emptyPlaceholder}}</template>
          </template>
          <template v-else-if="row.csStaffGroup.groupType === 'CS'">
            <staff-group-pop
              popType="CS"
              :staffGroupId="row.csStaffGroup.csStaffGroupId"
              :isLastEle="true"
              :groupName="row.csStaffGroup.groupName"
              :groupTypeVisible="false"
            ></staff-group-pop>
          </template>
          <template v-else>{{emptyPlaceholder}}</template>
        </template>
      </el-table-column>
      <el-table-column
        label="应用话术"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          <template v-if="row.enabledIvr">
            {{row.dialogFlowNameList && row.dialogFlowNameList.length ? row.dialogFlowNameList.join(',') : emptyPlaceholder}}
          </template>
          <template v-else>
            {{row.csStaffGroup ? (row.csStaffGroup.dialogFlowName || emptyPlaceholder) : emptyPlaceholder}}
          </template>
        </template>
      </el-table-column>
      <el-table-column
        label="是否启用"
        width="80px"
      >
        <template slot-scope="{ row }">
          {{row.status === 'ENABLE' ? '是' : '否'}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="130px"
      >
        <div slot-scope="{ row }">
          <span class="action" @click="handleEditReception(row)" v-if="hasAccess('crm_callInRecp_addOrEdit')">编辑</span>
          <yiwise-pop-confirm
            v-if="row.status === 'ENABLE' && hasAccess('crm_callInRecp_enableOrforbidden')"
            label="确认要禁用该接待场景吗？"
            @submit="handleUpdateStatus(row, 'DISABLE')"
          >
            <span class="action" v-if="hasAccess('crm_callInRecp_enableOrforbidden')">禁用</span>
          </yiwise-pop-confirm>
          <span v-else>
            <yiwise-pop-confirm
              v-if="row.status === 'DISABLE' && hasAccess('crm_callInRecp_enableOrforbidden')"
              label="确认要启用该接待场景吗？"
              @submit="handleUpdateStatus(row, 'ENABLE')"
            >
              <span class="action" v-if="hasAccess('crm_callInRecp_enableOrforbidden')">启用</span>
            </yiwise-pop-confirm>
            <yiwise-pop-confirm
              v-if="row.status === 'DISABLE'"
              label="确认要删除该接待场景吗？"
              @submit="handleDeleteClick(row)"
            >
              <span class="action">删除</span>
            </yiwise-pop-confirm>
          </span>
        </div>
      </el-table-column>
    </pagination-table>
    <reception-dialog
      :visible.sync="receptionVisible"
      :type="receptionType"
      :defaultData="receptionData"
      @data-change="handleDataChange"
    >
    </reception-dialog>
  </div>
</template>

<script>
import { PaginationTable, YiwisePopConfirm } from 'yiwise-components'
import ReceptionDialog from './ReceptionDialog'
import { emptyPlaceholder } from '@/utils/constant'
import { staffGroupTypeEnum, staffDistributeTypeEnum } from '@/utils/enum'
import { updateReceptionStatus, fetchSummaryInfo, deleteReception } from '@/api/reception'
import StaffGroupPop from '@/views/IVR/components/staffGroupPop'

export default {
  name: 'Reception',
  components: {
    PaginationTable,
    ReceptionDialog,
    YiwisePopConfirm,
    StaffGroupPop
  },
  data() {
    return {
      emptyPlaceholder,
      staffGroupTypeEnum,
      staffDistributeTypeEnum,
      receptionVisible: false,
      receptionType: 'add',
      receptionData: {},
      summaryInfo: {}
    }
  },
  methods: {
    loadData(params = {}) {
      const { table } = this.$refs
      if (table) {
        table.loadData(params)
      }
    },
    handleAddReception() { // 新增接待
      this.receptionVisible = true
      this.receptionType = 'add'
    },
    handleEditReception(row) { // 编辑接待
      this.receptionVisible = true
      this.receptionType = 'edit'
      this.receptionData = row
    },
    async handleUpdateStatus(row, status) { // 更新接待场景状态
      await updateReceptionStatus({
        callInReceptionId: row.callInReceptionId,
        status
      })
      this.loadData()
      this.loadSummaryInfo()
    },
    async loadSummaryInfo() {
      const { data } = await fetchSummaryInfo()
      this.summaryInfo = data.data || {}
    },
    handleDataChange() {
      this.loadData({
        pageNum: 1
      })
      this.loadSummaryInfo()
    },
    async handleDeleteClick(row) { // 删除接待场景
      await deleteReception({
        callInReceptionId: row.callInReceptionId
      })
      this.$message.success('删除成功')
      this.loadData()
      this.loadSummaryInfo()
    },
    getIVRMode(ivrNavigationInfo) {
      if (!ivrNavigationInfo) return '--'
      const { aiCsStaffGroupInfoList, humanCsStaffGroupInfoList } = ivrNavigationInfo
      const hasAI = aiCsStaffGroupInfoList && aiCsStaffGroupInfoList.length
      const hasHuman = humanCsStaffGroupInfoList && humanCsStaffGroupInfoList.length
      if (hasAI && hasHuman) {
        return 'AI + 人工'
      } else if (hasAI) {
        return 'AI'
      } else if (hasHuman) {
        return '人工'
      }
      return '--'
    }
  },
  mounted() {
    this.loadData()
    this.loadSummaryInfo()
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';
@import '~src/styles/placeholder.scss';

.reception {
  height: 100%;
  display: flex;
  flex-direction: column;
  > .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px;
  }
  > .list {
    flex-grow: 1;
    .action {
      @extend %tableAction;
    }
  }
}
</style>

