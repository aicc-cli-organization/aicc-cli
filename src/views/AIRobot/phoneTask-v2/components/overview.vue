<template>
  <div class="section-overview">
    <div class="desc">
      <div class="title">
        <span class="name">{{robotCallJobDetail.robotCallJob.name}}</span>
        <task-status
          :status="robotCallJobDetail.robotCallJob.status"
          :priority="robotCallJobDetail.robotCallJob.priority"
          style="margin-left: 10px;"
        >
        </task-status>
        <detail-reason
          :status="robotCallJobDetail.robotCallJob.status"
          :hangUpReason="robotCallJobDetail.robotCallJob.hangUpReason"
          :nextStartTime="robotCallJobDetail.robotCallJob.nextStartTime"
        >
        </detail-reason>
        <div class="btns">
          <el-button class="refresh-btn" size="mini" type="primary" @click="onRefresh"><i class="iconfont icon-shuaxin"></i>刷新</el-button>
          <el-button class="edit-btn" size="mini" type="primary" @click="onEditTask" v-if="showEditIcon(robotCallJobDetail.robotCallJob.status)" :disabled="!hasAccess('crm_callTask_addOrEdit')"><i class="iconfont icon-edited"></i>编辑任务</el-button>
          <el-button v-for="(item, index) in operations" :key="index"
            size="mini"
            :type="item.btnType || 'primary'"
            @click="onFlowTask(item.value, item.text)"
            :disabled="!hasAccess('crm_callTask_startOrStop')"
            :plain="!!item.plain"
          >
            <i class="iconfont f10" :class="item.icon"></i>
            {{item.text}}
          </el-button>
          <el-dropdown
            v-if="showImportButton && hasAccess('crm_callTask_importCus')"
            size="mini"
            type="primary"
            @command="importCustomer">
            <el-button size="mini" type="primary" >
              导入{{customerStr}}
              <i class="el-icon-arrow-down"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="singleImport">单个导入</el-dropdown-item>
              <el-dropdown-item command="multipleImport">批量导入</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <detail-settings></detail-settings>
      <ul class="subtitle">
        <li>{{robotCallJobDetail.createdByUserName}}创建于: {{robotCallJobDetail.robotCallJob.createTime}}</li>
        <li>任务最近更新于: {{robotCallJobDetail.robotCallJob.updateTime}}</li>
        <el-tooltip effect="dark" placement="top-start" :content="dailyTimeStr">
          <li>可拨打时段: {{dailyTimeStr}}</li>
        </el-tooltip>
        <li style="display:block;padding:0;margin-top:5px" v-if="dateTimeStr">不可拨打日期: {{dateTimeStr}}</li>
      </ul>
      <div class="descpition">
        <span class="label">任务描述:</span>
        <div class="value">{{robotCallJobDetail.robotCallJob.description ? robotCallJobDetail.robotCallJob.description : '暂无描述'}}</div>
      </div>
      <customer-cost :robotCallJobDetail="robotCallJobDetail"></customer-cost>
      <ul class="table-ul">
        <li>
          <label>话术模版:</label>
          <el-tooltip effect="dark" :content="robotCallJobDetail.dialogFlowName" placement="top">
            <span class="value">{{robotCallJobDetail.dialogFlowName}}</span>
          </el-tooltip>
        <li>
          <label>启动方式:</label>
          <span class="value">{{config.START_MODE[robotCallJobDetail.robotCallJob.mode]}}</span>
        </li>
        <li>
          <label>外呼方式:</label>
          <span class="value">{{config.PHONE_TYPE[robotCallJobDetail.robotCallJob.phoneType]}}</span>
        </li>
        <li class="line-li">
          <label>外呼线路:</label>
          <span class="value" v-if="robotCallJobDetail.robotCallJob.phoneType === 'CALL_POLICY_GROUP'">
            {{robotCallJobDetail.callPolicyGroupName || '已删除'}}
            <policy-group-phone-number
              v-if="robotCallJobDetail.callPolicyGroupName"
              :policyGroupPhoneNumberList="robotCallJobDetail.policyGroupPhoneNumberList"
            ></policy-group-phone-number>
          </span>
          <span class="value-con" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" v-else>
            <span class="value" v-for="(item, index) in robotCallJobDetail.jobPhoneNumberList" :key="index">
              {{item.phoneType === 'MOBILE' ? (`${item.phoneName ? item.phoneName + '-' : ''}${item.phoneNumber}`) : (item.phoneName || item.phoneNumber)}}
            </span>
          </span>
        </li>
        <li>
          <label>AI数量:</label>
          <span class="value">
            {{AICount}}
          </span>
        </li>
        <li>
          <label>平均通话时长:</label>
          <span class="value">
            {{averageCallDuration}}秒
          </span>
        </li>
      </ul>
    </div>
    <div class="pies">
      <div class="pie-item" v-for="(pie, index) in pieData" :key="index">
        <div class="left">
          <p>{{pie.title}}</p>
          <span class="progress">
            <span class="num">{{pie.showNum ? pie.num : ''}}{{pie.showNum ? '(' + pie.progress + '%)' : pie.progress + '%'}}</span>
          </span>
        </div>
        <pie-chart width="60px" height="60px" outer-radius="20" inner-radius="13" :chart-list="pie.chartList"></pie-chart>
      </div>
    </div>
    <div class="charts">
      <concern-answer-chart
        class="chart-item"
        :fullStatsInfo="fullStatsInfo"
      >
      </concern-answer-chart>
      <sms-send-chart
        v-if="robotCallJobDetail.hasSmsTemplate"
        :smsSendList="smsSendList"
      ></sms-send-chart>
      <div class="chart-item concern">
        <chart-item-title
          :title="`${customerStr}前十大关注点`"
        >
        </chart-item-title>
        <div class="concern-filter">
          <span>关注点数据：</span>
          <el-radio-group v-model="isAll">
            <el-radio :label="false">前十</el-radio>
            <el-radio :label="true">全部</el-radio>
          </el-radio-group>
        </div>
        <customer-concern :customerConcern="concern"></customer-concern>
      </div>
    </div>
    <horizental-bar :fullStatsInfo="fullStatsInfo"></horizental-bar>
    <div class="lines">
      <el-tabs>
        <el-tab-pane label="外呼与接听">
          <call-and-answer-total
          :title="'外呼和接听总量'"
          :unit="'次'"
          :stats="fullStatsInfo.callJobStatsBrokenLine"></call-and-answer-total>
        </el-tab-pane>
        <el-tab-pane label="接听率">
          <answer-ratio
            :stats="fullStatsInfo.callJobStatsBrokenLine"></answer-ratio>
        </el-tab-pane>
        <el-tab-pane label="通话时长">
          <total-and-average-duration
            :title="'总通话时长和平均通话时长'"
            :unit="'秒'"
            :stats="fullStatsInfo.callJobStatsBrokenLine"></total-and-average-duration>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-tooltip placement="top" ref="tooltip">
      <div slot="content">
        <div class="value" v-for="(item, index) in robotCallJobDetail.jobPhoneNumberList" :key="index">
          {{item.phoneType === 'MOBILE' ? (`${item.phoneName ? item.phoneName + '-' : ''}${item.phoneNumber}`) : (item.phoneName || item.phoneNumber)}}
          <br v-if="index !== robotCallJobDetail.jobPhoneNumberList.length - 1"/>
        </div>
      </div>
    </el-tooltip>
    <!-- 批量导入客户 -->
    <yw-import-csv-dialog
      title="批量导入"
      width="942px"
      v-if="dialog.importCustomerDialogVisible"
      :robotCallJobId="selectTaskId"
      :visible.sync="dialog.importCustomerDialogVisible"
      @update="updateTaskListProgress"
    ></yw-import-csv-dialog>
    <!-- 客户表单 弹框 -->
    <customer-form-dialog
      v-if="dialog.customerFormDialogVisible"
      title="单个导入"
      :robotCallJobId="selectTaskId"
      :visible.sync="dialog.customerFormDialogVisible"
      :transferPhoneChooseType="robotCallJobDetail.robotCallJob.transferPhoneChooseType"
      @success="updateTaskListProgress"
      singleImportTip
      page="callTask"
    >
    </customer-form-dialog>
    <!-- 金融短信发送满足条数提示 -->
    <finance-sms-job-dialog
      :smsStats="smsStats"
      :visible.sync="dialog.financeSmsJobDialogVisible"
      @confirm="flowTask('START', '开始任务')"
    >
    </finance-sms-job-dialog>
  </div>
