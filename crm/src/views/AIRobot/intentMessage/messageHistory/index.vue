<template>
  <div>
    <div class="mt5 mb15">
      <!-- <el-select v-model="activeHistoryType">
        <el-option key="intentMessage" label="意向短信" value="intentMessage"></el-option>
        <el-option key="taskMessage" label="短信任务" value="taskMessage" v-if="hasAccess('crm_sms_job_view')"></el-option>
      </el-select> -->
      <el-button-group>
        <el-button :class="activeHistoryType === 'intentMessage' ? 'pitch-on' : '' " @click="changeType('intentMessage')">意向短信</el-button>
        <el-button :class="activeHistoryType === 'taskMessage' ? 'pitch-on' : '' " @click="changeType('taskMessage')" :disabled="!hasAccess('crm_sms_job_view')">短信任务</el-button>
      </el-button-group>
      <search-input
        placeholder="联系电话"
        v-model="filterSearchText"
        width="200px"
        @search="search"
      ></search-input>
      <span class="title">任务名：</span>
      <task-name-select
        :historyType="activeHistoryType"
        v-model="filterTaskName"
      ></task-name-select>
      <span class="title">发送日期：</span>
      <el-date-picker
        value-format="yyyy-MM-dd"
        v-model="filterCreationTime"
        type="date"
        style="width: 200px;"
        placeholder="发送日期"
        @change="search">
      </el-date-picker>
      <!-- <el-select v-model="filterSendStatus" placeholder="发送状态" @change="search" clearable>
        <el-option
          v-for="(value, key) in realFilterSendStatus"
          :key="value"
          :label="value"
          :value="key"
        ></el-option>
      </el-select> -->
      <!-- <el-select v-model="reportStatus" placeholder="接收状态" @change="search" clearable>
        <el-option
          v-for="(value, key) in reportState"
          :key="value"
          :label="value"
          :value="key"
        ></el-option>
      </el-select> -->
      <el-button class="w150 f12 ml5 empty" type="primary" @click="clearFilter">清空数据</el-button>
      <el-button class="ml5 export" type="primary" @click="onExportData">导出</el-button>
    </div>
    <pagination-table v-if="activeHistoryType === 'intentMessage'" key="intentMessage"
      url="/apiEngine/intentMessage/list"
      :server="'engine'"
      :pageZero="false"
      stripe
      :params="paginationParams"
      :headers="{
        'Content-Type': 'application/json'
      }"
      ref="table">
      <el-table-column key="callRecordId"
        v-if="activeHistoryType === 'intentMessage'"
        prop="callRecordId"
        label="通话记录id">
      </el-table-column>
      <el-table-column key="customerPersonName"
        prop="customerPersonName"
        :label="customerStr"
        width="">
      </el-table-column>
      <el-table-column key="phoneNumber"
        prop="phoneNumber"
        label="联系号码"
        width="">
      </el-table-column>
      <el-table-column key="createTime"
        prop="createTime"
        label="发送时间"
        width="">
      </el-table-column>
      <el-table-column key="sendStatus"
        prop="sendStatus"
        width="100px">
        <template slot="header">
          <filterTableSelection
            :filters="realFilterSendStatus"
            :multiple="false"
            @change="realFilterSendStatusSuccess"
          >
            <span slot="title">
              发送状态
            </span>
          </filterTableSelection>
        </template>
        <template slot-scope="{ row }">
          <send-status-column :sendStatus="row.sendStatus" :sendErrorMsg="row.sendErrorMsg"></send-status-column>
        </template>
      </el-table-column>
      <el-table-column key="smsTemplateName"
        prop="smsTemplateName"
        label="短信模板"
        width="">
      </el-table-column>
      <el-table-column key="robotCallJobName"
        prop="robotCallJobName"
        label="呼叫任务名称"
        width="">
      </el-table-column>
      <el-table-column key="costCount"
        prop="costCount"
        label="计费条数"
        width="">
      </el-table-column>
      <el-table-column
        prop="reportStatus"
        width="120px">
        <template slot="header">
          <filterTableSelection
            :filters="reportState"
            :multiple="false"
            @change="reportStateSuccess"
          >
            <span slot="title">
              接收状态
              <el-tooltip placement="top" content="接收成功即接收人成功接收到短信，接收失败的短信费用将在当天晚上12点退回至短信账号。">
                <i class="iconfont icon-shuomingx"></i>
              </el-tooltip>
            </span>
          </filterTableSelection>
        </template>
        <template slot-scope="{ row }">
          <span v-if="row.reportStatus === 'FAIL'">接收失败</span>
          <span v-if="row.reportStatus === 'SUCCESS'">接收成功</span>
          <span v-if="row.reportStatus === 'PENDING'">接收中</span>
        </template>
      </el-table-column>
      <el-table-column key="messageDetail"
        :show-overflow-tooltip="true"
        prop="messageDetail"
        label="短信详情"
        width="350px">
      </el-table-column>
    </pagination-table>
    <pagination-table v-else key="taskMessage"
      url="/apiEngine/smsJob/getIntentMessageByJobId"
      :server="'engine'"
      :pageZero="false"
      stripe
      :params="paginationParams"
      :headers="{
        'Content-Type': 'application/json'
      }"
      ref="table">
      <el-table-column
        prop="customerPersonName"
        :label="customerStr"
        width="">
      </el-table-column>
      <el-table-column
        prop="phoneNumber"
        label="联系号码"
        width="">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="发送时间"
        width="">
      </el-table-column>
      <el-table-column
        prop="sendStatus"
        width="">
        <template slot="header">
          <filterTableSelection
            :filters="realFilterSendStatus"
            :multiple="false"
            @change="realFilterSendStatusSuccess"
          >
            <span slot="title">
              发送状态
            </span>
          </filterTableSelection>
        </template>
        <template slot-scope="{ row }">
          <send-status-column :sendStatus="row.sendStatus" :sendErrorMsg="row.sendErrorMsg"></send-status-column>
        </template>
      </el-table-column>
      <el-table-column
        prop="smsJobName"
        label="短信任务名称"
        width="">
      </el-table-column>
      <el-table-column
        prop="costCount"
        label="计费条数"
        width="">
      </el-table-column>
      <el-table-column
        prop="reportStatus"
        width="">
        <template slot="header">
          <filterTableSelection
            :filters="reportState"
            :multiple="false"
            @change="reportStateSuccess"
          >
            <span slot="title">
              接收状态
              <el-tooltip placement="top" content="接收成功即接收人成功接收到短信，接收失败的短信费用将在当天晚上12点退回至短信账号。">
                <i class="iconfont icon-shuomingx"></i>
              </el-tooltip>
            </span>
          </filterTableSelection>
        </template>
        <template slot-scope="{ row }">
          <span v-if="row.reportStatus === 'FAIL'">接收失败</span>
          <span v-if="row.reportStatus === 'SUCCESS'">接收成功</span>
          <span v-if="row.reportStatus === 'PENDING'">接收中</span>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="messageDetail"
        label="短信详情"
        width="350px">
      </el-table-column>
    </pagination-table>
  </div>
