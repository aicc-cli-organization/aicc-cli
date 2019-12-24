<template>
  <new-pagination-table
    class="table"
    ref="table"
    url="/apiEngine/customerPerson/list"
    method="post"
    :headers="{
      'Content-Type': 'application/json'
    }"
    customClass="table-header-change-loading"
    :autoLoad="false"
    server="engine"
    :pageZero="false"
    :max-height="clientHeight - 440"
    @select-all="(selection) => $emit('select-all', selection)"
    @select="(selection, row) => $emit('select', selection, row)"
    @selection-change="(val) => $emit('selection-change', val)"
    @totalSizeChange="totalSize => $emit('totalSizeChange', totalSize)"
    @refreshTable="() => $emit('refreshTable')"
    @row-dblclick="handleRowDoubleClick"
  >
    <el-table-column type="selection" width="55px"></el-table-column>
    <el-table-column v-for="item in tableHeaders" :key="item.customerPersonExtraFieldId" :label="item.name">
      <template slot-scope="{ row }">
        <customerCommonTableHeaders :rowData="row" :header="item"></customerCommonTableHeaders>
      </template>
    </el-table-column>
    <el-table-column :label="`${customerStr}标签`" :show-overflow-tooltip="false" v-if="innerShowTableHeaders.includes('customerLevel')">
      <template slot-scope="{ row }">
        <el-popover
          v-if="row.customerLevelTag"
          placement="top"
          width="200"
          trigger="hover"
        >
          <div class="label-tag-popover">
            <span v-for="item in row.customerLevelTag.split(',')" :key="item" class="label-tag" style="margin-bottom:5px">{{item}}</span>
          </div>
          <span slot="reference">
            <span class="label-tag-wrap">
              <span v-for="item in row.customerLevelTag.split(',')" :key="item" class="label-tag">{{item}}</span>
            </span>
          </span>
        </el-popover>
        <span v-else>{{emptyPlaceholder}}</span>
      </template>
    </el-table-column>
    <el-table-column label="负责人" v-if="hasAccess('crm_private_company')">
      <template slot-scope="{ row }">
        {{row.followUserName || emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column label="跟进状态" prop="followStatus" v-if="innerShowTableHeaders.includes('followStatus')">
      <template slot-scope="scope">
        {{scope.row.followStatus ? followStatusENUM[scope.row.followStatus] : emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column label="最近通话状态" v-if="innerShowTableHeaders.includes('lastDialStatus')">
      <template slot-scope="{ row }">
        {{row.lastDialStatus ? callStatusEnum[row.lastDialStatus] : emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column :label="`最近${customerStr}意向`" sortable='custom' prop="lastIntentLevel" v-if="innerShowTableHeaders.includes('lastIntentLevel')"
    >
      <template slot-scope="{ row }">
        {{row.lastIntentLevelName || emptyPlaceholder }}
      </template>
    </el-table-column>
    <el-table-column prop="lastChatDuration" label="最近呼叫时长" sortable='custom' v-if="innerShowTableHeaders.includes('lastChatDuration')"
    >
      <template slot-scope="{ row }">
        {{(row.lastChatDuration != null) ? (row.lastChatDuration + '秒') : emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column :label="`${customerStr}属性`" :show-overflow-tooltip="true" v-if="innerShowTableHeaders.includes('attributes')">
      <template slot-scope="{ row }">
        <template v-if="!row.attributes || row.attributes.length === 0">{{emptyPlaceholder}}</template>
        <div v-else v-for="attribute in row.attributes" :key="attribute">
          {{attribute}}
        </div>
      </template>
    </el-table-column>
    <el-table-column label="自定义变量" :show-overflow-tooltip="false" v-if="innerShowTableHeaders.includes('properties')">
      <template slot-scope="{ row }">
        <template v-if="!row.hasOwnProperty('properties')">{{emptyPlaceholder}}</template>
        <div v-else v-for="(value, key) in row.properties" :key="key" class="property-item">
          <span class="p-label">{{key}}:</span>
          <span>{{value || emptyPlaceholder}}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="最近呼叫时间" prop="lastStartTime" sortable='custom'
      v-if="innerShowTableHeaders.includes('lastStartTime')"
    >
      <template slot-scope="{ row }">
        {{parseDate(row.lastStartTime)}}
      </template>
    </el-table-column>
    <el-table-column label="最近外呼任务" prop="lastRobotCallJobName" 
      v-if="innerShowTableHeaders.includes('lastRobotCallJobName')"
    >
      <template slot-scope="{ row }">
        {{row.lastRobotCallJobName || emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column prop="lastFollowTime" label="最近跟进时间" sortable='custom'
      v-if="innerShowTableHeaders.includes('lastFollowTime')"
    >
      <template slot-scope="{ row }">
        {{parseDate(row.lastFollowTime)}}
      </template>
    </el-table-column>
    <el-table-column label="领取时间" v-if="innerShowTableHeaders.includes('assignTime')">
      <template slot-scope="{ row }">
        {{parseDate(row.assignTime)}}
      </template>
    </el-table-column>
    <el-table-column label="联系历史" fixed="right" v-if="hasAccess('crm_private_viewDialHis')">
      <span class="operation" slot-scope="{ row, $index }" @click="$emit('preview', row, $index)">
        <span>
          查看通话详情
        </span> 
      </span>
    </el-table-column>
    <el-table-column
      label="操作"
      width="230"
      fixed="right"
      v-if="hasOneAccessOf(['crm_private_addOrEdit', 'crm_private_transferOrDel', 'crm_private_dial', 'crm_private_addToWhiteList'])">
      <div slot-scope="{ row }">
        <span class="operation" v-if="hasAccess('crm_private_addOrEdit')" @click="$emit('edit', row)">
          编辑
        </span>
        <yiwise-pop-confirm
          v-if="hasAccess('crm_private_transferOrDel')"
          :label="`确定删除该${customerStr}吗？`"
          @submit="handleCustomerDelete(row.customerPersonId)"
          >
          <span class="operation">删除</span>
        </yiwise-pop-confirm>
        <span class="operation" v-if="hasAccess('crm_private_transferOrDel')" @click="$emit('transfer', row)">
          转移
        </span>
        <span class="operation" v-if="hasAccess('crm_private_dial')" @click="$emit('call', row)">
          拨打
        </span>
        <addToWhiteListPopOver
          v-if="hasAccess('crm_private_addToWhiteList')"
          :disabled="row.inWhiteList"
          :customerPersonId="row.customerPersonId"
          @refresh="$emit('refresh')">
          <span class="operation" :class="row.inWhiteList ? 'disabled' : ''">加入白名单</span>
        </addToWhiteListPopOver>
      </div>
    </el-table-column>
  </new-pagination-table>
</template>

<script>
  import NewPaginationTable from '@/components/NewPaginationTable'
  import { YiwisePopConfirm } from 'yiwise-components'
  import addToWhiteListPopOver from '@/components/addToWhiteListPopOver'
  import { customerLevelEnum, callStatusEnum, intentLevelEnum } from '@/utils/enum'
  import { deleteCustomer } from '@/api/customer'
  import { emptyPlaceholder } from '@/utils/constant'
  import { parseDate } from '@/utils/date'
  import { mapGetters } from 'vuex'
  import { followStatusENUM } from '@/utils/constant'
  import customerCommonTableHeaders from '@/components/customer/customerCommonTableHeaders'

  export default {
    name: 'MyCustomerList',
    components: {
      NewPaginationTable,
      YiwisePopConfirm,
      addToWhiteListPopOver,
      customerCommonTableHeaders
    },
    props: {
      showTableHeaders: {
        type: Array,
        default: []
      }
    },
    computed: {
      ...mapGetters(['clientHeight', 'customerFields_private', 'customerStr']),
      tableHeaders() {
        return this.customerFields_private.filter(item => this.innerShowTableHeaders.includes(item.customerPersonExtraFieldId + ''))
      }
    },
    watch: {
      showTableHeaders(v) {
        setTimeout(() => {
          this.innerShowTableHeaders = v
        }, 100)
      }
    },
    data() {
      return {
        followStatusENUM,
        customerLevelEnum,
        emptyPlaceholder,
        callStatusEnum,
        intentLevelEnum,
        loading: false,
        innerShowTableHeaders: []
      }
    },
    methods: {
      loadData(params, cb) {
        this.$refs.table.loadData({
          ...params,
          customerPersonListType: 'PRIVATE_LIST'
        }, cb)
      },
      parseDate,
      async handleCustomerDelete(customerPersonId) {
        try {
          await deleteCustomer({
            customerPersonListType: 'PRIVATE_LIST',
            customerPersonIds: [customerPersonId]
          })
          this.$message.success('删除成功')
          this.$emit('delete')
        } catch (error) {
          return
        }
      },
      handleRowDoubleClick(row) {
        if (!this.hasAccess('crm_private_viewDialHis')) {
          return
        }

        this.$emit('preview', row)
      },
      followStatusStyle(status) {
        if (status === 'FOLLOW_UP') {
          return { 'color': '#0abd77' }
        } else if (status === 'AI_INITIAL_VISIT') {
          return { 'color': '#1890ff' }
        } else if (status === 'PEOPLE_INITIAL_VISIT') {
          return { 'color': '#9d48f4' }
        }
      },
      checkAll(checkAll) {
        this.$refs.table.checkAll(checkAll)
      }
    },
    mounted() {
      this.loadData()
      this.innerShowTableHeaders = this.showTableHeaders
    }
  }
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/placeholder.scss';

  .table {
    .operation {
      position:relative;
      @extend %tableAction;
    }
    .dot {
      position:absolute;
      top:0;
      right:-7px;
      display: inline-block;
      height: 5px;
      width: 5px;
      background: red;
      border-radius: 50%;
    }
    .text-aa {
      width:100px;
    }
  }
  .label-tag-wrap {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
  }
  .label-tag {
    display: inline-block;
    padding: 2px 5px;
    margin-right: 5px;
    background:#E5EBF1;
  }
</style>

