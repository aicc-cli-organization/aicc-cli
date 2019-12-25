<template>
  <PaginationTable
    url="/apiEngine/customerPerson/list"
    ref="table"
    :server="'engine'"
    stripe
    :total.sync="innerTotal"
    :pageZero="false"
    method="post"
    :headers="{
      'Content-Type': 'application/json'
    }"
    customClass="table-header-change-loading"
    :params="params"
    :max-height="clientHeight - 370"
    :multipleSelection.sync="multipleSelection"
    @select-all="(selection) => $emit('select-all', selection)"
    @select="(selection, row) => $emit('select', selection, row)"
    @handleSelectionChange="(val) => $emit('selection-change', val)"
    @totalSizeChange="totalSize => $emit('totalSizeChange', totalSize)"
    @refreshTable="() => $emit('refreshTable')"
  >
    <el-table-column type="selection" width="40"></el-table-column>
    <el-table-column v-for="item in tableHeaders" :key="item.customerPersonExtraFieldId" :label="item.name">
      <template slot-scope="{ row }">
        <customerCommonTableHeaders :rowData="row" :header="item" page="public"></customerCommonTableHeaders>
      </template>
    </el-table-column>
    <el-table-column label="最近呼叫时间" prop="lastStartTime" sortable='custom' v-if="innerShowTableHeaders.includes('lastStartTime')">
      <template slot-scope="{ row }">
        {{parseDate(row.lastStartTime)}}
      </template>
    </el-table-column>
    <el-table-column label="最近外呼任务" prop="lastRobotCallJobName"  v-if="innerShowTableHeaders.includes('lastRobotCallJobName')">
      <template slot-scope="{ row }">
        {{row.lastRobotCallJobName || emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column label="最近通话状态" v-if="innerShowTableHeaders.includes('lastDialStatus')">
      <template slot-scope="{ row }">
        {{row.lastDialStatus ? callStatusEnum[row.lastDialStatus] : emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column :label="`最近${customerStr}意向`" prop="lastIntentLevelName" sortable='custom' v-if="innerShowTableHeaders.includes('lastIntentLevel')">
      <template slot-scope="{ row }">
        {{row.lastIntentLevelName || emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column label="最近呼叫时长" prop="lastChatDuration" sortable='custom' v-if="innerShowTableHeaders.includes('lastChatDuration')">
      <template slot-scope="{ row }">
        {{(row.lastChatDuration != null) ? (row.lastChatDuration + '秒') : emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column
      fixed="right"
      label="操作"
      width="200px"
      v-if="hasOneAccessOf(['crm_publicSea_addOrEdit', 'crm_publicSea_del', 'crm_publicSea_addToWhiteList'])">
      <div slot-scope="scope" class="action">
        <el-button type="text" @click="$emit('edit', scope.row)" v-if="hasAccess('crm_publicSea_addOrEdit')">编辑</el-button>
        <YiwisePopConfirm :label="`确认删除该${customerStr}吗？`" @submit="removeCustomer(scope.row)" v-if="hasAccess('crm_publicSea_del')">
          <el-button type="text">删除</el-button>
        </YiwisePopConfirm>
        <addToWhiteListPopOver
          :disabled="scope.row.inWhiteList"
          :customerPersonId="scope.row.customerPersonId"
          @refresh="$emit('refresh')"
          v-if="hasAccess('crm_publicSea_addToWhiteList')">
          <el-button type="text" :disabled="scope.row.inWhiteList" v-if="hasAccess('crm_publicSea_addToWhiteList')">加入白名单</el-button>
        </addToWhiteListPopOver>
      </div>
    </el-table-column>
  </PaginationTable>
</template>

<script>
import { mapGetters } from 'vuex'
import PaginationTable from '@/components/PaginationTable'
import addToWhiteListPopOver from '@/components/addToWhiteListPopOver'
import customerCommonTableHeaders from '@/components/customer/customerCommonTableHeaders'
import { parseDate } from '@/utils/date'
import { YiwisePopConfirm } from 'yiwise-components'
import * as customerAPI from '@/api/customer'
import { intentLevelEnum, callStatusEnum } from '@/utils/enum'
import { emptyPlaceholder } from '@/utils/constant'

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
    },
    total: {
      type: Number,
      default: 0
    },
    showTableHeaders: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      emptyPlaceholder,
      intentLevelEnum,
      callStatusEnum,
      multipleSelection: [],
      innerShowTableHeaders: []
    }
  },
  computed: {
    ...mapGetters(['clientHeight', 'isLocal', 'customerFields_public', 'customerStr']),
    innerTotal: {
      get: function(val) {
        return this.total
      },
      set: function(val) {
        this.$emit('update:total', val)
      }
    },
    params() {
      return {
        ...this.paginationParams,
        customerPersonListType: 'PUBLIC_LIST'
      }
    },
    tableHeaders() {
      return this.customerFields_public.filter(item =>
        this.innerShowTableHeaders.includes(item.customerPersonExtraFieldId + '')
      )
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
    parseDate,
    removeCustomer(row) {
      customerAPI.deleteCustomer({
        customerPersonListType: 'PUBLIC_LIST',
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
    checkAll(checkAll) {
      this.$refs.table.checkAll(checkAll)
    }
  },
  mounted() {
    this.innerShowTableHeaders = this.showTableHeaders
  }
}
</script>
