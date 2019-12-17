<template>
  <div class="call-popover">
    <el-popover
      trigger="manual"
      placement="bottom-start"
      width="440"
      popper-class="call-btn-form"
      v-model="popoverVisible"
      @show="handlePopoverShow"
      @hide="handlePopoverHide"
    >
      <el-form
        class="form"
        ref="form"
        :model="formModel"
        :rules="rules"
        :hide-required-asterisk="true"
      >
        <el-form-item class="call-type">
          <el-radio-group v-model="formModel.isBatched" @change="handleBatchedChange">
            <el-radio-button :label="false">单个外呼</el-radio-button>
            <el-radio-button :label="true">批量外呼</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div class="form-item-wrap" v-if="!formModel.isBatched">
          <el-form-item
            prop="phoneNumber"
          >
            <el-input
              v-model="formModel.phoneNumber"
              placeholder="输入被叫号码（必填）"
            >
            </el-input>
          </el-form-item>
          <el-form-item
            prop="name"
          >
            <el-input
              v-model="formModel.name"
              :placeholder="`输入${customerStr}姓名（选填）`"
            >
            </el-input>
          </el-form-item>
          <el-form-item
            prop="phoneNumberId"
          >
            <el-select
              v-model="formModel.phoneNumberId"
              placeholder="选择主叫号码"
              style="width: 100%"
            >
              <el-option
                v-for="line in lineList"
                :key="line.phoneNumberId"
                :value="line.phoneNumberId"
                :label="line.phoneNumber + (line.accountFare > 0 || line.ownFlag ? '' :'（欠费）')"
                :disabled="line.accountFare <= 0 && !line.ownFlag"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <template v-else>
          <div class="form-item-wrap">
            <el-form-item class="phone-type">
              <el-radio-group v-model="phoneType">
                <el-radio
                  v-for="(value, key) in phoneTypeEnum"
                  :key="key"
                  :label="key"
                >
                  {{value}}
                </el-radio>
                <el-radio label="CALL_POLICY_GROUP">外呼策略组</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="phoneType === 'MOBILE'"
              key="0"
              prop="mobilePhoneNumberIds"
            >
              <el-select
                v-model="formModel.mobilePhoneNumberIds"
                placeholder="选择线路"
                style="width: 100%"
                :multiple="true"
              >
                <el-option
                  v-for="line in mobileLineList"
                  :key="line.phoneNumberId"
                  :value="line.phoneNumberId"
                  :label="line.label"
                  :disabled="line.disabled || line.supplierStatus === 0"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-else-if="phoneType === 'LANDLINE'"
              key="1"
              prop="landlinePhoneNumberId"
            >
              <el-select
                v-model="formModel.landlinePhoneNumberId"
                placeholder="选择线路"
                style="width: 100%"
              >
                <el-option
                  v-for="line in landLineList"
                  :key="line.phoneNumberId"
                  :value="line.phoneNumberId"
                  :label="line.label"
                  :disabled="line.disabled || line.supplierStatus === 0"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-else-if="phoneType === 'UNFIXED_CALL'"
              key="2"
              prop="unfixedPhoneNumberId"
            >
              <el-select
                v-model="formModel.unfixedPhoneNumberId"
                placeholder="选择线路"
                style="width: 100%"
              >
                <el-option
                  v-for="line in unfixedLineList"
                  :key="line.phoneNumberId"
                  :value="line.phoneNumberId"
                  :label="line.label"
                  :disabled="line.disabled || line.supplierStatus === 0"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-else
              key="3"
              prop="policyPhoneNumberId"
            >
              <el-select
                v-model="formModel.policyPhoneNumberId"
                placeholder="选择策略组"
                style="width: 100%"
              >
                <el-option
                  v-for="line in policyLineList"
                  :key="line.phoneNumberId"
                  :value="line.phoneNumberId"
                  :label="line.label"
                  :disabled="line.disabled || line.supplierStatus === 0"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item key="4" prop="csStaffGroup" v-if="enableCsSeat && hasAccess('crm_seatGroup_view')">
              <el-select
                v-model="formModel.csStaffGroup"
                placeholder="人工坐席组"
                style="width: 100%"
                filterable
                clearable
                value-key="csStaffGroupId"
                @change="handleGroupChange"
              >
                <el-option
                  v-for="item in staffGroupList"
                  :key="item.csStaffGroupId"
                  :value="item"
                  :label="item.groupName + '(在线'+ item.onlineCount +'个)'"
                />
              </el-select>
            </el-form-item>
            <el-form-item key="5" prop="csDistributionMethod" v-if="enableCsSeat && hasAccess('crm_seatGroup_view')">
              <el-select
                v-model="formModel.csDistributionMethod"
                placeholder="分配方式"
                style="width: 100%"
                clearable>
                <el-option
                  v-for="(value, key) in staffGroupDistributeTypeEnum"
                  :key="key"
                  :value="key"
                  :label="value">
                </el-option>
              </el-select>
            </el-form-item>
            <div class="step">
              <span>第一步：填写批量导入的{{customerStr}}模板文件</span>
              <span class="action" @click="handleDownload">下载模板</span>
            </div>
            <el-upload
              ref="upload"
              action="/apiPlatform/file/upload"
              :headers="headers"
              :limit="1"
              :on-success="uploadSuccess"
              :on-remove="handleRemoveFile"
              :data="uploadData"
              :accept="'.xlsx'"
              :auto-upload="true">
              <div class="step">
                <span>第二步：上传数据文件</span>
                <span class="action">上传文件</span>
              </div>
              <div slot="tip" class="el-upload__tip extra">仅支持上传Excel格式的文件，且不超过10万行。</div>
            </el-upload>
          </div>
          <div class="form-item-wrap">
            <el-form-item
              class="form-radio"
              label="接听模式："
            >
              <el-radio-group
                v-model="answerMode"
              >
                <el-radio v-for="(value, key) in answerModelEnum" :label="key" :key="key">{{value}}</el-radio>
              </el-radio-group>
              <el-tooltip
                placement="top"
                content="手动模式将发送接入通知至坐席，自动模式则会将通知转接至对应坐席自动接起">
                <i class="el-icon-question ml5"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item
              class="form-radio"
              label="是否打乱顺序："
            >
              <el-radio-group
                v-model="formModel.needRearrange"
              >
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="showMultiple"
              class="form-radio"
              label="是否使用多并发："
            >
              <el-radio-group
                v-model="formModel.isMultiple"
                :disabled="phoneType === 'MOBILE'"
                @change="handleMutipleChange"
              >
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="showMultiple && formModel.isMultiple"
              label="并发数量："
              prop="concurrencyQuota"
            >
              <el-input-number
                class="input-number"
                size="mini"
                v-model="formModel.concurrencyQuota"
                controls-position="right"
                :disabled="phoneType === 'MOBILE'"
                :min="2"
                :max="maxConcurrencyQuota"
              >
              </el-input-number>
            </el-form-item>
          </div>
        </template>
        <div class="form-item-wrap" v-if="enableAiAssistant">
          <el-form-item
            class="ai-assitant"
            label="AI助理"
          >
            <el-switch
              v-model="useAiAssistant"
            >
            </el-switch>
          </el-form-item>
          <div class="env-check">
            <i  class="iconfont icon-huanjingjiancex2" @click="openEnv">
              <span>环境检测</span>
            </i>
            <el-alert
              title="为了保证拨打质量，人工外呼前请先进行环境检测"
              type="warning"
              class="alert"
              :closable="false"
              show-icon>
            </el-alert>
          </div>
          <el-form-item
            v-if="useAiAssistant"
            prop="dialogFlowId"
          >
            <el-select
              placeholder="选择相应话术"
              v-model="formModel.dialogFlowId"
              style="width: 100%"
              :filterable="true"
            >
              <el-option
                v-for="item in dialogFlowList"
                :key="item.id"
                :value="item.id"
                :label="item.name"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <el-button
          class="submit-btn"
          :loading="callLoading"
          type="primary"
          @click="handleCallClick"
        >
          确认拨打
        </el-button>
      </el-form>
      <div slot="reference" @click.stop="toggleVisible">
        <slot name="reference"></slot>
      </div>
    </el-popover>
    <div class="mask" v-show="popoverVisible" ref="mask"></div>
  </div>
