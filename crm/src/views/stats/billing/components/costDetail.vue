<template>
  <div>
    <div class="pl16 mt5 mb15">
      <el-select v-model="type"
        class="ml15 mr5"
        @change="search"
        :disabled="!hasAccess('crm_cusSeat_view')"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.key"
          :value="item.key"
          :label="item.value"
        ></el-option>
      </el-select>
      <option-search-input
        width="300px"
        optionWidth="120px"
        :option-list="optionList"
        @search="search()"
        v-model="searchWords"
      >
      </option-search-input>
      <el-select
        v-if="[0, 1].includes(type)"
        v-model="filterRoboCallJobValue"
        placeholder="全部任务名称"
        class="mr5 mb15 mb15"
        remote
        clearable
        filterable
        :disabled="robotCallJobDisabled"
        :remote-method="getRobotCallJobList"
        @change="handleRemoteSearch"
        :popper-append-to-body="false"
        >
        <el-option
          v-for="item in filterRoboCallJobOptions"
          :key="item.robotCallJobId"
          :label="item.name"
          :value="item.robotCallJobId">
        </el-option>
      </el-select>
      <el-select
        class="mr5 mr5 mb15"
        placeholder="全部线路"
        filterable
        v-model="tenantPhoneNumberId"
        @change="search"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in numberList"
          :key="item.tenantPhoneNumberId"
          :value="item.tenantPhoneNumberId"
          :label="item.phoneName || item.phoneNumber"
        >
          <span style="float: left">{{(item.phoneName || item.phoneNumber)}}
            <el-tag v-if="item.phoneName !== '全部线路' && item.enabledStatus">有效</el-tag>
            <el-tag v-if="item.phoneName !== '全部线路' && !item.enabledStatus" type="danger">解绑</el-tag>
          </span>
        </el-option>
      </el-select>
      <el-tooltip v-if="type !== 4"  content="请先选择线路" placement="top">
        <el-select
          class="mr5 mr5 mb15"
          placeholder="全部归属地类型"
          v-model="callType"
          @change="search"
          :disabled="!tenantPhoneNumberId"
          :popper-append-to-body="false"
        >
          <el-option
            v-for="item in callTypeOptions"
            :key="item.key"
            :value="item.key"
            :label="item.value"
          >
          </el-option>
        </el-select>
      </el-tooltip>
      <el-select
        v-model="filterResultStatuses"
        placeholder="全部通话状态"
        class="mr5 mb15"
        @change="search"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in constant.resultStatusMultipleOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-select
        v-model="chatDuration"
        placeholder="全部通话时长"
        class="mr5 mb15"
        @change="search"
        :popper-append-to-body="false"
      >
        <el-option
          v-for="item in constant.durationOptions"
          :key="item.key"
          :label="item.value"
          :value="item.key">
        </el-option>
      </el-select>
      <el-date-picker
        @change="search"
        v-model="startEndDate"
        type="daterange"
        align="right"
        value-format="yyyy-MM-dd"
        unlink-panels
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
      <el-button class="w150 f12 mr5 " type="primary" @click="clearFilter()">清空筛选条件</el-button>
      <el-button class="float-r mr15" type="primary"  @click="exportCost" v-if="hasAccess('crm_statisticsBill_export')">导出话单明细</el-button>
    </div>
    <pagination-table
      :url="'/apiEngine/callCost/infoList'"
      stripe
      :server="'engine'"
      :max-height="clientHeight - 250"
      :pageZero="false"
      :params="paginationParams"
      ref="table">
      <el-table-column
        fixed
        prop="callRecordId"
        label="通话记录id"
        width="">
      </el-table-column>
      <yiwise-table-column
        prop="customerPersonName"
        :label="customerStr"
        width="">
      </yiwise-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="calledPhoneNumber"
        label="联系电话"
        width="">
      </el-table-column>
      <el-table-column label="归属地" v-if="[2, 3, 4].includes(type)">
        <template slot-scope="scope">
          {{scope.row.calledPhoneNumberLocationProv, scope.row.calledPhoneNumberLocationCity}}
        </template>
      </el-table-column>
      <el-table-column label="呼入线路" v-if="[2, 3, 4].includes(type)">
        <template slot-scope="scope">
          <span>{{scope.row.callingPhoneNumberName}}</span>
          <el-tag v-if="scope.row.tenantPhoneNumberStatus==0" type="danger">解绑</el-tag>
          <el-tag v-if="scope.row.tenantPhoneNumberStatus==1">有效</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="接待方式" v-if="[2, 3, 4].includes(type)">
        <template slot-scope="{ row }">
          {{staffGroupEnum[row.seatType] || '--'}}
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        v-if="type===0"
        label="任务名称">
        <template slot-scope="{ row }">
          {{row.robotCallJobName || '--'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="startTime"
        label="通话时间"
        width="">
        <template slot-scope="scope">
          {{parseTime(scope.row.startTime)}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="[0, 1].includes(type)"
        prop="callingPhoneNumberName"
        label="线路名"
        width="">
        <template slot-scope="scope">
          <span>{{scope.row.callingPhoneNumberName}}</span>
          <el-tag v-if="scope.row.tenantPhoneNumberStatus==0 || !scope.row.tenantPhoneNumberStatus" type="danger">解绑</el-tag>
          <el-tag v-if="scope.row.tenantPhoneNumberStatus==1">有效</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="resultStatus"
        label="通话状态"
        width="">
        <template slot-scope="scope">
          {{constant.resultStatus[scope.row.resultStatus]}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="[0, 1].includes(type)"
        label="号码归属地"
        width="">
        <template slot-scope="scope">
          {{scope.row.calledPhoneNumberLocationProv, scope.row.calledPhoneNumberLocationCity}}
        </template>
      </el-table-column>
      <el-table-column
        prop="chatDuration"
        label="通话时长(秒)"
        width="">
      </el-table-column>
      <el-table-column
        prop="callCost"
        label="话费(元)"
        width="">
        <template slot-scope="scope">
          {{scope.row.callCost / 1000}}
        </template>
      </el-table-column>
    </pagination-table>
  </div>
</template>

<script>
import { OptionSearchInput, YiwiseTableColumn } from 'yiwise-components'
import PaginationTable from '@/components/PaginationTable/index'
import * as statsAPI from '@/api/stats'
import * as constant from '@/utils/constant'
import { staffGroupEnum } from '@/utils/enum'
import * as moment from 'moment'
import { mapGetters } from 'vuex'
import * as taskAPI from '@/api/task'
import * as numberpoolAPI from '@/api/numberpool'

export default {
  data() {
    return {
      staffGroupEnum,
      searchWords: undefined,
      startEndDate: undefined,
      filterRoboCallJobValue: undefined,
      filterRoboCallJobOptions: [],
      tenantPhoneNumberId: undefined,
      numberList: [],
      filterResultStatuses: undefined,
      beginChatDuration: undefined,
      endChatDuration: undefined,
      formLabelWidth: '80px',
      callType: undefined,
      chatDuration: undefined,
      type: 0
    }
  },
  watch: {
    type: {
      handler: function(val) {
        this.filterRoboCallJobValue = undefined
      },
      deep: true
    }
  },
  components: {
    PaginationTable,
    OptionSearchInput,
    YiwiseTableColumn
  },
  computed: {
    robotCallJobDisabled() {
      return this.type === 1
    },
    constant() {
      return constant
    },
    callTypeOptions() {
      // this.callType = ''
      // if(this.type === 2 || this.type === 3) {
      //   return constant.callTypeOptions2
      // }else {
      return constant.callTypeOptions
      // }
    },
    ...mapGetters([
      'clientHeight',
      'enableCsSeat',
      'userEnableCsSeat',
      'enableIvr',
      'customerStr'
    ]),
    optionList() {
      return [
        {
          label: '电话号码',
          searchKey: 'calledPhoneNumber',
          placeholder: '请输入电话号码'
        },
        {
          label: '通话记录ID',
          searchKey: 'callRecordId',
          placeholder: '请输入通话记录ID'
        },
        {
          label: `${this.customerStr}名称`,
          searchKey: 'customerPersonName',
          placeholder: `请输入${this.customerStr}名称`
        }
      ]
    },
    typeOptions() {
      let options = [
        {
          key: 0,
          value: 'AI外呼'
        }
      ]

      if (this.enableCsSeat || this.userEnableCsSeat) {
        options.push({
          key: 1,
          value: '人工外呼'
        })
      }

      options = options.concat([
        {
          key: 2,
          value: 'AI接待'
        },
        {
          key: 3,
          value: '人工接待'
        }
      ])

      if (this.enableIvr) {
        options.push({
          key: 4,
          value: 'IVR接待'
        })
      }

      return options
    },
    paginationParams() {
      return {
        ...this.searchWords,
        robotCallJobId: this.filterRoboCallJobValue,
        tenantPhoneNumberId: this.tenantPhoneNumberId,
        resultStatus: this.filterResultStatuses,
        beginChatDuration: this.beginChatDuration,
        endChatDuration: this.endChatDuration,
        chatDuration: this.chatDuration,
        status: this.filterStatus,
        callType: this.callType,
        type: this.type,
        beginDate: this.startEndDate ? this.startEndDate[0] : undefined,
        endDate: this.startEndDate ? this.startEndDate[1] : undefined
      }
    }
  },
  methods: {
    search() {
      this.$nextTick(() => {
        this.loadData()
      })
    },
    clearFilter() {
      this.searchWords = undefined
      this.filterRoboCallJobValue = undefined
      this.tenantPhoneNumberId = undefined
      this.filterResultStatuses = undefined
      this.beginChatDuration = undefined
      this.endChatDuration = undefined
      this.chatDuration = undefined
      this.callType = undefined
      this.startEndDate = undefined
      this.$nextTick(() => {
        this.loadData()
      })
    },
    loadData(page = 1, size = 20) {
      this.$refs.table.loadData(page, size)
    },
    parseTime(time) {
      return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : null
    },
    handleRemoteSearch(val) {
      this.search()
      if (val === '') {
        this.getRobotCallJobList()
      }
    },
    getRobotCallJobList(val) {
      taskAPI.getSimpleList({
        searchWords: val
      }).then(({ data }) => {
        this.filterRoboCallJobOptions = data.data
      })
    },
    getNumberPoolList() {
      numberpoolAPI.getTenantPhoneNumberList().then(({ data }) => {
        this.numberList = data.data
      })
    },
    exportCost() {
      statsAPI.exportCallCost({
          ...this.paginationParams
      }).then(({ data }) => {
        if (data.code === 200) {
          this.$message.success('操作成功！详细结果请在导入导出列表查看')
          this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
        }
      })
    }
  },
  mounted() {
    this.getRobotCallJobList()
    this.getNumberPoolList()
  }
}
</script>

<style lang="scss" scoped>
  .w100{
    width: 100px;
    vertical-align: top;
    margin-right: -3px;

  }
  .stats {
    span {
      margin-left: 15px;
      font-size: 14px;
    }
    height: 40px;
    line-height: 40px;
    font-size: 12px;
  }

  .w300{
    width: 300px;
    vertical-align: top;
  }

  .mb5{
    margin-bottom: 5px;
  }
  .w30{
    width: 30px;
  }
  .el-button + .el-button {
    margin-left: 5px;
  }
  .remark-text {
    font-size: 12px;
    color: #666;
    line-height: 12px;
  }
  .count-text {
    position: absolute;
    right: 10px;
    bottom: 10px;
    background: #fff;
  }
  /deep/ .el-dialog__body {
    padding: 0 150px!important;
  }
  /deep/ .el-form-item--small.el-form-item:last-child {
    margin-bottom: 37px;
  }
  /deep/ .el-textarea__inner {
    padding: 5px 15px 25px;
  }
</style>
