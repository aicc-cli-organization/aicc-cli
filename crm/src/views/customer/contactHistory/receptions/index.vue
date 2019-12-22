<template>
  <div class="private-sea">
    <template v-if="entrance !== 'training'">
      <div class="header">
        <div class="header-filter">
          <slot name="typeSelect"></slot>
          <option-search-input
            width="270px"
            ref="optionSearchInput"
            v-model="searchWords"
            @search="refresh"
            :option-list="optionListForReceptions"
            option-width="110px"
          ></option-search-input>
          <div class="form-item">
            <span class="label">呼入时间：</span>
            <el-date-picker
              v-model="createDate"
              type="datetimerange"
              time-arrow-control
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
              :default-time="['00:00:00', '23:59:59']"
              :style="{width: '360px'}"
              @change="refresh"
            />
          </div>
          <span class="label" style="margin-left:20px" v-if="seatType !== 'IVR'">话术名称：</span>
          <el-select
            v-if="seatType !== 'IVR'"
            filterable
            v-model="dialogFlowId"
            placeholder="请选择话术"
            :style="{width: '150px', marginLeft: '20px'}"
            :clearable="true"
            @change="refresh"
          >
            <el-option v-for="item in dialogFlowList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <el-button type="primary" @click="handleClearFilterClick">清空筛选条件</el-button>
      </div>

      <div class="header header-sub">
        <div class="header-filter">
          <div class="form-item">
            <span class="label">呼入时长：</span>
            <div class="flex-center duration">
              <el-input class="duration-input" v-model="chatDurationMin" placeholder="最小时长" :style="{width: '100px'}" @change="handleChatMinChange">
              </el-input>
              <span class="split-line">-</span>
              <el-input class="duration-input" v-model="chatDurationMax" placeholder="最大时长" :style="{width: '100px'}" @change="handleChatMaxChange">
              </el-input>
            </div>
          </div>
          <div class="form-item">
            <span class="label">呼入线路：</span>
            <el-select
              filterable
              remote
              :remote-method="selectSupportCallInList"
              v-model="phoneNumberId"
              placeholder="呼入线路"
              :style="{width: '150px', marginLeft: '20px'}"
              :clearable="true"
              @change="refresh"
            >
              <el-option v-for="item in lineList" :key="item.phoneNumberId" :value="item.phoneNumberId"
                :label="(item.phoneName ? (item.phoneName+'-') : '')+item.phoneNumber">
              </el-option>
            </el-select>
          </div>
          <div class="form-item">
            <span class="label">通话状态：</span>
            <el-select v-model="resultStatuses" placeholder="通话状态" :style="{width: '150px'}" @change="refresh" :clearable="true">
              <el-option v-for="(value, key) in resultStatusMultipleOptions" :key="key" :value="key" :label="value"></el-option>
            </el-select>
          </div>
          <div class="form-item">
            <span class="label">查看状态：</span>
            <el-select v-model="readStatus" placeholder="查看状态" class="ml5" :style="{width: '150px'}" @change="refresh" :clearable="true">
              <el-option v-for="(value, key) in readStatusEnum" :key="key" :value="key" :label="value"></el-option>
            </el-select>
          </div>
          <div class="form-item">
            <el-checkbox class='remove-repeat' @change="handleIntentChange" v-model='isRealIntent'>人工意向分类</el-checkbox>
          </div>
        </div>
      </div>
    </template>

    <div class="table-top-action">
      <div class="action-left">
        <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
        <span class="checked-count ml5">已选中
          <span class="num">{{checkedCount}}</span>项
        </span>
        <SelectTableHeaders v-model="showTableHeaders" :tableHeaders="tableHeaders" @headerChange="handleHeaderChange"></SelectTableHeaders>
      </div>
      <div class="action-left ml15" v-if="entrance !== 'training'">
        <el-button type="primary" plain @click="$router.push('/customer/whiteList')" v-if="hasAccess('crm_whiteList_view')">{{customerStr}}白名单</el-button>
        <el-button type="primary" plain @click="$router.push('/customer/customerGroup')" v-if="hasAccess('crm_group_view')">{{customerStr}}分组</el-button>
      </div>
      <div class="action-right">
        <div class="f12 right ml10" v-if="hasAccess('crm_dialHistory_downAudio')">
          <el-button type="primary" v-if="entrance === 'training'" @click="refresh">刷新</el-button>
          <downloader-module
            :allChecked="allChecked"
            :multipleSelection="multipleSelection"
            :paginationParams="{
              ...paginationParams,
              ...entrance === 'training' ? { 'dialogFlowId': traningDialogFlowId } : {},
              callInRecordType: receptionType === 'training' ? 'VERBAL_TRICK_TRAINING' : 'NORMAL'
            }"
            :seatType="seatType"
            :type="type"
            tag="callIn"
          ></downloader-module>
        </div>
      </div>
    </div>

    <list
      ref="table"
      :seatType="seatType"
      :receptionType="receptionType"
      :showTableHeaders="showTableHeaders"
      :multipleSelection="multipleSelection"
      @preview="handlePreviewClick"
      @showCallDetail="handleShowCallDetail"
      @totalSizeChange="handleTotalSizeChange"
      @selection-change="handleSelectionChange"
      @select="handleSelectChange"
      @select-all="handleSelectAll"
      @refreshTable="handleRefreshTable"
    ></list>

    <contact-history-modal
      tag="callIn"
      unit="通"
      :visible.sync="previewVisible"
      :downloadAudio="hasAccess('crm_dialHistory_downAudio')"
      :defaultData="customerData"
      :customerPersonId="customerData.customerPersonId"
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
      tag="callIn"
      @edit-customer="handleEditCustomer"
      width="1066px"
      :withEmotion="receptionType !== 'IVR'"
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
  import list from './list'
  import * as talkAPI from '@/api/talk'
  import { selectSupportCallInList } from '@/api/numberpool'
  import TableCheckAll from '@/mixins/tableCheckAll'
  import { tableHeadersForReceptions, optionListForReceptions, resultStatusMultipleOptions } from '../enum'
  import { chartDurationManager } from '../utils'
  import { setTableHeader, getTableHeader } from '@/utils'
  import { mapGetters } from 'vuex'

  export default {
    // 处理table全选的mixin
    mixins: [TableCheckAll],
    components: {
      CallRecordDetailDialog,
      OptionSearchInput,
      list,
      downloaderModule,
      SelectTableHeaders,
      CallRecordDetailModal,
      ContactHistoryModal,
      CustomerDialog
    },
    props: {
      url: {
        type: String,
        default: ''
      },
      receptionType: {
        type: String,
        default: 'AI',
        validator(value) {
          return ['AI', 'person', 'IVR'].includes(value)
        }
      },
      seatType: {
        type: String,
        default: 'AI',
        validator(value) {
          return ['AI', 'CS', 'TEL', 'IVR'] // AI:AI; CS:人工; TEL:移动; IVR:IVR
        }
      },
      entrance: String,
      traningDialogFlowId: [String, Number]
    },
    data() {
      return {
        type: 'AI_CALL_IN',
        resultStatuses: undefined,
        dialogFlowId: undefined,
        phoneNumberId: undefined,
        searchWords: undefined,
        createDate: undefined,
        readStatus: undefined,
        chatDuration: undefined,
        chatDurationMin: undefined,
        chatDurationMax: undefined,
        callRecordDetailDialogVisible: false,
        readStatusEnum: ['未读', '已读'],
        showTableHeaders: Object.keys(tableHeadersForReceptions),
        dialogFlowList: [],
        multipleSelection: [], // 当前选中的table行
        lineList: [],
        customerData: {},
        // 查看dialog
        previewVisible: false,
        callRecordIndex: -1,
        optionListForReceptions,
        resultStatusMultipleOptions,
        tableData: {}, // 当前页列表相关数据，包含分页信息
        customerVisible: false, // 是否显示编辑用户dialog
        editCustomerData: {},
        isRealIntent: false
      }
    },
    computed: {
      ...mapGetters(['customerFields_private', 'customerStr']),
      generalParams() {
        for (const key in this.searchWords) {
          if (this.searchWords[key] === '') {
            this.searchWords[key] = undefined
          }
        }

        return {
          ...this.searchWords,
          dialogFlowId: this.dialogFlowId || undefined,
          phoneNumberId: this.phoneNumberId || undefined,
          startTime: this.createDate ? this.createDate[0] : undefined,
          endTime: this.createDate ? this.createDate[1] : undefined,
          readStatus: typeof this.readStatus !== 'undefined' ? this.readStatus : undefined,
          chatDuration: this.chatDuration || undefined,
          minChatDuration: +this.chatDurationMin || undefined,
          maxChatDuration: +this.chatDurationMax || undefined
        }
      },
      paginationParams() {
        return {
          ...this.generalParams,
          seatType: this.seatType,
          resultStatus: this.resultStatuses || undefined
        }
      },
      tableHeaders() {
        const _cloneData = JSON.parse(JSON.stringify(tableHeadersForReceptions))
        if (this.receptionType === 'person') {
          delete _cloneData.dialogFlowName
        }

        return _cloneData
      }
    },
    methods: {
      refresh() {
        const params = { pageNum: 1 }
        if (this.entrance === 'training') {
          params.dialogFlowId = this.traningDialogFlowId
        }
        params.realIntent = params.realIntent===true? true:undefined
        this.loadData({
          ...params
        })
      },
      loadData(params = {}, cb = () => {}) {
        const newParams = {
          ...this.paginationParams,
          ...params,
          ...this.receptionType === 'IVR' ? { callInRecordType: this.entrance === 'training' ? 'VERBAL_TRICK_TRAINING' : 'NORMAL' } : {}
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
        setTableHeader('receptions' + this.receptionType, v)
      },
      handleShowCallDetail(row, index) {
        var tableData = this.$refs.table.$refs.table.tableData
        for (let i = 0; i < tableData.length; i++) {
          if (tableData[i].callInRecordId === row.callInRecordId) {
            this.$set(this.$refs.table.$refs.table.tableData[i], 'crmRead', true)
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
      handlePreviewClick(data) {
        this.customerData = data
        this.previewVisible = true
      },
      handleClearFilterClick() { // 清空筛选条件
        this.$refs.optionSearchInput.reset((params) => {
          this.searchWords = params
        })

        this.createDate = undefined
        this.customerGroup = undefined
        this.dialogFlowId = undefined
        this.phoneNumberId = undefined
        this.readStatus = undefined
        this.chatDuration = undefined
        this.chatDurationMin = undefined
        this.chatDurationMax = undefined
        this.resultStatuses = undefined
        this.isRealIntent = false
        this.refresh()
      },
      handleEditCustomer(data) { // 编辑客户
        this.customerVisible = true
        this.editCustomerData = data
      },
      handleIntentChange(val) {
        this.$nextTick(()=> {
          this.loadData({
            realIntent:val===true?val:undefined
          })
        })
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
      },
      async selectSupportCallInList(searchWords) {
        this.lineList = (await selectSupportCallInList({
          searchWords
        })).data.data
      }
    },
    mounted() {
      this.showTableHeaders = getTableHeader('receptions' + this.receptionType) || Object.keys(this.tableHeaders)
      let params = {}
      if (this.entrance !== 'training') {
        this.requestDialogFlowList()
        this.selectSupportCallInList()
      } else {
        params = { dialogFlowId: this.traningDialogFlowId }
      }
      this.loadData(params)
    },
    watch: {
      traningDialogFlowId(newVal) {
        if (this.entrance === 'training') {
          this.loadData({
            dialogFlowId: newVal
          })
        }
      }
      // isRealIntent(val) {
      //    this.$nextTick(()=> {
      //     this.loadData({
      //       realIntent:val===true?val:undefined
      //     })
      //   })
      // }
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
    }
    > .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      &.header-sub {
        padding: 0 0 14px 0;
      }
      > .header-filter {
        display: flex;
        align-items: center;
      }
      .duration {
        border: 1px solid #d8d8d8;
        border-radius: 4px
      }
      .duration-input  /deep/ .el-input__inner{
        border:none
      }
    }
  }
</style>
