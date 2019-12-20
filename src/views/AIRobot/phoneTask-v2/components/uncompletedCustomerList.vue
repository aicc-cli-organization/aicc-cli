<template>
  <div id="record-detail">
    <div class="pl16 mb15">
      <el-input class="w200" :placeholder="'搜索联系电话'" @keyup.enter.native="search()" v-model="inputKeywords" size="small">
        <el-button size="mini" slot="append" icon="el-icon-search" @click="search()"></el-button>
      </el-input>
      <el-select @change="search()" v-model="statusValue" placeholder="通话状态" class="ml5">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" @click="onRefresh">
        <i class="iconfont icon-shuaxin const-icon-refresh"></i>刷新
      </el-button>
      <el-button class="w150 f12" type="primary" @click="clearFilter()">清空筛选条件</el-button>
    </div>

    <div class="action">
      <div class="action-left">
        <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
        <span class="checked-count ml5">已选中
          <span class="num">{{checkedCount}}</span>项
        </span>
      </div>
      <div class="action-right">
        <div class="right">
          <!-- 导入到任务 -->
          <import-to-task
            v-if="hasAccess('crm_callTask_addOrImportToTask')"
            class="inlineBlock"
            @change="handleRemoteSearch"
            @import="handleImportTask"
            v-model="taskForImport"
            :robotCallJobId="robotCallJobId">
          </import-to-task>
          <!-- <el-button class="right white-list-btn" :disabled="!hasAccess('ADMIN_TASK_WHITE_LIST')">
            <router-link :to="{ name: 'whiteList'}">{{customerStr}}白名单</router-link>
          </el-button> -->
          <el-button type="primary" class="right-item" v-if="hasAccess('crm_callTask_exportCus')" @click="exportCustomerPerson">导出{{customerStr}}</el-button>
          <el-button type="primary" @click="batchDelete">批量删除</el-button>
        </div>
      </div>
    </div>

    <pagination-table
      :url="`/apiEngine/robotCallTask/toBeCalledList`"
      ref="table"
      :server="'engine'"
      :params="paginationParams"
      stripe
      :pageZero="false"
      :autoLoad="false"
      :max-height="clientHeight - 308"
      @totalSizeChange="handleTotalSizeChange"
      @selection-change="handleSelectionChange"
      @select="handleSelectChange"
      @select-all="handleSelectAll"
      @refreshTable="handleRefreshTable"
    >
      <el-table-column type="selection" width="40"></el-table-column>
      <el-table-column fixed prop="customerPersonName" label="姓名">
        <template slot-scope="{ row }">
          <YiwiseUserName
            :name="row.customerPersonName"
            :inWhiteList="row.inWhiteList"
            :inShareWhiteList="row.inShareWhiteList"
          ></YiwiseUserName>
        </template>
      </el-table-column>
      <el-table-column prop="calledPhoneNumber" label="联系电话">
        <template slot-scope="{ row }">
          {{row.calledPhoneNumber}}
          <el-popover
            v-if="row.alternatePhoneNumbers && row.alternatePhoneNumbers.length > 0"
            trigger="hover"
            placement="top-start"
          >
            <div
              v-for="(item, index) in row.alternatePhoneNumbers"
              :key="index"
            >
              {{ item }}
            </div>
            <span slot="reference" class="more-phone">更多号码</span>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="customerPersonGroupName" :label="`${customerStr}分组`"></el-table-column>
      <el-table-column label="自定义变量" :show-overflow-tooltip="true">
        <template slot-scope="{ row }">
          <span v-if="row.hasOwnProperty('properties') && Object.keys(row.properties).length" class='property-span'>
            <div class='property-edit' @click='onEditProperty(row.robotCallTaskId, row.properties)'>编辑</div>
            <div class='property-list'>
              <div v-for="(value, key) in row.properties" :key="key" class="property-item">
                <span class="p-label">{{key}}</span>
                <span>{{value}}</span>
              </div>
            </div>
          </span>
          <span v-else>{{constant.emptyPlaceholder}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="执行状态">
        <template slot-scope="scope">{{parseStatus(scope.row.runnableStatus, scope.row.nextCalledTime)}}</template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="80">
        <template slot-scope="scope">
          <YiwisePopConfirm :label="`确认删除该${customerStr}吗？`" @submit="removeCustomerFromRobotCallJob(scope.row)">
            <el-button type="text">删除</el-button>
          </YiwisePopConfirm>
          <!-- <addToWhiteListPopOver :disabled="scope.row.inWhiteList" :customerPersonId="scope.row.customerPersonId" @refresh="loadData">
            <el-button type="text" :disabled="scope.row.inWhiteList">加入白名单</el-button>
          </addToWhiteListPopOver> -->
          <!-- <el-button @click="addToWhiteList(scope.row)" type="text" size="small">加入白名单</el-button> -->
        </template>
      </el-table-column>
    </pagination-table>
    <!-- 修改自定义变量 -->
    <edit-property-dialog
      :visible.sync="propertyDialogVisible"
      :propertyData="propertyData"
      @submit="handlePropertySubmit"
    >
    </edit-property-dialog>
  </div>
</template>

<script>
  import PaginationTable from '@/components/PaginationTable'
  import * as constant from '@/utils/constant'
  import { hidePhoneNumber } from '@/utils'
  import * as taskAPI from '@/api/task'
  import { mapGetters } from 'vuex'
  import * as customerAPI from '@/api/customer'
  import TableCheckAll from '@/mixins/tableCheckAll'
  import { YiwisePopConfirm } from 'yiwise-components'
  import ImportToTask from '@/components/ImportToTask'
  import { addTaskToJob } from '@/api/customer'
  import Connect from '../config/connect'
  import addToWhiteListPopOver from '@/components/addToWhiteListPopOver'
  import YiwiseUserName from '@/components/YiwiseUserName'
  import EditPropertyDialog from '@/components/EditPropertyDialog'
  import moment from 'moment'

  export default {
    name: 'recordDetail',
    mixins: [TableCheckAll, Connect],
    props: {
      selectTaskId: {
        type: [String, Number],
        default: undefined
      }
    },
    components: {
      YiwisePopConfirm,
      PaginationTable,
      ImportToTask,
      addToWhiteListPopOver,
      YiwiseUserName,
      EditPropertyDialog
    },
    computed: {
      ...mapGetters(['clientHeight', 'customerStr']),
      robotCallJobId() {
        return this.$store.state.taskV2.selectTaskId
      },
      paginationParams() {
        return {
          robotCallJobId: this.robotCallJobId,
          searchWords: this.inputKeywords,
          taskStatus: this.statusValue
        }
      },
      exportCustomerParams() {
        return this.paginationParams
      }
    },
    watch: {
      robotCallJobId: {
        handler: function(val) {
          this.$nextTick(() => {
            this.loadData()
          })
        },
        deep: true
      }
    },
    data() {
      return {
        inputKeywords: undefined,
        // 导入到任务dialog
        taskForImport: {},
        placeholder: '',
        audioUrl: '',
        searchType: '',
        value: '',
        callDate: '',
        currentPage: 1,
        tableData: [],
        completedTableVisible: false,
        multipleSelection: [],
        statusOptions: [{
          value: '',
          label: '全部状态'
        }, {
          value: 'IN_PROCESS',
          label: '进行中'
        }, {
          value: 'CAN_NOT_START',
          label: '不可运行'
        }, {
          value: 'CAN_START',
          label: '可运行'
        }],
        statusValue: undefined,
        constant,
        propertyDialogVisible: false,
        propertyRobotCallTaskId: undefined,
        propertyData: {}
      }
    },
    methods: {
      hidePhoneNumber,
      async handlePropertySubmit(newProperties) {
        await taskAPI.updateProperties({
          robotCallTaskId: this.propertyRobotCallTaskId,
          properties: newProperties
        })
        this.$message({
          message: '修改成功',
          type: 'success'
        })
        this.onRefresh()
      },
      onEditProperty(taskId, properties) {
        this.propertyDialogVisible = true
        this.propertyRobotCallTaskId = taskId
        this.propertyData = properties
      },
      // TODO: 跟后端对接
      batchDelete() {
        const robotCallTaskIds = this.multipleSelection.map(item => item.robotCallTaskId)
        if (robotCallTaskIds.length === 0) {
          this.$message.error(`请选择需要删除的${this.customerStr}`)
          return
        }
        const params = this.allChecked ? {
          ...this.paginationParams,
          robotCallJobId: this.robotCallJobId
        } : {
          robotCallJobId: this.robotCallJobId,
          robotCallTaskIds: robotCallTaskIds.join(',')
        }
        taskAPI.batchDeleteTobeCalled(params)
          .then(() => {
            this.$message({
              type: 'success',
              message: '删除成功！'
            })
            this.loadData()
            this.refreshTaskListProgress()
          })
      },
      async refreshTaskListProgress() {
        const robotCallJobId = this.robotCallJobId
        const { data: progressObj } = (await taskAPI.getRobotCallJobProgressList([robotCallJobId])).data
        const { taskCompleted, taskTotal } = progressObj[robotCallJobId]
        this.__updateTaskItem({ robotCallJobId, completedTask: taskCompleted, taskCallTotal: taskTotal })
      },
      onRefresh() {
        this.loadData()
      },
      addToWhiteList(row) {
        customerAPI.addToWhiteList([row.customerPersonId]).then(({ data }) => {
          if (data.code === 200) {
            this.$message({
              message: '添加至白名单成功！',
              type: 'success'
            })
          } else {
            this.$message({
              message: '添加至白名单失败！',
              type: 'error'
            })
          }
        })
      },
      removeCustomerFromRobotCallJob(row) {
        customerAPI.removeCustomerFromRobotCallJob({
          robotCallTaskId: row.robotCallTaskId
        }).then(data => {
          this.loadData()
        })
      },
      search() {
        this.$nextTick(() => {
          this.loadData()
        })
      },
      clearFilter() {
        this.inputKeywords = undefined
        this.statusValue = undefined
        this.$nextTick(() => {
          this.loadData()
        })
      },
      loadData(page = 1, size = 20) {
        if (!this.robotCallJobId) {
          return
        }
        this.$refs.table.loadData(page, size, { robotCallJobId: this.robotCallJobId })
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
        // 这个函数时定义在mixin中，用于处理全选操作的
        this._handleSelectionChange && this._handleSelectionChange(val)
      },
      handleRemoteSearch(val) {
        // 暂时注释掉了；不知道有啥用；会导致重新调用列表接口
        // this.loadData()
      },
      handleImportTask() { // 导入到任务
        if (!this.taskForImport || !this.taskForImport.robotCallJobId) {
          this.$message.error('请先选择任务')
          return
        }

        if (!this.multipleSelection || this.multipleSelection.length === 0) {
          this.$message.error(`请至少选择一位${this.customerStr}`)
          return
        }
        if (this.allChecked) {
          this.importToTaskByFilters()
        } else {
          this.importToTaskByIds()
        }
      },
      async importToTaskByIds() {
        const callRecordIds = this.multipleSelection.map(item => item.robotCallTaskId)
        try {
          await addTaskToJob({
            robotCallTaskIds: callRecordIds,
            robotCallJobId: this.robotCallJobId,
            targetRobotCallJobId: this.taskForImport.robotCallJobId
          })
          this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
          this.$message.success('操作成功！')
        } catch (error) {
          return
        }
      },
      async importToTaskByFilters() {
        try {
          await addTaskToJob({
            calledPhoneNumber: this.inputKeywords,
            taskStatus: this.statusValue,
            robotCallJobId: this.robotCallJobId,
            targetRobotCallJobId: this.taskForImport.robotCallJobId
          })
          this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
          this.$message.success('操作成功！')
        } catch (error) {
          return
        }
      },
      parseStatus(status, nextCalledTime) {
        return (constant.taskStatus[status] || '--') + (status === 'CAN_NOT_START' ? `(运行时间：${moment(nextCalledTime).format('YYYY-MM-DD HH:mm:ss')})` : '')
      },
      exportCustomerPerson(command) {
        if (!this.allChecked) {
          const robotCallTaskIds = this.multipleSelection.map(item => item.robotCallTaskId)
          if (robotCallTaskIds.length === 0) {
            this.$message.error(`请选择需要导出的${this.customerStr}`)
            return
          }
          taskAPI.exportCustomerPerson({
            robotCallTaskIds,
            robotCallJobId: this.robotCallJobId
          }, 'UNCALLED_LIST').then(({ data }) => {
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
        } else {
          taskAPI.exportCustomerPerson({
            ...this.exportCustomerParams,
            robotCallJobId: this.robotCallJobId
          }, 'UNCALLED_LIST').then(({ data }) => {
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
        }
      }
    },
    mounted() {
      this.loadData()
    }
  }
</script>


<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';
  #record-detail {
    background: #fff;
    padding-top: 10px;
    .const-icon-refresh {
      font-size: 12px;
      margin-right: 5px;
    }
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
  /deep/ .el-input--medium .el-input__inner {
    height: 28px !important;
  }
  /deep/ .el-input--medium .el-input__icon {
    line-height: 28px !important;
  }

  .w100{
    width: 100px;
    vertical-align: top;
    margin-right: -3px;

  }

  /deep/ .w100 .el-input__inner{
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .w200{
    width: 200px;
    vertical-align: top;
  }
  /deep/ .w200 .el-input__inner{
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .w30{
    width: 30px;
  }

  .audio-container{
    line-height: 55px;
  }
  .box-top, .box-middle, .box-bottom{
    background: #fff;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }
  .box-top {
    height: 133px;
    border-bottom: 1px solid #d0d6e2;
  }
  .box-middle {
    height: 290px;
    border-bottom: 1px solid #d0d6e2;
  }
  .box-bottom {
    height: 128px;
    border-bottom: 1px solid #d0d6e2;
  }
  .ml100{
    margin-left: 100px;
  }
  .colorBlack {
    color: #333;
  }

  .intent-level-list div {
    width: 106px;
    height: 24px;
    border: 1px solid #d3d4de;
    border-radius: 5px;
    margin: 6px 0 0 0;
    line-height: 24px;
    text-align: center;
    font-size: 12px;
    cursor: pointer;
  }
  .intent-level-list div.selectedIntentLevel {
    background: $--color-primary;
    color: #fff;
  }
  .ml30{
    margin-left: 30px !important;
  }
  .ml16{
    margin-left: 16px !important;
  }
  .status-button {
    height: 22px;
    line-height: 22px;
    font-size: 12px !important;
    padding:  10px !important;
    margin-top: 5px;
  }
  .w108 {
    width: 108px;
  }
  .w150{
    width: 150px;
    margin-left: 5px;
    height: 30px;
    margin-right: 16px;
  }
  .w30 {
    width: 30px;
  }
  .w334 {
    width: 334px;
    height: 30px;
  }
  .mt10.mb10 .el-tag {
    line-height: 0;
  }
  .el-input--medium .el-input__inner {
    height: 28px !important;
  }
  .el-input--medium .el-input__icon {
    line-height: 28px !important;
  }

  .fc666{
    color: #666;
  }

  .el-select{
    width: 150px;
  }
  .lh24{
    vertical-align: middle;
  }
  .c333{
    color: #333;
  }
  .blue-underline{
    color: #0055ff;
    text-decoration: underline;
  }
  .f14{
    font-weight: 700;
  }
  .scroll-container-left::-webkit-scrollbar {
    display: none;
  }
  .scroll-container-left{
    overflow-y: scroll;
    height: 530px;
    padding-bottom: 120px;
  }

  .scroll-container::-webkit-scrollbar {
    display: none;
  }
  .scroll-container{
    overflow-y: scroll;
    height: 460px;
    padding-bottom: 120px;
  }

  /*history-dialog*/
  .history-dialog{
    max-height: 85vh;
    overflow: hidden;
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

  .action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    > .action-left {
      display: flex;
      align-items: center;
      > .el-checkbox {
        display: flex;
        align-items: center;
        /deep/ .el-checkbox__inner {
          margin-top: 4px;
        }
        /deep/ .el-checkbox__label {
          // font-size: 12px;
          padding-left: 5px;
        }
      }
      > .checked-count {
        margin-top: 2px;
        .num {
          color: $--color-primary;
        }
      }
    }
    > .action-right {
      display: flex;
      > .right-item {
        margin-left: 10px;
      }
    }

    .white-list-btn {
      margin-left: 4px;
    }
  }

  .property-span {
    .property-edit {
      color: $--color-primary;
      cursor: pointer;
    }
  }

  .more-phone {
    @extend %tableAction;
  }

</style>