</template>

<script>
import * as taskApi from '@/api/task'
import {
  START_MODE,
  PHONE_TYPE,
  CALL_RECORD_STATUS,
  TASK_OPERATION_ENUM,
  EDIT_TYPE_LIST,
  SMS_STATUS_ENUM,
  getMergeTimes,
  getPercent,
  timeListEnum,
  timeListSortEnum
} from '../config/enum'
import Connect from '../config/connect'
import PieChart from './pieChart'
import CustomerConcern from './customerConcern'
import CallAndAnswerTotal from '@/components/Charts/callAndAnswerTotal'
import answerRatio from '@/components/Charts/answerRatio'
import NumberByDateChart from '@/components/Charts/numberByDateChart'
import TotalAndAverageDuration from '@/components/Charts/totalAndAverageDuration'
import CustomerFormDialog from '@/business/customer/customerFormDialog'
import YwImportCsvDialog from '@/components/ywImportCsvDialog'
import { mapGetters } from 'vuex'
import PolicyGroupPhoneNumber from './policyGroupPhoneNumber'
import FinanceSmsJobDialog from './financeSmsJobDialog'
import { getSmsTemplateDetail } from '@/api/sms'
import { getMobileCallJobStats, getDialogFlowSmsTemplate } from '@/api/task'
import TaskStatus from './taskStatusTag'
import DetailReason from './detailReason'
import DetailSettings from './detailSettings'
import CustomerCost from './customerCost'
import HorizentalBar from './horizentalBar'
import ConcernAnswerChart from './concernAnswerChart'
import SmsSendChart from './smsSendChart'
import ChartItemTitle from './chartItemTitle'

