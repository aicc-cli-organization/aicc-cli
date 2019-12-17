<template>
  <div class="private-sea">
    <div class="header">
      <div class="header-filter">
        <slot name="typeSelect"></slot>
        <option-search-input
          width="270px"
          ref="optionSearchInput"
          v-model="searchWords"
          @search="refresh"
          :option-list="optionList"
          option-width="100px"
        ></option-search-input>
        <span class="label text-label" style="margin-left:20px">话术名：</span>
        <el-select
          v-model="dialogFlowId"
          placeholder="请选择话术"
          :style="{width: '110px', marginLeft: '10px'}"
          filterable
          clearable
          remote
          :remote-method="requestDialogFlowList"
          @change="handleDialogChange"
        >
          <el-option v-for="item in dialogFlowList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
        <span class="label text-label" v-if="type === 'callTask'" style="margin-left:20px">任务名：</span>
        <el-select
          v-if="type === 'callTask'"
          v-model="robotCallJobId"
          placeholder="请选择任务"
          :style="{width: '110px', marginLeft: '10px'}"
          filterable
          clearable
          remote
          :remote-method="loadTaskList"
          @change="handleRemoteSearchForFilter"
        >
          <el-option v-for="item in taskList" :key="item.robotCallJobId" :value="item.robotCallJobId" :label="item.name"></el-option>
        </el-select>
        <el-checkbox class='remove-repeat' v-model='isRealIntent'>人工意向分类</el-checkbox>
      </div>
      <el-button type="primary" @click="handleClearFilterClick">清空筛选条件</el-button>
    </div>
    <div class="header header-sub">
      <div class="header-filter">
        <div class="form-item">
          <span class="label text-label">最近呼叫时长(秒)：</span>
          <div class="flex-center duration">
            <el-input class="duration-input" v-model="chatDurationMin" placeholder="最小时长" :style="{width: '100px'}" @change="handleChatMinChange">
            </el-input>
            <span class="split-line">-</span>
            <el-input class="duration-input" v-model="chatDurationMax" placeholder="最大时长" :style="{width: '100px'}" @change="handleChatMaxChange">
            </el-input>
          </div>
        </div>
        <div class="form-item">
          <span class="label text-label">呼叫时间：</span>
          <el-date-picker
            v-model="createDate"
            type="datetimerange"
            time-arrow-control
            range-separator="-"
            align="right"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
            :style="{width: '360px'}"
            @change="refresh"
          />
        </div>
        <div class="form-item">
          <span class="label text-label">查看状态：</span>
          <el-select v-model="readStatus" placeholder="请选择查看状态" :style="{width: '150px'}" @change="refresh" :clearable="true">
            <el-option v-for="(name, value) in readStatusEnum" :key="value" :value="value" :label="name"></el-option>
          </el-select>
        </div>
        <div class="form-item" v-if="type === 'callTask'">
          <span class="label text-label">人工介入：</span>
          <el-select v-model="noticeStatus" placeholder="状态选择" :style="{width: '150px'}" @change="refresh" :clearable="true">
            <el-option v-for="(name, value) in noticeStatusEnum" :key="value" :value="value" :label="name"></el-option>
          </el-select>
          <el-tooltip placement="top">
            <div slot="content">
              <div>已通知：触发人工介入，通知成功发送至坐席</div>
              <div>未通知：未触发人工介入</div>
              <div>通知失败：触发人工介入，通知未成功发送至坐席（无可用在线空闲坐席）</div>
            </div>
            <i class="el-icon-question pointer"></i>
          </el-tooltip>
          <el-select v-model="answerSit" placeholder="介入人员" filterable :style="{width: '150px', marginLeft: '5px'}" @change="refresh" :clearable="true">
            <el-option-group
              v-for="group in answerSits"
              :key="group.label"
              :label="group.label === 'group' ? '坐席组' : '坐席'">
              <el-option
                v-for="item in group.options"
                :key="item.id"
                :label="item.value"
                :value="group.label + item.id">
              </el-option>
            </el-option-group>
          </el-select>
        </div>
        
      </div>
    </div>

    <call-status-filter
      class="no-border"
      v-model="resultStatuses"
      @change="loadData({ pageNum: 1 })"/>

    <intent-level-filter
      class="no-border"
      :intentLevelTagId.sync="intentLevelTagId"
      :intentLevelDisabled="intentLevelDisabled"
      :intentLevelCodes.sync="intentLevelCodes"
      @changeIntentLevelCodes="loadData({ pageNum: 1 })"
      />

    

    <div class="table-top-action">
      <div class="action-left">
        <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
        <span class="checked-count ml5">已选中
          <span class="num">{{checkedCount}}</span>项
        </span>
        <SelectTableHeaders v-model="showTableHeaders" :tableHeaders="tableHeaders"></SelectTableHeaders>
      </div>
      <div class="action-left ml15">
        <el-button type="primary" plain @click="$router.push('/customer/whiteList')" v-if="hasAccess('crm_whiteList_view')">{{customerStr}}白名单</el-button>
        <el-button type="primary" plain @click="$router.push('/customer/customerGroup')" v-if="hasAccess('crm_group_view')">{{customerStr}}分组</el-button>
      </div>
      <div class="action-right">
        <div class="form-item" v-if="type === 'callTask'">
          <!-- 导入到任务 -->
          <import-to-task @import="handleImportTask" v-model="taskForImport"></import-to-task>
        </div>
        <div class="f12 right ml10" v-if="hasAccess('crm_dialHistory_downAudio')">
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
    <contact-history-modal
      unit="通"
      :visible.sync="previewVisible"
      :downloadAudio="hasAccess('crm_dialHistory_downAudio')"
      :defaultIndex="callRecordIndex"
      :loadTableData="loadData"
      :tableData="tableData"
    >
    </contact-history-modal>
    <call-record-detail-modal
      ref="modal"
      :visible.sync="callRecordDetailDialogVisible"
      :downloadAudio="hasAccess('crm_dialHistory_downAudio')"
      :customerFields_private="customerFields_private"
      :tableData="tableData"
      :defaultIndex="callRecordIndex"
      :loadTableData="loadData"
      :canEditCustomer="true"
      appType="crm"
      @edit-customer="handleEditCustomer"
      width="1080px"
      @refresh="refresh"
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
  import { chartDurationManager } from './utils'
  import { callRecordFromJobReAdd } from '@/api/customer'
  import TableCheckAll from '@/mixins/tableCheckAll'
  import { mapGetters } from 'vuex'

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
      ...mapGetters(['call_all_fields', 'call_checked_fields', 'customerFields_private', 'enableCsSeat', 'userEnableCsSeat', 'customerStr']),
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
        dialogFlowId: undefined,
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
        isRealIntent: false
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
          ...params
        }
        this.$refs.table.loadData(newParams, (tableData) => {
          this.tableData = tableData
          cb && cb()
        })
      },
      handleChatMinChange(v) {
        this.chatDurationMin = chartDurationManager(v)
        this.refresh()
      },
      handleChatMaxChange(v) {
        this.chatDurationMax = chartDurationManager(v)
        this.refresh()
      },
      handleDialogChange(val) {
        if (val === undefined || val === null || val === '') {
          this.requestDialogFlowList()
          this.dialogFlowId = undefined
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
      requestDialogFlowList(name) {
        talkAPI.fetchFlowList({
          pageNum: 1,
          pageSize: 20,
          published: true,
          name
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
            pageSize: 20
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
        this.isRealIntent = false
        this.refresh()
      },
      async handleExportCommand() { // 导出
        const callRecordIds = this.multipleSelection.map(item => item.callRecordId)
        if (callRecordIds.length === 0) {
          this.$message.error(`请选择需要导出的${this.customerStr}`)
          return
        }

        if (this.allChecked) { // 根据筛选条件导出
          await exportDialogHistory({
            customerPersonListType: 'PRIVATE_LIST',
            ...this.paginationParams
          }, this.type)
        } else { // 导出选中客户
          await exportDialogHistory({
            callRecordIds,
            customerPersonListType: 'PRIVATE_LIST'
          }, this.type)
        }

        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success('操作成功！详细结果请在导入导出列表查看')
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
    watch:{
      isRealIntent(val) {
         this.$nextTick(()=> {
          this.loadData({
            realIntent:val===true?val:undefined
          })
        })
      }
    },
    mounted() {
      this.requestDialogFlowList()
      this.getCsGroupAndStaff()
      this.loadTaskList()
      this.loadData()
    }
  }
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/extend.scss';

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
      .el-icon-question {
        margin-left: 5px;
        font-size: 14px;
      }
      .duration {
        border: 1px solid #d8d8d8;
        border-radius: 4px
      }
      .duration-input  /deep/ .el-input__inner{
        border:none;
      }
    }
    > .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      &.header-sub {
        padding: 0 0 4px 0;
        .header-filter {
          flex-wrap: wrap;
          .form-item {
            margin-bottom: 10px;
          }
        }
      }
      > .header-filter {
        display: flex;
        align-items: center;
      }
      .remove-repeat {
        margin-left:20px;
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
  }
</style>
