<template>
  <el-popover
    class="batch-call-status"
    popper-class="batch-call-status-popper"
    width="396"
    trigger="manual"
    v-model="popoverVisible"
    @show="handlePopoverShow"
  >
    <div class="header">
      <div>
        <span class="title">批量外呼详情</span>
        <yiwise-tag :type="batchJobStatusEnum[batchJobStatus].type">
          {{batchJobStatusEnum[batchJobStatus].text}}
          <span v-if="batchJobStatus === 'SYSTEM_HANG_UP'">（{{hangUpReason}}）</span>
        </yiwise-tag>
      </div>
      <div>
        <div>实时在线坐席数量：{{onlineList.length}}</div>
        <div v-if="concurrencyQuota && concurrencyQuota > 1">实时并发数量：{{realTimeConcurrencyCount}}</div>
      </div>
    </div>
    <div class="body">
      <div class="body-item">
        <span class="label">外呼进度：</span>
        <div class="content">
          <span>{{completeCount}}/{{sumCount}}</span>
          <el-progress
            :stroke-width="8"
            :show-text="false"
            :percentage="sumCount > 0 ? (completeCount / sumCount * 100) : 0"
          >
          </el-progress>
        </div>
      </div>
      <div class="body-item">
        <span class="label">{{phoneType === 'CALL_POLICY_GROUP' ? '策略组：' : '主叫号码：'}}</span>
        <el-select
          v-if="phoneType === 'MOBILE'"
          v-model="phoneNumberIdList"
          placeholder="选择主叫号码"
          style="width: 100%"
          :disabled="phoneNumerDisabled"
          :multiple="true"
          @change="handlePhoneNumberChange"
        >
          <el-option
            v-for="line in mobileLineList"
            :key="line.phoneNumberId"
            :value="line.phoneNumberId"
            :label="line.label"
            :disabled="line.disabled"
          >
          </el-option>
        </el-select>
        <el-select
          v-else
          v-model="phoneNumberId"
          :placeholder="phoneType === 'CALL_POLICY_GROUP' ? '选择策略组' : '选择主叫号码'"
          style="width: 100%"
          :disabled="phoneNumerDisabled"
          @change="handlePhoneNumberChange"
        >
          <el-option
            v-for="line in lineList"
            :key="line.phoneNumberId"
            :value="line.phoneNumberId"
            :label="line.label"
            :disabled="line.disabled"
          >
          </el-option>
        </el-select>
      </div>
      <!-- <div class="body-item">
        <span class="label">接听模式：</span>
        <el-radio-group
          v-model="answerMode"
          @change="handleAnswerModelChange"
          :disabled="batchJobStatus === 'IN_PROCESS'"
        >
          <el-radio v-for="(value, key) in answerModelEnum" :label="key" :key="key">{{value}}</el-radio>
        </el-radio-group>
      </div> -->
      <div class="body-item cs-group">
        <span class="label">人工坐席组：</span>
        <div>
          <div>{{groupName || emptyPlaceholder}}</div>
          <div class="staff">
            <span
              v-for="(item, i) in staffList"
              :key="i"
            >
              {{item}}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <el-button
        v-if="batchJobStatus === 'IN_PROCESS'"
        type="primary"
        size="medium"
        @click="handleJobExcute('PAUSE')"
      >
        暂停外呼
      </el-button>
      <el-button
        v-else
        type="primary"
        size="medium"
        :disabled="batchJobStatus === 'RUNNABLE'"
        @click="handleJobExcute('START')"
      >
        开始外呼
      </el-button>
      <el-button
        type="info"
        size="medium"
        class="stop-btn"
        @click="handleJobExcute('TERMINATE')"
      >
        终止外呼
      </el-button>
    </div>
    <template slot="reference">
      <div class="status" @click.stop="popoverVisible = !popoverVisible">
        <i class="el-icon-loading" v-if="batchJobStatus === 'IN_PROCESS'"></i>
        <span>{{batchJobStatusEnum[batchJobStatus].desc}}</span>
        <i class="el-icon-caret-bottom"></i>
      </div>
    </template>
  </el-popover>
