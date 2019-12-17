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
          option-width="110px"
        ></option-search-input>
        <span class="label" style="margin-left:20px;">查看状态：</span>
        <el-select v-model="readStatus" placeholder="请选择查看状态" class="ml5" :style="{width: '150px'}" @change="refresh" :clearable="true">
          <el-option v-for="(name, value) in readStatusEnum" :key="value" :value="value" :label="name"></el-option>
        </el-select>
      </div>
      <el-button type="primary" @click="handleClearFilterClick">清空筛选条件</el-button>
    </div>

    <div class="header header-sub">
      <div class="header-filter">
        <div class="form-item">
          <span class="label">通话状态：</span>
          <el-select v-model="resultStatuses" placeholder="最近通话状态" :style="{width: '150px'}" @change="refresh" :clearable="true">
            <el-option v-for="(value, key) in mngResultStatus" :key="key" :value="key" :label="value"></el-option>
          </el-select>
        </div>
        <div class="form-item">
          <span class="label">最近呼叫时长：</span>
          <div class="flex-center duration">
            <el-input class="duration-input"  v-model="chatDurationMin" placeholder="最小时长" :style="{width: '100px'}" @change="handleChatMinChange">
            </el-input>
            <span class="split-line">-</span>
            <el-input class="duration-input"  v-model="chatDurationMax" placeholder="最大时长" :style="{width: '100px'}" @change="handleChatMaxChange">
            </el-input>
          </div>
        </div>
        <!-- <div class="form-item">
          <span class="label">批量外呼：</span>
          <el-select v-model="callOutStatus" placeholder="状态选择" class="ml5" :style="{width: '150px'}" @change="refresh" :clearable="true">
            <el-option v-for="(name, value) in noticeStatusEnum" :key="value" :value="value" :label="name"></el-option>
          </el-select>
          <el-tooltip effect="dark" placement="top-start">
            <div slot="content">已通知：批量人工外呼已接通并发送通知。<br>未通知：批量人工外呼未接通。<br>通知失败：批量人工外呼已接通，但无在线坐席接收通知。</div>
            <i class="el-icon-question icon-tip const-icon-tip"></i>
          </el-tooltip>
        </div> -->
        <div class="form-item">
          <span class="label">转接坐席：</span>
          <el-select v-model="csAnswer" placeholder="状态选择" class="ml5" :style="{width: '150px'}" @change="refresh" :clearable="true">
            <el-option v-for="(name, value) in transferStatus" :key="value" :value="value" :label="name"></el-option>
          </el-select>
        </div>
        <div class="form-item">
          <span class="label">接入人员：</span>
          <el-select @change="refresh"  :clearable="true" filterable :style="{width: '150px', marginLeft: '5px'}" v-model="answerSit" placeholder="接入人员">
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
        <div class="form-item">
          <el-checkbox class='remove-repeat' v-model='isRealIntent'>人工意向分类</el-checkbox>
        </div>
        <div class="form-item">
          <span class="label">呼叫时间：</span>
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
          ></el-date-picker>
        </div>
      </div>
    </div>

    <div class="table-top-action">
      <div class="action-left">
        <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
        <span class="checked-count ml5">已选中
          <span class="num">{{checkedCount}}</span>项
        </span>
        <SelectTableHeaders v-model="showTableHeaders" :tableHeaders="tableHeaders" @headerChange="handleHeaderChange"></SelectTableHeaders>
      </div>
      <div class="action-left ml15">
        <el-button type="primary" plain @click="$router.push('/customer/whiteList')" v-if="hasAccess('crm_whiteList_view')">{{customerStr}}白名单</el-button>
        <el-button type="primary" plain @click="$router.push('/customer/customerGroup')" v-if="hasAccess('crm_group_view')">{{customerStr}}分组</el-button>
      </div>
      <div class="action-right">
        <div class="f12 right ml10" v-if="hasAccess('crm_dialHistory_downAudio')">
          <downloader-module
            :allChecked="allChecked"
            :multipleSelection="multipleSelection"
            :paginationParams="paginationParams"
            :type="type"
            tag="callOutSide"
          ></downloader-module>
        </div>
      </div>
    </div>

    <sit-list
      ref="table"
      :showTableHeaders="showTableHeaders"
      :multipleSelection="multipleSelection"
      @preview="handlePreviewClick"
      @showCallDetail="handleShowCallDetail"
      @totalSizeChange="handleTotalSizeChange"
      @selection-change="handleSelectionChange"
      @select="handleSelectChange"
      @select-all="handleSelectAll"
      @refreshTable="handleRefreshTable"
    ></sit-list>

    <contact-history-modal
      tag="callOutSide"
      unit="通"
      :visible.sync="previewVisible"
      :defaultIndex="callRecordIndex"
      :loadTableData="loadData"
      :tableData="tableData"
      :downloadAudio="hasAccess('crm_dialHistory_downAudio')"
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
      tag="callOutSide"
      @edit-customer="handleEditCustomer"
      width="1066px"
    ></call-record-detail-modal>
    <customer-dialog :visible.sync="customerVisible" type="edit" :defaultData="editCustomerData" @success="handleEditSuccess"></customer-dialog>
  </div>