</template>

<script>
import { getCsLineList, importCustomerPersonToBatchJob, getDownloadTemplate, getCsBatchJobInfo } from '@/api/cs'
import { getCustomerPersonByPhoneNumber } from '@/api/customer'
import { addArtificialCallRecord } from '@/api/callRecord'
import { fetchStaffGroupList, getActiveTenantPhoneNumberList } from '@/api/numberpool'
import { getPolicyGroupList } from '@/api/task'
import { getArtificialDialInfo } from '@/api/users'
import { fetchFlowList } from '@/api/talk'
import { staffGroupDistributeTypeEnum, phoneTypeEnum, answerModelEnum } from '@/utils/enum'
import { phoneNumberregex } from '@/utils/regexp'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'

export default {
  name: 'ArtificialCallPopover',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    defaultName: {
      type: String,
      default: ''
    },
    defaultPhoneNumber: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters([
      'fsUserAgent',
      'artiInfo',
      'artiModalVisible',
      'enableAiAssistant',
      'batchJobVisible',
      'enableCsTransfer',
      'enableCsTransferTel',
      'enableCallIn',
      'enableCsSeat',
      'customerStr'
    ]),
    headers() {
      return {
        Authorization: getToken()
      }
    },
    uploadData() {
      return {
        isPermanent: false,
        expireTime: 7,
        checkExcel: true
      }
    },
    csStaffGroupId() {
      const { csStaffGroup } = this.formModel
      return csStaffGroup ? csStaffGroup.csStaffGroupId : undefined
    },
    showMultiple() {
      return this.phoneType !== 'MOBILE' && this.csStaffGroupId
    },
    maxConcurrencyQuota() {
      const { csStaffGroup = {}} = this.formModel
      return csStaffGroup.csStaffList ? Math.ceil(csStaffGroup.csStaffList.length * 1.5) : 2
    }
  },
  data() {
    return {
      answerMode: 'MANUAL',
      answerModelEnum,
      formModel: {
        phoneNumber: undefined,
        name: undefined,
        phoneNumberId: undefined,
        csStaffGroup: undefined,
        csDistributionMethod: undefined,
        dialogFlowId: undefined,
        needRearrange: false, // 是否打乱顺序
        isBatched: false,
        isMultiple: false, // 是否多并发
        concurrencyQuota: 1, // 并发数量
        mobilePhoneNumberIds: [],
        landlinePhoneNumberId: undefined,
        unfixedPhoneNumberId: undefined,
        policyPhoneNumberId: undefined
      },
      lineList: [], // 线路列表
      staffGroupList: [], // 坐席组列表
      staffGroupDistributeTypeEnum,
      callLoading: false, // 确认拨打loading
      rules: {
        phoneNumber: [{
          required: true,
          message: '请输入被叫号码'
        }, {
          pattern: phoneNumberregex,
          message: '请输入正确的被叫号码'
        }],
        phoneNumberId: [{
          required: true,
          message: '请选择主叫号码'
        }],
        mobilePhoneNumberIds: [{
          required: true,
          message: '请选择线路'
        }],
        landlinePhoneNumberId: [{
          required: true,
          message: '请选择线路'
        }],
        unfixedPhoneNumberId: [{
          required: true,
          message: '请选择线路'
        }],
        policyPhoneNumberId: [{
          required: true,
          message: '请选择策略组'
        }],
        dialogFlowId: [{
          required: true,
          message: '请选择相应话术'
        }],
        concurrencyQuota: [{
          required: true,
          message: '请输入并发数量'
        }],
        csStaffGroup: [{
          required: true,
          message: '请选择人工坐席组'
        }],
        csDistributionMethod: [{
          required: true,
          message: '请选择分配方式'
        }]
      },
      popoverVisible: false,
      useAiAssistant: false, // 默认关闭ai助理
      dialogFlowList: [], // 话术列表
      templateDownloadUrl: '', // 模板下载链接
      uploadFileUrl: '', // 上传excel的相对路径
      timer: null,
      phoneTypeEnum,
      phoneType: 'MOBILE',
      mobileLineList: [],
      landLineList: [],
      unfixedLineList: [],
      policyLineList: []
    }
  },
  watch: {
    csStaffGroupId(newId, oldId) {
      if (!oldId) {
        this.formModel.csDistributionMethod = Object.keys(staffGroupDistributeTypeEnum)[0]
      } else if (!newId) {
        this.formModel.csDistributionMethod = undefined
      }
    }
  },
  methods: {
    openEnv() {
      this.$emit('openEnv')
      this.hidePopover()
    },
    async loadLineList() { // 加载线路列表
      const { data } = await getCsLineList()
      this.lineList = data.data || []
    },
    async createCallRecord(customerPersonId, local, phoneLocationId) { // 创建人工外呼通话记录
      try {
        const { phoneNumberId, name, phoneNumber } = this.formModel
        const { data } = await addArtificialCallRecord({
          customerPersonId,
          customerPersonName: name,
          calledPhoneNumber: phoneNumber,
          phoneNumberId,
          callerPhone: this.artiInfo.sipAccount,
          callType: local ? 0 : 1,
          phoneLocationId
        })
        this.$store.commit('SET_NEW_CALL_RECORD_ID', data.data) // 生成的通话记录存到vuex用于更新
      } catch (error) {
        this.callLoading = false
        return Promise.reject(error)
      }
    },
    handleCallClick() {
      if (this.formModel.isBatched) {
        this.handleBatchedCall()
      } else {
        this.handleSingleCall()
      }
    },
    handleSingleCall() { // 点击拨打
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.$store.commit('SET_CALLTYPE', 'out') // 更新外呼类型为呼出
          this.$store.commit('SET_ASSISTANT_DIALOGFLOW_ID', this.formModel.dialogFlowId) // 保存当前选中的ai助理话术id
          this.$store.commit('SET_USE_AI_ASSISTANT', this.useAiAssistant) // 更新useAiAssistant状态
          if (this.useAiAssistant) { // 默认不显示通话记录，开启ai助理则显示
            this.$store.commit('SET_HISTORY_VISIBLE', true)
          } else if (!this.artiModalVisible) {
            this.$store.commit('SET_HISTORY_VISIBLE', false)
          }
          this.callLoading = true
          const customerInfo = await this.loadCustomerInfo() // 获取客户信息
          const { customerPersonId } = customerInfo
          const { dialCode, sipHeaders, useSipHeader, local, phoneLocationId } = await this.loadArtificialDialInfo()
          let formatSipHeaders = []
          if (useSipHeader && sipHeaders) { // 拨号需要sipHeader
            formatSipHeaders = sipHeaders.map(item => {
              return `${item.name}: ${item.value}`
            })
          }
          await this.createCallRecord(customerPersonId, local, phoneLocationId)
          this.callLoading = false
          this.popoverVisible = false
          if (this.fsUserAgent) {
            // this.fsUserAgent.call('CALL10030', ['X-LP: 861', 'X-LA: 106.15.160.37:5080', 'X-ECIN: 057128204503']) // TODO: mock
            if (useSipHeader) {
              this.fsUserAgent.call(dialCode, formatSipHeaders)
            } else {
              this.fsUserAgent.call(dialCode)
            }
          }
          if (!this.artiModalVisible) { // 若当前页有modal打开，先关闭
            this.$store.commit('SET_MODAL_VISIBLE_SWITCH', false)
            this.$nextTick(() => {
              this.$store.commit('SET_MODAL_VISIBLE_SWITCH', true)
            })
          }
          setTimeout(() => {
            this.$store.commit('SET_ARTI_MODAL_VISIBLE', true)
          }, 300)
        }
      })
    },
    handleBatchedCall() { // 批量人工外呼
      if (!this.uploadFileUrl) {
        this.$message.error('请先上传文件')
        return
      }
      this.$refs.form.validate(async valid => {
        if (valid) {
          const { concurrencyQuota, mobilePhoneNumberIds, landlinePhoneNumberId, unfixedPhoneNumberId, policyPhoneNumberId,
            dialogFlowId, needRearrange, isMultiple, csDistributionMethod } = this.formModel

          if (this.csStaffGroupId && !csDistributionMethod) {
            this.$message.error('请选择分配方式')
            return
          }

          let phoneNumberIdList
          switch (this.phoneType) {
            case 'MOBILE':
              phoneNumberIdList = mobilePhoneNumberIds
              break
            case 'LANDLINE':
              phoneNumberIdList = [landlinePhoneNumberId]
              break
            case 'UNFIXED_CALL':
              phoneNumberIdList = [unfixedPhoneNumberId]
              break
            case 'CALL_POLICY_GROUP':
              phoneNumberIdList = [policyPhoneNumberId]
              break
            default:
              phoneNumberIdList = undefined
              break
          }
          this.callLoading = true
          this.$store.commit('SET_ASSISTANT_DIALOGFLOW_ID', this.formModel.dialogFlowId) // 保存当前选中的ai助理话术id
          this.$store.commit('SET_USE_AI_ASSISTANT', this.useAiAssistant) // 更新useAiAssistant状态
          if (this.useAiAssistant) { // 默认不显示通话记录，开启ai助理则显示
            this.$store.commit('SET_HISTORY_VISIBLE', true)
          } else if (!this.artiModalVisible) {
            this.$store.commit('SET_HISTORY_VISIBLE', false)
          }
          try {
            await importCustomerPersonToBatchJob({
              objectName: this.uploadFileUrl,
              concurrencyQuota: isMultiple ? concurrencyQuota : 1,
              phoneNumberIdList,
              dialogFlowId,
              needRearrange,
              csStaffGroupId: this.csStaffGroupId,
              csDistributionMethod,
              answerMode: this.answerMode
            })
            this.pollingJob()
          } catch (error) {
            this.callLoading = false
          }
        }
      })
    },
    pollingJob() { // 轮询查询任务详情，进行中则任务创建完成
      let times = 0
      this.timer = setInterval(async() => {
        const { data } = await getCsBatchJobInfo()
        times++
        if (data.data || times > 10) {
          if (times > 10) {
            this.$message.success('任务创建成功')
          }
          const { jobStatus } = data.data || { jobStatus: 'COMPLETED' }
          clearInterval(this.timer)
          this.callLoading = false
          this.popoverVisible = false
          this.$store.commit('SET_BATCH_JOB_STATUS', jobStatus)
          this.$store.commit('SET_BATCH_JOB_VISIBLE', !!data.data)
        }
      }, 2000)
    },
    async getCSStaffList() {
      const { data } = await fetchStaffGroupList({
        pageNum: 1,
        pageSize: 999,
        enabledStatus: 'ENABLE',
        groupType: 'CS'
      })
      if (data.data) {
        this.staffGroupList = data.data.content || []
      }
    },
    async loadCustomerInfo() { // 获取当前外呼的客户信息
      const { phoneNumber, name } = this.formModel
      try {
        const { data } = await getCustomerPersonByPhoneNumber({ // 获取当前外呼的客户信息
          phoneNumber,
          customerPersonName: name
        })
        const result = data.data || {}
        this.$store.commit('SET_ARTI_CUSTOMER_DATA', result)
        return result
      } catch (error) {
        this.callLoading = false
        return Promise.reject(error)
      }
    },
    async loadArtificialDialInfo() { // 获取拨号信息
      try {
        const { phoneNumber, phoneNumberId } = this.formModel
        const { data } = await getArtificialDialInfo({
          customerPhone: phoneNumber,
          phoneNumberId
        })
        const result = data.data || {}
        this.$store.commit('SET_DIAL_INFO', result)
        return result
      } catch (error) {
        this.callLoading = false
        return Promise.reject(error)
      }
    },
    async loadDialogFlowList() { // 加载话术列表
      const { data } = await fetchFlowList({
        pgaeNum: 1,
        pageSize: 100,
        published: true
      })
      if (data.data) {
        this.dialogFlowList = data.data.content || []
      }
    },
    hidePopover() { // popover关闭
      this.popoverVisible = false
    },
    handlePopoverShow() { // popover显示
      this.loadDialogFlowList()
      this.getCSStaffList()
      if (this.defaultName) {
        this.$set(this.formModel, 'name', this.defaultName)
      }
      if (this.defaultPhoneNumber) {
        this.$set(this.formModel, 'phoneNumber', this.defaultPhoneNumber)
      }
    },
    handlePopoverHide() {
      this.formModel.isMultiple = false
    },
    uploadSuccess(res) { // 上传成功
      if (res.code !== 200) {
        this.$refs.upload.clearFiles()
        this.$message({
          message: res.resultMsg,
          type: 'error'
        })
        return
      }
      const { relativeURL } = res.data || {}
      this.uploadFileUrl = relativeURL
    },
    handleRemoveFile() { // 移除文件
      this.uploadFileUrl = ''
    },
    async handleDownload() { // 下载模板
      if (!this.templateDownloadUrl) {
        const { data } = await getDownloadTemplate()
        this.templateDownloadUrl = data.data
      }
      window.open(this.templateDownloadUrl, '_blank')
    },
    handleBatchedChange() {
      this.$refs.form.clearValidate()
    },
    toggleVisible() {
      // 已经有人工外呼了，此弹框不能被点出来，因为不能重复创建外呼任务
      if (!this.batchJobVisible) {
        this.popoverVisible = !this.popoverVisible
      }
    },
    handleMutipleChange(val) { // 切换并发
      if (val) {
        const self = this
        const h = this.$createElement
        this.$msgbox({
          customClass: 'confirm-multiple',
          distinguishCancelAndClose: true,
          title: '提示',
          message: h('div', { class: 'confirm-body' }, [
            h('i', { class: 'el-icon-warning' }),
            h('div', { class: 'text-wrap' }, [
              h('div', { class: 'title' }, '确定要开启多并发功能吗？'),
              h('div', { class: 'extra' }, `使用多并发功能，系统将按照您设置的并发数量，调度资源外呼${this.customerStr}，大大提高外呼效率！同时您也可能会因为${this.customerStr}等待时挂机，而错过部分外呼${this.customerStr}。`)
            ])
          ]),
          showCancelButton: true,
          confirmButtonText: '确定开启',
          cancelButtonText: '取消',
          closeOnClickModal: false
        }).catch(action => {
          if (action === 'cancel') {
            self.formModel.isMultiple = false
          }
        })
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
    },
    handleGroupChange() {
      this.$set(this.formModel, 'concurrencyQuota', 2)
    }
  },
  mounted() {
    this.loadLineList()
    this.loadTenantPhoneNumberList()
    this.loadPolicyGroupList()
    this.$refs.mask.addEventListener('click', this.hidePopover)
  },
  destroyed() {
    this.$refs.mask.removeEventListener('click', this.hidePopover)
  }
}
</script>

