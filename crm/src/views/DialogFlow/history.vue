<template>
  <div class="private-sea">
    <option-search-input width="270px"
      v-model="searchKey"
      @search="loadData"
      :option-list="optionList"
      option-width="110px"
      >
    </option-search-input>
    <div class="table-top-action">
      <div class="action-left">
        <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
        <span class="checked-count ml5">已选中
          <span class="num">{{checkedCount}}</span>项
        </span>
        <!-- <SelectTableHeaders v-model="showTableHeaders" :tableHeaders="tableHeaders"></SelectTableHeaders> -->
        <span class="tip">文本训练暂不提供训练历史</span>
      </div>
      <div class="action-right">
        <div class="form-item" v-if="type === 'callTask'">
          <!-- 导入到任务 -->
          <import-to-task @import="handleImportTask" v-model="taskForImport"></import-to-task>
        </div>
        <div class="f12 right ml10" v-if="hasAccess('crm_dialHistory_downAudio')">
          <el-button type="primary" @click="refresh">刷新</el-button>
          <downloader-module
            :allChecked="allChecked"
            :multipleSelection="multipleSelection"
            :paginationParams="paginationParams"
            :type="type"
          ></downloader-module>
        </div>
        <el-button type="primary" class="right-item" @click="handleExportCommand" v-if="hasAccess('crm_dialHistory_exportDialHis')">导出通话记录</el-button>
      </div>
    </div>
    <div
      :style="{width: 'calc(100vw - 477px)'}"
    >
      <my-customer-list
        ref="table"
        :url="url"
        :type="type"
        :showTableHeaders="showTableHeaders"
        :multipleSelection="multipleSelection"
        @preview="handlePreviewClick"
        @showCallDetail="handleShowCallDetail"
        @totalSizeChange="handleTotalSizeChange"
        @selection-change="handleSelectionChange"
        @select="handleSelectChange"
        @select-all="handleSelectAll"
        @refreshTable="handleRefreshTable"
      ></my-customer-list>
    </div>
    <contact-history-modal
      unit="通"
      :visible.sync="previewVisible"
      :defaultIndex="callRecordIndex"
      :loadTableData="loadData"
      :tableData="tableData"
    >
    </contact-history-modal>
    <call-record-detail-modal
      ref="modal"
      :visible.sync="callRecordDetailDialogVisible"
      :customerFields_private="customerFields_private"
      :tableData="tableData"
      :defaultIndex="callRecordIndex"
      :loadTableData="loadData"
      :canEditCustomer="true"
      appType="crm"
      @edit-customer="handleEditCustomer"
    >
      <div slot="header" class="record-detail-header">
        <artificial-call-popover
          v-if="enableCsSeat || userEnableCsSeat"
          :defaultName="customerData.customerPersonName"
          :defaultPhoneNumber="customerData.calledPhoneNumber"
        >
          <div
            class="call"
            slot="reference"
          >
            <i class="iconfont icon-bohaox"></i>
            人工外呼
          </div>
        </artificial-call-popover>
      </div>
    </call-record-detail-modal>
    <customer-dialog :visible.sync="customerVisible" type="edit" :defaultData="editCustomerData" @success="handleEditSuccess"></customer-dialog>
  </div>
</template>