</template>

<script>
  import { OptionSearchInput, CallRecordDetailDialog, CallRecordDetailModal } from 'yiwise-components'
  import downloaderModule from '@/components/downloaderModule/index'
  import SelectTableHeaders from '@/components/SelectTableHeaders'
  import CustomerDialog from '@/components/CustomerDialog'
  import ContactHistoryModal from '@/components/ContactHistoryModal'
  import sitList from './sitList'
  import { readStatusEnum, noticeStatusEnum, transferStatus } from '@/utils/enum'
  import { getSimpleList } from '@/api/task'
  import { getCsGroupAndStaff } from '@/api/numberpool'
  import * as talkAPI from '@/api/talk'
  import TableCheckAll from '@/mixins/tableCheckAll'
  import { tableHeadersForSit, optionList, resultStatusMultipleOptions } from './enum'
  import { chartDurationManager } from './utils'
  import { setTableHeader, getTableHeader } from '@/utils'
  import { resultStatus } from '@/utils/constant'
  import { mapGetters } from 'vuex'

  export default {
    // 处理table全选的mixin
    mixins: [TableCheckAll],
    components: {
      CallRecordDetailDialog,
      OptionSearchInput,
      sitList,
      downloaderModule,
      SelectTableHeaders,
      CallRecordDetailModal,
      ContactHistoryModal,
      CustomerDialog
    },
    computed: {
      ...mapGetters(['customerFields_private', 'customerStr']),
      intentLevelDisabled() {
        return this.dialogFlowId || this.robotCallJobId
      },
      mngResultStatus() {
        const rs  = {}
        for (const key in resultStatus) {
          if (key !== 'TRANSFER_ARTIFICIAL') {
            rs[key] = resultStatus[key]
          }
        }

        return rs
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
          csStaffGroupId: this.answerSit && this.answerSit.includes('group') ? this.answerSit.split('group')[1] : undefined,
          csStaffId: this.answerSit && this.answerSit.includes('staff') ? this.answerSit.split('staff')[1] : undefined,
          earliestCreationTime: this.createDate ? this.createDate[0] : undefined,
          latestCreationTime: this.createDate ? this.createDate[1] : undefined,
          customerGroupId: this.customerGroup || undefined,
          robotCallJobId: this.robotCallJobId || undefined,
          readStatus: this.readStatus || undefined,
          csTransferNotify: this.callOutStatus || undefined,
          csAnswer: this.csAnswer || undefined,
          chatDuration: this.chatDuration || undefined,
          chatDurationMin: +this.chatDurationMin || undefined,
          chatDurationMax: +this.chatDurationMax || undefined
        }
      },
      paginationParams() {
        return {
          ...this.generalParams,
          resultStatuses: this.resultStatuses ? [this.resultStatuses] : undefined,
          intentLevelTagId: this.intentLevelCodes.length > 0 ? this.intentLevelTagId : undefined,
          intentLevelCodes: this.intentLevelCodes
        }
      },
      tableHeaderKey() {
        return this.type + '1'
      }
    },
    watch: {
      dialogFlowId: {
        deep: true,
        handler: function handler(val) {
          if (val === undefined) {
            return
          }
          const intentLevelTagId = this.dialogFlowList.filter((item) => {
            return item.id === this.dialogFlowId
          })[0].intentLevelTagId
          this.$set(this, 'intentLevelTagId', intentLevelTagId)
          this.$set(this, 'intentLevelCodes', [])
        }
      },
      robotCallJobId: {
        deep: true,
        handler: function handler(val) {
          if (val === undefined) {
            return
          }
          const intentLevelTagId = this.taskList.filter((item) => {
            return item.id === this.robotCallJobId
          })[0].intentLevelTagId
          this.$set(this, 'intentLevelTagId', intentLevelTagId)
          this.$set(this, 'intentLevelCodes', [])
        }
      },
      isRealIntent(val) {
         this.$nextTick(()=> {
          this.loadData({
            realIntent:val===true?val:undefined
          })
        })
      }
    },
    data() {
      return {
        type: 'CS_CALL_OUT',
        resultStatuses: undefined,
        resultStatus,
        transferStatus,
        intentLevelTagId: undefined,
        intentLevelCodes: [],
        dialogFlowId: undefined,
        searchWords: undefined,
        createDate: undefined,
        customerGroup: undefined,
        customerSource: undefined,
        robotCallJobId: undefined,
        readStatus: undefined,
        csAnswer: undefined,
        callOutStatus: undefined,
        answerSits:[],
        answerSit: undefined,
        chatDuration: undefined,
        chatDurationMin: undefined,
        chatDurationMax: undefined,
        callRecordDetailDialogVisible: false,
        readStatusEnum,
        noticeStatusEnum,
        taskList: [],
        showTableHeaders: [],
        tableHeaders: tableHeadersForSit,
        taskForImport: {},
        dialogFlowList: [],
        multipleSelection: [], // 当前选中的table行
        customerData: {},
        // 查看dialog
        previewVisible: false,
        callRecordIndex: -1,
        optionList,
        resultStatusMultipleOptions,
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
      handleSelectionChange(val) {
        this.multipleSelection = val
        // 这个函数时定义在mixin中，用于处理全选操作的
        this._handleSelectionChange && this._handleSelectionChange(val)
      },
      handleHeaderChange(v) {
        setTableHeader(this.tableHeaderKey, v)
      },
      handleShowCallDetail(row, index) {
        var tableData = this.$refs.table.$refs.table.tableData
        for (let i = 0; i < tableData.length; i++) {
          if (tableData[i].csRecordId === row.csRecordId) {
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
      async loadCsStaffGroup() {  //加载坐席和坐席组下拉列表
        try {
          const { data } = await getCsGroupAndStaff({})
          if (data) {
            this.answerSits = data.data || []
          }
        } catch (error) {
          return
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
        this.callOutStatus = undefined
        this.csAnswer = undefined
        this.answerSit = undefined
        this.chatDuration = undefined
        this.chatDurationMin = undefined
        this.chatDurationMax = undefined
        this.intentLevelCodes = []
        this.resultStatuses = undefined
        this.isRealIntent = false
        this.refresh()
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
      this.showTableHeaders = getTableHeader(this.tableHeaderKey) || Object.keys(tableHeadersForSit)

      this.requestDialogFlowList()
      this.loadTaskList()
      this.loadCsStaffGroup()
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
      .const-icon-tip {
        line-height: 32px;
        font-size: 18px;
        color: #666666;
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
        padding: 0 0 14px 0;
        .header-filter {
          flex-wrap: wrap;
        }
      }
      > .header-filter {
        display: flex;
        align-items: center;
      }
    }
  }
</style>