// 函数去抖
const debounce = (idle, action) => {
  let last
  return function() {
    const ctx = this
    const args = arguments
    clearTimeout(last)
    last = setTimeout(() => {
      action.apply(ctx, args)
    }, idle)
  }
}

export default {
  mixins: [Connect],
  data() {
    return {
      config: {
        START_MODE,
        PHONE_TYPE,
        CALL_RECORD_STATUS,
        TASK_OPERATION_ENUM,
        SMS_STATUS_ENUM
      },
      dialog: {
        customerFormDialogVisible: false,
        importCustomerDialogVisible: false,
        financeSmsJobDialogVisible: false
      },
      timerStats: null,
      smsSendList: [],
      smsStats: {},
      isAll: false
    }
  },
  components: {
    answerRatio,
    PieChart,
    CustomerConcern,
    CallAndAnswerTotal,
    NumberByDateChart,
    CustomerFormDialog,
    YwImportCsvDialog,
    TotalAndAverageDuration,
    PolicyGroupPhoneNumber,
    FinanceSmsJobDialog,
    TaskStatus,
    DetailReason,
    DetailSettings,
    CustomerCost,
    HorizentalBar,
    ConcernAnswerChart,
    SmsSendChart,
    ChartItemTitle
  },
  methods: {
    onRefresh() {
      this.initOverview()
      this.__refreshTaskList(true)
      this.$message.success('刷新成功')
    },
    onEditTask() {
      this.__updateEditTaskId(this.selectTaskId)
      this.$emit('update:addTaskDialogVisible', true)
    },
    handleMouseEnter(event, text) {
      let elm = event.target
      if (elm && elm.scrollWidth > elm.offsetWidth && this.$refs.tooltip) {
        const tooltip = this.$refs.tooltip
        tooltip.referenceElm = elm
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
        tooltip.doDestroy()
        tooltip.setExpectedState(true)
        this.activateTooltip(tooltip)
      }
    },
    handleMouseLeave() {
      const tooltip = this.$refs.tooltip
      if (tooltip) {
        tooltip.setExpectedState(false)
        tooltip.handleClosePopper()
      }
    },
    async getCallJobFullStatsInfo() {
      const fullStatsInfo = (await taskApi.getRobotCallJobStats(this.selectTaskId)).data.data
      fullStatsInfo.robotCallJobId = this.selectTaskId
      this.__coverTaskFullStats(fullStatsInfo)
    },
    async getRobotCallJobDetail() {
      const { data: detail } = (await taskApi.getRobotCallJobDetail(this.selectTaskId)).data
      this.__updateTaskItem({ robotCallJobId: this.selectTaskId, status: detail.robotCallJob.status })
      this.__coverTaskDetail(detail)
    },
    importCustomer(command) {
      if (!this.hasAccess('crm_callTask_importCus')) {
        this.$message.error('暂无导入权限')
        return
      }
      if (command === 'multipleImport') {
        this.dialog.importCustomerDialogVisible = true
      } else {
        this.dialog.customerFormDialogVisible = true
      }
    },
    async updateTaskListProgress() {
      const robotCallJobId = this.selectTaskId
      if (!robotCallJobId) {
        return
      }
      const { data: progressObj } = (await taskApi.getRobotCallJobProgressList([robotCallJobId])).data
      const { taskCompleted, taskTotal } = progressObj[robotCallJobId]
      this.__updateTaskItem({ robotCallJobId, completedTask: taskCompleted, taskCallTotal: taskTotal })
      this.__coverTaskDetail({
        ...this.robotCallJobDetail,
        taskCallTotal: taskTotal
      })
      this.$emit('importSuccessCallback')
    },
    handleOpenJobWithFinanceDialog() {
      this.dialog.financeSmsJobDialogVisible = true
    },
    async hasFinanceSmsTempate() {
      const { hasSmsTemplate, robotCallJob: { smsTemplateId, dialogFlowId }} = this.robotCallJobDetail
      if (!hasSmsTemplate) { // 没有短信直接reject
        return new Promise((resolve, reject) => {
          reject()
        })
      }
      return new Promise((resolve, reject) => {
        Promise.all([
          getSmsTemplateDetail({ smsTemplateId }),
          getDialogFlowSmsTemplate(dialogFlowId)
        ])
          .then(async resArr => {
            const smsTempDetail = resArr[0].data.data
            const dialogFlowDetail = resArr[1].data.data
            if (smsTempDetail.type === 'FINANCE' || dialogFlowDetail === 'FINANCE') { // 话术或挂机短信含有短信模版
              const statsRes = await getMobileCallJobStats({ callJobId: this.selectTaskId }) // 旧数据不考虑
              this.smsStats = statsRes.data.data
              this.smsStats ? resolve() : reject()
            } else {
              reject()
            }
          })
      })
    },
    async onFlowTask(operation, text) {
      const { taskCallTotal } = this.robotCallJobDetail
      if (operation === 'START' && taskCallTotal === 0) {
        this.$message.error(`请先导入${this.customerStr}信息`)
        return
      }
      if (operation !== 'START') {
        this.flowTask(operation, text)
        return
      }
      this.hasFinanceSmsTempate()
        .then(() => this.handleOpenJobWithFinanceDialog())
        .catch(() => this.flowTask(operation, text))
    },
    async flowTask(operation, text) {
      await taskApi.executeRobotCallJob({ // START  PAUSE  TERMINATE
        robotCallJobId: this.selectTaskId,
        operation
      })
      this.initOverview()
      this.$message.success(`${text}成功`)
    },
    async initOverview() {
      if (!this.selectTaskId) return

      const [jobStats, jobDetail, intentMessage] = await Promise.all([
        taskApi.getRobotCallJobStats(this.selectTaskId),
        taskApi.getRobotCallJobDetail(this.selectTaskId),
        taskApi.getIntentMessage(this.selectTaskId)]
      )
      const fullStatsInfo = jobStats.data.data
      const taskDetail = jobDetail.data.data
      this.smsSendList = intentMessage.data.data
      fullStatsInfo.robotCallJobId = this.selectTaskId
      this.__coverTaskFullStats(fullStatsInfo)
      this.__updateTaskItem({ robotCallJobId: this.selectTaskId, status: taskDetail.robotCallJob.status })
      this.__coverTaskDetail(taskDetail)
      this.poolingStatsInfo()
    },
    poolingStatsInfo() {
      if (this.timerStats) {
        clearInterval(this.timerStats)
      }
      this.timerStats = setInterval(() => {
        this.getCallJobFullStatsInfo()
      }, 10000 * 12 * 15)
    },
    showEditIcon(status) {
      return EDIT_TYPE_LIST.includes(status)
    }
  },
  computed: {
    ...mapGetters([
      'isLocal', 'customerStr'
    ]),
    operations() {
      const { status, mode } = this.robotCallJobDetail.robotCallJob
      if (!status) return
      const allOperations = TASK_OPERATION_ENUM[status] || []
      if (mode === 'AUTO' && status === 'NOT_STARTED') { // 自动任务且未开始任务丢掉开始按钮
        return allOperations.filter(item => item.value !== 'START')
      }
      return allOperations
    },
    robotCallJobDetail() {
      return this.$store.state.taskV2.taskDetail
    },
    fullStatsInfo() {
      return this.$store.state.taskV2.fullTaskInfo
    },
    selectTaskId() {
      return this.$store.state.taskV2.selectTaskId
    },
    dailyTimeStr() {
      let { startTime, endTime, daysOfWeek, dailyStartTime = '', dailyEndTime = '', inactiveTimeList, mode } = this.robotCallJobDetail.robotCallJob
      if (dailyStartTime.substring(0, 5) === "23:59") {
        dailyStartTime = "24:00:00"
      }
      if (dailyEndTime.substring(0, 5) === "23:59") {
        dailyEndTime = "24:00:00"
      }
      console.log(dailyEndTime)
      const times = dailyStartTime ? [dailyStartTime] : []
      inactiveTimeList && inactiveTimeList.forEach(({ startTime, endTime }) => {
        startTime && times.push(startTime)
        endTime && times.push(endTime)
      })
      times.push(dailyEndTime)
      let mergeTimeStr = ''
      if(times.length > 0) {
        mergeTimeStr = getMergeTimes(times).join(',')
      }
      const startTimeStr = startTime ? startTime.replace(/\s.*/, '') + '起,' : ''
      const endTimeStr = endTime ? endTime.replace(/\s.*/, '') + '止;': ''

      let weekStr = ''
      if(daysOfWeek.length === 7) {
        weekStr =  '每天,'
      }else if(JSON.stringify(daysOfWeek) == JSON.stringify(['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'])) {
        weekStr =  '工作日,'
      }else if(JSON.stringify(daysOfWeek) == JSON.stringify(['SATURDAY', 'SUNDAY'])) {
        weekStr =  '周末,'
      }else {
        daysOfWeek.sort((a,b) => {
          return timeListSortEnum[a] -  timeListSortEnum[b]
        })
        daysOfWeek.map(item => {
          weekStr += timeListEnum[item] + ','
        })
      }
     

      if(mode === 'MANUAL') {
        return `${endTimeStr}${weekStr}${mergeTimeStr}` 
      }else {
        return `${startTimeStr}${endTimeStr}${weekStr}${mergeTimeStr}` 
      }
    },
    dateTimeStr() {
      const { inactiveDateList } = this.robotCallJobDetail.robotCallJob
      if(inactiveDateList.length > 0) {
        let str = ''
        inactiveDateList.map(item => {
          str+= ' ' + item.startDate.replace(/-/g, '/') + ' - '+ item.endDate.replace(/-/g, '/') + ';'
        })
        str = str.substring(0,str.length-1)
        return str
      }else {
        return ''
      }
    },
    averageCallDuration() {
      const { chatDurationTotal, answeredTask } = this.fullStatsInfo
      if (!answeredTask) return 0
      return Math.ceil(chatDurationTotal / answeredTask)
    },
    pieData() {
      const {
        intentLevel = {},
        answeredTask, // 接听数
        taskCallTotal, // 外呼数,
        taskTotalCompleted, // 接听数 / 外呼数
        totalTask = 1,
        intentLevelTagDetailList = [] // 自定义意向标签
      } = this.fullStatsInfo
      if (!this.fullStatsInfo) return ''
      let intentTotal = 0
      for (const key in intentLevel) {
        intentTotal += intentLevel[key]
      }
      const taskProgress = getPercent(taskCallTotal, totalTask)
      const answeredRate = getPercent(answeredTask, taskTotalCompleted)
      const customerIntentList = []
      const realIntentLevelTagDetailList = intentLevelTagDetailList.slice(0, 2)
      realIntentLevelTagDetailList.forEach((item) => {
        const progress = getPercent(intentLevel[item.code], intentTotal)
        customerIntentList.push({
          progress,
          showNum: true,
          num: `${intentLevel[item.code] || 0}位`,
          title: `${item.name}${this.customerStr}数及占比`,
          chartList: [{ value: progress, color: '#1890FF' }, { value: 100 - progress, color: '#F3F3F3' }]
        })
      })
      return [
        { progress: taskProgress, title: '外呼进度', chartList: [{ value: taskProgress, color: '#1890FF' }, { value: 100 - taskProgress, color: '#F3F3F3' }] },
        { progress: answeredRate, title: '电话接通率', chartList: [{ value: answeredRate, color: '#1890FF' }, { value: 100 - answeredRate, color: '#F3F3F3' }] },
        ...customerIntentList
      ]
    },
    showImportButton() {
      return !['TERMINATE'].includes(this.robotCallJobDetail.robotCallJob.status)
    },
    AICount() {
      const { robotCallJob: { robotCount, phoneType }, enableConcurrency, concurrencyQuota } = this.robotCallJobDetail
      if (enableConcurrency) {
        if (phoneType === 'MOBILE') {
          return `${concurrencyQuota}个 并发数${robotCount}个`
        }
        return `${robotCount}个 并发数${concurrencyQuota}个`
      }
      return robotCount
    },
    concern() {
      const { customerConcern } = this.fullStatsInfo
      if (!customerConcern) {
        return {}
      }
      if (this.isAll) {
        return customerConcern
      } else {
        const tmpObj = {}
        Object.keys(customerConcern).slice(0, 10).forEach(item => {
          tmpObj[item] = customerConcern[item]
        })
        return tmpObj
      }
    }
  },
  watch: {
    selectTaskId(value) {
      if (value) {
        document.querySelector('.el-tabs__content').scrollTop = 0
        this.initOverview()
      }
    }
  },
  beforeDestroy() {
    this.$store.commit('SELECT_TASK_ID', undefined)
    this.$store.commit('SELECT_INTENT_LEVEL_TAG_ID', undefined)
    this.$store.commit('UPDATE_TASK_TAB', 'overview')
    clearInterval(this.timerStats)
  },
  created() {
    this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper())
  }
}
</script>

