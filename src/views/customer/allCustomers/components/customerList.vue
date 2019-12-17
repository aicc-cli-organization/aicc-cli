<template>
  <PaginationTable
    url="/apiEngine/customerPerson/list"
    ref="table"
    :server="'engine'"
    stripe
    method="post"
    :headers="{
      'Content-Type': 'application/json'
    }"
    :pageZero="false"
    :params="params"
    :max-height="this.clientHeight - 255"
    :multipleSelection.sync="multipleSelection"
    @select-all="(selection) => $emit('select-all', selection)"
    @select="(selection, row) => $emit('select', selection, row)"
    @handleSelectionChange="(val) => $emit('selection-change', val)"
    @totalSizeChange="totalSize => $emit('totalSizeChange', totalSize)"
    @refreshTable="() => $emit('refreshTable')"
  >
    <el-table-column type="selection" :show-overflow-tooltip="false" v-if="hasAccess('crm_allCus_del')"></el-table-column>
    <el-table-column v-for="item in customerFields_all" :key="item.customerPersonExtraFieldId" :label="item.name">
      <template slot-scope="{ row }">
        <customerCommonTableHeaders :rowData="row" :header="item" page="all"></customerCommonTableHeaders>
      </template>
    </el-table-column>
    <el-table-column label="跟进人">
      <template slot-scope="{ row }">
        {{row.followUserName ? row.followUserName : constant.emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" v-if="hasOneAccessOf(['crm_allCus_edit', 'crm_allCus_del', 'crm_allCus_addToWhiteList'])">
      <div slot-scope="{ row }" class="action">
        <el-button type="text" @click="$emit('edit', row)" v-if="hasAccess('crm_allCus_edit')">编辑</el-button>
        <YiwisePopConfirm :label="`确认删除该${customerStr}吗？`" @submit="removeCustomer(row)" v-if="hasAccess('crm_allCus_del')">
          <el-button type="text">删除</el-button>
        </YiwisePopConfirm>
        <addToWhiteListPopOver
          v-if="hasAccess('crm_allCus_addToWhiteList')"
          :customerPersonId="row.customerPersonId"
          :disabled="row.inWhiteList"
          @refresh="$emit('refresh')">
          <el-button type="text" :disabled="row.inWhiteList">加入白名单</el-button>
        </addToWhiteListPopOver>
      </div>
    </el-table-column>
  </PaginationTable>
</template>

<script>
import { mapGetters } from 'vuex'
import * as constant from '@/utils/constant'
import PaginationTable from '@/components/PaginationTable'
import { YiwisePopConfirm } from 'yiwise-components'
import addToWhiteListPopOver from '@/components/addToWhiteListPopOver'
import customerCommonTableHeaders from '@/components/customer/customerCommonTableHeaders'
import * as customerAPI from '@/api/customer'

export default {
  components: {
    PaginationTable,
    YiwisePopConfirm,
    addToWhiteListPopOver,
    customerCommonTableHeaders
  },
  props: {
    paginationParams: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      multipleSelection: [],
      constant
    }
  },
  computed: {
    ...mapGetters(['clientHeight', 'customerFields_all', 'customerStr']),
    params() {
      return {
        customerPersonListType: 'ADMIN_LIST',
        ...this.paginationParams
      }
    }
  },
  methods: {
    checkAll(checkAll) {
      this.$refs.table.checkAll(checkAll)
    },
    removeCustomer(row) {
      customerAPI.deleteCustomer({
        customerPersonListType: 'ADMIN_LIST',
        customerPersonIds: [row.customerPersonId]
      }).then(data => {
        this.loadData()
      })
    },
    loadData(page = 1, size = 20) {
      this.$nextTick(() => {
        this.$refs.table.loadData(page, size)
      })
    },
    async addToWhiteList(row) {
      await customerAPI.addToWhiteList([row.customerPersonId])

      this.$message.success('添加至白名单成功！')
      this.$emit('refresh')
    }
  }

}
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/placeholder.scss';
  .button-container {
    height: 52px;
    padding: 10px 8px 10px 15px;
    border-bottom: $--border-base;
  }
  #customer-management {
    height: 100%;
    position: relative;
  }
  .title {
    margin: 15px 16px 15px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .el-date-editor{
    width: 380px
  }

  .el-dialog{
    padding: 0px 0px;
  }

  .el-dialog__header{
    padding: 0px 0px;
    height: 48px;
    line-height: 48px;
    background: #f0f3f8;
  }

  .el-dialog__header .el-dialog__title {
    margin-left: 15px;
    font-size: 14px;
  }
  .el-dialog__header .el-dialog__headerbtn {
    margin-left: 15px;
    font-size: 14px;
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
  .message-box::-webkit-scrollbar {display:none}
  .message-box {
    overflow-y: scroll;
    max-height: 480px;
    padding-bottom: 120px;
  }
  .history-dialog{
    max-height: 85vh;
    overflow: hidden;
  }
  .action {
    > span {
      @extend %tableAction;
    }
  }

  .preview {
    @extend %tableAction;
  }

  .el-button + .el-button{
    margin-left: 5px;    
  }
  .border-box+.border-box {
    margin-top: 10px !important;
  }
  .border-box {
    margin: 20px 20px 0 20px;
    width: 296px;
    height: 100px;
    border-radius: 2px;
    border: 1px solid #d8d9de;
  }

  .colorBlack {
    color: #333;
  }

  .pre-text {
    width: 70px;
    height: 20px;
    margin-left: 20px;
    text-align: right;
    display: inline-block;
  }

  .left-area{
    background: #fff;
  }

  .button-container .el-form-item{
    margin: 0 5px 0 0;
  }

  .center-text {
    text-align: center;
    display: inline-block;
    width: 100%;
    line-height: 196px;
    font-size: 20px;
    color: #1890ff;
  }

  .move-to-select{
    position: absolute !important;
    bottom: 0;
  }
  .history-dialog{
    /deep/ .el-dialog__header{
      margin-bottom: 0;
    }
    /deep/ .el-dialog__body {
      padding: 0!important;
      display: flex;
      .detail-left {
        width: 342px;
        min-height: 555px;
      }
      .detail-right {
        padding-top: 14px;
        flex: 1;
      }
    }
  }
</style>

