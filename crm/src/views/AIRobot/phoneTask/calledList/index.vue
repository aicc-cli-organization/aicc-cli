<template>
  <div id="record-detail" class="yw-container private-sea">
    <div class="header">
      <div class="header-filter">
        <option-search-input :disabled="lastCallRecord" width="268px" optionWidth="115px" :option-list="optionList" @search="loadData(initialParams)" v-model="searchWords"></option-search-input>
        <el-select
          multiple
          collapse-tags
          v-model="filterResultStatuses"
          placeholder="通话状态"
          @change="loadData({
            resultStatuses: filterResultStatuses,
            robotCallJobId,
            pageNum: 1
          })"
        >
          <el-option v-for="item in constant.resultStatusMultipleOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-select
          v-model="filterIntentLevels"
          placeholder="最近意向等级"
          multiple
          collapse-tags
          @change="loadData({
            intentLevelCodes: filterIntentLevels,
            robotCallJobId,
            pageNum: 1
          })"
        >
          <el-option
            v-for="item in intentLevelOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
        <el-select :disabled="lastCallRecord"
          v-model="readStatus"
          placeholder="查看状态"
          @change="loadData({
            readStatus: readStatus || undefined,
            robotCallJobId,
            pageNum: 1
          })"
          :clearable="true"
        >
          <el-option v-for="(name, value) in readStatusEnum" :key="value" :value="value" :label="name"></el-option>
        </el-select>
        <el-checkbox class='remove-repeat' v-model='lastCallRecord'>{{customerStr}}信息去重</el-checkbox>
      </div>
      <span>
        <el-button type="primary" @click="onRefresh">
          <i class="iconfont icon-shuaxin const-icon-refresh"></i>刷新
        </el-button>
        <el-button type="primary" @click="clearFilter()">清空筛选条件</el-button>
      </span>
    </div>

    <div class="form-item">
      <span class="label">最近呼叫时长：</span>
      <div class="flex-center">
        <el-input v-model="chatDurationMin" placeholder="最小时长" :style="{width: '100px'}" @change="loadData(paginationParams)">
          <span class="input-suffix" slot="suffix">秒</span>
        </el-input>
        <span class="split-line">-</span>
        <el-input v-model="chatDurationMax" placeholder="最大时长" :style="{width: '100px'}" @change="loadData(paginationParams)">
          <span class="input-suffix" slot="suffix">秒</span>
        </el-input>
      </div>
    </div>
    <div class="form-item" v-if="fullStatsInfo.customerConcern">
      <el-select :disabled="lastCallRecord"
        :placeholder="`${customerStr}关注点`"
        v-model="customerConcern"
        @change="loadData({
          customerConcern,
          robotCallJobId,
          pageNum: 1
        })"
        multiple
        collapse-tags
      >
        <el-option v-for="(value, key) in fullStatsInfo.customerConcern" :key="key" :value="key" :label="key"></el-option>
      </el-select>
    </div>
    <div class='form-item'>
      <el-select :disabled="lastCallRecord"
        placeholder="挂断状态"
        v-model="hangupBy"
        @change="loadData({
          hangupBy: hangupBy || undefined,
          robotCallJobId,
          pageNum: 1
        })"
        clearable
      >
        <el-option v-for="(value, key) in hangupEnum" :key="key" :value="key" :label="value"></el-option>
      </el-select>
    </div>
    <div class="action">
      <div class="action-left">
        <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
        <span class="checked-count ml5">已选中
          <span class="num">{{checkedCount}}</span>项
        </span>
        <SelectTableHeaders v-model="showTableHeaders" :tableHeaders="tableHeaders" @headerChange="handleHeaderChange"></SelectTableHeaders>
      </div>
      <div class="action-right">
        <!-- 导入到任务 -->
        <import-to-task
          v-if="hasAccess('crm_callTask_addOrImportToTask')"
          class="inlineBlock mr10"
          @import="handleImportTask"
          v-model="taskForImport"
          :robotCallJobId="robotCallJobId">
        </import-to-task>

        <!-- 下载通话录音 -->
        <downloader-module
          v-if="hasAccess('crm_callTask_downAudio')"
          :allChecked="allChecked"
          :multipleSelection="multipleSelection"
          :paginationParams="paginationParams"
          type="completeCallList"
        ></downloader-module>
        <el-button type="primary" class="right-item" @click="exportCustomerPerson" v-if="hasAccess('crm_callTask_exportAudio')">导出通话记录</el-button>
        <el-button type="primary" class="right-item" @click="reImportCustomerListToTask" :disabled="!hasAccess('crm_callTask_addOrImportToTask')">重新添加到拨打任务</el-button>
        <el-tooltip effect="dark" placement="top-start">
          <div slot="content">已经存在于白名单和该任务未呼{{customerStr}}列表的{{customerStr}}无法被重新添加到任务，重拨{{customerStr}}会去重后添加到任务中。</div>
          <i class="el-icon-question icon-tip const-icon-tip"></i>
        </el-tooltip>
        <!-- <el-popover
            title="提示"
            trigger="hover"
            placement="right"
            width="420"
          >
          <i class="el-icon-question const-icon-tip" slot="reference"></i>
          <div>已经存在于该任务的{{customerStr}}和白名单{{customerStr}}无法被重新添加到任务，重拨{{customerStr}}会去重添加到任务中。</div>
        </el-popover> -->
      </div>
    </div>

    <new-pagination-table
      url="/apiEngine/callRecord/getInfoList"
      ref="table"
      :server="'engine'"
      :pageZero="false"
      :method="'post'"
      :headers="{
        'Content-Type': 'application/json'
      }"
      customClass="table-header-change-loading"
      :max-height="clientHeight - 308"
      :autoLoad="false"
      @totalSizeChange="handleTotalSizeChange"
      @selection-change="handleSelectionChange"
      @select="handleSelectChange"
      @select-all="handleSelectAll"
      @refreshTable="handleRefreshTable"
    >
      <el-table-column type="selection" width="37"></el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('callRecordId')" prop="callRecordId" label="通话记录id" width="80"></el-table-column>
      <el-table-column prop label="姓名" v-if="innerShowTableHeaders.includes('name')" width="">
        <template slot-scope="{ row }">
          <YiwiseUserName :name="row.customerPersonInfo ? row.customerPersonInfo.name : ''" :inWhiteList="row.inWhiteList"></YiwiseUserName>
        </template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('phoneNumber')" prop="calledPhoneNumber" label="联系电话" width="110"></el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('chatDuration')" prop="chatDuration" label="呼叫时长(秒)" width="120"></el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('resultStatus')" prop="resultStatus" label="最近通话状态" width="">
        <template slot-scope="scope">{{parseStatus(scope.row.resultStatus)}}</template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('hangupBy')" label="挂断状态" width="80">
        <template slot-scope="{ row }">{{row.resultStatus === 'ANSWERED' ? (hangupEnum[row.hangupBy] || emptyPlaceholder) : emptyPlaceholder}}</template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('startTime')" prop="startTime" label="通话时间" width="140"></el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('tenantPhoneNumber')" prop="tenantPhoneNumber" label="主叫号码" width="140">
        <template slot-scope="{ row }">{{row.phoneName ? `${row.phoneName}-${row.tenantPhoneNumber}` : row.tenantPhoneNumber}}</template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('realIntentLevel')" prop="realIntentLevelName" :label="`${customerStr}意向`" width=""></el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('customerConcern')" :label="`${customerStr}关注点`" width="120">
        <template slot-scope="scope">{{scope.row.customerConcern.length > 0 ? scope.row.customerConcern.toString() : '--'}}</template>
      </el-table-column>
      <el-table-column label="自定义变量" :show-overflow-tooltip="true" v-if="innerShowTableHeaders.includes('properties')" width="120">
        <template slot-scope="{ row }">
          <template v-if="!row.hasOwnProperty('properties')">{{emptyPlaceholder}}</template>
          <div v-else v-for="(value, key) in row.properties" :key="key" class="property-item">
            <span class="p-label">{{key}}</span>
            <span>{{value}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop label="微信推送人" v-if="innerShowTableHeaders.includes('wechatPushUserName')" width="120">
        <template slot-scope="scope">{{scope.row.wechatPushUserName || emptyPlaceholder }}</template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('customerGroupName')" :label="`${customerStr}分组`" width="">
        <template slot-scope="scope">{{scope.row.customerGroupName || emptyPlaceholder }}</template>
      </el-table-column>
      <el-table-column prop label="微信推送时间" v-if="innerShowTableHeaders.includes('wechatPushTime')" width="120">
        <template slot-scope="scope">{{scope.row.wechatPushTime || emptyPlaceholder }}</template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('transferType')" label="转接人工" width="">
        <template slot-scope="scope">{{constant.transferType[scope.row.transferType]}}</template>
      </el-table-column>
      <el-table-column label="转人工号码" prop="transferPhoneNumber" v-if="innerShowTableHeaders.includes('transferPhoneNumber')" width="120">
        <template slot-scope="scope">{{scope.row.transferPhoneNumber || emptyPlaceholder }}</template>
      </el-table-column>
      <el-table-column fixed="right" label="通话详情" width="120">
        <template slot-scope="scope">
          <el-button v-if="hasAccess('crm_callTask_callDetail')"
            @click="showCallDetail(scope.row, scope.$index)"
            type="text"
            style="position: relative"
            size="small"
          >查看通话详情
            <div class="dot" v-if="scope.row.read === 'NOT_READ'"></div>
          </el-button>
        </template>
      </el-table-column>
    </new-pagination-table>
    <call-record-detail-modal
      ref="modal"
      :visible.sync="callRecordDetailDialogVisible"
      :tableData="tableData"
      :defaultIndex="callRecordIndex"
      :loadTableData="loadData"
      :canEditCustomer="true"
      appType="crm"
      @edit-customer="handleEditCustomer"
    ></call-record-detail-modal>
    <customer-dialog :visible.sync="customerVisible" type="edit" :defaultData="editCustomerData" @success="handleEditSuccess"></customer-dialog>
  </div>
</template>

<script>
  import { CallRecordDetailModal } from 'yiwise-components'
  import OptionSearchInput from '../components/optionSearchInput'
  import NewPaginationTable from '@/components/NewPaginationTable'
  import YiwiseUserName from '@/components/YiwiseUserName'
  import SelectTableHeaders from '@/components/SelectTableHeaders'
  import ImportToTask from '@/components/ImportToTask'
  import CustomerDialog from '@/components/CustomerDialog'
  import * as constant from '@/utils/constant'
  import * as customerAPI from '@/api/customer'
  import CallRecordRequest from '@/mixins/callRecordRequest'
  import { mapGetters } from 'vuex'
  import { readStatusEnum, hangupEnum } from '@/utils/enum'
  import * as taskAPI from '@/api/task'
  import { emptyPlaceholder, customType } from '@/utils/constant'
  import TableCheckAll from '@/mixins/tableCheckAll'
  import { reAddCustomerToOtherJob } from '@/api/customer'
  import downloaderModule from '@/components/downloaderModule/index'
  import { setTableHeader, getTableHeader } from '@/utils'
  import { tableHeaders, optionList } from '../utils/enum'
  import { getIntentLevelTag } from '@/api/intentLevel'

  export default {
    name: 'recordDetail',
    mixins: [CallRecordRequest, TableCheckAll],
    components: {
      CallRecordDetailModal,
      YiwiseUserName,
      NewPaginationTable,
      OptionSearchInput,
      downloaderModule,
      SelectTableHeaders,
      ImportToTask,
      CustomerDialog
    },
    computed: {
      importToTaskTableData() {
        return this.multipleSelection.map((item) => {
          return {
            ...item,
            phoneNumber: item.calledPhoneNumber,
            name: item.customerPersonInfo ? item.customerPersonInfo.name : ''
          }
        })
      },
      ...mapGetters([
        'clientHeight', 'customerStr'
      ]),
      constant() {
        return constant
      },
      robotCallJobId() {
        return this.$store.state.taskV2.selectTaskId
      },
      intentLevelTagId() {
        return this.$store.state.taskV2.selectIntentLevelTagId
      },
      overviewJumpCalledWithCustomerCercorn() {
        return this.$store.state.taskV2.overviewJumpCalledWithCustomerCercorn
      },
      initialParams() {
        return {
          ...this.searchWords,
          robotCallJobId: this.robotCallJobId,
          pageNum: 1
        }
      },
      robotCallJobStatus() {
        return this.$store.state.task.robotCallJobStatus
      },
      paginationParams() {
        return {
          ...this.searchWords,
          robotCallJobId: this.robotCallJobId,
          customerGroupId: this.customerGroupId,
          resultStatuses: this.filterResultStatuses,
          intentLevelCodes: this.filterIntentLevels,
          readStatus: this.readStatus || undefined,
          hangupBy: this.hangupBy || undefined,
          customerConcern: this.customerConcern || [],
          followStatus: this.filterFollowStatus,
          chatDurationMin: +this.chatDurationMin || undefined,
          chatDurationMax: +this.chatDurationMax || undefined
        }
      },
      exportCustomerParams() {
        return this.paginationParams
      },
      fullStatsInfo() {
        return this.$store.state.taskV2.fullTaskInfo
      }
    },
    mounted() {
      this.getIntentLevelTag()
      this.innerShowTableHeaders = this.showTableHeaders
      this.loadData({
        robotCallJobId: this.robotCallJobId
      })
      if (this.overviewJumpCalledWithCustomerCercorn) {
        this.customerConcern = [this.overviewJumpCalledWithCustomerCercorn]
      }
    },
    watch: {
      robotCallJobId(val) {
        this.clearFilter()
        this.taskForImport = {}
      },
      robotCallJobStatus(val) {
        this.loadData({
          robotCallJobId: this.robotCallJobId
        })
      },
      overviewJumpCalledWithCustomerCercorn(val) {
        if (val) {
          this.clearFilter()
          this.customerConcern = [val]
        }
      },
      showTableHeaders(v) {
        this.loading = true

        setTimeout(() => {
          this.innerShowTableHeaders = v
        }, 100)

        setTimeout(() => {
          this.loading = false
        }, 500)
      },
      intentLevelTagId() {
        this.filterIntentLevels = []
        this.getIntentLevelTag()
      },
      lastCallRecord(val) {
        if (val) {
          this.searchWords = {
            calledPhoneNumber: undefined,
            callRecordId: undefined,
            customerPersonName: undefined,
          }
          this.readStatus = undefined
          this.customerConcern = []
          this.hangupBy = undefined
        }
        this.$nextTick(() => {
          this.loadData({
            ...this.paginationParams,
            lastCallRecord: val
          })
        })
      }
    },
    data() {
      return {
        optionList,
        searchWords: undefined,
        tableData: {},
        // 导入到任务dialog
        taskForImport: {},
        chatDurationMin: undefined,
        chatDurationMax: undefined,
        filterPhoneNumber: undefined,
        customerGroupId: undefined,
        filterResultStatuses: [],
        filterIntentLevels: [],
        readStatus: undefined,
        customerConcern: [],
        filterFollowStatus: undefined,
        previewVisible: false,
        callRecordDetailDialogVisible: false,
        hangupBy: undefined,
        callRecordIndex: -1,
        placeholder: '',
        customerData: {},
        emptyPlaceholder,
        readStatusEnum,
        hangupEnum,
        multipleSelection: [],
        intentLevelOptions: customType,
        userOrNumberValue: 'username',
        callDetailParams: {},
        showTableHeaders: getTableHeader('completedCustomerList') || Object.keys(tableHeaders),
        innerShowTableHeaders: [],
        tableHeaders,
        loading: false,
        customerVisible: false, // 是否显示编辑用户dialog
        editCustomerData: {},
        lastCallRecord: false // 是否去重
      }
    },
    methods: {
      isLastCallRecord() {
        const { resultStatuses = [], intentLevelCodes = [], chatDurationMin, chatDurationMax } = this.paginationParams
        console.log(resultStatuses, intentLevelCodes, chatDurationMin, chatDurationMax)
        return !!(resultStatuses.length || intentLevelCodes.length || chatDurationMin || chatDurationMax)
      },
      onRefresh() {
        this.loadData({
          robotCallJobId: this.robotCallJobId
        })
      },
      handleHeaderChange(v) {
        setTableHeader('completedCustomerList', v)
      },
      async handleImportTask() { // 导入到任务
        if (!this.taskForImport || !this.taskForImport.robotCallJobId) {
          this.$message.error('请先选择任务')
          return
        }
        if (!this.multipleSelection || this.multipleSelection.length === 0) {
          this.$message.error(`请至少选择一位${this.customerStr}`)
          return
        }
        if (this.allChecked) {
          await this.importToTaskByFilters()
        } else {
          await this.importToTaskByIds()
        }

        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success('操作成功！')
        this.$emit('update')
      },
      async importToTaskByIds() {
        const callRecordIds = this.multipleSelection.map(item => item.callRecordId)

        await reAddCustomerToOtherJob({
          intentLevelTagId: this.intentLevelTagId,
          lastCallRecord: this.lastCallRecord,
          callRecordIds,
          robotCallJobId: this.robotCallJobId,
          targetRobotCallJobId: this.taskForImport.robotCallJobId
        })
      },
      async importToTaskByFilters() {
        await reAddCustomerToOtherJob({
          intentLevelTagId: this.intentLevelTagId,
          lastCallRecord: this.lastCallRecord,
          robotCallJobId: this.robotCallJobId,
          ...this.paginationParams,
          targetRobotCallJobId: this.taskForImport.robotCallJobId
        })
      },
      getIntentLevelTag() {
        getIntentLevelTag({
          intentLevelTagId: this.intentLevelTagId
        }).then(({ data }) => {
          this.intentLevelOptions = data.data.details
        })
      },
      followStatusStyle(status) {
        return { 'color': {
          FOLLOW_UP: '#0abd77',
          AI_INITIAL_VISIT: '#1890ff',
          PEOPLE_INITIAL_VISIT: '#9d48f4'
        }[status] }
      },
      clearFilter() {
        this.searchWords = {
          calledPhoneNumber: undefined,
          callRecordId: undefined,
          customerPersonName: undefined
        }
        this.filterPhoneNumber = undefined
        this.customerGroupId = undefined
        this.filterResultStatuses = []
        this.filterIntentLevels = []
        this.filterFollowStatus = undefined
        this.readStatus = undefined
        this.customerConcern = []
        this.chatDurationMin = undefined
        this.chatDurationMax = undefined
        this.hangupBy = undefined
        this.loadData(this.paginationParams)
      },
      async exportCustomerPerson() {
        if (!this.allChecked) {
          const callRecordIds = this.multipleSelection.map(item => item.callRecordId)
          if (callRecordIds.length === 0) {
            this.$message.error(`请选择需要导出的${this.customerStr}`)
            return
          }

          await taskAPI.exportCustomerPerson({
            intentLevelTagId: this.intentLevelTagId,
            lastCallRecord: this.lastCallRecord,
            robotCallJobId: this.robotCallJobId,
            callRecordIds
          }, 'CALLED_LIST')
        } else {
          await taskAPI.exportCustomerPerson({
            intentLevelTagId: this.intentLevelTagId,
            lastCallRecord: this.lastCallRecord,
            ...this.exportCustomerParams,
            robotCallJobId: this.robotCallJobId
          }, 'CALLED_LIST')
        }

        this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        this.$message.success('操作成功！详细结果请在导入导出列表查看')
      },
      showCallDetail(row, index) {
        this.callRecordDetailDialogVisible = true
        this.callRecordIndex = index
        this.customerData = row
      },
      loadData(params = {}) {
        if (!params.robotCallJobId) return
        params.lastCallRecord = this.lastCallRecord
        this.$refs.table.loadData(params, (tableData) => {
          this.tableData = tableData
        })
      },
      parseStatus(status) {
        return constant.resultStatus[status]
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
        // 这个函数时定义在mixin中，用于处理全选操作的
        this._handleSelectionChange && this._handleSelectionChange(val)
      },
      async reImportCustomerListToTask() {
        if (!this.allChecked) {
          const customerPersonIds = this.multipleSelection.map(item => item.customerPersonId)
          if (customerPersonIds.length === 0) {
            this.$message.error(`请选择${this.customerStr}`)
            return
          }
          // 导入到当前任务
          await customerAPI.reAddCustomerToJob({
            intentLevelTagId: this.intentLevelTagId,
            lastCallRecord: this.lastCallRecord,
            robotCallJobId: this.robotCallJobId,
            customerPersonIds,
            reAdd: true
          })
        } else {
          // 导入到当前任务
          await customerAPI.reAddCustomerToJob({
            intentLevelTagId: this.intentLevelTagId,
            lastCallRecord: this.lastCallRecord,
            ...this.exportCustomerParams,
            robotCallJobId: this.robotCallJobId
          })
        }

        this.$message.success('操作成功！')
        this.$emit('update')
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
        this.loadData({
          robotCallJobId: this.robotCallJobId
        })
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  @import '~src/styles/variables.scss';
  #record-detail {
    background: #fff;
    padding-top: 10px;
  }
  .private-sea {
    > .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      .const-icon-refresh {
        font-size: 12px;
        margin-right: 5px;
      }
    }
  }
  .bottom-pagination{
    height: 46px;
    border-top: 1px solid #dadadb;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .pagination-container {
    width: 500px;
    margin: 8px auto;
  }
  .el-input--medium .el-input__inner /deep/ {
    height: 28px !important;
  }
  .el-input--medium .el-input__icon /deep/ {
    line-height: 28px !important;
  }
  .el-dialog__header /deep/{
    margin-bottom: 0;
  }
  .w100{
    width: 100px;
    vertical-align: top;
    margin-right: -3px;
  }
  .w100 .el-input__inner /deep/{
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .w200{
    width: 200px;
    vertical-align: top;
  }
  .w200 .el-input__inner /deep/{
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .w150{
    width: 150px;
    height: 30px;
    margin-right: 16px;
  }
  .mt10.mb10 .el-button {
    line-height: 0;
  }
  .mt10.mb10 .el-tag {
    line-height: 0;
  }
  .el-input--medium .el-input__inner {
    height: 28px !important;
  }
  .el-input--medium .el-input__icon {
    line-height: 28px !important;
  }
  .el-select{
    width: 150px;
  }
  .left-area{
    background: #fff;
  }
  .clear {
    margin-left: 5px;
  }
  .dot{
    height: 6px;
    width: 6px;
    border-radius: 3px;
    background: red;
    position: absolute;
    top: 5px;
    right: -10px;
  }
  .action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    > .action-left {
      display: flex;
      align-items: center;
      > .el-checkbox {
        display: flex;
        align-items: center;
        /deep/ .el-checkbox__inner {
          margin-top: 4px;
        }
        /deep/ .el-checkbox__label {
          // font-size: 12px;
          padding-left: 5px;
        }
      }
      > .checked-count {
        margin-top: 2px;
        .num {
          color: $--color-primary;
        }
      }
    }
    > .action-right {
      display: flex;
      > .right-item {
        margin-left: 10px;
      }
      .const-icon-tip {
        line-height: 32px;
        font-size: 18px;
        color: #666666;
      }
    }
  }
  .form-item {
    display: inline-flex;
    align-items: center;
    margin-left: 20px;
    > .label {
      flex-shrink: 0;
      color: $--color-text-regular;
      font-size: $--font-size-small;
    }
  }
  .remove-repeat {
    margin-left: 10px;
  }
</style>