<script>
  import { OptionSearchInput, CallRecordDetailModal } from 'yiwise-components'
  import ArtificialCallPopover from '@/components/ArtificialCallPopover'
  import downloaderModule from '@/components/downloaderModule/index'
  import SelectTableHeaders from '@/components/SelectTableHeaders'
  import callStatusFilter from '@/components/customer/callStatusFilter'
  import intentLevelFilter from '@/components/customer/intentLevelFilter'
  import ImportToTask from '@/components/ImportToTask'
  import CustomerDialog from '@/components/CustomerDialog'
  import MyCustomerList from './MyCustomerList'
  import { readStatusEnum, noticeStatusEnum } from '@/utils/enum'
  import ContactHistoryModal from '@/components/ContactHistoryModal'
  import { getSimpleList, exportDialogHistory } from '@/api/task'
  import { getCsGroupAndStaff } from '@/api/numberpool'
  import * as talkAPI from '@/api/talk'
  import { callRecordFromJobReAdd } from '@/api/customer'
  import TableCheckAll from '@/mixins/tableCheckAll'
  import { mapGetters } from 'vuex'

  const optionList = [
    {
      label: '通话记录id',
      searchKey: 'callRecordId',
      placeholder: '请输入通话记录id'
    }
  ]

  export default {
    name: 'contactHistory',
    props: {
      url: {
        type: String,
        default: ''
      },
      type: [String]
    },
    // 处理table全选的mixin
    mixins: [TableCheckAll],
    components: {
      CallRecordDetailModal,
      OptionSearchInput,
      MyCustomerList,
      downloaderModule,
      ImportToTask,
      callStatusFilter,
      intentLevelFilter,
      SelectTableHeaders,
      ContactHistoryModal,
      ArtificialCallPopover,
      CustomerDialog
    },
    computed: {
      ...mapGetters(['call_all_fields', 'call_checked_fields', 'customerFields_private', 'flowId', 'enableCsSeat', 'userEnableCsSeat', 'customerStr']),
      dialogFlowId() {
        return this.flowId
      },
      showTableHeaders: {
        set(v) {
          this.$store.commit('SET_CALL_CHECKED_FIELDS', v)
        },
        get() {
          return this.call_checked_fields
        }
      },
      tableHeaders() {
        const call_all_fields = JSON.parse(JSON.stringify(this.call_all_fields))
        if (this.type !== 'callTask') {
          delete call_all_fields['personInvolved']
          delete call_all_fields['listened']
          delete call_all_fields['cutOver']
          delete call_all_fields['listenPerson']
        }
        return call_all_fields
      },
      intentLevelDisabled() {
        return (this.dialogFlowId !== undefined && this.dialogFlowId !== '') ||
          (this.robotCallJobId !== undefined && this.robotCallJobId !== '')
      },
      generalParams() {
        for (const key in this.searchWords) {
          if (this.searchWords[key] === '') {
            this.searchWords[key] = undefined
          }
        }

        return {
          ...this.searchWords,
          dialogFlowId: this.dialogFlowId || undefined,
          earliestCreationTime: this.createDate ? this.createDate[0] : undefined,
          latestCreationTime: this.createDate ? this.createDate[1] : undefined,
          customerGroupId: this.customerGroup || undefined,
          robotCallJobId: this.robotCallJobId || undefined,
          readStatus: this.readStatus || undefined,
          chatDuration: this.chatDuration || undefined,
          chatDurationMin: +this.chatDurationMin || undefined,
          chatDurationMax: +this.chatDurationMax || undefined,
          csStaffGroupId: this.answerSit && this.answerSit.includes('group') ? this.answerSit.split('group')[1] : undefined,
          csStaffId: this.answerSit && this.answerSit.includes('staff') ? this.answerSit.split('staff')[1] : undefined,
          csTransferNotify: this.noticeStatus || undefined
        }
      },
      paginationParams() {
        return {
          ...this.generalParams,
          resultStatuses: this.resultStatuses,
          intentLevelTagId: this.intentLevelCodes.length > 0 ? this.intentLevelTagId : undefined,
          intentLevelCodes: this.intentLevelCodes
        }
      },
      optionList() {
        const linkPhone = {
          label: '联系电话',
          searchKey: 'calledPhoneNumber',
          placeholder: '请输入联系电话'
        }
        const callRecordId = {
          label: '通话记录id',
          searchKey: 'callRecordId',
          placeholder: '请输入通话记录id'
        }
        return this.type === 'wordsTraining' ? [linkPhone, callRecordId] : [
          linkPhone, callRecordId,
          {
            label: '姓名',
            searchKey: 'customerPersonName',
            placeholder: '请输入姓名'
          }
        ]
      }
    },
    data() {
      return {
        resultStatuses: [],
        answerSits: [],
        answerSit: undefined,
        intentLevelTagId: undefined,
        intentLevelCodes: [],
        // dialogFlowId: undefined,
        searchWords: undefined,
        createDate: undefined,
        customerGroup: undefined,
        customerSource: undefined,
        robotCallJobId: undefined,
        readStatus: undefined,
        noticeStatus: undefined,
        chatDuration: undefined,
        chatDurationMin: undefined,
        chatDurationMax: undefined,
        callRecordDetailDialogVisible: false,
        readStatusEnum,
        noticeStatusEnum,
        taskList: [],
        taskForImport: {},
        dialogFlowList: [],
        multipleSelection: [], // 当前选中的table行
        customerData: {},
        // 查看dialog
        previewVisible: false,
        callRecordIndex: -1,
        tableData: {}, // 当前页列表相关数据，包含分页信息
        customerVisible: false, // 是否显示编辑用户dialog
        editCustomerData: {},
        searchKey: {}, // 搜索id
        optionList
      }
    },
    methods: {
      refresh() {
        this.loadData({
          pageNum: 1
        })
      },
      loadData(params = {}, cb = () => {}) {
        const newParams = {
          ...this.paginationParams,
          callRecordId:parseInt(this.searchKey.callRecordId),
          ...params
        }
        this.$refs.table.loadData(newParams, (tableData) => {
          this.tableData = tableData
          cb && cb()
        })
      },
      handleDialogChange(val) {
        if (val === undefined || val === null || val === '') {
          return
        }
        const intentLevelTagId = this.dialogFlowList.filter((item) => {
          return item.id === val
        })[0].intentLevelTagId
        this.intentLevelTagId = intentLevelTagId
        this.intentLevelCodes = []

        this.refresh()
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
        // 这个函数时定义在mixin中，用于处理全选操作的
        this._handleSelectionChange && this._handleSelectionChange(val)
      },
      handleImportTask(val) { // 导入到任务
        if (!this.taskForImport || !this.taskForImport.robotCallJobId) {
          this.$message.error('请先选择任务')
          return
        }

        if (this.allChecked) {
          this.importToTaskByFilters()
        } else {
          this.importToTaskByIds()
        }
      },
      async importToTaskByIds() {
        if (!this.multipleSelection || this.multipleSelection.length === 0) {
          this.$message.error(`请至少选择一位${this.customerStr}`)
          return
        }

        const callRecordIds = this.multipleSelection.map(item => item.callRecordId)
        await callRecordFromJobReAdd({
          targetRobotCallJobId: this.taskForImport.robotCallJobId,
          callRecordIds
        })
        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success(`已导入${callRecordIds.length}个${this.customerStr}到${this.taskForImport.name},任务详细结果请在导入导出列表查看`)
      },
      async importToTaskByFilters() {
        await callRecordFromJobReAdd({
          ...this.paginationParams,
          targetRobotCallJobId: this.taskForImport.robotCallJobId
        })
        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success(`已导入${this.checkedCount}个${this.customerStr}到${this.taskForImport.name},任务详细结果请在导入导出列表查看`)
      },
      handleShowCallDetail(row, index) {
        var tableData = this.$refs.table.$refs.table.tableData
        for (let i = 0; i < tableData.length; i++) {
          if (tableData[i].callRecordId === row.callRecordId) {
            this.$set(this.$refs.table.$refs.table.tableData[i], 'read', 'HAS_READ')
          }
        }
        this.callRecordDetailDialogVisible = true
        this.callRecordIndex = index
        this.customerData = row
      },
      requestDialogFlowList() {
        talkAPI.fetchFlowList({
          pageNum: 1,
          pageSize: 100,
          published: true
        }).then(({ data }) => {
          this.dialogFlowList = data.data.content
        })
      },
      handleRemoteSearchForFilter(val) {
        if (val === undefined || val === '') {
          this.loadTaskList()
          this.robotCallJobId = undefined
          return
        }
        const intentLevelTagId = this.taskList.filter((item) => {
          return item.robotCallJobId === val
        })[0].intentLevelTagId
        this.intentLevelTagId = intentLevelTagId
        this.intentLevelCodes = []

        this.refresh()
      },
      async loadTaskList(val) { // 加载任务列表
        try {
          const { data } = await getSimpleList({
            searchWords: val,
            pageSize: 999
          })
          if (data) {
            this.taskList = data.data || []
          }
        } catch (error) {
          return
        }
      },
      async getCsGroupAndStaff() { // 加载接听人员列表
        const { data } = await getCsGroupAndStaff()
        if (data) {
          this.answerSits = data.data || []
        }
      },
      handlePreviewClick(data, index) {
        this.customerData = data
        this.previewVisible = true
        if (typeof index !== 'undefined') {
          this.callRecordIndex = index
        } else {
          this.callRecordIndex = this.tableData.content.findIndex(item => item.customerPersonId ===  data.customerPersonId)
        }
      },
      handleClearFilterClick() { // 清空筛选条件
        this.$refs.optionSearchInput.reset((params) => {
          this.searchWords = params
        })
        this.createDate = undefined
        this.customerGroup = undefined
        this.dialogFlowId = undefined
        this.robotCallJobId = undefined
        this.readStatus = undefined
        this.noticeStatus = undefined
        this.answerSit = undefined
        this.chatDuration = undefined
        this.chatDurationMin = undefined
        this.chatDurationMax = undefined
        this.intentLevelCodes = []
        this.resultStatuses = []
        this.refresh()
      },
      async handleExportCommand() { // 导出
        const callRecordIds = this.multipleSelection.map(item => item.callRecordId)
        if (callRecordIds.length === 0) {
          this.$message.error('请选择需要导出的通话记录')
          return
        }

        if (this.allChecked) { // 根据筛选条件导出
          await this.exportByFilter()
        } else { // 导出选中客户
          await this.exportBySelect()
        }

        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success('操作成功！详细结果请在导入导出列表查看')
      },
      async exportByFilter() { // 根据筛选条件导出
        await exportDialogHistory({
          customerPersonListType: 'PRIVATE_LIST',
          ...this.paginationParams
        }, this.type)
      },
      async exportBySelect() { // 导出选中聊天记录
        const callRecordIds = this.multipleSelection.map(item => item.callRecordId)
        await exportDialogHistory({
          callRecordIds,
          customerPersonListType: 'PRIVATE_LIST'
        }, this.type)
      },
      handleEditCustomer(data) { // 编辑客户
        this.customerVisible = true
        this.editCustomerData = data
      },
      handleEditSuccess() { // 编辑成功
        const { modal } = this.$refs
        if (modal) {
          const { callRecordId, tenantId, robotType } = this.editCustomerData
          modal.loadCallDetail({
            callRecordId,
            tenantId,
            type: robotType
          })
        }
        this.loadData()
      }
    },
    mounted() {
      this.requestDialogFlowList()
      this.getCsGroupAndStaff()
      this.loadTaskList()
      this.loadData()
    },
    watch: {
      dialogFlowId() {
        this.searchKey = {
          callRecordId: null
        }
        this.loadData()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/extend.scss';

  .private-sea {
    height: 100%;
    .form-item {
      display: flex;
      align-items: center;
      margin-left: 20px;
      > .label {
        flex-shrink: 0;
        color: $--color-text-regular;
        font-size: $--font-size-small;
      }
    }
    > .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      &.header-sub {
        padding: 0 0 14px 0;
        border-bottom: $--border-base;
      }
      > .header-filter {
        display: flex;
        align-items: center;
      }
    }
    .record-detail-header {
      position: absolute;
      right: 25px;
      .call {
        color: $--color-primary;
        display: flex;
        align-items: center;
        padding-right: 20px;
        border-right: $--border-base;
        margin-right: 30px;
        cursor: pointer;
        > i {
          display: inline-block;
          margin-right: 10px;
        }
      }
    }
    .tip {
      display: inline-block;
      margin-left: 10px;
      color: $--color-primary;
    }
  }
</style>
