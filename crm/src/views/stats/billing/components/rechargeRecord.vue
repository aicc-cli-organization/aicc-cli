<template>
  <div class="recharge-record-container">
    <div class="check-wrap" v-if="hasAccess('crm_bill_apply')">
      <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
      <span class="checked-count ml5">已选中
        <span class="num">{{multipleSelection.length}}</span>项
      </span>
    </div>
    <el-button plain 
      v-if="multipleSelection.length === 0 && hasAccess('crm_bill_apply')"  
      :disabled="true"
      class="ml15 float-r" style="margin-right:18px;margin-top:12px" 
      @click="openInvoice('','multiAdd')">合并开票</el-button>
    <el-button plain 
      v-if="multipleSelection.length !== 0 && hasAccess('crm_bill_apply')"  
      class="ml15 float-r" style="margin-right:18px;margin-top:12px;color:#409eff;border-color:#b3d8ff" 
      @click="openInvoice('','multiAdd')">合并开票</el-button>
    <pagination-table
      url="/apiEngine/rechargeStream/rechargeRecord"
      ref="table"
      :server="'engine'"
      :autoLoad="false"
      :multipleSelection="multipleSelection"
      stripe
      :max-height="600"
      :pageZero="false"
      @select-all="handleSelectAll"
      @selection-change="handleSelectionChange"
      @current-change="allChecked = false"
      @size-change="allChecked = false"
      style="margin:12px 16px 0"
      >
      <yiwise-table-column v-if="hasAccess('crm_bill_apply')" type="selection" width="55" :selectable="selectable"></yiwise-table-column>
      <yiwise-table-column label="时间" prop="createTime"></yiwise-table-column>
      <yiwise-table-column label="类别">
        <template slot-scope="scope">
          {{constant.rechargeHandleTypeENUM[scope.row.handleType]}}
        </template>
      </yiwise-table-column>
      <yiwise-table-column label="线路">
        <template slot-scope="{ row }">
          {{row.phoneNumberId === -1 ? '短信' : row.phoneName || row.phoneNumber}}
        </template>
      </yiwise-table-column>
      <yiwise-table-column prop="fare" label="金额(元)">
        <template slot-scope="scope">
          {{scope.row.fare / 1000}}
        </template>
      </yiwise-table-column>
      <yiwise-table-column prop="fare" label="交易渠道">
        <template slot-scope="{ row }">
          {{payMethodsEnum[row.rechargeMethod]}}
        </template>
      </yiwise-table-column>
      <yiwise-table-column prop="fare" label="交易状态">
        <template slot-scope="{ row }">
          {{payStatusEnum[row.rechargeStatus]}}
        </template>
      </yiwise-table-column>
      <yiwise-table-column prop="createUserName" label="操作者"></yiwise-table-column>
      <yiwise-table-column width="120" prop="payReference" :show-overflow-tooltip="false" label="支付订单号">
        <template slot-scope="{ row }">
          <el-tooltip placement="top"
            v-if="row.payReference"
            :content="row.payReference">
            <span class="ellipsis">{{row.payReference}}</span>
          </el-tooltip>
          <span v-else>{{constant.emptyPlaceholder}}</span>
        </template>
      </yiwise-table-column>
      <yiwise-table-column width="120" prop="aliPayReference" :show-overflow-tooltip="false" label="支付宝交易号">
        <template slot-scope="{ row }">
          <el-tooltip placement="top"
            v-if="row.aliPayReference"
            :content="row.aliPayReference">
            <span class="ellipsis">{{row.aliPayReference}}</span>
          </el-tooltip>
          <span v-else>{{constant.emptyPlaceholder}}</span>
        </template>
      </yiwise-table-column>
      <yiwise-table-column prop="remark" label="备注"></yiwise-table-column>
      <yiwise-table-column  v-if="hasAccess('crm_bill_apply')" :show-overflow-tooltip="false" width="120">
        <template slot="header">
          <filter-table-selection
            :multiple="false"
            :filters="filters"
            @filter-success="filterSuccess"
          >
            <span slot="title">
              发票状态
            </span>
          </filter-table-selection>
        </template>
        <template slot-scope="{ row }">
          <div class="button-wrap">
            <span v-if="row.rechargeBillApplyStatus === 'BILL_SEND'" style="color: #30bc35">{{rechargeBillApplyStatusEnum[row.rechargeBillApplyStatus]}}</span>
            <span v-else-if="row.rechargeBillApplyStatus === 'BILL_APPLYED'"  class="has-apply" style="color: #eeb252">{{rechargeBillApplyStatusEnum[row.rechargeBillApplyStatus]}}</span>
            <el-button v-else-if="row.rechargeBillApplyStatus === 'BILL_ENABLE'"  style="color: #409eff;border-color: #b3d8ff" @click="openInvoice(row,'add')">{{rechargeBillApplyStatusEnum[row.rechargeBillApplyStatus]}}</el-button>
            <span v-else>--</span>
            <el-button v-if="row.rechargeBillApplyStatus === 'BILL_APPLYED'" class="retreat" style="color: #409eff;border-color: #b3d8ff" @click="openInvoice(row,'retreat')">撤回</el-button>
          </div>
        </template>
      </yiwise-table-column>
    </pagination-table> 
    <invoice
      :visible.sync="invoiceVisible"
      :type="type"
      :rowData="rowData"
      @success="loadData"
    ></invoice> 
  </div>