</template>

<script>
import { YiwiseTag } from 'yiwise-components'
import { batchJobStatusEnum, answerModelEnum } from '@/utils/enum'
import { getCsBatchJobInfo, executeBatchJob, updateJob, getCurrentCsStaffGroupInfo } from '@/api/cs'
import { getActiveTenantPhoneNumberList } from '@/api/numberpool'
import { getPolicyGroupList } from '@/api/task'
import { mapGetters } from 'vuex'
import { emptyPlaceholder } from '@/utils/constant'

export default {
  name: 'BatchCallStatus',
  components: {
    YiwiseTag
  },
  computed: {
    ...mapGetters(['batchJobStatus']),
    staffList() {
      return [
        ...this.onlineList.map(item => {
          return item.csName
        }),
        ...this.offlineList.map(item => {
          return item.csName + '（离线）'
        })
      ]
    },
    lineList() {
      if (this.phoneType === 'LANDLINE') {
        return this.landLineList
      } else if (this.phoneType === 'UNFIXED_CALL') {
        return this.unfixedLineList
      } else if (this.phoneType === 'CALL_POLICY_GROUP') {
        return this.policyLineList
      }
    },
    realTimeConcurrencyCount() {
      return Math.min(Math.ceil(this.onlineList.length * 1.5), this.concurrencyQuota || 2)
    },
    phoneNumerDisabled() {
      return true // ['RUNNABLE', 'IN_PROCESS', 'USER_PAUSE', 'SYSTEM_SUSPENDED', 'SYSTEM_HANG_UP'].includes(this.batchJobStatus)
    }
  },
  data() {
    return {
      answerModelEnum,
      batchJobStatusEnum,
      concurrencyQuota: undefined,
      phoneNumberIdList: [],
      answerMode: undefined,
      phoneNumberId: undefined,
      completeCount: 0, // 已完成任务数量
      sumCount: 0, // 总任务数量
      popoverVisible: false,
      hangUpReason: '', // 挂起原因
      groupName: undefined,
      onlineList: [],
      offlineList: [],
      emptyPlaceholder,
      phoneType: undefined,
      mobileLineList: [],
      landLineList: [],
      unfixedLineList: [],
      policyLineList: []
    }
  },
  methods: {
    async getCsBatchJobInfo() {
      const { data } = await getCsBatchJobInfo()
      if (data && data.data) {
        const { jobStatus, phoneNumberIdList, completeCount, sumCount, hangUpReason, phoneType, concurrencyQuota, answerMode } = data.data
        this.$store.commit('SET_BATCH_JOB_STATUS', jobStatus)
        this.phoneNumberIdList = phoneNumberIdList || []
        this.phoneNumberId = this.phoneNumberIdList[0]
        this.completeCount = completeCount
        this.sumCount = sumCount
        this.hangUpReason = hangUpReason
        this.phoneType = phoneType
        this.concurrencyQuota = concurrencyQuota
        this.answerMode = answerMode || 'MANUAL'
      } else {
        this.$store.commit('SET_BATCH_JOB_VISIBLE', false)
        this.popoverVisible = false
      }
    },
    updateData(){
      var time = setInterval(() => {
        setTimeout( () => {
          this.getCsBatchJobInfo()
          this.getCurrentCsStaffGroupInfo()
        }, 0)
        if( this.completeCount === this.sumCount || this.popoverVisible === false )
        clearInterval(time)
      }, 10000 )
    },
    handlePopoverShow() {
      this.getCsBatchJobInfo()
      this.getCurrentCsStaffGroupInfo()
      this.loadTenantPhoneNumberList()
      this.loadPolicyGroupList()
      this.updateData()
    },
    async handleJobExcute(status) { // 任务操作
      this.popoverVisible = false
      try {
        await executeBatchJob({
          operation: status
        })
        this.getCsBatchJobInfo()
      } catch (error) {
        this.getCsBatchJobInfo()
      }
    },
    handlePhoneNumberChange(val) { // 更改主叫号码
      if (!val || val.length === 0) {
        return this.$message.error(this.phoneType === 'CALL_POLICY_GROUP' ? '请选择策略组' : '请选择主叫号码')
      }
      updateJob({
        phoneNumberIdList: this.phoneType === 'MOBILE' ? val : [val]
      })
    },
    handleAnswerModelChange (v) { // 更改接听模式
      updateJob({
        phoneNumberIdList: this.phoneNumberIdList,
        answerMode: v
      })
    },
    handlePopoverHide() { // popover关闭
      this.popoverVisible = false
    },
    async getCurrentCsStaffGroupInfo() {
      const { data } = await getCurrentCsStaffGroupInfo()
      if (data.data) {
        const { groupName, onlineList, offlineList } = data.data
        this.groupName = groupName
        this.onlineList = onlineList
        this.offlineList = offlineList
      }
    },
    async loadTenantPhoneNumberList() {
      const { data: { data: { MOBILE, LANDLINE, UNFIXED_CALL }}} = await getActiveTenantPhoneNumberList()
      this.mobileLineList = MOBILE.map((item) => {
        const backfix = item.concurrency === 0 ? '(空闲)' : '(使用中)'
        item.label = `${item.phoneName ? item.phoneName + '-' : ''}${item.phoneNumber}${backfix}`
        return item
      })
      this.landLineList = LANDLINE.map((item) => {
        item.label = item.phoneName || item.phoneNumber
        if (item.overdue) {
          item.label += '(欠费)'
          item.disabled = true
        }
        return item
      })
      this.unfixedLineList = UNFIXED_CALL.map((item) => {
        item.label = item.phoneName || item.phoneNumber
        if (item.overdue) {
          item.label += '(欠费)'
          item.disabled = true
        }
        return item
      })
    },
    async loadPolicyGroupList() {
      const res = await getPolicyGroupList()
      this.policyLineList = res.data.data.map(item => {
        item.label = item.name
        item.phoneNumberId = item.callPolicyGroupId
        return item
      })
    }
  },
  mounted() {
    document.body.addEventListener('click', this.handlePopoverHide)
  },
  destroyed() {
    document.body.removeEventListener('click', this.handlePopoverHide)
  }
}
</script>

