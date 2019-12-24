<template>
  <pagination-table
    v-if="url"
    class="table"
    ref="table"
    :url="url"
    :data="tableData.content"
    :autoLoad="false"
    :headers="{
      'Content-Type': 'application/json'
    }"
    @current-change="handleCurrentChange"
    @size-change="handleSizeChange"
    :max-height="clientHeight - 255"
  >
    <el-table-column
      :label="customerStr"
      width="">
      <template slot-scope="{ row }">{{row.customerPersonName || '--'}}</template>
    </el-table-column>
    <el-table-column
      prop="phoneNumber"
      label="联系电话">
    </el-table-column>
    <el-table-column
      prop="sendStatus"
      label="发送状态">
      <template slot-scope="scope">
        <send-status-column :sendStatus="scope.row.sendStatus" :sendErrorMsg="scope.row.sendErrorMsg"></send-status-column>
      </template>
    </el-table-column>
    <el-table-column
      prop="costCount"
      label="计费条数"
      width="">
      <template slot-scope="scope">
        {{scope.row.costCount || 0}}
      </template>
    </el-table-column>
  </pagination-table>
</template>

<script>
import { PaginationTable } from 'yiwise-components'
import { mapGetters } from 'vuex'
import { SMS_SEND_MAP } from '../config/enum'
import SendStatusColumn from '@/views/AIRobot/intentMessage/messageHistory/sendStatusColumn'

export default {
  props: {
    pagingParams: {
      type: Object,
      default() {
        return {}
      }
    },
    url: String
  },
  data() {
    return {
      paginationParams: {
        pageNum: 1,
        pageSize: 20
      },
      tableData: {},
      SMS_SEND_MAP
    }
  },
  computed: {
    ...mapGetters([
      'clientHeight', 'customerStr'
    ]),
    selectTaskId() {
      return this.$store.state.smsTask.selectSmsTaskId
    }
  },
  components: {
    PaginationTable,
    SendStatusColumn
  },
  methods: {
    handleCurrentChange(page) {
      this.loadData({
        pageNum: page
      })
    },
    handleSizeChange(size) {
      this.loadData({
        pageSize: size
      })
    },
    loadData(params = {}, cb) {
      if (!(this.selectTaskId && this.url)) {
        return
      }
      params = {
        ...this.paginationParams,
        ...params,
        smsJobId: this.selectTaskId
      }
      this.$refs.table.loadData(params, tableData => {
        if (tableData.totalElements && this.url === '/apiEngine/smsJob/getNotSendMessageList') {
          this.$store.commit('UPDATE_NOTSEND_TOTAL', tableData.totalElements)
        }
        this.tableData = tableData
        if (cb) {
          cb()
        }
      })
    }
  },
  mounted() {
    this.loadData()
  },
  watch: {
    pagingParams: {
      handler(value) {
        this.loadData(value)
      },
      deep: true
    },
    selectTaskId() {
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  margin: 20px;
}
</style>
