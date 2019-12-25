<template>
  <div class="button-container">
    <el-form
      :inline="true"
      size="small"
      class="button-form-inline no-padding"
    >
      <el-form-item>
        <option-search-input class="option-search-input" width="270px" ref="optionSearchInput" v-model="filterSearchWords" @search="updatePaginationParams"
          :option-list="optionList" option-width="110px">
        </option-search-input>
      </el-form-item>
      <span class="label">创建日期：</span>
      <el-form-item>
        <el-date-picker :style="{width: '300px'}" @change="updatePaginationParams" v-model="filterCreationTime" type="daterange"
          value-format="yyyy-MM-dd" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>

      <span class="label text-label">最近呼叫时间：</span>
      <el-date-picker
        v-model="createDate"
        type="datetimerange"
        time-arrow-control
        align="right"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :style="{width: '300px'}"
        :default-time="['00:00:00', '23:59:59']"
        @change="updatePaginationParams">
      </el-date-picker>
      <el-button class="w150 f12 right" type="primary" @click="clearFilter">清空筛选条件</el-button>

      <div class="header">
        <div class="header-filter">
          <div class="form-item">
            <span class="label text-label">最近呼叫时长(秒)：</span>
            <div class="flex-center duration">
              <el-input class="duration-input" v-model="chatDurationMin" placeholder="最小时长" :style="{width: '88px'}" @change="updatePaginationParams">
              </el-input>
              <span class="split-line">-</span>
              <el-input class="duration-input" v-model="chatDurationMax" placeholder="最大时长" :style="{width: '88px'}" @change="updatePaginationParams">
              </el-input>
            </div>
          </div>
          <div class="form-item">
            <span class="label text-label" style="margin-left:8px;margin-right:4px;">{{customerStr}}分组：</span>
            <el-form-item>
              <group-list-select :style="{width: '300px'}" ref="groupList" v-model="filterCustomerGroupId" :placeholder="`${customerStr}分组`" @change="updatePaginationParams"></group-list-select>
            </el-form-item>
          </div>
          <div class="form-item">
            <span class="label text-label" style="margin-left:4px;margin-right:-1px;">最后外呼任务：</span>
            <el-select 
              filterable
              remote
              clearable
              reserve-keyword
              :remote-method="requestRobotCallJobList"
              v-model="lastRobotCallJobId" 
              placeholder="请选择Ai外呼任务" 
              :style="{width: '300px', marginLeft: '5px'}" 
              @change="updatePaginationParams"
              >
              <el-option v-for=" item in filterRobotCallJobList" 
                :key="item.robotCallJobId"
                :label="item.name"
                :value="item.robotCallJobId"></el-option>
            </el-select>
          </div>
        </div>
      </div>
      
    </el-form>

    <call-status-filter
      class="no-border"
      v-model="resultStatuses"
      @change="updatePaginationParams"/>
    
    <intent-level-filter
      class="no-border"
      :intentLevelTagId.sync="intentLevelTagId"
      :intentLevelCodes.sync="intentLevelCodes"
      @changeIntentLevelCodes="updatePaginationParams"
      />
  </div>
</template>
<script>
import { OptionSearchInput } from 'yiwise-components'
import callStatusFilter from '@/components/customer/callStatusFilter'
import intentLevelFilter from '@/components/customer/intentLevelFilter'
import GroupListSelect from '@/components/GroupListSelect'
import { optionList } from '../enum'
import * as taskAPI from '@/api/task'
import moment from 'moment'
import { mapGetters } from 'vuex'

