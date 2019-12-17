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
    </div>
    <div class="filter">
      <record-score-range
        :minScore.sync="minScore"
        :maxScore.sync="maxScore"
        @search="loadData({
          pageNum: 1,
          minScore,
          maxScore
        })"
      ></record-score-range>
      <el-button type="primary" @click="onRefresh">刷新</el-button>
    </div>
    <pagination-table
      ref="table"
      url="/apiEngine/qcJobRecord/qcRecordList"
      method="post"
      :autoLoad="false"
      :headers="{
        'Content-Type': 'application/json'
      }"
      :max-height="clientHeight - 255"
    >
      <el-table-column label="通话记录ID" prop="qcJobRecordId"></el-table-column>
      <el-table-column label="坐席姓名" v-if="!isUpload" prop="csName"></el-table-column>
      <el-table-column :label="`${customerStr}姓名`" v-if="!isUpload" prop="customerPersonName"></el-table-column>
      <el-table-column :label="`${customerStr}电话`" v-if="!isUpload" prop="customerPersonPhoneNumber"></el-table-column>
      <el-table-column label="呼叫时间" prop="callRecordTime"></el-table-column>
      <el-table-column label="处理状态">
        <template slot-scope="{ row }">
          <span v-if="!(row.status === 'FAIL' && row.failReason)">{{HANDLE_STATUS[row.status]}}</span>
          <el-popover
            v-else
            placement="top"
            title=""
            width="160"
            trigger="hover"
            :content="row.failReason">
            <span slot="reference" class="operation" v-if="row.status === 'FAIL' && row.failReason">
              {{HANDLE_STATUS[row.status]}}
            </span>
          </el-popover>
          </template>
      </el-table-column>
      <el-table-column label="呼叫时长（秒）">
        <template slot-scope="{ row }">
          <!-- 0当作无法识别处理 -->
          {{row.chatDuration === 0 ? '--' : row.chatDuration}}
        </template>
      </el-table-column>
      <el-table-column label="质检分数">
        <template slot-scope="{ row }">
          {{row.status === 'FAIL' ? '--' : (row.madeScore || row.score)}}
        </template>
      </el-table-column>
      <el-table-column label="复核人" prop="madeUserName">
        <template slot-scope="{ row }">{{row.madeUserName || '--'}}</template>
      </el-table-column>
      <el-table-column label="通话详情" width="110px">
        <template slot-scope="scope">
          <a
            v-if="hasAccess('crm_qc_job_detail')"
            class="detail-a"
            @click="onOpenDetailDialog(scope.$index, scope.row.qcJobRecordId)"
            :class="{'unread': scope.row.readStatus !== 'READ' && !readIdList.includes(scope.row.qcJobRecordId)}"
          >查看通话详情</a>
        </template>
      </el-table-column>
    </pagination-table>
    <call-record-detail-dialog
      :visible.sync="callRecordDetailDialogVisible"
      :tableData="tableData"
      :defaultIndex="callRecordIndex"
      :loadTableData="loadData"
    ></call-record-detail-dialog>
  </div>
</template>

<script>
import { PaginationTable } from 'yiwise-components'
import * as constant from '@/utils/constant'
import { QC_STATUS, DEL_UNCHECKED_STATUSED, HANDLE_STATUS } from '../utils/enum'
import RecordOptionSearchInput from '../components/recordOptionSearchInput'
import RecordCsStaff from '../components/recordCsStaff'
import RecordScoreRange from '../components/recordScoreRange'
import CallRecordDetailDialog from '../callRecordDetailDialog/index'
import { mapGetters } from 'vuex'

export default {
  components: {
    PaginationTable,
    RecordOptionSearchInput,
    RecordCsStaff,
    RecordScoreRange,
    CallRecordDetailDialog
  },
  data() {
    return {
      searchWords: undefined,
      constant,
      QC_STATUS,
      DEL_UNCHECKED_STATUSED,
      HANDLE_STATUS,
      csStaffId: undefined,
      minScore: undefined,
      maxScore: undefined,
      callRecordDetailDialogVisible: false,
      tableData: {},
      callRecordIndex: -1,
      readIdList: []
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
      }, (tableData) => {
        this.tableData = tableData
      })
    },
    onOpenDetailDialog(index, qcJobRecordId) {
      this.callRecordDetailDialogVisible = true
      this.callRecordIndex = index
      if (this.readIdList.indexOf(qcJobRecordId) === -1) {
        this.readIdList.push(qcJobRecordId)
      }
    },
    clearFilter() {
      this.csStaffId = undefined
      this.searchWords = {
        customerPersonPhoneNumber: undefined,
        callRecordId: undefined,
        customerPersonName: undefined
      }
      this.minScore = undefined
      this.maxScore = undefined
      this.loadData({
        pageNum: 1,
        csStaffId: this.csStaffId,
        minScore: undefined,
        maxScore: undefined,
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
@import 'src/styles/variables.scss';
@import 'src/styles/placeholder.scss';

.unchecked {
  .filter {
    margin-bottom: 10px;
  }
  .detail-a {
    color: $--link-color;
    &:hover {
      color: $--link-hover-color;
    }
    &.unread {
      position: relative;
      &::after {
        content: '';
        display: block;
        position: absolute;
        right: -10px;
        top: 0;
        width: 6px;
        height: 6px;
        background-color: red;
        border-radius: 50%;
      }
    }
  }
}
.operation {
  @extend %tableAction;
}
</style>