</template>

<script>
import { SearchInput } from 'yiwise-components'
import PaginationTable from '@/components/PaginationTable/index'
import { filterTableSelection } from 'yiwise-components'
import * as smsAPI from '@/api/sms'
import moment from 'moment'
import * as constant from '@/utils/constant'
import taskNameSelect from './taskNameSelect'
import SendStatusColumn from './sendStatusColumn'
import TableAllCheck from './tableAllCheck'
import { mapGetters } from 'vuex'

// const filterSendStatusMap = {
//   'SEND_SUCCESSFUL': '发送成功',
//   'SEND_FAILURE': '发送失败',
//   'SEND_WAIT': '待发送',
//   'SENDING': '发送中'
// }
const historyTypeMap = {
  intentMessage: '意向短信',
  taskMessage: '短信任务'
}


export default {
  name: 'messageHistory',
  components: {
    PaginationTable,
    SearchInput,
    taskNameSelect,
    SendStatusColumn,
    TableAllCheck,
    filterTableSelection
  },
  data() {
    const historyTypeKeyList = Object.keys(historyTypeMap)
    return {
      filterCreationTime: null,
      filterSearchText: null,
      constant,
      filterTaskName: null,
      filterRoboCallJobOptions: [],
      filterSendStatus: null,
      historyTypeMap,
      activeHistoryType: historyTypeKeyList[0],
      tableUrlMap: {
        intentMessage: '/apiEngine/intentMessage/list',
        taskMessage: '/apiEngine/smsJob/getIntentMessageByJobId'
      },
      tableData: {},
      allChecked: false,
      reportStatus: null,
      reportState: [
          { text: '接受中', value: '0' ,type: 'PENDING'},
          { text: '接收成功', value: '1' ,type: 'SUCCESS'},
          { text: '接收失败', value: '2' ,type: 'FAIL'}
      ],
      filterSendStatusMap: [
        { text: '发送成功', value: '0' ,type: 'SEND_SUCCESSFUL'},
        { text: '发送失败', value: '1' ,type: 'SEND_FAILURE'},
        { text: '待发送', value: '2' ,type: 'SEND_WAIT'},
        { text: '发送中', value: '3' ,type: 'SENDING'},
      ]
    }
  },
  computed: {
    ...mapGetters(['customerStr']),
    paginationParams() {
      const commonParams = {
        phoneNumber: this.filterSearchText
      }
      if (this.activeHistoryType === 'taskMessage') {
        return {
          smsJobId: this.filterTaskName,
          sendDate: this.filterCreationTime,
          sendStatus: this.filterSendStatus,
          reportStatus: this.reportStatus,
          ...commonParams
        }
      }
      return {
        robotCallJobId: this.filterTaskName,
        creationTime: this.filterCreationTime,
        sendMessageStatus: this.filterSendStatus,
        reportStatus: this.reportStatus,
        ...commonParams
      }
    },
    realFilterSendStatus() {
      if (this.activeHistoryType === 'taskMessage') {
        return this.filterSendStatusMap
      }
      return [
        ...this.filterSendStatusMap,
        { text: '余额不足', value: '4' ,type: 'SEND_DEBT'},
        { text: '取消发送', value: '5' ,type: 'SEND_CANCEL'},
      ]
    }
  },
  methods: {
    search() {
      this.$nextTick(() => {
        this.loadData()
      })
    },
    clearFilter() {
      this.filterSearchText = null
      this.filterCreationTime = null
      this.filterTaskName = null
      this.reportStatus = null
      this.filterSendStatus = null
      this.search()
    },
    onExportData() {
      const apiMap = {
        taskMessage: 'exportSmsMsg',
        intentMessage: 'exportIntentSmsMsg'
      }
      smsAPI[apiMap[this.activeHistoryType]]({
        ...this.paginationParams
      })
        .then(({ data }) => {
          if (data.code === 200) {
            this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
            this.$message({
              message: '操作成功！详细结果请在导入导出列表查看',
              type: 'success'
            })
          } else {
            this.$message({
              message: '导出失败',
              type: 'error'
            })
          }
        })
    },
    loadData(page = 1, size = 20) {
      this.$refs.table.loadData(page, size)
    },
    parseDate(time) {
      if (time === null) {
        return null
      } else {
        return moment(time).format('YYYY-MM-DD')
      }
    },
    reportStateSuccess(checkList) {
      if (checkList) {
        this.reportStatus = this.reportState[checkList].type
      } else {
        this.reportStatus = null
      }
      this.search()
    },
    realFilterSendStatusSuccess(checkList) {
      if (checkList) {
        this.filterSendStatus = this.realFilterSendStatus[checkList].type
      } else {
        this.filterSendStatus = null
      }
      this.search()
    },
    changeType(value) {
      this.activeHistoryType = value
      this.reportStatus = null
      this.filterSendStatus = null
      this.search()
    }
  },
  watch: {
    filterTaskName: {
      handler: function(newVal) {
        this.search()
      }
    },
    activeHistoryType() {
      this.filterSendStatus = null
    }
  }
}
</script>

<style lang="scss" scoped>
  .w100{
    width: 100px;
    vertical-align: top;
    margin-right: -3px;

  }

  .w300{
    width: 300px;
    vertical-align: top;
  }

  .w30{
    width: 30px;
  }
  .pitch-on {
    background-color: #1890FF;
    border-color: #1890FF;
    color: #FFFFFF;
  }
  .el-button-group {
    margin-bottom: 2px;
    > .el-button.is-disabled {
      border:1px solid rgba(211,212,222,1);
      background:rgba(240,240,240,1);
      color:rgba(182,183,187,1);
    }
  }
  .search-input {
    margin-left: 20px;
  }
  .title {
    margin-left: 20px;
  }
  .empty {
    margin-left: 20px;
  }
  .export {
    width: 76px;
    float: right;
  }
  /deep/ .header-slot {
    height: 35px;
  }
  .iconfont {
    font-size: 13px;
  }
</style>
