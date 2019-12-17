<template>
  <div class="yw-container private-sea">
    <div class="header">
      <div class="header-filter">
        <option-search-input
          width="270px"
          ref="optionSearchInput"
          v-model="searchValue"
          @search="loadData({ pageNum: 1 })"
          :option-list="optionList"
          option-width="110px"
        ></option-search-input>
        <div class="form-item">
          <span class="label text-label">最近呼叫时间：</span>
          <el-date-picker
            v-model="lastCallTimeRange"
            type="datetimerange"
            time-arrow-control
            align="right"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :style="{width: '360px'}"
            :default-time="['00:00:00', '23:59:59']"
            @change="loadData({ pageNum: 1 })">
          </el-date-picker>
        </div>
        <div class="form-item" >
          <span class="label text-label"
            v-if="hasAccess('crm_private_company')"
          >负责人：</span>
          <el-select v-model="filterFollowUserId" placeholder="请选择负责人" :style="{width: '150px', marginLeft: '5px'}"
            filterable
            remote
            clearable
            :remote-method="getAllUserList"
            @change="handleFilterFollowUserChange"
            v-if="hasAccess('crm_private_company')">
            <el-option v-for="value in allUserList" :key="value.id" :value="value.id" :label="value.name"></el-option>
          </el-select>
        </div>
        <div class="form-item">
          <span class="label text-label">最近呼叫时长(秒)：</span>
          <div class="flex-center duration">
            <el-input class="duration-input" v-model="chatDurationMin" placeholder="最小时长" :style="{width: '90px'}" @change="loadData({ pageNum: 1 })">
            </el-input>
            <span class="split-line">-</span>
            <el-input class="duration-input" v-model="chatDurationMax" placeholder="最大时长" :style="{width: '90px'}" @change="loadData({ pageNum: 1 })">
            </el-input>
          </div>
        </div>
      </div>
      <el-button class="ml5" type="primary" @click="handleClearFilterClick">清空筛选条件</el-button>
    </div>

    <call-status-filter
      class="no-border"
      v-model="resultStatuses"
      @change="loadData({ pageNum: 1 })"/>

    <intent-level-filter
      class="no-border"
      :intentLevelTagId.sync="intentLevelTagId"
      :intentLevelCodes.sync="intentLevelCodes"
      @changeIntentLevelCodes="loadData({ pageNum: 1 })"
      />

    <div class="header header-sub">
      <el-collapse v-model="active"  accordion>
        <el-collapse-item name="search">
          <template slot="title">
           <el-button class="collapse-button" round><i class="el-icon-d-arrow-left" :class="[active ? 'up'  : 'down']"></i>{{active ? '收起高级搜索' : '展开高级搜索'}}</el-button>
          </template>
            <div class="collapse-filter">
                <div class="form-item">
                  <span class="label text-label">{{customerStr}}领取日期：</span>
                  <el-date-picker
                    v-model="customerReceiveDate"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="yyyy-MM-dd"
                    :style="{width: '230px'}"
                    @change="loadData({ pageNum: 1 })"
                  ></el-date-picker>
                </div>
                 <follow-status-filter
                    class="no-border"
                    v-model="followStatuses"
                    @change="loadData({ pageNum: 1 })"/>
                <div class="form-item">
                  <span class="label text-label">创建日期：</span>
                  <el-date-picker
                    v-model="createDate"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="yyyy-MM-dd"
                    :style="{width: '230px'}"
                    @change="loadData({ pageNum: 1 })"
                  ></el-date-picker>
                </div>
            </div>
            <div class="collapse-filter">
              <div class="form-item">
                <span class="label text-label">最近跟进日期：</span>
                <el-date-picker
                  v-model="lastFlowUpDate"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="yyyy-MM-dd"
                  :style="{width: '230px'}"
                  @change="loadData({ pageNum: 1 })"
                ></el-date-picker>
              </div>
              <div class="form-item">
                  <span class="label text-label">{{customerStr}}分组：</span>
                  <group-list-select v-model="customerGroup" :style="{width: '150px', marginLeft: '5px'}" @change="loadData({ pageNum: 1 })"></group-list-select>
                </div>
                <div class="form-item">
                  <span class="label">最后外呼任务：</span>
                  <el-select 
                    filterable
                    remote
                    clearable
                    reserve-keyword
                    :remote-method="requestRobotCallJobList"
                    v-model="lastRobotCallJobId" 
                    placeholder="请选择Ai外呼任务" 
                    :style="{width: '150px', marginLeft: '5px'}" 
                    @change="loadData({ pageNum: 1 })"
                    >
                    <el-option v-for=" item in filterRobotCallJobList" 
                      :key="item.robotCallJobId"
                      :label="item.name"
                      :value="item.robotCallJobId"></el-option>
                  </el-select>
                </div>
                <div class="form-item">
                  <span class="label text-label">{{customerStr}}来源： </span>
                  <el-select v-model="source" :placeholder="`请选择${customerStr}来源`" :style="{width: '225px', marginLeft: '5px'}" :clearable="true" @change="loadData({ pageNum: 1 })">
                    <el-option v-for="(value, key) in customerSourceEnum" :key="key" :value="key" :label="value"></el-option>
                  </el-select> 
                </div>
            </div>
            <div class="collapse-filter">
              <customer-label-filter 
                ref="customerLabelFilter"
                v-model="customerLevelTags"
                @change="loadData({ pageNum: 1 })"/>
            </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    

    <div class="table-top-action">
      <div class="action-left">
        <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
        <span class="checked-count ml5">已选中
          <span class="num">{{checkedCount}}</span>项
        </span>
        <SelectTableHeaders v-model="showTableHeaders" :tableHeaders="private_all_fields"></SelectTableHeaders>
      </div>
      <div class="action-left ml10">
        <el-button type="primary" plain @click="$router.push('/customer/whiteList')" v-if="hasAccess('crm_whiteList_view')">{{customerStr}}白名单</el-button>
        <el-button type="primary" plain @click="$router.push('/customer/customerGroup')" v-if="hasAccess('crm_group_view')">{{customerStr}}分组</el-button>
      </div>
      <div class="action-right">
        <div class="form-item ml0" v-if="hasAccess('crm_private_importToTask')">
          <!-- 导入到任务 -->
          <import-to-task @import="handleImportTask" v-model="taskForImport" :selectWidth="120"></import-to-task>
        </div>
        <!-- 批量加入白名单 -->
        <multi-addwhitelist-confirm
          class="ml10"
          @refresh="loadData"
          :multipleSelection="multipleSelection"
          :allChecked="allChecked"
          :searchContition="searchContition"
           customerPersonListType="PRIVATE_LIST"
        >
        </multi-addwhitelist-confirm>
        <el-button type="primary" class="right-item" @click="handleCreateClick" v-if="hasAccess('crm_private_addOrEdit')">新建{{customerStr}}</el-button>
        <el-button type="primary" class="right-item" @click="handleBatchImportClick" v-if="hasAccess('crm_private_importCus')">批量导入{{customerStr}}</el-button>
        <el-button type="primary" class="right-item" @click="handleBackToPublic" v-if="hasAccess('crm_private_backToPublic')">退回公海</el-button>
        <el-button type="primary" class="right-item" @click="handleBatchTrans" v-if="hasAccess('crm_private_transferOrDel')">批量转移</el-button>
        <!-- 批量删除 -->
        <multi-del-confirm
          class="ml10"
          :onSubmit="handleBatchDel"
          :multipleSelection="multipleSelection"
          v-if="hasAccess('crm_private_transferOrDel')"
        />
        <el-button type="primary" class="right-item" @click="handleExportCommand" v-if="hasAccess('crm_private_exportCus')">导出{{customerStr}}</el-button>
      </div>
    </div>

    <my-customer-list
      ref="table"
      :multipleSelection="multipleSelection"
      @edit="handleEditClick"
      @delete="loadData"
      @refresh="loadData"
      @transfer="handleTransferClick"
      @call="handleCallClick"
      @preview="handlePreviewClick"
      @totalSizeChange="handleTotalSizeChange"
      @selection-change="handleSelectionChange"
      @select="handleSelectChange"
      @select-all="handleSelectAll"
      @refreshTable="handleRefreshTable"
      :showTableHeaders="showTableHeaders"
    ></my-customer-list>

    <customer-dialog :visible.sync="customerVisible" page="private" :type="customerType" :defaultData="customerData" @success="loadData"></customer-dialog>

    <transfer-dialog
      :visible.sync="transferVisible"
      :customerPersonIds="transferPersonIds"
      :distributeType="allChecked ? 'BY_FILTER' : 'BY_SELECTION'"
      :paginationParams="searchContition"
      :total="checkedCount"
      @success="loadData"
    ></transfer-dialog>

    <call-dialog :visible.sync="callVisible" :customerData="customerData"></call-dialog>

    <contact-history-modal
      unit="位"
      :visible.sync="previewVisible"
      :defaultIndex="callRecordIndex"
      :loadTableData="loadData"
      :tableData="tableData"
      @edit-customer-success="loadData"
      @refreshLabel="loadLabel"

    >
    </contact-history-modal>
    <yw-import-csv-dialog
      title="导入"
      width="942px"
      v-if="importCustomerDialogVisible"
      :customerPersonListType="'PRIVATE_LIST'"
      :visible.sync="importCustomerDialogVisible"
      @update="refreshAfterImport"
    ></yw-import-csv-dialog>
  </div>