<style lang="scss" scoped>
.section-overview {
  .desc {
    padding: 20px 10px 10px;
    background-color: white;
    .title {
      position: relative;
      display: flex;
      align-items: flex-end;
      margin-bottom: 10px;
      .name {
        color: #4A4A4A;
        font-size: 22px;
        font-weight: 600;
      }
      .btns {
        position: absolute;
        top: 0;
        right: 0;
        .edit-btn,
        .refresh-btn {
          i {
            font-size: 12px;
            margin-right: 5px;
          }
        }
      }
    }
    .subtitle {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      li {
        display: inline-block;
        list-style: none;
        padding: 0 20px;
        font-size: 12px;
        line-height: 16px;
        color: #666666;
        border-right: 1px solid #D8D8D8;
        &:first-child {
          padding-left: 0;
        }
        &:last-child {
          border-right: 0;
        }
      }
    }
    .descpition {
      color: #666666;
      margin-top: 8px;
      white-space: normal;
      .label {
        float: left;
      }
      .value {
        margin-left: 65px;
        .span-item {
          display: inline-block;
          padding-right: 10px;
          border-right: 1px solid #d8d8d8;
          &:last-child {
            border-right: 0;
          }
        }
      }
    }
    .table-ul {
      margin-top: 18px;
      display: grid;
      grid-template-columns: 40% 30% 30%;
      grid-template-rows: 50px 50x;
      grid-column-gap: 2px;
      grid-row-gap: 2px;
      li {
        background-color: #F4F8FC;
        line-height: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        label {
          display: inline-block;
          color: #666666;
          width: 116px;
          text-align: right;
          font-size: 14px;
        }
        .value {
          margin-left: 10px;
          font-size: 16px;
          color: #333333;
        }
      }
    }
  }
  .charts {
    margin-top: 20px;
    display: flex;
    .chart-item {
      flex: 1;
      padding: 17px 20px;
      background-color: white;
      &.concern {
        margin-left: 20px;
        position: relative;
        .concern-filter {
          position: absolute;
          top: 19px;
          right: 18px;
          > span {
            font-size: 14px;
          }
        }
      }
    }
  }
  .pies {
    display: flex;
    margin-top: 20px;
    padding: 23px 0;
    background-color: white;
    .pie-item {
      flex: 1;
      display: flex;
      justify-content: center;
      .left {
        margin-right: 20px;
        p {
          margin-top: 5px;
        }
        .progress {
          color: #333333;
          font-size: 14px;
          .num {
            font-size: 22px;
          }
        }
      }
    }
  }
  .lines {
    margin-top: 20px;
    background-color: white;
    /deep/ .el-tabs__content {
      padding-top: 33px;
    }
  }
  .line-li {
    display: flex;
    label {
      flex-shrink: 0;
    }
    .value-con {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
