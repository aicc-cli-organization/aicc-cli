<template>
  <div class="overview">
    <el-row>
      <span class="name mr10">{{taskDetail.jobName}}</span>
      <task-type class="mr10" :jobType="taskDetail.jobType"></task-type>
      <task-status class="mr10" :status="taskDetail.jobStatus"></task-status>
      <task-hangup-reason :status="taskDetail.jobStatus" :hangUpReason="taskDetail.hangUpReason"></task-hangup-reason>
      <flow-btns
        :status="taskDetail.jobStatus"
        :qcJobId="taskDetail.qcJobId"
        @edit="onEdit"
        @flow="onFlow"
        @refresh="onRefresh"
      ></flow-btns>
    </el-row>
    <el-row class="row-create-info">
      <span>{{taskDetail.createUserName}}创建于: {{taskDetail.createTime}}</span>
      <span>任务最近更新于: {{taskDetail.updateTime}}</span>
      <span>任务累计运行时长: {{taskDetail.sumDuration}}秒</span>
      <span>质检费用累计: {{formatCost(taskDetail.sumCost)}}元</span>
    </el-row>
    <el-row>
      <span>基础分: {{taskDetail.jobBaseScore}}分</span>
      <span>满分: 100分</span>
      <template v-if="taskDetail.jobType === 'CALLING'">
        <span>预警阈值: {{taskDetail.jobScoreThreshold}}</span>
        <span>预警接收人: {{taskDetail.jobAlertUserNameList && taskDetail.jobAlertUserNameList.length ? taskDetail.jobAlertUserNameList.join(',') : '暂无'}}</span>
      </template>
    </el-row>
    <el-row class="row-property-info">
      <span class="label">质检范围:</span>
      <span class="value">
        <el-row>{{jobPropertyStr}}</el-row>
        <el-row v-if="taskDetail.csStaffList && taskDetail.csStaffList.length">
          人工坐席 包括 {{taskDetail.csStaffList.map(item => item.name).join(',')}}
        </el-row>
        <el-row v-if="taskDetail.startDate && taskDetail.endDate && taskDetail.startTime && taskDetail.endTime">
          时间段 介于 {{taskDetail.startDate}} ~ {{taskDetail.endDate}} 的 {{taskDetail.startTime}} ~ {{taskDetail.endTime}}
        </el-row>
      </span>
    </el-row>
    <el-row class="row-rule-info">
      <span class="label">质检规则:</span>
      <el-table :data="taskDetail.ruleList">
        <el-table-column prop="qcRuleId" width="80px" label="规则id"></el-table-column>
        <el-table-column prop="ruleName" label="规则名"></el-table-column>
        <el-table-column label="描述" width="150px" :show-overflow-tooltip="true">
          <template slot-scope="{ row }">{{row.ruleDescription || '--'}}</template>
        </el-table-column>
        <el-table-column label="规则类型">
          <template slot-scope="{ row }">
            {{RULE_TYPE[row.ruleType]}}
          </template>
        </el-table-column>
        <el-table-column label="加/减分要求">
          <template slot-scope="{ row }">
            {{RULE_WEIGHT[row.ruleWeight]}}
          </template>
        </el-table-column>
        <el-table-column label="加/减分频率">
          <template slot-scope="{ row }">
            {{RULE_RATE[row.ruleRate]}}
          </template>
        </el-table-column>
        <el-table-column label="规则属性">
          <template slot-scope="{ row }">
            {{RULE_PROPERTY[row.ruleProperty]}}
          </template>
        </el-table-column>
        <el-table-column label="关键词">
          <template slot-scope="{ row }">
            <span>{{(row.keyWordList && row.keyWordList.length ? row.keyWordList : ['--']).join(',')}}</span>
          </template>
        </el-table-column>
        <el-table-column label="设置条件" :show-overflow-tooltip="true">
          <template slot-scope="{ row }">
            {{formatSettingConditionStr(row.itemMap)}}
          </template>
        </el-table-column>
        <el-table-column prop="ruleScore" label="分值(分)"></el-table-column>
      </el-table>
    </el-row>
    <task-form
      type="edit"
      @editSuccess="onEditSuccess"
      :qcJobId="selectedTaskId"
      :visible.sync="taskFormVisible"
    ></task-form>
  </div>
</template>

<script>
import * as qcAPI from '@/api/qualityTest'
import TaskStatus from '../components/taskStatus'
import TaskType from '../components/jobType'
import FlowBtns from '../components/flowBtns'
import TaskHangupReason from '../components/hangupReason'
import TaskForm from '../taskForm/index'
import { RULE_TYPE, RULE_WEIGHT, RULE_RATE, QUALITY_RANGE, RULE_PROPERTY, UPLOAD_RECORD, FRONT_UPLOAD_SINGLE } from '../utils/enum'

export default {
  data() {
    return {
      RULE_TYPE,
      RULE_WEIGHT,
      RULE_RATE,
      QUALITY_RANGE,
      RULE_PROPERTY,
      taskFormVisible: false
    }
  },
  components: {
    TaskStatus,
    TaskType,
    TaskHangupReason,
    FlowBtns,
    TaskForm
  },
  computed: {
    selectedTaskId() {
      return this.$store.state.qcTask.selectedTaskId
    },
    taskDetail() {
      return this.$store.state.qcTask.taskDetail
    },
    jobPropertyStr() {
      const { jobProperty, leftChannel, rightChannel } = this.taskDetail
      let resultJobProperty = jobProperty
      if (jobProperty === UPLOAD_RECORD && leftChannel === rightChannel) {
        resultJobProperty = FRONT_UPLOAD_SINGLE
      }
      return QUALITY_RANGE[resultJobProperty]
    }
  },
  methods: {
    formatCost(originCost) {
      if (!originCost) return 0

      return originCost / 1000
    },
    async loadData() {
      const res = await qcAPI.getQCTaskDetail({
        qcJobId: this.selectedTaskId
      })
      
      this.$store.commit('QC_TASK_DETAIL', res.data.data)
    },
    onEdit() {
      this.taskFormVisible = true
    },
    onEditSuccess() {
      this.loadData()
      this.$emit('editSuccess')
    },
    onFlow() {
      this.loadData()
      this.$emit('refresh')
    },
    onRefresh() {
      this.loadData()
      this.$emit('refresh')
      this.$message({
        message: '刷新成功',
        type: 'success'
      })
    },
    formatSettingConditionStr(itemMap) {
      const itemList = []
      for (const key in itemMap) {
        const item = itemMap[key]
        itemList.push(`【${item.name}】介于${item.min}${item.unit}至${item.max}${item.unit}`)
      }
      return itemList.length ? itemList.join(' 并且') : '--'
    }
  },
  watch: {
    selectedTaskId: {
      handler: function(newVal) {
        if (newVal) {
          this.loadData()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.overview {
  .mr10 {
    margin-right: 10px;
  }
  .name {
    color: #4A4A4A;
    font-size: 22px;
    font-weight: 600;
  }
  /deep/ .el-row {
    margin-bottom: 10px;
  }
  .row-create-info {
    > span {
      display: inline-block;
      border-right: 1px solid #d8d8d8;
      padding-right: 15px;
      margin-right: 15px;
      &:last-child {
        border-right: 0;
        margin-right: 0;
      }
    }
  }
  .row-property-info {
    display: flex;
    .value {
      flex: 1;
      margin-left: 10px;
    }
  }
  .row-rule-info {
    display: flex;
    /deep/ .el-table {
      flex: 1;
      margin-left: 10px;
    }
  }
}
</style>