</template>

<script>
  import { OptionSearchInput } from 'yiwise-components'
  import multiDelConfirm from '@/components/multiDelConfirm'  
  import multiAddwhitelistConfirm from '@/components/multiAddwhitelistConfirm'
  import CallDialog from '@/components/callDialog'
  import GroupListSelect from '@/components/GroupListSelect'
  import ImportToTask from '@/components/ImportToTask'
  import ContactHistoryModal from '@/components/ContactHistoryModal'
  import SelectTableHeaders from '@/components/SelectTableHeaders'
  import callStatusFilter from '@/components/customer/callStatusFilter'
  import intentLevelFilter from '@/components/customer/intentLevelFilter'
  import followStatusFilter from '@/components/customer/followStatusFilter'
  import customerLabelFilter from '@/components/customer/customerLabelFilter'
  import CustomerDialog from '@/components/CustomerDialog'
  import TransferDialog from './TransferDialog'
  import MyCustomerList from './MyCustomerList'
  import { customerSourceEnum } from '@/utils/enum'
  import { exportCustomerPerson } from '@/api/task'
  import { getUserListPage } from '@/api/users'
  import { addCustomerToJob1, moveCustomerListToPublicSea, deleteCustomer } from '@/api/customer'
  import ywImportCsvDialog from '@/components/ywImportCsvDialog'
  import TableCheckAll from '@/mixins/tableCheckAll'
  import { optionList } from './enum'
  import * as taskAPI from '@/api/task'
  import { mapGetters } from 'vuex'
  import moment from 'moment'

  export default {
    name: 'PrivateSea',
    // 处理table全选的mixin
    mixins: [TableCheckAll],
    components: {
      ywImportCsvDialog,
      OptionSearchInput,
      callStatusFilter,
      intentLevelFilter,
      followStatusFilter,
      customerLabelFilter,
      MyCustomerList,
      CustomerDialog,
      TransferDialog,
      CallDialog,
      ContactHistoryModal,
      SelectTableHeaders,
      GroupListSelect,
      ImportToTask,
      multiDelConfirm,
      multiAddwhitelistConfirm
    },
    computed: {
      ...mapGetters(['private_all_fields', 'private_checked_fields', 'customerStr']),
      showTableHeaders: {
        set(v) {
          this.$store.commit('SET_PRIVATE_CHECKED_FIELDS', v)
        },
        get() {
          return this.private_checked_fields
        }
      },
      generalParams() {
        return {
          ...this.searchValue,
          earliestStartTime: this.lastCallTimeRange && this.lastCallTimeRange[0] ? moment(this.lastCallTimeRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined,
          latestStartTime: this.lastCallTimeRange && this.lastCallTimeRange[1] ? moment(this.lastCallTimeRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined,
          earliestCreationTime: this.createDate ? this.createDate[0] : undefined,
          latestCreationTime: this.createDate ? this.createDate[1] : undefined,
          chatDuration: this.chatDuration || undefined,
          chatDurationMin: +this.chatDurationMin || undefined,
          chatDurationMax: +this.chatDurationMax || undefined,
          earliestFollowTime: this.lastFlowUpDate ? this.lastFlowUpDate[0] : undefined,
          latestFollowTime: this.lastFlowUpDate ? this.lastFlowUpDate[1] : undefined,
          earliestAssignTime: this.customerReceiveDate ? this.customerReceiveDate[0] : undefined,
          latestAssignTime: this.customerReceiveDate ? this.customerReceiveDate[1] : undefined,
          customerGroupId: this.customerGroup || undefined,
          filterFollowUserId: this.filterFollowUserId || undefined,
          source: this.source || undefined,
          lastRobotCallJobId: this.lastRobotCallJobId || undefined
        }
      },
      searchContition() {
        return {
          ...this.generalParams,
          lastDialStatuses: this.resultStatuses,
          lastIntentLevelTagId: this.intentLevelCodes.length > 0 ? this.intentLevelTagId : undefined,
          lastIntentLevelCodes: this.intentLevelCodes,
          followStatuses: this.followStatuses,
          customerLevelTags: this.customerLevelTags
        }
      }
    },
    data() {
      const source = {}
      for (const key in customerSourceEnum) {
        if (key !== 'BACK_TO_PUBLIC') {
          source[key] = customerSourceEnum[key]
        }
      }
      return {
        followStatuses: [],
        resultStatuses: [],
        customerLevelTags:[],
        intentLevelTagId: undefined,
        intentLevelCodes: [],
        searchValue: undefined,
        createDate: undefined,
        lastFlowUpDate: undefined,
        customerReceiveDate: undefined,
        customerGroup: undefined,
        filterFollowUserId: undefined,
        source: undefined,
        lastRobotCallJobId:undefined,
        customerSourceEnum: source,
        chatDuration: undefined,
        chatDurationMin: undefined,
        lastCallTimeRange: undefined,
        chatDurationMax: undefined,
        taskList: [],
        taskForImport: {},
        multipleSelection: [], // 当前选中的table行
        // 客户dialog
        customerVisible: false,
        customerType: 'add',
        importCustomerDialogVisible: false,
        customerData: {},
        // 转移dialog
        transferVisible: false,
        transferPersonIds: [],
        // 拨打dialog
        callVisible: false,
        // 查看dialog
        previewVisible: false,
        optionList,
        callRecordIndex: -1,
        allUserList: [],
        tableData: [],
        filterRobotCallJobList:[],
        active:'' //折叠面板状态
      }
    },
    methods: {
      loadData(params = {}, cb) {
        const newParams = {
          ...this.searchContition,
          ...params
        }
        this.$refs.table.loadData(newParams, (tableData) => {
          this.tableData = tableData
          cb && cb()
        })
      },
      loadLabel() {
        this.customerLevelTags = []
        this.$refs.customerLabelFilter.queryCustomerLevelTag()
        this.loadData()
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
        // 这个函数时定义在mixin中，用于处理全选操作的
        this._handleSelectionChange && this._handleSelectionChange(val)
      },
      handleCreateClick() { // 新建客户
        this.customerVisible = true
        this.customerType = 'add'
      },
      handleEditClick(data) { // 编辑客户
        this.customerVisible = true
        this.customerType = 'edit'
        this.customerData = data
      },
      handleTransferClick(data) {
        this.transferVisible = true
        this.transferPersonIds = [data.customerPersonId]
      },
      handleCallClick(data) {
        this.customerData = data
        this.callVisible = true
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
      handleFilterFollowUserChange(val) {
        if (val === undefined || val === '') {
          this.getAllUserList()
          this.filterFollowUserId = undefined
        }

        this.loadData({ pageNum: 1 })
      },
      handleClearFilterClick() { // 清空筛选条件
        this.$refs.optionSearchInput.reset((params) => {
          this.searchValue = params
        })

        this.createDate = undefined
        this.lastFlowUpDate = undefined
        this.customerReceiveDate = undefined
        this.customerGroup = undefined
        this.filterFollowUserId = undefined
        this.source = undefined
        this.lastRobotCallJobId = undefined
        this.chatDuration = undefined
        this.chatDurationMin = undefined
        this.lastCallTimeRange = undefined
        this.chatDurationMax = undefined
        this.followStatuses = []
        this.resultStatuses = []
        this.customerLevelTags = []
        this.$refs.customerLabelFilter.reset()
        this.intentLevelCodes = []
        this.loadData()
      },
      handleImportTask() { // 导入到任务
        if (!this.taskForImport || !this.taskForImport.robotCallJobId) {
          this.$message.error('请先选择任务')
          return
        }

        if (!this.multipleSelection || this.multipleSelection.length === 0) {
          this.$message.error(`请至少选择一位${this.customerStr}`)
          return
        }

        if (this.allChecked) {
          this.importToTaskByFilters()
        } else {
          this.importToTaskByIds()
        }
      },
      async getAllUserList(searchWords) {
        const { data } = await getUserListPage({
          searchWords,
          pageNum: 1,
          pageSize: 20
        })

        this.allUserList = data.data.content
      },
      async importToTaskByIds() {
        const customerPersonIds = this.multipleSelection.map(item => item.customerPersonId)
        await addCustomerToJob1({
          customerPersonListType: 'PRIVATE_LIST',
          robotCallJobId: this.taskForImport.robotCallJobId,
          customerPersonIds
        })
        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success('操作成功！详细结果请在导入导出列表查看')
      },
      async importToTaskByFilters() {
        await addCustomerToJob1({
          customerPersonListType: 'PRIVATE_LIST',
          robotCallJobId: this.taskForImport.robotCallJobId,
          ...this.searchContition
        })
        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success('操作成功！详细结果请在导入导出列表查看')
      },
      handleExportCommand(commnad) { // 导出
        if (this.allChecked) {
          this.exportByFilter()
        } else {
          this.exportBySelect()
        }
      },
      async handleBatchDel() { // 批量删除
        let params
        const idList = this.multipleSelection.map(item => item.customerPersonId)

        if (!idList.length) {
          this.$message.error(`请选择需要删除的${this.customerStr}`)
          return
        }

        if (this.allChecked) {
          params = this.searchContition
        } else {
          params = {
            customerPersonIds: idList
          }
        }

        await deleteCustomer({
          customerPersonListType: 'PRIVATE_LIST',
          ...params
        })
        this.$message.success('删除成功')
        this.loadData()
      },
      async handleBatchAddWhiteList() { //批量加入白名单

      },
      async handleBackToPublic() {
        if (this.allChecked) {
          await moveCustomerListToPublicSea({
            ...this.searchContition
          })
        } else {
          if (!this.multipleSelection || this.multipleSelection.length === 0) {
            this.$message.error(`请先选择${this.customerStr}`)
            return
          }
          const customerPersonIds = this.multipleSelection.map(item => item.customerPersonId)
          await moveCustomerListToPublicSea({
            customerPersonIds
          })
        }

        this.$message.success('退回公海成功')
        this.loadData()
      },
      handleBatchTrans() { // 批量转移
        if (!this.multipleSelection || this.multipleSelection.length === 0) {
          this.$message.error(`请先选择${this.customerStr}`)
          return
        }

        if (!this.filterFollowUserId) {
          this.$message.error(`请先选择负责人`)
          return
        }

        const ids = this.multipleSelection.map(item => item.customerPersonId)
        this.transferVisible = true
        this.transferPersonIds = ids
      },
      async exportByFilter() { // 根据筛选条件导出
        await exportCustomerPerson({
          customerPersonListType: 'PRIVATE_LIST',
          ...this.searchContition
        })
        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success('操作成功！详细结果请在导入导出列表查看')
      },
      async exportBySelect() { // 导出选中客户
        const customerPersonIds = this.multipleSelection.map(item => item.customerPersonId)
        if (customerPersonIds.length === 0) {
          this.$message.error(`请选择需要导出的${this.customerStr}`)
          return
        }
        await exportCustomerPerson({
          customerPersonIds,
          customerPersonListType: 'PRIVATE_LIST'
        })

        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success('操作成功！详细结果请在导入导出列表查看')
      },
      handleBatchImportClick() { // 批量导入
        this.importCustomerDialogVisible = true
      },
      refreshAfterImport() {
        // 导入后刷新列表
        this.$nextTick(() => {
          this.loadData()
        })
      },
      requestRobotCallJobList(val) {
        //获取最后外呼任务
        taskAPI.getSimpleList({
          searchWords: val
        }).then(({ data }) => {
          this.filterRobotCallJobList = [{
            robotCallJobId: undefined,
            name: '全部任务'
          }, ...data.data]
        })
      }
      
    },
    mounted() {
      this.requestRobotCallJobList()
      this.getAllUserList()
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
      &.ml0 {
        margin-left: 0;
      }
      > .label {
        flex-shrink: 0;
        color: $--color-text-regular;
        font-size: $--font-size-small;
      }
      .duration {
        border: 1px solid #d8d8d8;
        border-radius: 4px
      }
      .duration-input  /deep/ .el-input__inner{
        border:none
      }
    }
    > .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      &.header-sub {
        position: relative;
        margin-top:16px;
        margin-bottom: 16px;
        padding: 0;
        border-top: $--border-base;
        background: #f7f7f7;
        .collapse-filter {
          display: flex;
          margin-top:10px;
          /deep/ .label.text-label {
            display: inline-block;
            width:90px;
            text-align: right;
          }
        }
        .header-filter {
          flex-wrap: wrap;
          .form-item {
            margin-bottom: 10px;
          }
        }
        .collapse-button {
          position:absolute;
          left:50%;
          transform: translateX(-50%);
          top:-10px;
          height: 24px !important;
          line-height: 22px !important;
        }
        .collapse-button:focus {
          color: #666;
          border: 1px solid #d8d8d8;
          background:#fff;
        }
        /deep/ .collapse-button +  i {
          display: none
        }
        .el-icon-d-arrow-left {
          margin-right:5px;
          transform: rotate(-90deg)
        }
        .el-icon-d-arrow-left.up {
          transform: rotate(90deg)
        }
        .el-icon-d-arrow-left.down {
          transform: rotate(-90deg)
        }
      }
      > .header-filter {
        display: flex;
        align-items: center;
      }
    }
    /deep/ .el-collapse {
      width: 100%;
      border-top:none;
    }
    /deep/ .el-collapse-item div[role=tab] {   
      height:0;
      .el-collapse-item__header {
        height:0
      }
    }
    /deep/ .el-collapse-item div[role=tabpanel] {   
      background:#f7f7f7
    }
    /deep/ .el-collapse-item div[role=tabpanel] .el-collapse-item__content {   
      padding:10px 0px
    }
  }

</style>

