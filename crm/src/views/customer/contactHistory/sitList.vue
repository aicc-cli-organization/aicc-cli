<template>
  <new-pagination-table
    class="table"
    ref="table"
    :url="'/apiEngine/csRobot/searchCsRecord'"
    method="post"
    :headers="{
      'Content-Type': 'application/json'
    }"
    customClass="table-header-change-loading"
    :autoLoad="false"
    server="engine"
    :pageZero="false"
    :max-height="clientHeight - 392"
    @row-dblclick="handleRowDoubleClick"
    @select-all="(selection) => $emit('select-all', selection)"
    @select="(selection, row) => $emit('select', selection, row)"
    @selection-change="(val) => $emit('selection-change', val)"
    @totalSizeChange="totalSize => $emit('totalSizeChange', totalSize)"
    @refreshTable="() => $emit('refreshTable')"
  >
    <el-table-column type="selection" width="37"></el-table-column>
    <el-table-column fixed v-if="innerShowTableHeaders.includes('callRecordId')" prop="csRecordId" label="通话记录id" width="80">
      <template slot-scope="{ row }">
        {{row.csRecordId || '--'}}
      </template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('name')" label="姓名" width="">
      <template slot-scope="{ row }">
        <YiwiseUserName
          :name="row.customerPersonName"
          :inWhiteList="row.inWhiteList"
          :inShareWhiteList="row.inShareWhiteList"
        ></YiwiseUserName>
      </template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('gender')" label="性别" width="">
      <template slot-scope="{ row }">
        {{genderEnum[row.customerPerson ? row.customerPerson.gender : row.gender] || emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('phoneNumber')" prop="customerPersonNumber" label="联系电话" width=""></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('robotCallJobName')" prop="csName" label="坐席名称" width=""></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('startTime')" prop="startTime" label="呼叫时间" width="140"></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('resultStatus')" label="通话状态" width="80">
      <template slot-scope="scope">{{constant.resultStatus[scope.row.resultStatus]}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('tenantPhoneNumber')" label="主叫号码" width="200">
      <template slot-scope="{ row }">{{getPhoneStr(row)}}</template>
    </el-table-column>
    <!-- <el-table-column v-if="innerShowTableHeaders.includes('notifyType')"  label="请求接听" width="120">
      <template slot-scope="scope">{{getNotifyStr(scope.row.notifyType)}}</template>
    </el-table-column> -->
    <el-table-column label="转接坐席" width="120">
      <template slot-scope="{ row }">
        {{row.resultStatus === 'ANSWERED' ? (row.csAnswer === 'YES' ? '成功' : '失败') : '--'}}
      </template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('csName')"  label="接入人员" width="120">
      <template slot-scope="scope">{{getCsStr(scope.row.csStaffName, scope.row.csStaffGroupName)}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('chatDuration')" prop="chatDuration" label="呼叫时长（秒）" width="120"></el-table-column>
    <el-table-column fixed="right" label="通话详情" width="120px" v-if="hasAccess('crm_dialHistory_viewDialDetail')">
      <template slot-scope="scope">
        <el-button style="position: relative" class="mr10" @click="$emit('showCallDetail', scope.row, scope.$index)" type="text" size="small">查看通话详情
          <div class="dot" v-if="scope.row.read === 'NOT_READ'"></div>
        </el-button>
      </template>
    </el-table-column>
  </new-pagination-table>
</template>

<script>
  import NewPaginationTable from '@/components/NewPaginationTable'
  import YiwiseUserName from '@/components/YiwiseUserName'
  import { genderEnum, customerLevelEnum, customerSourceEnum, callStatusEnum, intentLevelEnum, hangupEnum, noticeStatusEnum } from '@/utils/enum'
  import { emptyPlaceholder } from '@/utils/constant'
  import { mapGetters } from 'vuex'
  import * as constant from '@/utils/constant'

  export default {
    name: 'MyCustomerList',
    components: {
      NewPaginationTable,
      YiwiseUserName
    },
    props: {
      showTableHeaders: {
        type: Array,
        default: []
      }
    },
    computed: {
      ...mapGetters(['clientHeight']),
      constant() {
        return constant
      }
    },
    data() {
      return {
        genderEnum,
        customerLevelEnum,
        emptyPlaceholder,
        customerSourceEnum,
        callStatusEnum,
        intentLevelEnum,
        hangupEnum,
        noticeStatusEnum,
        innerShowTableHeaders: []
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
      getPhoneStr(row) {
        const { phoneType, tenantPhoneNumber, phoneName } = row
        return (phoneType === 'MOBILE' ? (phoneName ? `${phoneName}-` : '') + (tenantPhoneNumber || '') : tenantPhoneNumber) || emptyPlaceholder
      },
      getNotifyStr(notify) {
        console.log(notify)
        console.log(noticeStatusEnum[notify])
        if (notify) return noticeStatusEnum[notify] || emptyPlaceholder
        return emptyPlaceholder
      },
      getCsStr(staff, group) {
        if (staff && group) return `${staff}(${group})`
        else return staff? staff: ( group?`${emptyPlaceholder}(${group})` : emptyPlaceholder )
      },
      loadData(params, cb) {
        this.$refs.table.loadData({
          ...params
        }, cb)
      },
      handleRowDoubleClick(row) {
        this.$emit('preview', row)
      },
      checkAll(checkAll) {
        this.$refs.table.checkAll(checkAll)
        this.innerShowTableHeaders = this.showTableHeaders
      }
    },
    mounted() {
      this.innerShowTableHeaders = this.showTableHeaders
    }
  }
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/placeholder.scss';

  .table {
    .operation {
      @extend %tableAction;
    }
    .property-item {
      display: inline-block;
      margin-right: 10px;
    }
  }
  .dot{
    height: 6px;
    width: 6px;
    border-radius: 3px;
    background: red;
    position: absolute;
    top: 5px;
    right: -10px;
  }
</style>

