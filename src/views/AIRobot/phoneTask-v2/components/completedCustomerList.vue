<template>
  <div id="record-detail" class="yw-container private-sea">
    <div class="header">
      <div class="header-filter">
        <option-search-input :disabled="lastCallRecord" width="268px" optionWidth="115px" :option-list="optionList" @search="loadData(initialParams)" v-model="searchWords"></option-search-input>
        <el-tooltip v-if="filterResultStatuses.includes('CALL_LOSS') || filterResultStatuses.includes('TRANSFER_ARTIFICIAL')" placement="top">
          <div slot="content">
            <div v-if="filterResultStatuses.includes('CALL_LOSS')">因开启多并发，导致{{customerStr}}等待时挂机而产生的呼叫损失。</div>
            <div v-if="filterResultStatuses.includes('TRANSFER_ARTIFICIAL')">转人工时因坐席繁忙，导致未接起{{customerStr}}电话而产生的呼叫损失。</div>
          </div>
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
            <el-option v-if="enableConcurrency" key="CALL_LOSS" label="多并发呼损" value="CALL_LOSS"></el-option>
            <el-option v-if="hasTransferPhoneNumber" key="TRANSFER_ARTIFICIAL" label="转人工呼损" value="TRANSFER_ARTIFICIAL"></el-option>
          </el-select>
        </el-tooltip>
        <el-select
          v-else
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
          <el-option v-if="enableConcurrency" key="CALL_LOSS" label="多并发呼损" value="CALL_LOSS"></el-option>
          <el-option v-if="hasTransferPhoneNumber" key="TRANSFER_ARTIFICIAL" label="转人工呼损" value="TRANSFER_ARTIFICIAL"></el-option>
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
      </div>
      <span>
        <el-button type="primary" @click="onRefresh">
          <i class="iconfont icon-shuaxin const-icon-refresh"></i>刷新
        </el-button>
        <el-button type="primary" @click="clearFilter()">清空筛选条件</el-button>
      </span>
    </div>

    <div class="form-item ml10">
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
    <div class="form-item" v-if="robotCallJobDetail.csStaffGroupId && humanIntervention">
      <span class="label text-label">人工介入：</span>
      <el-select v-model="csTransferNotify" placeholder="状态选择" :style="{width: '150px'}" @change="loadData({...paginationParams, pageNum: 1})" clearable>
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
      <el-select v-model="answerSit" placeholder="介入人员" filterable :style="{width: '150px', marginLeft: '5px'}" @change="loadData({...paginationParams, pageNum: 1})" clearable>
        <el-option-group
          v-for="group in answerSits"
          :key="group.label"
          :label="group.label === 'group' ? '坐席组' : group.label === 'phoneNumber' ? '手机号' : '坐席'">
          <el-option
            v-for="item in group.options"
            :key="item.id"
            :label="item.value"
            :value="group.label + (group.label === 'phoneNumber' ? item.value : item.id)">
          </el-option>
        </el-option-group>
      </el-select>
    </div>
    <div class="form-item">
      <el-select
        v-model="transferType"
        placeholder="转接人工状态"
        :style="{width: '150px'}"
        v-if="humanService"
        @change="loadData({...paginationParams, pageNum: 1})"
        clearable>
        <el-option :value="'TRANSFERED'" :label="'已转人工'"></el-option>
        <el-option :value="'NO_TRANSFER'" :label="'无转人工'"></el-option>
      </el-select>
    </div>
    <div class="form-item-wrap">
      <div class="form-item ml10">
        <span class="label">呼叫时间：</span>
        <el-date-picker
          v-model="createDate"
          type="datetimerange"
          range-separator="-"
          align="right"
          time-arrow-control
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          :style="{width: '360px'}"
          @change="loadData({...paginationParams, pageNum: 1})"
        />
      </div>
      <el-checkbox class='remove-repeat' v-model='lastCallRecord'>{{customerStr}}信息去重</el-checkbox>
      <el-checkbox @change="handleIntentChange" :disabled="lastCallRecord" class='remove-repeat' v-model='isRealIntent'>人工意向分类</el-checkbox>
      <el-select
        placeholder="选择自动重拨次数"
        v-model="redialTimes"
        :disabled="!lastCallRecord"
        :clearable="true"
        @change="loadData({...paginationParams, pageNum: 1})"
      >
        <el-option
          v-for="item in redialTimesOptions"
          :key="item"
          :value="item"
          :label="item + '次'"
        >
        </el-option>
      </el-select>
      <el-tooltip placement="top" :content="`勾选${customerStr}信息去重后可选`">
        <i class="el-icon-question const-icon-tip"></i>
      </el-tooltip>
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
      class="table"
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
      <el-table-column type="selection" width="40"></el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('callRecordId')" label="通话记录id" width="80">
        <template slot-scope="{ row }">
          {{row.callRecordId}}
        </template>
      </el-table-column>
      <el-table-column prop label="姓名" v-if="innerShowTableHeaders.includes('name')" width="150">
        <template slot-scope="{ row }">
          <div class="username-mood_container">
            <YiwiseUserName
              :name="row.customerPersonInfo ? row.customerPersonInfo.name : ''"
              :inWhiteList="row.inWhiteList"
              :inShareWhiteList="row.inShareWhiteList"
            ></YiwiseUserName>
            <gender-info :gender="row.customerPersonInfo ? row.customerPersonInfo.gender : ''"></gender-info>
            <mood-info :mood="row.emotion"></mood-info>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('phoneNumber')" prop="calledPhoneNumber" label="联系电话" width="110"></el-table-column>
      <el-table-column
        v-if="isAdmin"
        label="是否使用一知ASR"
        width="120"
      >
        <template slot-scope="{ row }">
          {{ row.useYiwiseAsr ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="性别" width="90">
        <template slot-scope="{ row }">
          {{ genderEnum[row.customerPersonGender] || emptyPlaceholder }}
          <!-- <span class="recognize" v-if="row.recognizeGender && row.recognizeGender !== 'UNKNOWN' && row.recognizeGender !== row.customerPersonGender">
            --
            {{genderEnum[row.recognizeGender]}}
          </span> -->
        </template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('chatDuration')" prop="chatDuration" label="呼叫时长(秒)" width="120"></el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('resultStatus')" prop="resultStatus" label="最近通话状态" width="">
        <template slot-scope="scope">{{parseStatus(scope.row.resultStatus)}}</template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('hangupBy')" label="挂断状态" width="80">
        <template slot-scope="{ row }">{{row.resultStatus === 'ANSWERED' ? (hangupEnum[row.hangupBy] || emptyPlaceholder) : emptyPlaceholder}}</template>
      </el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('startTime')" prop="startTime" label="通话时间" width="140"></el-table-column>
      <el-table-column v-if="innerShowTableHeaders.includes('redialTimes')" prop="redialTimes" label="自动重拨次数" width="100"></el-table-column>
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
      <el-table-column v-if="humanService" label="转接人工" width="">
        <template slot-scope="scope">{{constant.transferType[scope.row.transferType]}}</template>
      </el-table-column>
      <el-table-column label="转人工坐席" prop="transferPhoneNumber" v-if="humanService" width="120">
        <template slot-scope="scope">{{scope.row.transferPhoneNumber || emptyPlaceholder }}</template>
      </el-table-column>
      <el-table-column v-if="humanIntervention" label="请求人工介入" width="100">
        <template slot-scope="scope">{{noticeStatusEnum[scope.row.csTransferNotify] || emptyPlaceholder}}</template>
      </el-table-column>
      <el-table-column v-if="humanIntervention" label="是否监听" width="">
        <template slot-scope="scope">{{scope.row.csMonitorFlag === 1 ? '是' : '否'}}</template>
      </el-table-column>
      <el-table-column v-if="humanIntervention" label="是否切入" width="">
        <template slot-scope="scope">{{scope.row.csTransferAccept === 1 ? '是' : '否'}}</template>
      </el-table-column>
      <el-table-column v-if="humanIntervention" label="介入人员" width="">
        <template slot-scope="scope">
          {{(
            (scope.row.csStaffName || '') + (scope.row.csStaffGroupName ? '(' + scope.row.csStaffGroupName + ')' : '')
          ) || emptyPlaceholder}}
        </template>
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
      :customerFields_private="customerFields_private"
      :tableData="tableData"
      :defaultIndex="callRecordIndex"
      :loadTableData="loadData"
      :canEditCustomer="true"
      appType="crm"
      @edit-customer="handleEditCustomer"
      width="1066px"
    ></call-record-detail-modal>
    <customer-dialog :visible.sync="customerVisible" type="edit" :defaultData="editCustomerData" @success="handleEditSuccess"></customer-dialog>
  </div>
</template>

<script>
  import { CallRecordDetailModal, MoodInfo, GenderInfo } from 'yiwise-components'
  import OptionSearchInput from './optionSearchInput'
  import NewPaginationTable from '@/components/NewPaginationTable'
  import YiwiseUserName from '@/components/YiwiseUserName'
  import SelectTableHeaders from '@/components/SelectTableHeaders'
  import ImportToTask from '@/components/ImportToTask'
  import CustomerDialog from '@/components/CustomerDialog'
  import * as constant from '@/utils/constant'
  import * as customerAPI from '@/api/customer'
  import CallRecordRequest from '@/mixins/callRecordRequest'
  import { mapGetters } from 'vuex'
  import { readStatusEnum, hangupEnum, noticeStatusEnum, genderEnum } from '@/utils/enum'
  import * as taskAPI from '@/api/task'
  import { emptyPlaceholder, customType } from '@/utils/constant'
  import TableCheckAll from '@/mixins/tableCheckAll'
  import { getCsGroupAndStaff } from '@/api/numberpool'
  import { reAddCustomerToOtherJob } from '@/api/customer'
  import downloaderModule from '@/components/downloaderModule/index'
  import { setTableHeader, getTableHeader } from '@/utils'
  import { tableHeaders, optionList } from '../config/enum'
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
      CustomerDialog,
      MoodInfo,
      GenderInfo
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
        'clientHeight', 'customerFields_private', 'humanIntervention', 'humanService', 'customerStr'
      ]),
      robotCallJobDetail() {
        return this.$store.state.taskV2.taskDetail
      },
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
      enableConcurrency() {
        return this.$store.state.taskV2.taskDetail.enableConcurrency
      },
      hasTransferPhoneNumber() {
        return this.$store.state.taskV2.taskDetail.transferPhoneNumber && this.$store.state.taskV2.taskDetail.transferPhoneNumber.length
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
        const csStaffGroupId = this.answerSit && this.answerSit.includes('group') ? this.answerSit.split('group')[1] : undefined
        const csStaffId = this.answerSit && this.answerSit.includes('staff') ? this.answerSit.split('staff')[1] : undefined
        
        return {
          ...this.searchWords,
          transferType: this.transferType || undefined,
          csTransferNotify: this.csTransferNotify || undefined,
          robotCallJobId: this.robotCallJobId,
          customerGroupId: this.customerGroupId,
          resultStatuses: this.filterResultStatuses,
          intentLevelCodes: this.filterIntentLevels,
          readStatus: this.readStatus || undefined,
          hangupBy: this.hangupBy || undefined,
          customerConcern: this.customerConcern || [],
          followStatus: this.filterFollowStatus,
          chatDurationMin: +this.chatDurationMin || undefined,
          chatDurationMax: +this.chatDurationMax || undefined,
          csStaffGroupId: csStaffGroupId === '0' ? undefined : csStaffGroupId || undefined,
          csStaffId: csStaffId === '0' ? undefined : csStaffId || undefined,
          realIntent: this.isRealIntent === true ? true : undefined,
          transferPhoneNumber: this.answerSit && this.answerSit.includes('phoneNumber') ? this.answerSit.split('phoneNumber')[1] : undefined,
          earliestCreationTime: this.createDate ? this.createDate[0] : undefined,
          latestCreationTime: this.createDate ? this.createDate[1] : undefined,
          redialTimes: typeof this.redialTimes === 'undefined' ? undefined : this.redialTimes
        }
      },
      exportCustomerParams() {
        return this.paginationParams
      },
      fullStatsInfo() {
        return this.$store.state.taskV2.fullTaskInfo
      },
      isAdmin() {
        return this.$route.query.isAdmin === 'true'
      }
    },
    mounted() {
      this.getCsGroupAndStaff()
      this.getIntentLevelTag()
      this.getRedialLimit()
      this.innerShowTableHeaders = this.showTableHeaders
      if (this.overviewJumpCalledWithCustomerCercorn) {
        this.customerConcern = [this.overviewJumpCalledWithCustomerCercorn]
      }
      this.loadData({
        robotCallJobId: this.robotCallJobId
      })
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
          this.customerConcern = [val]
          this.loadData({
            robotCallJobId: this.robotCallJobId
          })
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
            customerPersonName: undefined
          }
          this.readStatus = undefined
          this.customerConcern = []
          this.hangupBy = undefined
          this.isRealIntent = false
        }
        this.$nextTick(() => {
          this.loadData({
            ...this.paginationParams,
            lastCallRecord: val,
            realIntent: this.isRealIntent
          })
        })
      }
    },
    data() {
      return {
        optionList,
        noticeStatusEnum,
        answerSits: [],
        answerSit: undefined,
        searchWords: undefined,
        csTransferNotify: undefined,
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
        transferType: undefined,
        lastCallRecord: false, // 是否去重
        isRealIntent: false, // 是否人工意向分类
        createDate: [],
        redialTimes: undefined, // 自动重拨次数
        redialTimesOptions: [],
        genderEnum
      }
    },
    methods: {
      async getCsGroupAndStaff() { // 加载接听人员列表
        const { data } = await getCsGroupAndStaff({
          csStaffGroupId: this.robotCallJobDetail.csStaffGroupId
        })
        if (data) {
          this.answerSits = data.data || []
        }
      },
      handleIntentChange() {
        this.loadData({
          robotCallJobId: this.robotCallJobId,
          realIntent: this.isRealIntent
        })
      },
      isLastCallRecord() {
        const { resultStatuses = [], intentLevelCodes = [], chatDurationMin, chatDurationMax } = this.paginationParams
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
        if (!this.intentLevelTagId && this.intentLevelTagId !== 0) 
          return
        
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
        this.csTransferNotify = undefined
        this.answerSit = undefined
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
        this.transferType = undefined
        this.isRealIntent = false
        this.createDate = []
        this.redialTimes = undefined
        this.lastCallRecord = false
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
      loadData(params = {}, cb) {
        if (!params.robotCallJobId) {
          params = {
            ...this.paginationParams,
            ...params
          }
        }
        if (params.realIntent === false){
          params.realIntent = undefined
        }
        params.lastCallRecord = this.lastCallRecord

        if (!params.robotCallJobId) return

        this.$refs.table.loadData({
          customerConcern: this.customerConcern,
          ...params
        }, (tableData) => {
          this.tableData = tableData
          cb && cb()
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
        let countObj = { whiteCount: 0, successCount: 0 }
        if (!this.allChecked) {
          const customerPersonIds = this.multipleSelection.map(item => item.customerPersonId)
          if (customerPersonIds.length === 0) {
            this.$message.error(`请选择${this.customerStr}`)
            return
          }
          // 导入到当前任务
          const res = await customerAPI.reAddCustomerToJob({
            intentLevelTagId: this.intentLevelTagId,
            lastCallRecord: this.lastCallRecord,
            robotCallJobId: this.robotCallJobId,
            customerPersonIds,
            reAdd: true
          })
          if (res.data.data) {
            countObj = res.data.data
          }
        } else {
          // 导入到当前任务
          const res = await customerAPI.reAddCustomerToJob({
            intentLevelTagId: this.intentLevelTagId,
            lastCallRecord: this.lastCallRecord,
            ...this.exportCustomerParams,
            robotCallJobId: this.robotCallJobId
          })

          if (res.data.data) {
            countObj = res.data.data
          }
        }

        const { successCount, whiteCount, interceptCount, otherFollowerCount } = countObj
        if ((successCount && !whiteCount && !otherFollowerCount) || (!successCount && !whiteCount && !interceptCount && !otherFollowerCount)) {
          this.$message.success(`成功添加${successCount}位${this.customerStr}到任务`)
        } else if (otherFollowerCount && !whiteCount){
          this.$message.info(`成功添加${successCount}位${this.customerStr}到任务，失败${otherFollowerCount}位，原因是负责人已变更`)
        } else if (whiteCount && !otherFollowerCount){
          this.$message.info(`成功添加${successCount}位${this.customerStr}到任务，失败${whiteCount}位，原因是${this.customerStr}在白名单`)
        } else if (whiteCount && otherFollowerCount){
          this.$message.info(`成功添加${successCount}位${this.customerStr}到任务，失败${whiteCount + otherFollowerCount}位，原因是${this.customerStr}在白名单或负责人已变更`)
        } else if (interceptCount) {
          this.$message.info(`${interceptCount}位被拦截`)
        }
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
      },
      async getRedialLimit() {
        const { data } = await taskAPI.getRedialLimit()
        if (data.data || data.data === 0) {
          for (let i = 0; i <= data.data; i++) {
            this.redialTimesOptions.push(i)
          }
        }
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
  .table {
    .username-mood_container {
      display: flex;
      /deep/ .name-container {
        flex-basis: 70px;
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
    }
  }
  .const-icon-tip {
    line-height: 32px;
    font-size: 18px;
    color: #666666;
  }
  .form-item {
    display: inline-flex;
    align-items: center;
    > .label {
      flex-shrink: 0;
      color: $--color-text-regular;
      font-size: $--font-size-small;
    }
    .el-icon-question {
      margin-left: 5px;
      font-size: 14px;
    }
  }
  .remove-repeat {
    margin-left: 10px;
  }
  .form-item-wrap {
    margin-top: 14px;
  }
  .recognize {
    color: $--color-danger;
  }
</style>