<style lang="scss">
@import 'src/styles/variables.scss';

.batch-call-status {
  margin-right: 14px;
  .status {
    color: $--color-primary;
    font-weight: $--font-weight-medium;
    font-size: $--font-size-base;
  }
}
.batch-call-status-popper {
  padding: 0;
  .popper__arrow::after {
    border-bottom-color: #F2F2F2!important;
  }
  .header {
    background-color: #F2F2F2;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      margin-right: 6px;
    }
  }
  .body {
    padding: 34px 20px 18px;
    font-size: $--font-size-small;
    border-bottom: 1px solid #F0F0F0;
    > .body-item {
      &:nth-of-type(n + 2) {
        margin-top: 20px;
      }
      display: flex;
      align-items: center;
      > .label {
        flex-shrink: 0;
      }
      > .content {
        flex-grow: 1;
        display: flex;
        align-items: center;
        .el-progress {
          flex-grow: 1;
          margin-left: 18px;
        }
      }
    }
    > .cs-group {
      align-items: flex-start;
      .staff {
        margin-top: 10px;
      }
    }
  }
  .footer {
    padding: 15px 20px;
    display: flex;
    align-items: center;
    .el-button {
      flex-grow: 1;
    }
    > .stop-btn {
      background-color: #DFDEDE;
      border-color: #DFDEDE;
      color: $--color-text-primary;
    }
  }
}
</style>