<style lang="scss">
  @import '~src/styles/variables.scss';
  .call-popover {
    .mask {
      z-index: $--index-top;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
  .env-check{
    i.iconfont{
      font-size: 12px;
      cursor: pointer;
      span{
        margin-left: 10px;
      }
    }
    .el-alert--warning{
      background-color: white;
      font-size: 12px;
      padding-right: 0;
      padding-bottom: 18px;
      i.el-icon-warning{
        font-size: 12px;
      }
    }
    .alert .el-alert__content .el-alert__title{
      font-size: 12px;
      height:17px;
      font-size:12px;
      font-family:PingFangSC-Regular;
      font-weight:400;
      color:rgba(226,153,21,1);
    }

  }
  .call-btn-form {
    padding: 32px 0 20px 0!important;
    .form {
      display: flex;
      flex-direction: column;
      .call-type {
        padding: 0 32px;
        /deep/ .el-radio-group {
          width: 100%;
          > label {
            width: 50%;
            > span {
              width: 100%;
            }
          }
        }
      }
      .form-radio {
        margin-bottom: 6px!important;
      }
      .input-number {
        width: 80px;
      }
      .form-item-wrap {
        padding: 0 32px;
        margin-bottom: 14px;
        border-bottom: 1px solid #F0F0F0;
        .ai-assitant {
          margin-bottom: 14px!important;
          .el-form-item__content {
            text-align: right;
            font-size: 0;
          }
        }
      }
      .step {
        color: $--color-black;
        &:nth-child(2) {
          margin-bottom: 16px;
        }
        > .action {
          margin-left: 12px;
          color: $--color-primary;
        }
      }
      .extra {
        font-size: $--font-size-small;
        margin: 4px 0 16px;
      }
      .submit-btn {
        margin: 0 32px;
        height: 38px!important;
        line-height: 38px!important;
        border-radius: $--border-radius-base;
      }
      .el-form-item--small.el-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .confirm-multiple {
    width: 554px;
    padding-bottom: 0;
    .confirm-body {
      display: flex;
      > .el-icon-warning {
        color: $--color-warning;
        font-size: 32px;
        margin-right: 24px;
      }
      > .text-wrap {
        > .title {
          font-size: $--font-size-middle;
          color: $--color-black;
          margin-bottom: 10px;
        }
        > .extra {
          font-size: $--font-size-small;
          color: #4A4A4A;
          line-height: 20px;
        }
      }
    }
    .el-message-box__header {
      padding: 12px 16px;
      background-color: #F7F7F7;
      > .el-message-box__title {
        font-size: $--font-size-middle;
        font-weight: $--font-weight-medium;
      }
    }
    .el-message-box__content {
      padding: 60px 80px;
    }
    .el-message-box__btns {
      padding: 12px 22px;
      background-color: #F7F7F7;
      border-top: 1px solid #D8D8D8;
    }
  }
</style>
