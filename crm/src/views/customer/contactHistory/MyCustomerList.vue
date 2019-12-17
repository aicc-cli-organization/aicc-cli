<template>
  <new-pagination-table
    class="table"
    ref="table"
    :url="url"
    method="post"
    :headers="{
      'Content-Type': 'application/json'
    }"
    customClass="table-header-change-loading"
    :autoLoad="false"
    server="engine"
    :pageZero="false"
    :max-height="clientHeight - (type === 'callTask' ? 462 : 420)"
    @row-dblclick="handleRowDoubleClick"
    @select-all="(selection) => $emit('select-all', selection)"
    @select="(selection, row) => $emit('select', selection, row)"
    @selection-change="(val) => $emit('selection-change', val)"
    @totalSizeChange="totalSize => $emit('totalSizeChange', totalSize)"
    @refreshTable="() => $emit('refreshTable')"
    style="width:100%"
  >
    <el-table-column type="selection" width="55"></el-table-column>
    <el-table-column fixed v-if="innerShowTableHeaders.includes('callRecordId')" prop="callRecordId" label="通话记录id" width="80"></el-table-column>
    <el-table-column v-for="item in tableHeaders" :key="item.customerPersonExtraFieldId" :label="item.name" :width="150">
      <template slot-scope="{ row }">
        <customerCommonTableHeaders :rowData="row" :header="item" page="call"></customerCommonTableHeaders>
      </template>
    </el-table-column>
    <el-table-column
      v-if="isAdmin"
      label="是否使用一知ASR"
      width="120"
    >
      <template slot-scope="{ row }">
        {{ row.useYiwiseAsr ? '是' : '否' }}
      </template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('robotCallJobName')" prop="robotCallJobName" label="任务名称" width="" :show-overflow-tooltip="true"></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('dialogFlowName')" prop="dialogFlowName" label="话术名称" width="200px" :show-overflow-tooltip="true"></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('startTime')" prop="startTime" label="呼叫时间" width="140"></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('tenantPhoneNumber')" prop="tenantPhoneNumber" label="主叫号码" width="200">
      <template slot-scope="{ row }">{{getPhoneStr(row)}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('chatDuration')" prop="chatDuration" label="呼叫时长（秒）" width="120"></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('resultStatus')" label="通话状态" width="80">
      <template slot-scope="scope">{{constant.resultStatus[scope.row.resultStatus]}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('hangupBy')" label="挂断状态" width="80">
      <template slot-scope="{ row }">{{row.resultStatus === 'ANSWERED' ? (hangupEnum[row.hangupBy] || emptyPlaceholder) : emptyPlaceholder}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('realIntentLevel')" prop="realIntentLevelName" :label="`${customerStr}意向`" width="70"></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('customerConcern')" :label="`${customerStr}关注点`" width="120">
      <template slot-scope="scope">{{scope.row.customerConcern.length > 0 ? scope.row.customerConcern.toString() : '--'}}</template>
    </el-table-column>
    <el-table-column :label="`${customerStr}属性`" :show-overflow-tooltip="true" v-if="innerShowTableHeaders.includes('attributes')">
      <template slot-scope="{ row }">
        <template v-if="!row.attributes || row.attributes.length === 0">{{emptyPlaceholder}}</template>
        <div v-else v-for="attribute in row.attributes" :key="attribute">{{attribute}}</div>
      </template>
    </el-table-column>
    <el-table-column label="自定义变量" :show-overflow-tooltip="false" v-if="innerShowTableHeaders.includes('properties')" width="150">
      <template slot-scope="{ row }">
        <template v-if="!row.hasOwnProperty('properties') || Object.keys(row.properties).length == 0">{{emptyPlaceholder}}</template>
        <div v-else v-for="(value, key) in row.properties" :key="key" class="property-item">
          <span class="p-label">{{key}}:</span>
          <span>{{value || emptyPlaceholder}}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('wechatPushUserName')" label="微信推送人" width="120px">
      <template slot-scope="scope">{{scope.row.wechatPushUserName || emptyPlaceholder}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('personInvolved') && type === 'callTask'" label="请求人工介入" width="100">
      <template slot-scope="scope">{{noticeStatusEnum[scope.row.csTransferNotify] || emptyPlaceholder}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('listened') && type === 'callTask'" label="是否监听" width="">
      <template slot-scope="scope">{{scope.row.csMonitorFlag === 1 ? '是' : '否'}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('cutOver') && type === 'callTask'" label="是否切入" width="">
      <template slot-scope="scope">{{scope.row.csTransferAccept === 1 ? '是' : '否'}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('listenPerson') && type === 'callTask'" label="介入人员" width="">
      <template slot-scope="scope">
        {{(
          (scope.row.csStaffName || '') + (scope.row.csStaffGroupName ? '(' + scope.row.csStaffGroupName + ')' : '')
        ) || emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('wechatPushTime')" label="微信推送时间" width="150px">
      <template slot-scope="scope">{{scope.row.wechatPushTime || emptyPlaceholder}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('transferType')" label="转接人工" width="">
      <template slot-scope="scope">{{constant.transferType[scope.row.transferType]}}</template>
    </el-table-column>
    <el-table-column label="转人工坐席" prop="transferPhoneNumber" v-if="innerShowTableHeaders.includes('transferPhoneNumber')" width="120">
      <template slot-scope="scope">{{scope.row.transferPhoneNumber || emptyPlaceholder }}</template>
    </el-table-column>
    <el-table-column fixed="right" label="通话详情" width="120px" v-if="hasAccess('crm_dialHistory_viewDialDetail')">
      <template slot-scope="scope">
        <el-button style="position: relative" class="mr10" @click="$emit('showCallDetail', scope.row, scope.$index)" type="text" size="small">查看通话详情
          <div class="dot" v-if="scope.row.read === 'NOT_READ'"></div>
        </el-button>
      </template>
    </el-table-column>
  </new-pagination-table>
</template>

<script>
  import NewPaginationTable from '@/components/NewPaginationTable'
  import { YiwisePopConfirm } from 'yiwise-components'
  import customerCommonTableHeaders from '@/components/customer/customerCommonTableHeaders'
  import { genderEnum, customerLevelEnum, customerSourceEnum, callStatusEnum, intentLevelEnum, hangupEnum, noticeStatusEnum } from '@/utils/enum'
  import { emptyPlaceholder } from '@/utils/constant'
  import { mapGetters } from 'vuex'
  import * as constant from '@/utils/constant'

  export default {
    name: 'MyCustomerList',
    components: {
      customerCommonTableHeaders,
      NewPaginationTable,
      YiwisePopConfirm
    },
    props: {
      type: [String],
      url: {
        type: String,
        default: ''
      },
      showTableHeaders: {
        type: Array,
        default: []
      }
    },
    computed: {
      ...mapGetters(['clientHeight', 'customerFields_contactHistory', 'customerStr']),
      constant() {
        return constant
      },
      tableHeaders() {
        return this.customerFields_contactHistory.filter(item => this.innerShowTableHeaders.includes(item.customerPersonExtraFieldId + ''))
      },
      isAdmin() {
        return this.$route.query.isAdmin === 'true'
      }
    },
    data() {
      return {
        genderEnum,
        customerLevelEnum,
        emptyPlaceholder,
        customerSourceEnum,
        callStatusEnum,
        intentLevelEnum,
        hangupEnum,
        noticeStatusEnum,
        innerShowTableHeaders: []
      }
    },
    watch: {
      showTableHeaders(v) {
        setTimeout(() => {
          this.innerShowTableHeaders = v
        }, 100)
      }
    },
    methods: {
      getPhoneStr(row) {
        const { phoneType, tenantPhoneNumber, phoneName } = row
        return (phoneType === 'MOBILE' ? (phoneName ? `${phoneName}-` : '') + (tenantPhoneNumber || '') : tenantPhoneNumber) || emptyPlaceholder
      },
      loadData(params, cb) {
        this.$refs.table.loadData({
          ...params
        }, cb)
      },
      handleRowDoubleClick(row) {
        this.$emit('preview', row)
      },
      checkAll(checkAll) {
        this.$refs.table.checkAll(checkAll)
        this.innerShowTableHeaders = this.showTableHeaders
      }
    },
    mounted() {
      this.innerShowTableHeaders = this.showTableHeaders
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';

  .table {
    .operation {
      @extend %tableAction;
    }
    .property-item {
      display: inline-block;
      margin-right: 10px;
    }
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
</style>

