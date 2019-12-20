<template>
  <div>
    <div class="pl16 mt5 mb15">
      <el-input class="w300" @keyup.enter.native="search()" placeholder="输入联系电话"  size="small" v-model="filterSearchText">
        <el-button class="w30" slot="append" icon="el-icon-search"  size="small"  @click="search()"></el-button>
      </el-input>

      <el-date-picker
        @change="search()"
        v-model="filterCreationTime"
        type="date"
        style="width: 200px;"
        placeholder="创建日期">
      </el-date-picker>

      <el-select
        v-model="filterRoboCallJobValue"
        placeholder="任务名称" class="ml5"
        filterable
        remote
        clearable
        :remote-method="getRobotCallJobList"
        @change="handleRemoteSearch">
        <el-option
          v-for="item in filterRoboCallJobOptions"
          :key="item.robotCallJobId"
          :label="item.name"
          :value="item.robotCallJobId">
        </el-option>
      </el-select>
      <el-button class="w150 f12 ml5" type="primary" @click="clearFilter()">清空筛选条件</el-button>
    </div>
    <pagination-table
      :url="'/apiEngine/intentMessage/list'"
      :server="'engine'"
      :pageZero="false"
      stripe
      :params="paginationParams"
      :headers="{
        'Content-Type': 'application/json'
      }"
      ref="table">
      <el-table-column
        fixed
        prop="callRecordId"
        label="通话记录id"
        width="">
      </el-table-column>
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
        label="发送状态"
        width="">
        <template slot-scope="{ row }">
          <span v-if="row.sendStatus !== 'SEND_FAILURE' || !row.sendErrorMsg">{{constant.messageSendStatusENUM[row.sendStatus]}}</span>
          <el-popover
            v-if="row.sendStatus === 'SEND_FAILURE' && row.sendErrorMsg"
            placement="top"
            title=""
            width="160"
            trigger="hover"
            :content="row.sendErrorMsg">
            <span slot="reference" class="operation" v-if="row.sendStatus === 'SEND_FAILURE' && row.sendErrorMsg">{{constant.messageSendStatusENUM[row.sendStatus]}}</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        prop="smsTemplateName"
        label="短信模板"
        width="">
      </el-table-column>
      <el-table-column
        prop="robotCallJobName"
        label="任务名称"
        width="">
      </el-table-column>
      <el-table-column
        prop="costCount"
        label="计费条数"
        width="">
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="messageDetail"
        label="短信详情"
        width="350px"
        >
      </el-table-column>
    </pagination-table>
  </div>
</template>

<script>
import PaginationTable from '@/components/PaginationTable/index'
import * as taskAPI from '@/api/task'
import moment from 'moment'
import * as constant from '@/utils/constant'
import { mapGetters } from 'vuex'

export default {
  name: 'messageHistory',
  components: {
    PaginationTable
  },
  data() {
    return {
      filterCreationTime: null,
      filterSearchText: null,
      constant,
      filterRoboCallJobValue: null,
      filterRoboCallJobOptions: []

    }
  },
  mounted() {
    this.getRobotCallJobList()
  },
  computed: {
    ...mapGetters(['customerStr']),
    paginationParams() {
      return {
        robotCallJobId: this.filterRoboCallJobValue,
        creationTime: this.parseDate(this.filterCreationTime),
        phoneNumber: this.filterSearchText
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
      this.filterSearchText = null
      this.filterCreationTime = null
      this.filterRoboCallJobValue = null
      this.$nextTick(() => {
        this.loadData()
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
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';

  .el-table {
    .operation {
      @extend %tableAction;
    }
  }

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
</style>
