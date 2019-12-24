<template>
  <new-pagination-table
    class="table"
    ref="table"
    :url="'/apiEngine/callIn/record/queryCallInRecordList'"
    method="post"
    :headers="{
      'Content-Type': 'application/json'
    }"
    customClass="table-header-change-loading"
    :autoLoad="false"
    server="engine"
    :pageZero="false"
    :max-height="clientHeight - 350"
    @row-dblclick="handleRowDoubleClick"
    @select-all="(selection) => $emit('select-all', selection)"
    @select="(selection, row) => $emit('select', selection, row)"
    @selection-change="(val) => $emit('selection-change', val)"
    @totalSizeChange="totalSize => $emit('totalSizeChange', totalSize)"
    @refreshTable="() => $emit('refreshTable')"
  >
    <el-table-column type="selection" width="40"></el-table-column>
    <el-table-column fixed v-if="innerShowTableHeaders.includes('callRecordId')" prop="callInRecordId" label="通话记录id" width="80"></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('name')" label="姓名" width="">
      <template slot-scope="{ row }">
        <YiwiseUserName :name="row.customerPersonName" :inWhiteList="row.inWhiteList"></YiwiseUserName>
      </template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('gender')" label="性别" width="">
      <template slot-scope="{ row }">
        {{genderEnum[row.customerPerson ? row.customerPerson.gender : row.gender] || emptyPlaceholder}}
      </template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('phoneNumber')" prop="customerPhoneNumber" label="联系电话" width=""></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('line')" label="呼入线路" width="">
      <template slot-scope="{ row }">
        {{getPhoneName(row)}}
      </template>
    </el-table-column>
    <el-table-column label="接待方式" v-if="innerShowTableHeaders.includes('mode')">
      <template slot-scope="{ row }">
        {{getReceptionMode(row)}}
      </template>
    </el-table-column>
    <el-table-column label="接待AI坐席" v-if="innerShowTableHeaders.includes('aiGroupNames')">
      <template slot-scope="{ row }">
        {{row.aiCsStaffGroupNames && row.aiCsStaffGroupNames.length ? row.aiCsStaffGroupNames.join('、') : '--'}}
      </template>
    </el-table-column>
    <el-table-column label="接待人工坐席" v-if="innerShowTableHeaders.includes('csGroupNames')" width="100px">
      <template slot-scope="{ row }">
        {{row.humanCsStaffGroupNames && row.humanCsStaffGroupNames.length ? row.humanCsStaffGroupNames.join('、') : '--'}}
      </template>
    </el-table-column>
    <el-table-column label="人工坐席接听情况" v-if="innerShowTableHeaders.includes('csStatus')" width="120px">
      <template slot-scope="{ row }">
        {{trackStatusEnum[row.trackStatus] || '--'}}
      </template>
    </el-table-column>
    <el-table-column label="应用话术" v-if="innerShowTableHeaders.includes('dialogFlowNames')">
      <template slot-scope="{ row }">
        {{row.dialogFlowNames && row.dialogFlowNames.length ? row.dialogFlowNames.join('、') : '--'}}
      </template>
    </el-table-column>
    <!-- <el-table-column v-if="innerShowTableHeaders.includes('csName')" prop="csName" label="接听坐席" width=""> -->
      <!-- <template slot-scope="{ row }">{{receptionType === 'AI' ? 'AI' : (row.csStaffInfo ? row.csStaffInfo.csName : '')}}</template> -->
    <!-- </el-table-column> -->
    <!-- <el-table-column v-if="innerShowTableHeaders.includes('dialogFlowName') && receptionType === 'AI'" prop="dialogFlowName" label="应用话术" width=""></el-table-column> -->
    <el-table-column v-if="innerShowTableHeaders.includes('startTime')" prop="startTime" label="呼入时间" width="140"></el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('resultStatus')" label="通话状态" width="80">
      <template slot-scope="scope">{{constant.resultStatus[scope.row.resultStatus]}}</template>
    </el-table-column>
    <el-table-column v-if="innerShowTableHeaders.includes('chatDuration')" prop="chatDuration" label="呼入时长（秒）" width="120"></el-table-column>
    <el-table-column fixed="right" label="通话详情" width="120px" v-if="hasAccess('crm_dialHistory_viewDialDetail')">
      <template slot-scope="scope">
        <el-button style="position: relative" class="mr10" @click="$emit('showCallDetail', scope.row, scope.$index)" type="text" size="small">查看通话详情
          <div class="dot" v-if="!scope.row.crmRead"></div>
        </el-button>
      </template>
    </el-table-column>
  </new-pagination-table>
</template>

<script>
  import NewPaginationTable from '@/components/NewPaginationTable'
  import { YiwisePopConfirm } from 'yiwise-components'
  import YiwiseUserName from '@/components/YiwiseUserName'
  import { genderEnum, customerLevelEnum, customerSourceEnum, callStatusEnum, intentLevelEnum, hangupEnum, trackStatusEnum } from '@/utils/enum'
  import { emptyPlaceholder } from '@/utils/constant'
  import { mapGetters } from 'vuex'
  import * as constant from '@/utils/constant'

  export default {
    name: 'MyCustomerList',
    components: {
      NewPaginationTable,
      YiwisePopConfirm,
      YiwiseUserName
    },
    props: {
      showTableHeaders: {
        type: Array,
        default: []
      },
      // receptionType: {
      //   type: String,
      //   default: 'AI',
      //   validator(value) {
      //     return ['AI', 'person'].includes(value)
      //   }
      // },
      seatType: {
        type: String,
        default: 'AI',
        validator(value) {
          return ['AI', 'CS', 'TEL', 'IVR'] // AI:AI; CS:人工; TEL:移动; IVR:IVR
        }
      }
    },
    computed: {
      ...mapGetters(['clientHeight']),
      constant() {
        return constant
      }
      // url() {
      //   return ['/apiEngine/callIn/record/queryAiRecordList', '/apiEngine/callIn/record/queryCsRecordList'][
      //     ['AI', 'person'].indexOf(this.receptionType)
      //   ]
      // }
    },
    data() {
      return {
        genderEnum,
        trackStatusEnum,
        customerLevelEnum,
        emptyPlaceholder,
        customerSourceEnum,
        callStatusEnum,
        intentLevelEnum,
        hangupEnum,
        loading: false,
        innerShowTableHeaders: []
      }
    },
    watch: {
      showTableHeaders(v) {
        this.loading = true

        setTimeout(() => {
          this.innerShowTableHeaders = v
        }, 100)

        setTimeout(() => {
          this.loading = false
        }, 500)
      }
    },
    methods: {
      getPhoneName(row) {
        const { phoneNumberInfo } = row
        return phoneNumberInfo ? (phoneNumberInfo.phoneName ? phoneNumberInfo.phoneName + '-' : '') + (phoneNumberInfo.phoneNumber || '') : '--'
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
      },
      getReceptionMode({ aiCsStaffGroupNames, humanCsStaffGroupNames }) {
        const hasAI = aiCsStaffGroupNames && aiCsStaffGroupNames.length
        const hasHuman = humanCsStaffGroupNames && humanCsStaffGroupNames.length
        if (hasAI && hasHuman) {
          return 'AI + 人工'
        } else if (hasAI) {
          return 'AI'
        } else if (hasHuman) {
          return '人工'
        }
        return '--'
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