</template>

<script>
import { PaginationTable, YiwiseTableColumn } from 'yiwise-components'
import * as constant from '@/utils/constant'
import { payStatusEnum, payMethodsEnum, rechargeBillApplyStatusEnum } from '@/utils/enum'
import  invoice from './invoice'
import filterTableSelection from '@/components/filterTableSelection'

export default {
  name: 'rechargeRecord',
  components: {
    PaginationTable,
    filterTableSelection,
    YiwiseTableColumn,
    invoice
  },
  data() {
    const filters = [
      { text: '已寄出', value: 'BILL_SEND' },
      { text: '已申请', value: 'BILL_APPLYED' },
      { text: '开发票', value: 'BILL_ENABLE' }
    ]
    return {
      filters,
      payStatusEnum,
      payMethodsEnum,
      rechargeBillApplyStatusEnum,
      allChecked: false,
      checkedCount: 0,
      multipleSelection: [],
      invoiceVisible: false,
      type:'',
      rowData: [],
      checkList: []
    }
  },
  mounted() {
    this.$refs.table.loadData()
  },
  computed: {
    constant() {
      return constant
    }
  },
  methods: {
    loadData() {
      this.$refs.table.loadData({checkList: this.checkList})
    },
    handleAllChecked() {
      this.$refs.table.checkAll(this.allChecked)
    },
    handleSelectAll(list) {
      if (list.length === 0 ) {
        this.allChecked = false
      }else {
        this.allChecked = true
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    filterSuccess(checkList) {
      this.checkList = checkList
      this.$refs.table.loadData({
        pageNum: 1,
        rechargeBillApplyStatus: checkList
      })
      this.allChecked = false
    },
    openInvoice( row,type) {
      this.type = type
      this.invoiceVisible = true
      if(type === 'add' || type === 'retreat') {
        this.rowData = [row]
      }
      if(type === 'multiAdd') {
        this.rowData = [...this.multipleSelection]
      }
    },
    selectable(row,index) {
      if(row.rechargeBillApplyStatus === 'BILL_ENABLE') {
        row.disabled = false
        return true
      }else {
        row.disabled = true
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../../styles/variables.scss';
  .recharge-record-container {
    background: #fff;
    /deep/ button.is-plain:disabled {
      color:#A1A1A1;
      border:1px solid #cecece;
      &:hover {
        color:#A1A1A1;
        border:1px solid #cecece;
        background-color: #fff;
      }
    }
    /deep/ .el-button.is-plain:hover {
      background-color: #e8f4ff;
    }
  }
  .ellipsis {
    max-width: 100%;
    display: inline-block;
  }
  .num {
    color: #1890ff
  }
  .check-wrap {
    display: inline-block;
    margin-top: 20px;
    margin-left: 26px;
  }
  .button-wrap {
    .retreat {
      display: none;
    }
    /deep/ .el-button--small {
      width: 66px;
      line-height: 26px !important;
      height: 26px !important;
      border-radius:4px;
      &.el-button--default {
        color: #1890FF;
        border: 1px solid rgba(24,144,255,1);
      }
    }
  }
  .button-wrap:hover {
    .retreat {
      display: inline-block;
    }
    .has-apply {
      display: none;
    }
  }
</style>
