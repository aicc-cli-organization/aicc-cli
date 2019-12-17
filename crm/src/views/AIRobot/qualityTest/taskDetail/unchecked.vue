<template>
  <div class="unchecked">
    <div class="filter">
      <record-option-search-input
        v-model="searchWords"
        @search="loadData({ pageNum: 1, ...searchWords })"
      ></record-option-search-input>
      <record-cs-staff
        filterable
        v-model="csStaffId"
        @change="loadData({
          pageNum: 1,
          csStaffId
        })"
      ></record-cs-staff>
      <el-button type="primary" @click="clearFilter">清空筛选条件</el-button>
      <el-button type="primary" @click="onRefresh">刷新</el-button>
    </div>
    <pagination-table
      ref="table"
      url="/apiEngine/qcJobRecord/notQcRecordList"
      method="post"
      :autoLoad="false"
      :headers="{
        'Content-Type': 'application/json'
      }"
      :max-height="clientHeight - 255"
    >
      <el-table-column label="通话记录ID" prop="callRecordId"></el-table-column>
      <el-table-column label="坐席姓名" v-if="!isUpload" prop="csName"></el-table-column>
      <el-table-column :label="`${this.customerStr}姓名`" v-if="!isUpload" prop="customerPersonName"></el-table-column>
      <el-table-column :label="`${this.customerStr}电话`" v-if="!isUpload" prop="customerPersonPhoneNumber"></el-table-column>
      <el-table-column label="呼叫时间" prop="callRecordTime"></el-table-column>
      <el-table-column label="通话状态">
        <template slot-scope="{ row }">{{constant.resultStatus[row.callStatus]}}</template>
      </el-table-column>
      <el-table-column label="呼叫时长(秒)" width="120px" prop="chatDuration" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="质检状态">
        <template slot-scope="{ row }">{{QC_STATUS[row.status]}}</template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row }" v-if="DEL_UNCHECKED_STATUSED.includes(row.status)">
          <a class="delete-a" @click="onDelItem(row.qcJobRecordId)">删除</a>
        </template>
      </el-table-column>
    </pagination-table>
  </div>
</template>

<script>
import { PaginationTable } from 'yiwise-components'
import * as constant from '@/utils/constant'
import * as qcAPI from '@/api/qualityTest'
import { QC_STATUS, DEL_UNCHECKED_STATUSED } from '../utils/enum'
import RecordOptionSearchInput from '../components/recordOptionSearchInput'
import RecordCsStaff from '../components/recordCsStaff'
import { mapGetters } from 'vuex'

export default {
  components: {
    RecordOptionSearchInput,
    RecordCsStaff,
    PaginationTable
  },
  data() {
    return {
      searchWords: undefined,
      constant,
      QC_STATUS,
      DEL_UNCHECKED_STATUSED,
      csStaffId: undefined
    }
  },
  computed: {
    ...mapGetters([
      'clientHeight', 'customerStr'
    ]),
    selectedTaskId() {
      return this.$store.state.qcTask.selectedTaskId
    },
    isUpload() {
      return this.$store.state.qcTask.taskDetail.jobProperty === 'UPLOAD'
    }
  },
  methods: {
    loadData(params) {
      this.$refs.table.loadData({
        qcJobId: this.selectedTaskId,
        ...params
      })
    },
    async onDelItem(qcJobRecordId) {
      await qcAPI.deleteUncheckItem({
        qcJobRecordId
      })
      this.loadData()
      this.$message({
        message: '删除成功',
        type: 'success'
      })
    },
    clearFilter() {
      this.csStaffId = undefined
      this.searchWords = {
        customerPersonPhoneNumber: undefined,
        callRecordId: undefined,
        customerPersonName: undefined
      }
      this.loadData({
        pageNum: 1,
        csStaffId: this.csStaffId,
        ...this.searchWords
      })
    },
    onRefresh() {
      this.loadData()
    }
  },
  watch: {
    selectedTaskId: {
      handler: function(newVal) {
        if (newVal) {
          this.clearFilter()
        }
      }
    },
    deep: true
  }
}
</script>

<style lang="scss" scoped>
@import "~src/styles/variables.scss";

.unchecked {
  .filter {
    margin-bottom: 10px;
  }
  .delete-a {
    color: $--link-color;
    &:hover {
      color: $--link-hover-color;
    }
  }
}
</style>