export default {
  components: {
    OptionSearchInput,
    GroupListSelect,
    callStatusFilter,
    intentLevelFilter
  },
  data() {
    return {
      resultStatuses: [],
      intentLevelTagId: undefined,
      intentLevelCodes: [],
      createDate: undefined,
      chatDurationMin: undefined,
      chatDurationMax: undefined,
      filterCreationTime: undefined,
      createUserId: null,
      filterSearchWords: undefined,
      filterCustomerGroupId: undefined,
      lastRobotCallJobId:undefined,
      filterUserList: [],
      optionList,
      filterRobotCallJobList:[]
    }
  },
  computed: {
    ...mapGetters(['customerStr']),
    paginationParams() {
      const chatDurationMin = +this.chatDurationMin
      const chatDurationMax = +this.chatDurationMax

      return {
        earliestCreationTime: this.filterCreationTime ? this.filterCreationTime[0] : undefined,
        latestCreationTime: this.filterCreationTime ? this.filterCreationTime[1] : undefined,
        customerGroupId: this.filterCustomerGroupId,
        lastRobotCallJobId: this.lastRobotCallJobId,
        earliestStartTime: this.createDate && this.createDate[0] ? moment(this.createDate[0]).format('YYYY-MM-DD HH:mm:ss') : undefined,
        latestStartTime: this.createDate && this.createDate[1] ? moment(this.createDate[1]).format('YYYY-MM-DD HH:mm:ss') : undefined,
        chatDurationMin: this.chatDurationMin === '' || isNaN(chatDurationMin) ? undefined : chatDurationMin,
        chatDurationMax: this.chatDurationMax === '' || isNaN(chatDurationMax) ? undefined : chatDurationMax,
        ...this.filterSearchWords,
        lastIntentLevelCodes: this.intentLevelCodes,
        lastDialStatuses: this.resultStatuses,
        lastIntentLevelTagId: this.intentLevelCodes.length > 0 ? this.intentLevelTagId : undefined
      }
    }
  },
  methods: {
    updatePaginationParams() {
      this.$emit('updatePaginationParams', {
        ...this.paginationParams,
        pageNum: 1
      })
    },
    clearFilter() {
      this.$refs.optionSearchInput.reset((params) => {
        this.filterSearchWords = params
      })
      this.createDate = undefined
      this.filterCreationTime = undefined
      this.createUserId = null
      this.filterCustomerGroupId = undefined
      this.lastRobotCallJobId = undefined
      this.chatDurationMin = undefined
      this.chatDurationMax = undefined
      this.intentLevelCodes = []
      this.resultStatuses = []
      this.updatePaginationParams()
    },
    getCustomerGroupList() {
      this.$refs.groupList && this.$refs.groupList.refresh()
    },
    requestRobotCallJobList(val) {
      //获取最后外呼任务
      taskAPI.getSimpleList({
        searchWords: val
      }).then(({ data }) => {
        this.filterRobotCallJobList = [{
          robotCallJobId: undefined,
          name: '全部任务'
        },...data.data]
      })
    }
  },
  mounted(){
    this.requestRobotCallJobList()
  }
}
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/placeholder.scss';
  .button-form-inline {
    margin: 0 20px 14px 20px;
  }

  .header-filter {
    display: flex;
    align-items: center;
  }

  .form-item {
    display: flex;
    align-items: center;
    > .label {
      flex-shrink: 0;
      color: $--color-text-regular;
      font-size: $--font-size-small;
    }
    .duration {
      border: 1px solid #d8d8d8;
      border-radius: 4px
    }
    .duration-input  /deep/ .el-input__inner{
      border:none
    }
  }

  .button-container {
    // height: 52px;
    padding: 14px 0 14px 0;
    /deep/ .el-form-item .el-form-item__content {
      font-size: 0;
    }
    /deep/ .option-search-input .el-input__inner {
      width:180px;
    }
  }

  .el-date-editor{
    width: 380px
  }

  .el-dialog{
    padding: 0px 0px;
  }

  .bottom-pagination{
    height: 46px;
    border-top: 1px solid #dadadb;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .pagination-container {
    width: 500px;
    margin: 8px auto;
  }
  .message-box::-webkit-scrollbar {display:none}
  .message-box {
    overflow-y: scroll;
    max-height: 480px;
    padding-bottom: 120px;
  }

  .action {
    > span {
      @extend %tableAction;
    }
  }

  .preview {
    @extend %tableAction;
  }

  .el-button + .el-button{
    margin-left: 5px;
  }
  .border-box+.border-box {
    margin-top: 10px !important;
  }
  .border-box {
    margin: 20px 20px 0 20px;
    width: 296px;
    height: 100px;
    border-radius: 2px;
    border: 1px solid #d8d9de;
  }

  .colorBlack {
    color: #333;
  }

  .pre-text {
    width: 70px;
    height: 20px;
    margin-left: 20px;
    text-align: right;
    display: inline-block;
  }

  .left-area{
    background: #fff;
  }

  .button-container .el-form-item{
    margin: 0 5px 0 0;
  }

  .center-text {
    text-align: center;
    display: inline-block;
    width: 100%;
    line-height: 196px;
    font-size: 20px;
    color: #1890ff;
  }
</style>
