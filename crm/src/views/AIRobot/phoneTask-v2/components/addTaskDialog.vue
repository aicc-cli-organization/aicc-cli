<template>
  <el-dialog
    :title="editTaskId ? '编辑任务' : '新建任务'"
    top="0"
    width="1010px"
    :visible.sync="innerVisible"
    @close="close"
    @open="onOpen"
    class="add-task"
  >
    <el-form
      ref="form"
      class="add-task-form"
      label-width="147px"
      :rules="formRules"
      :model="formFields"
    >
      <el-form-item
        label="任务名称"
        prop="robotCallJob.name"
      >
        <el-input
          class="w300"
          placeholder="请输入任务名称"
          v-model="formFields.robotCallJob.name"
          clearable
        ></el-input>
        <el-checkbox v-model="priority">优先</el-checkbox>
      </el-form-item>
      <el-form-item
        v-if="!editTaskId"
        label="话术模版"
        prop="robotCallJob.dialogFlowId"
      >
        <el-select
          placeholder="请选择话术模版"
          filterable
          v-model="formFields.robotCallJob.dialogFlowId"
          @visible-change="loadDialogFlowInfoList"
          @change="getIntentionList"
        >
          <el-option
            v-for="(dialogFlow, index) in optionData.dialogFlowList"
            :key="index"
            :label="dialogFlow.name"
            :value="dialogFlow.id"
          ></el-option>
        </el-select>
        <sms-tooltip v-if="dialogFlowSmsTmpType" :smsType="dialogFlowSmsTmpType" :id="formFields.robotCallJob.dialogFlowId"></sms-tooltip>
        <send-count-tip v-if="dialogFlowSmsTmpType" :smsType="dialogFlowSmsTmpType" :id="formFields.robotCallJob.dialogFlowId"></send-count-tip>
      </el-form-item>
      <el-form-item
        label=" 外呼防骚扰"
      >
        <el-switch
          v-model="isDefendHarass"
          style="margin-right:5px"
          @change="defendHarassChange"
        >
        </el-switch>
        <el-select
          placeholder="请选择拦截规则"
          filterable
          v-model="formFields.robotCallJob.tenantCallInterceptId"
          v-if="isDefendHarass"
        >
          <el-option
            v-for="(item) in optionData.interceptInfoList"
            :key="item.tenantCallInterceptId"
            :label="item.name"
            :value="item.tenantCallInterceptId"
          ></el-option>
        </el-select>

        <el-tooltip effect="dark" placement="top-start">
          <div slot="content">请先在右上角拦截系统中添加拦截规则，用于在外呼时筛除部分号码，预防对{{customerStr}}的过度打扰。<br/>任务建成后可更改规则，更改后规则的只对其后导入的{{customerStr}}生效</div>
          <i class="el-icon-question icon-tip"></i>
        </el-tooltip>
        <span class="empty-dialogFlow-tip" v-if="isHarassTip" style="margin-left:15px">请先在右上角拦截设置里添加至少一组拦截规则</span>
      </el-form-item>
      <!-- 选择了话术 && 话术支持转人工 && 新建任务 -->
      <template v-if="formFields.robotCallJob.dialogFlowId && configData.jumpToHumanServiceExist && !editTaskId">
        <el-form-item
          label="转人工方式"
          key="transferHumanMode"
          required
        >
          <el-radio-group v-model="transferHumanMode">
            <el-radio label="human">转人工号码</el-radio>
            <el-radio label="callCenter">转第三方呼叫中心</el-radio>
            <el-radio label="csStaff" v-if="enableCsSeat">转人工坐席组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="transferHumanMode === 'human'"
          ref="humanTransfer"
          key="human"
          label="转人工号码"
          prop="transferPhoneNumber"
          :rules="formFields.robotCallJob.transferPhoneChooseType === 'POLLING' ? [{
            type: 'array', trigger: 'change', validator: transferPhoneNumberValidator
          }] : []"
          :required="formFields.robotCallJob.transferPhoneChooseType === 'POLLING'">
          <el-select v-model="formFields.transferPhoneNumber" placeholder="请选择" @visible-change="loadHumanService"
          allow-create multiple collapse-tags filterable :disabled="formFields.robotCallJob.transferPhoneChooseType === 'ASSIGN'">
            <el-option
              v-for="item in optionData.transferPhoneNumberList"
              :key="item.phoneNumber"
              :label="item.name + '---' +item.phoneNumber"
              :value="item.phoneNumber">
            </el-option>
          </el-select>
          <el-checkbox class="customer-user-push" @change="onChangeTransferType">导入{{customerStr}}时，为每个{{customerStr}}单独设置转人工号码</el-checkbox>
        </el-form-item>
        <el-form-item
          v-if="transferHumanMode === 'callCenter'"
          label="转第三方呼叫中心"
          key="callCenter"
          prop="robotCallJob.callCenterStaffGroupId"
        >
          <el-select
            v-model="formFields.robotCallJob.callCenterStaffGroupId"
            @visible-change="loadCallCenter"
          >
            <el-option
              v-for="(item, index) in optionData.staffGroupList"
              :key="index"
              :label="item.groupName"
              :value="item.csStaffGroupId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="transferHumanMode === 'csStaff'"
          label="坐席组选择"
          prop="robotCallJob.csStaffGroupId"
          required
        >
          <el-select
            v-model="formFields.robotCallJob.csStaffGroupId"
          >
            <el-option
              v-for="(item, index) in staffGroupList"
              :key="index"
              :label="item.groupName"
              :value="item.csStaffGroupId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分配方式" v-if="transferHumanMode === 'csStaff'" prop="robotCallJob.csDistributionMethod" required>
          <el-select v-model="formFields.robotCallJob.csDistributionMethod" placeholder="请选择">
            <el-option v-for="(v, index) in csDistributionMethodEnum" :key="index" :label="v" :value="index"></el-option>
          </el-select>
          <el-tooltip effect="dark" placement="top-start">
            <div slot="content">熟客分配：根据在线坐席对{{customerStr}}的熟悉程度进行分配，对{{customerStr}}越熟悉越优先；如果是陌生{{customerStr}}遵循“空闲分配”原则；<br />空闲分配：根据在线坐席空闲时间长短进行分配，空闲越久越优先；<br />随机分配：随机分配给在线坐席。</div>
            <i class="el-icon-question icon-tip"></i>
          </el-tooltip>
        </el-form-item>
      </template>
      <!-- 人工坐席组 -->
      <el-form-item key="group" label="人工介入坐席组" v-if="formFields.robotCallJob.dialogFlowId && configData.humanInterventionExist && !editTaskId" prop="robotCallJob.csStaffGroupId" required>
        <el-select filterable v-model="formFields.robotCallJob.csStaffGroupId" @visible-change="loadHumanIntervention" placeholder="请选择" :disabled="!enableCsTransfer">
          <el-option v-for="(item, index) in optionData.staffGroupList" :key="index" :label="item.groupName" :value="item.csStaffGroupId"></el-option>
        </el-select>
        <el-tooltip effect="dark" placement="top-start" v-if='!enableCsTransfer'>
          <div slot="content">未开启人工介入权限, 如有需要请联系{{customerStr}}经理为您开启</div>
          <i class="el-icon-question icon-tip const-cs-group-icon"></i>
        </el-tooltip>
        <span v-if="csGrouponLineTip" class="red-tip">当前坐席组无在线坐席，消息将无法推送，请谨慎选择！</span>
        <!-- <br> -->
        <div class="env-check">
          <span>为了保证人工介入的质量，请先进行环境检测。</span>
          <span class="text">如何检测<img src="/static/img/env-tip2.png"  alt=""></span>
        </div>
      </el-form-item>
      <el-form-item label="分配方式" v-if="formFields.robotCallJob.dialogFlowId && configData.humanInterventionExist && !editTaskId" prop="robotCallJob.csDistributionMethod" required>
        <el-select v-model="formFields.robotCallJob.csDistributionMethod" placeholder="请选择">
          <el-option v-for="(v, index) in csDistributionMethodEnum" :key="index" :label="v" :value="index"></el-option>
        </el-select>
        <el-tooltip effect="dark" placement="top-start">
          <div slot="content">熟客分配：根据在线坐席对{{customerStr}}的熟悉程度进行分配，对{{customerStr}}越熟悉越优先；如果是陌生{{customerStr}}遵循“空闲分配”原则；<br />空闲分配：根据在线坐席空闲时间长短进行分配，空闲越久越优先；<br />随机分配：随机分配给在线坐席。</div>
          <i class="el-icon-question icon-tip"></i>
        </el-tooltip>
      </el-form-item>
      <!-- 启动方式 -->
      <el-form-item label="启动方式" prop="robotCallJob.mode">
        <el-radio-group
          v-model="formFields.robotCallJob.mode">
          <el-radio label="MANUAL">手动</el-radio>
          <el-radio label="AUTO">自动</el-radio>
        </el-radio-group>
        <el-tooltip effect="dark" placement="top-start">
          <div slot="content">手动启动：新建任务后，在可拨打时段，系统不会开启外呼任务，需要用户手动点击启动!<br />自动启动：新建任务后，在可拨打时段，系统将自动开启外呼任务!</div>
          <i class="el-icon-question icon-tip"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <div slot="label"><span class="red-star" style="margin-right:4px">*</span>可拨打时间段</div>
        <dial-time-period-setting :mode="formFields.robotCallJob.mode" :timePeriod.sync='timePeriod'></dial-time-period-setting>
      </el-form-item>
      
      <el-form-item :label="index === 0 ? '不可拨打日期' : ''"  v-for="(item, index) in formFields.robotCallJob.inactiveDateList" :key="index">
        <el-date-picker
          v-model="formFields.robotCallJob.inactiveDateList[index].datePicker"
          type="daterange"
          prefix-icon="el"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          @focus="datePickerFocus(index)"
          :picker-options="datePickerRange"
        ></el-date-picker>
        <a class="edit-group iconfont icon-tianjiajiahaowubiankuang" style="margin-left:5px" @click="onCloneInactiveDateGroup" v-if="index === 0"></a>
        <span class="edit-group-tip" v-if="index === 0">请按时间顺序依次设置</span>
        <a class="edit-group iconfont icon-changyonggoupiaorenshanchu" @click="onRemoveInactiveDateGroup(index)" v-else></a>
      </el-form-item>

      <!-- 外呼方式 -->
      <el-form-item label="外呼方式" prop="robotCallJob.phoneType">
        <el-radio-group
          v-model="formFields.robotCallJob.phoneType"
          @change="changePhoneType">
          <el-radio v-for="(value, key) in configData.phoneTypeEnum" :key="key" :label="key">{{value}}</el-radio>
          <el-radio key="CALL_POLICY_GROUP" label="CALL_POLICY_GROUP" v-if="policyGroupList.length">外呼策略组</el-radio>
          <el-tooltip effect="dark" placement="top-start" v-if="policyGroupList.length">
            <div slot="content">
              <span>使用策略组外呼，可以根据被叫归属地智能路由线路，达到“本地号码呼本地”的效果，</span><br>
              <span>也可以有效避免某条线路故障导致的任务暂停问题，提高接通率和外呼效率！</span>
            </div>
            <i class="el-icon-question icon-tip policy-icon-tip"></i>
          </el-tooltip>
        </el-radio-group>
      </el-form-item>
      <!-- 坐席 :disabled="configData.jumpToHumanServiceExist && jobPhoneNumberSelect.label === '手机坐席'"-->
      <el-form-item :label="jobPhoneNumberSelect.label" prop="jobPhoneNumberIdList" class="inline-block">
        <el-select v-model="formFields.jobPhoneNumberIdList" collapse-tags
          multiple :multiple-limit="jobPhoneNumberSelect.multipleLimit"
          :placeholder="jobPhoneNumberSelect.placeholder"
          @change="handlePhoneNumberSelectChange"
          @visible-change="loadTenantPhoneNumberList"
        >
          <el-option disabled class="select-all-option" v-if="jobPhoneNumberSelect.multipleLimit > 1">
            <el-checkbox v-model="selectAllPhone" @change="handleSelectAllPhone">全选</el-checkbox>
          </el-option>
          <el-option v-for="(item, index) in jobPhoneNumberSelect.options"
            :key="index"
            :label="item.label"
            :value="item.tenantPhoneNumberId"
            :disabled="!!item.disabled"
          ></el-option>
        </el-select>
        <span v-if="jobPhoneNumberSelect.label === '手机坐席'">剩余AI数量{{configData.AICount.free}}个，AI总量{{configData.AICount.total}}个</span>
        <!-- <el-checkbox v-model="formFields.robotCallJob.useFreeAi" v-else>自动利用空闲AI</el-checkbox> -->
      </el-form-item>
      <el-form-item key="AICount" label="AI数量" v-if="['LANDLINE', 'UNFIXED_CALL', 'CALL_POLICY_GROUP'].includes(formFields.robotCallJob.phoneType)" prop="robotCallJob.robotCount">
        <el-input-number v-model="formFields.robotCallJob.robotCount" :min="1" :max="aiCountMax" size="mini" controls-position="right"></el-input-number>
        <span class="inline-block" style="height: 24px;vertical-align: top;">
          <span class="phone-number-limit" v-if="showConcurrenceLimit">{{concurrenceLimit ? `线路并发限制${concurrenceLimit}个` : ''}}</span>
          (剩余AI数量{{configData.AICount.free}}个，AI总量{{configData.AICount.total}}个)
        </span>
        <el-tooltip effect="dark" placement="top-start" v-if="configData.AICount.AITip">
          <div slot="content">{{configData.AICount.AITip}}</div>
          <i class="el-icon-question icon-tip"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item key="transferTenantPhoneNumberId" label="呼叫人工线路" prop="robotCallJob.transferTenantPhoneNumberId"
        v-if="configData.jumpToHumanServiceExist && formFields.robotCallJob.phoneType === 'MOBILE' && ['csStaff', 'human'].includes(transferHumanMode)">
        <el-select placeholder="请选择呼叫人工使用的线路" v-model="formFields.robotCallJob.transferTenantPhoneNumberId" @visible-change="loadTenantPhoneNumberList">
          <el-option
            v-for="(item, index) in optionData.transferTenantPhoneNumberList"
            :key="index"
            :label="item.label"
            :value="item.tenantPhoneNumberId"
            :disabled="!!item.disabled">
          </el-option>
        </el-select>
        <el-tooltip effect="dark" placement="top-start">
          <div slot="content">使用手机坐席外呼，需要另外搭配呼叫人工号码的线路</div>
          <i class="el-icon-question icon-tip"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="使用多并发" v-if="configData.showConcurrency" :style="{'margin-bottom': '0px'}">
        <el-col :span="4">
          <el-form-item prop="enableConcurrency">
            <el-radio-group v-model="formFields.enableConcurrency">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="20" v-if="formFields.enableConcurrency">
          <el-form-item label="并发数量" prop="concurrencyQuota" class="concurrency-form-item">
            <el-input-number v-model="formFields.concurrencyQuota"
              :min="concurrencyRange.min" :max="concurrencyRange.max" size="mini"
            ></el-input-number>
            <span v-if="showRange">请选择{{concurrencyRange.min}}~{{concurrencyRange.max}}个并发数</span>
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content">使用多并发功能，系统将按照您设置的并发数量调度资源外呼{{customerStr}}，待{{customerStr}}接听后再对接AI坐席，大大提高坐席使用效率！</div>
              <i class="el-icon-question icon-tip"></i>
            </el-tooltip>
            <span v-if="concurrencyTip">请选择大于1个坐席，才可以使用多并发功能</span>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="挂机短信推送" v-if="!isLocal">
        <el-radio-group v-model="configData.smsSend" :disabled="!!this.editTaskId">
          <el-radio label="yes">是</el-radio>
          <el-radio label="no">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="robotCallJob.smsAlertLevelCode" v-if="configData.smsSend === 'yes'" key="smsAlertLevelCode">
        <div v-if="formFields.robotCallJob.dialogFlowId">
           <el-checkbox label="all" v-model="smsAlertLevelIsCheckAll" :indeterminate="smsAlertLevelIsIndeterminate" :disabled="!!this.editTaskId">全选</el-checkbox>
          <el-checkbox-group v-model="formFields.robotCallJob.smsAlertLevelCode" class="sms-alert-checkbox-group" :disabled="!!this.editTaskId">
            <el-checkbox :label="item.code" v-for="(item, index) in configData.intentLevelTagList" :key="index">{{item.name}}</el-checkbox>
          </el-checkbox-group>
        </div>
        <span class="empty-dialogFlow-tip" v-else>选择话术模版后，方可选择意向进行挂机短信推送</span>
      </el-form-item>
      <el-form-item label="短信模版" v-if="configData.smsSend === 'yes' && !isLocal" prop="robotCallJob.smsTemplateId" key="smsTemplateId">
        <el-select v-model="formFields.robotCallJob.smsTemplateId" @visible-change="loadSmsTemplateList" :disabled="!!this.editTaskId">
          <el-option v-for="(item, index) in optionData.smsTemplateList"
            :key="index"
            :label="item.name"
            :value="item.smsTemplateId"
          ></el-option>
        </el-select>
        <sms-tooltip location="bottom" v-if="smsTemplateType" :smsType="smsTemplateType" :id="formFields.robotCallJob.smsTemplateId"></sms-tooltip>
        <send-count-tip v-if="smsTemplateType" :smsType="smsTemplateType" :id="formFields.robotCallJob.smsTemplateId"></send-count-tip>
      </el-form-item>
      <el-form-item
        v-if="!isLocal && !isRongLian && !NoLogoNorWx"
        ref="wechatPushFormItem"
        label="意向微信推送"
        prop="robotCallJob.wechatPushConditionList"
        class="wechat-alert-group"
        :rules="configData.wechatSend === 'yes' ? [{ validator: wechatPushConditionListValidator, trigger: 'change' }] : []"
      >
        <el-radio-group v-model="configData.wechatSend" @change="onChangeWechatSend">
          <el-radio label="yes">是</el-radio>
          <el-radio label="no">否</el-radio>
        </el-radio-group>
        <div v-if="configData.wechatSend === 'yes'">
          <div v-if="formFields.robotCallJob.dialogFlowId">
            <intent-wechat-push
              :intentLevelTags="configData.intentLevelTagList"
              v-model="formFields.robotCallJob.wechatPushConditionList"
            />
            <!-- <el-checkbox label="all" v-model="wechatAlertLevelIsCheckAll" :indeterminate="wechatAlertLevelIsIndeterminate">全选</el-checkbox>
            <el-checkbox-group v-model="formFields.robotCallJob.wechatAlertLevelCode">
              <el-checkbox :label="item.code" v-for="(item, index) in configData.intentLevelTagList" :key="index">{{item.name}}</el-checkbox>
            </el-checkbox-group>
            <div class="add-duration-limit" @click="configData.durationLimit = true" v-if="!configData.durationLimit">
              <i class="iconfont icon-tianjiajiahaowubiankuang"></i><span>添加通话时长限制</span>
            </div>
            <div class="duration-limit-area" v-if="configData.durationLimit">
              <div class="tip">注：以下勾选的标签将受通话时长的限制</div>
              <div class="area-content">
                <div class="limit-intent">
                  <span class="label">需要检查通话时长的标签: </span>
                  <el-checkbox-group v-model="formFields.robotCallJob.wechatConditionAlertLevelCode">
                    <el-checkbox :label="item.code" v-for="(item, index) in configData.wechatDurationLimitList" :key="index">{{item.name}}</el-checkbox>
                  </el-checkbox-group>
                </div>
                <div>
                  <span class="duration-span">通话时长 > </span>
                  <el-input class="threshold-input" type="number" placeholder="30" v-model="formFields.robotCallJob.wechatAlertChatDurationThreshold"></el-input>
                  <span class="unit">秒</span>
                  <i class="iconfont icon-delet const-icon-delete" @click="configData.durationLimit = false"></i>
                </div>
              </div>
            </div> -->
          </div>
          <span class="empty-dialogFlow-tip" v-else>选择话术模版后，方可选择意向进行微信推送</span>
        </div>

      </el-form-item>
      <!-- <el-form-item label="微信推送人" v-if="configData.wechatSend === 'yes' && !isLocal" prop="robotCallJob.alertUsers">
        <el-select multiple collapse-tags filterable
          @visible-change="loadWechatPushUserList"
          v-model="formFields.robotCallJob.alertUsers">
          <el-option v-for="(item, index) in optionData.alertUsers"
            :key="index"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
        <default-group
          groupType="WECHAT_PUSH"
          v-model="formFields.robotCallJob.alertUsers"
        ></default-group>
      </el-form-item> -->
      <!-- <el-form-item label="微信推送方式" v-if="configData.wechatSend === 'yes' && !isLocal" prop="robotCallJob.wechatSendMethod">
        <el-select v-model="formFields.robotCallJob.wechatSendMethod">
          <el-option v-for="item in weChatSendMethodList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          ></el-option>
        </el-select>
        <el-checkbox
          class="customer-user-push"
          v-if="formFields.robotCallJob.wechatSendMethod === 'SENDTOONE'"
          v-model="formFields.robotCallJob.transferCustomer"
        >同时将该{{customerStr}}分配至对应推送人</el-checkbox>
      </el-form-item> -->
      <el-form-item label="预警消息推送人" prop="robotCallJob.earlyWarningAlertUsers">
        <el-select @visible-change="loadEarlyWarningAlertUsers" v-model="formFields.robotCallJob.earlyWarningAlertUsers" multiple filterable collapse-tags>
          <el-option v-for="(item, index) in optionData.earlyWarningAlertUsers"
            :key="index"
            :label="item.name"
            :value="item.userId"
          ></el-option>
        </el-select>
        <default-group
          groupType="EARLY_WARNING_PUSH"
          v-model="formFields.robotCallJob.earlyWarningAlertUsers"
        ></default-group>
      </el-form-item>
      <el-form-item label="自动重拨设置">
        <el-radio-group v-model="configData.autoRecalled">
          <el-radio label="yes">是</el-radio>
          <el-radio label="no">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="robotCallJob.redialCondition" v-if="configData.autoRecalled === 'yes'">
        <div class="intention-wrap">
          <div class="intention">
            <el-checkbox label="all" v-model="autoRecalledIsCheckAll" :indeterminate="autoRecalledIsIndeterminate">全选</el-checkbox>
          </div>
          <div class="intention" style="white-space: normal">
            <el-checkbox-group v-model="formFields.robotCallJob.redialCondition" class="autorecall-checkbox-group">
              <!-- <el-checkbox :label="item" v-for="(item, index) in configData.redialCondition" :key="index">{{configData.redialConditionEnum[item]}}</el-checkbox> -->
              <el-checkbox
                v-for="(v, k) in configData.redialConditionEnum"
                :key="v"
                :label="k"
              >{{v}}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="intention-wrap" style="position:relative">
           <div class="intention"><el-checkbox v-model="isListening">已接听</el-checkbox></div>
           <div class="intention" v-if="!formFields.robotCallJob.dialogFlowId" style="color: #FF9900;font-size:12px">选择话术模板后，方可选择意向进行重拨</div>
           <div class="intention" style="white-space: normal" v-if="formFields.robotCallJob.dialogFlowId && isListening">
             <el-checkbox-group v-model="formFields.robotCallJob.connectRedialCondition"> 
              <el-checkbox  v-for="item in configData.intentLevelTagList" :key="item.code" :label="item.code" >{{item.name}}</el-checkbox>
            </el-checkbox-group>
           </div>
           <div class="error-text" v-if="isCalled">请选择自动重拨设置</div>
        </div>
      </el-form-item>
      <el-form-item v-if="configData.autoRecalled === 'yes'">
        <el-col :span="8">
          <el-form-item label="间隔时长" prop="robotCallJob.redialInterval" class="redial-interval-times" required>
            <el-input type="number" min="0" max="24" step="0.1" v-model.number="formFields.robotCallJob.redialInterval"></el-input>小时
            <el-tooltip effect="dark" placement="top-start">
              <div slot="content">设置完成后，需要重拨的通话将在间隔时长后拨打，若间隔时长设为“0”则会立即进行重拨，谨慎设置时长。</div>
              <i class="el-icon-question icon-tip"></i>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="重拨次数" prop="robotCallJob.redialTimes" class="redial-interval-times" required>
            <el-select v-model="formFields.robotCallJob.redialTimes">
              <!-- :disabled="item >= dailyCallCount" -->
              <el-option v-for="item in redialLimits" :key="item" :label="item" :value="item" :disabled="item >= dailyCallCount"></el-option>
            </el-select>次
            <span class="limit-text" v-if="dailyCallCount <= configData.maxRedialTimes">(线路对同一被叫每日拨打限制{{dailyCallCount}}次)</span>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="任务描述" prop="robotCallJob.description">
        <el-input type="textarea" v-model="formFields.robotCallJob.description"
          placeholder="请输入200字以内的任务描述"
          rows="4"
          resize="none"
          class="desc-textarea"
          :maxlength="maxLength"
          @input="inputLength"
          ></el-input>
          <span>
            <span v-if="validWords >= 181" class="input-length-red" >{{validWords}}</span>
            <span v-else >{{validWords}}</span>/200
          </span>
      </el-form-item>
      <div class="footer">
        <el-button @click="onSubmit"
          :disabled="submitBtnDisabled"
          type="primary"
        >提交</el-button>
        <el-button @click="close"
        >取消</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script>
import {
  transferPhoneNumberValidator,
  wechatPushConditionListValidator,
  formRules,
  getInitFormFields,
  getWechatPushConditionItem,
  jobPhoneNumberSelectConfig
} from '../config/addTask'
import { CS_GROUP_MAP, phoneTypeEnum, redialTimesEnum, redialConditionEnum } from '../config/enum'
import Connect from '../config/connect'
import TaskForm from '../config/taskForm'
import * as talkAPI from '@/api/talk'
import * as usersAPI from '@/api/users'
import * as smsAPI from '@/api/sms'
import * as taskAPI from '@/api/task'
import * as constant from '@/utils/constant'
import { csDistributionMethodEnum } from '@/utils/enum'
import moment from 'moment'
import { getActiveTenantPhoneNumberList } from '@/api/numberpool'
import { mapGetters } from 'vuex'
import SmsTooltip from './smsToolTip'
import SendCountTip from './sendCountTip'
import DefaultGroup from './defaultGroup'
import IntentWechatPush from './intentWechatPush'
import dialTimePeriodSetting from './dialTimePeriodSetting'

export default {
  mixins: [TaskForm, Connect],
  components: {
    SmsTooltip,
    SendCountTip,
    DefaultGroup,
    IntentWechatPush,
    dialTimePeriodSetting
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      //datepicker: ['2018-08-23','2018-09-09'],
      priority: false,
      formRules,
      csDistributionMethodEnum,
      formFields: getInitFormFields(),
      constant,
      optionData: {
        dialogFlowList: [],
        outCallFullInfo: {
          MOBILE: undefined,
          LANDLINE: undefined,
          UNFIXED_CALL: undefined,
          CALL_POLICY_GROUP: undefined
        },
        alertUsers: undefined,
        earlyWarningAlertUsers: undefined,
        smsTemplateList: undefined,
        transferPhoneNumberList: undefined,
        staffGroupList: undefined,
        transferTenantPhoneNumberList: [],
        interceptInfoList: [],
      },
      allConcurrencyCount: 0,
      staffGroupList: [],
      redialLimits: [],
      configData: {
        phoneTypeEnum,
        smsSend: 'no',
        wechatSend: 'yes',
        showConcurrency: false,
        AICount: {
          free: undefined,
          total: undefined,
          AITip: '',
          max: 0
        },
        intentLevelTagList: [], // 自定义意向标签列表
        jumpToHumanServiceExist: false,
        humanInterventionExist: false,
        autoRecalled: 'no',
        redialCondition: Object.keys(redialConditionEnum),
        redialConditionEnum,
        redialTimesEnum,
        maxRedialTimes: redialTimesEnum.slice(-1)[0],
        durationLimit: false,
        wechatDurationLimitList: []
      },
      dialogFlowSmsTmpType: '',
      transferPhoneNumberValidator,
      wechatPushConditionListValidator,
      policyGroupList: [],
      showConcurrenceLimit: false,
      submitBtnDisabled: false,
      selectAllPhone: false,
      transferHumanMode: 'human',
      maxLength: 999,
      isListening: false,
      timePeriod: {
        daysOfWeek: getInitFormFields().robotCallJob.daysOfWeek,
        dailyStartTime: getInitFormFields().robotCallJob.dailyStartTime,
        dailyEndTime: getInitFormFields().robotCallJob.dailyEndTime,
        inactiveTimeList: getInitFormFields().robotCallJob.inactiveTimeList,
        startTime: getInitFormFields().robotCallJob.startTime,
        endTime: getInitFormFields().robotCallJob.endTime
      },
      datePickerIndex: 0,
      datePickerRange: {
        disabledDate: (time) => {
          if(this.datePickerIndex === 0 ) {
            const startTime = this.timePeriod.startTime || ''
            const endTime = this.timePeriod.endTime || ''
            return time.getTime() < new Date(startTime).getTime() || time.getTime() > new Date(endTime).getTime()
          }else {
            const startTime = this.formFields.robotCallJob.inactiveDateList[this.datePickerIndex-1].datePicker[1] || this.timePeriod.startTime
            const endTime = this.timePeriod.endTime || ''
            return time.getTime() < new Date(startTime).getTime() || time.getTime() > new Date(endTime).getTime()
          }
        }
      },
      isListening: false,
      isDefendHarass: false,
      isHarassTip: false
    }
  },
  methods: {
    onChangeWechatSend(wechatSend) {
      this.$refs.wechatPushFormItem.clearValidate()
    },
    onChangeTransferType(transferType) {
      this.$set(this.formFields.robotCallJob, 'transferPhoneChooseType', transferType ? 'ASSIGN' : 'POLLING')
      this.$set(this.formFields, 'transferPhoneNumber', [])
      this.$refs.humanTransfer.clearValidate()
    },
    close() {
      this.formFields = getInitFormFields()
      this.timePeriod = {
        daysOfWeek: this.formFields.robotCallJob.daysOfWeek,
        dailyStartTime: this.formFields.robotCallJob.dailyStartTime,
        dailyEndTime: this.formFields.robotCallJob.dailyEndTime,
        inactiveTimeList: this.formFields.robotCallJob.inactiveTimeList,
        startTime: this.formFields.robotCallJob.startTime,
        endTime: this.formFields.robotCallJob.endTime,
        dialIntervalStart: this.dialIntervalStart || '09:00',
        dialIntervalEnd: this.dialIntervalEnd || '20:00'
      },
      this.transferHumanMode = 'human'
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.innerVisible = false
      this.selectAllPhone = false
    },
    async onOpen() {
      this.loadAICount()
      this.loadPolicyGroupList()
      this.fetchStaffGroupList()
      this.getRedialLimit()
      if (this.editTaskId) {
        this.loadTenantPhoneNumberList(true)
        this.loadDialogFlowInfoList(true)
        // this.loadWechatPushUserList(true)
        this.loadEarlyWarningAlertUsers(true)
        this.loadSmsTemplateList(true)
        this.loadHumanService(true)
        this.loadHumanIntervention(true)
        this.loadRobotJobInfo()
        this.priority = this.selectTask ? this.selectTask.priority === 0 : false
        await this.loadRobotJobInfo()
        this.getInterceptInfoList()
      } else {
        this.configData.intentLevelTagList = []
        this.configData.wechatDurationLimitList = []
        this.configData.durationLimit = false
        this.configData.smsSend = 'no'
        this.configData.wechatSend = 'yes'
        this.priority = false
        this.isListening = false
        this.getInterceptInfoList()
        this.timePeriod = {
          ...this.timePeriod,
          dialIntervalStart: this.dialIntervalStart || '09:00',
          dialIntervalEnd: this.dialIntervalEnd || '20:00'
        }
      }
    },
    async loadRobotJobInfo() {
      const taskInfo = (await taskAPI.getRobotCallJob({
        robotCallJobId: this.editTaskId
      })).data.data
      this.configData.intentLevelTagList = taskInfo.intentLevelTag.details
      this.__initFormFields(taskInfo)
    },
    async loadDialogFlowInfoList(visible) {
      if (!visible || (this.optionData.dialogFlowList && this.optionData.dialogFlowList.length)) {
        return
      }
      this.optionData.dialogFlowList = (await talkAPI.fetchFlowList({
        pageNum: 1,
        pageSize: 999,
        published: true
      })).data.data.content
    },
    async getIntentionList(id) {
      const a = id;
    },
    async loadTenantPhoneNumberList(visible) {
      if (!visible) {
        return
      }

      const { data: { data: { MOBILE, LANDLINE, UNFIXED_CALL }}} = await getActiveTenantPhoneNumberList()
      const dealMobile = MOBILE.map((item) => {
        const backfix = item.concurrency == 0 ? '(空闲)' : '(使用中)'
        item.label = `${item.phoneName ? item.phoneName + '-' : ''}${item.phoneNumber}${backfix}`
        return item
      })
      const outCallFullInfo = {
        MOBILE: dealMobile,
        LANDLINE: LANDLINE.map((item) => {
          item.label = item.phoneName || item.phoneNumber
          if (item.overdue) {
            item.label += '(欠费)'
            item.disabled = true
          }
          return item
        }),
        UNFIXED_CALL: UNFIXED_CALL.map((item) => {
          item.label = item.phoneName || item.phoneNumber
          if (item.overdue) {
            item.label += '(欠费)'
            item.disabled = true
          }
          return item
        })
      }
      this.optionData.outCallFullInfo = {
        ...this.optionData.outCallFullInfo,
        ...outCallFullInfo
      }
      this.selectAllPhone = this.formFields.jobPhoneNumberIdList.length === this.jobPhoneNumberSelect.options.filter(item => !item.disabled).length
      // canTransfer
      this.optionData.transferTenantPhoneNumberList = [...outCallFullInfo.LANDLINE, ...outCallFullInfo.UNFIXED_CALL].filter(item => item.canTransfer)
    },
    handlePhoneNumberSelectChange(v) {
      this.selectAllPhone = v.length === this.jobPhoneNumberSelect.options.filter(item => !item.disabled).length
    },
    // async loadWechatPushUserList(visible) {
    //   if (!visible ||
    //   (this.optionData.alertUsers &&
    //   this.optionData.alertUsers.length)) {
    //     return
    //   }
    //   this.optionData.alertUsers = (await usersAPI.getUserListByWechat()).data.data
    // },
    async loadEarlyWarningAlertUsers(visible) {
      if (!visible ||
      (this.optionData.earlyWarningAlertUsers &&
      this.optionData.earlyWarningAlertUsers.length)) {
        return
      }
      this.optionData.earlyWarningAlertUsers = (await usersAPI.getAllUserList()).data.data
    },
    async loadAICount() {
      const { freeRobotCount, robotCount, enableConcurrency, robotCountLimit, userFreeRobotCount, allConcurrencyCount, futherRobotCount } = (await taskAPI.getFreeRobotCount()).data.data
      const total = robotCountLimit <= 0 ? robotCount : Math.min(robotCountLimit, robotCount)
      const free = robotCountLimit <= 0 ? freeRobotCount : Math.min(userFreeRobotCount, freeRobotCount)
      const max = robotCountLimit <= 0 ? robotCount + futherRobotCount : Math.min(robotCountLimit, robotCount + futherRobotCount)
      this.configData.AICount = {
        max,
        free,
        total,
        AITip: robotCountLimit <= 0 ? '' : (freeRobotCount < userFreeRobotCount ? `您原本剩余坐席${userFreeRobotCount}个，由于其他账号占用坐席，导致您剩余坐席数为${freeRobotCount}个` : '')
      }
      this.allConcurrencyCount = allConcurrencyCount || 0
      this.configData.showConcurrency = !!enableConcurrency
    },
    async loadHumanService(visible) {
      if (!visible ||
      (this.optionData.transferPhoneNumberList &&
      this.optionData.transferPhoneNumberList.length)) {
        return
      }
      taskAPI.listAllBrief().then(({ data }) => {
        this.optionData.transferPhoneNumberList = data.data
      })
    },
    async loadStaffGroupList(params) {
      const res = await taskAPI.getcsRototStaffGroupList({
        pageNum: 1,
        pageSize: 999,
        enabledStatus: 'ENABLE',
        ...params
      })
      this.optionData.staffGroupList = res.data.data.content.map(item => ({
        groupName: `${item.groupName}-${CS_GROUP_MAP[item.groupType]}`,
        csStaffGroupId: item.csStaffGroupId,
        onlineCount: item.onlineCount,
        groupType: item.groupType
      }))
    },
    async fetchStaffGroupList() {
      const { data } = await taskAPI.getcsRototStaffGroupList({
        pageNum: 1,
        pageSize: 999,
        enabledStatus: 'ENABLE'
      })

      this.staffGroupList = data.data.content || []
    },
    async loadHumanIntervention(visible) {
      if (!visible) {
        return
      }
      this.loadStaffGroupList()
    },
    async loadCallCenter(visible) {
      if (!visible) return
      this.loadStaffGroupList({
        groupType: 'THIRD_PARTY'
      })
    },
    async loadIntentLevelTag(dialogFlowId) {
      const { intentLevelTagId } = this.optionData.dialogFlowList.find(item => item.id === dialogFlowId)
      return taskAPI.getIntentLevelTag(intentLevelTagId)
        .then(({ data }) => {
          const intentLevelTagList = data.data.details
          this.configData.intentLevelTagList = intentLevelTagList
          return intentLevelTagList
        })
    },
    async loadPolicyGroupList() {
      const res = await taskAPI.getPolicyGroupList()
      this.policyGroupList = res.data.data.map(item => {
        item.label = item.name
        item.tenantPhoneNumberId = item.callPolicyGroupId
        return item
      })
      if (this.policyGroupList.length) {
        this.optionData.outCallFullInfo = {
          ...this.optionData.outCallFullInfo,
          CALL_POLICY_GROUP: this.policyGroupList
        }
      }
    },
    handleSelectAllPhone(v) {
      this.formFields.jobPhoneNumberIdList = v
        ? this.jobPhoneNumberSelect.options
            .filter(item => !item.disabled)
            .map(item => item.tenantPhoneNumberId)
            .slice(0, this.jobPhoneNumberSelect.multipleLimit || 1)
        : []
    },
    requestJumpToHumanServiceExist() {
      const dialogFlowId = this.formFields.robotCallJob.dialogFlowId
      if (!dialogFlowId) return
      taskAPI.getDialogFlowCallJobRelatedInfo({
        dialogFlowId
      }).then(({ data }) => {
        const { jumpToHumanServiceExist, humanInterventionExist } = data.data
        this.configData.jumpToHumanServiceExist = jumpToHumanServiceExist
        this.configData.humanInterventionExist = humanInterventionExist
      })
    },
    requestIntentLevelTag(dialogFlowId) {
      if (!dialogFlowId || this.editTaskId) return
      this.loadIntentLevelTag(dialogFlowId)
        .then(() => {
          this.formFields.robotCallJob.wechatPushConditionList = [getWechatPushConditionItem()]
          // const initSelectIntentLevelTagCodeList = intentLevelTagList.slice(0, 2).map(item => item.code)
          // this.$set(this.formFields.robotCallJob, 'smsAlertLevelCode', initSelectIntentLevelTagCodeList)
          // this.$set(this.formFields.robotCallJob, 'wechatAlertLevelCode', initSelectIntentLevelTagCodeList)
        })
    },
    requestDialogFlowSmsTemplate(dialogFlowId) {
      if (!dialogFlowId || this.editTaskId) return
      taskAPI.getDialogFlowSmsTemplate(dialogFlowId)
        .then((res) => {
          this.dialogFlowSmsTmpType = res.data.data || ''
        })
    },
    changePhoneType(phoneType) {
      this.formFields.robotCallJob.phoneType = phoneType
      this.$set(this.formFields, 'jobPhoneNumberIdList', [])
      this.selectAllPhone = false
    },
    async loadSmsTemplateList(visible) {
      if (!visible ||
      (this.optionData.smsTemplateList && this.optionData.smsTemplateList.length)) {
        return
      }
      this.optionData.smsTemplateList = (await smsAPI.getSmsTemplateList({
        status: 'APPROVED'
      })).data.data.content
    },
    canuseConcurrency() {
      const { jobPhoneNumberIdList = [], robotCallJob: { phoneType, robotCount }} = this.formFields
      if (jobPhoneNumberIdList.length <= 1 && phoneType === 'MOBILE') {
        return false
      }
      if (robotCount <= 0 && phoneType !== 'MOBILE') {
        return false
      }
      return true
    },
    async getRedialLimit() {
      const { data } = await taskAPI.getRedialLimit()
      this.redialLimits = [...new Array(data.data || 3)].map((item, index) => index + 1)
    },
    async getInterceptInfoList() {
      const { data } = await usersAPI.getInterceptInfo()
      this.optionData.interceptInfoList = data.data ? data.data.map(item => ({
        name: item.name + (item.type !== 'ALL' ? '(内部)' : '') + (item.defaultStatus === true ? '(默认)' : ''),
        tenantCallInterceptId: item.tenantCallInterceptId,
        defaultStatus: item.defaultStatus,
        source: item.source
      })) : []
      const tenantCallInterceptId = this.formFields.robotCallJob.tenantCallInterceptId
      const hasInterceptId  = this.optionData.interceptInfoList.filter(item => item.tenantCallInterceptId === tenantCallInterceptId).length
      if(this.editTaskId) { //编辑状态
        this.isDefendHarass =  hasInterceptId ? true : false
      }else {
        this.isDefendHarass = this.optionData.interceptInfoList.filter(item => item.source === 'SYSTEM').length > 0 ? true : false
      }
      
      const defaultInterceptInfoList = this.optionData.interceptInfoList.filter(item => item.defaultStatus === true)
      if(!this.formFields.robotCallJob.tenantCallInterceptId || this.formFields.robotCallJob.tenantCallInterceptId === 0 || !hasInterceptId) { //新增/编辑下没有已选值/编辑下已选择值已禁用/的时候才需要默认设值
        if(defaultInterceptInfoList.length > 0) { //有默认填默认
          this.formFields.robotCallJob.tenantCallInterceptId = defaultInterceptInfoList[0].tenantCallInterceptId
        }else {
          this.formFields.robotCallJob.tenantCallInterceptId = this.optionData.interceptInfoList[0] && this.optionData.interceptInfoList[0].tenantCallInterceptId
        }
      }
    },
    defendHarassChange(val) {
      if(val && this.optionData.interceptInfoList && this.optionData.interceptInfoList.length === 0) {
        this.isDefendHarass = false
        this.isHarassTip = true
      }else {
        this.isHarassTip = false
      }
    },
    onSubmit() {
      this.submitBtnDisabled = true
      this.$refs.form.validate(async valid => {
        if (!valid || this.isCalled) return
        const formData = JSON.parse(JSON.stringify(this.formFields))
        const { jobPhoneNumberIdList, enableConcurrency } = formData
        let { robotCallJob } = formData
        const { wechatSend, smsSend, autoRecalled, humanInterventionExist, jumpToHumanServiceExist } = this.configData
        const csStaffGroupId = robotCallJob.csStaffGroupId
        const csDistributionMethod = robotCallJob.csDistributionMethod
        robotCallJob = {
          ...robotCallJob,
          ...this.timePeriod
        }

        if(robotCallJob.mode === 'AUTO' && !robotCallJob.startTime) {
          this.$message.error('可拨打时间段里的开始日期未设置')
          return
        }

        robotCallJob.inactiveDateList = robotCallJob.inactiveDateList.filter(item => item.datePicker && item.datePicker.length > 0).map(item => {
          if(item.datePicker && item.datePicker[0] && item.datePicker[1]) {
            return {
              startDate: item.datePicker[0],
              endDate: item.datePicker[1]
            }
          }
        })

        robotCallJob.wechatPushConditionList = robotCallJob.wechatPushConditionList.map(item => {
          if (item.wechatSendMethod !== 'SENDTOONE') {
            item.transferCustomer = false
          }
          return item
        })
        if (robotCallJob.dailyStartTime === '24:00') {
          robotCallJob.dailyStartTime = '23:59'
        }
        if (robotCallJob.dailyEndTime === '24:00') {
          robotCallJob.dailyEndTime = '23:59'
        }
        robotCallJob.csStaffGroupId = null // 先置空
        robotCallJob.csDistributionMethod = null
        if (humanInterventionExist) { // 存在人工介入
          robotCallJob.csStaffGroupId = csStaffGroupId
          robotCallJob.csDistributionMethod = csDistributionMethod
        }
        if (this.transferHumanMode === 'callCenter' && // 转人工 && 转第三方呼叫
        jumpToHumanServiceExist
        ) { // 存在转第三方呼叫中心
          robotCallJob.csStaffGroupId = robotCallJob.callCenterStaffGroupId
        }
        if (this.transferHumanMode === 'csStaff') {
          robotCallJob.csStaffGroupId = csStaffGroupId
          robotCallJob.csDistributionMethod = csDistributionMethod
        }
        if (smsSend === 'no') {
          robotCallJob.smsAlertLevelCode = []
          robotCallJob.smsTemplateId = undefined
        }
        if (wechatSend === 'no' || this.isLocal || this.isRongLian || this.NoLogoNorWx) {
          // robotCallJob.wechatAlertLevelCode = []
          // robotCallJob.wechatConditionAlertLevelCode = []
          // robotCallJob.wechatAlertChatDurationThreshold = 1
          // robotCallJob.alertUsers = []
          // robotCallJob.wechatSendMethod = undefined
          // robotCallJob.transferCustomer = false
          robotCallJob.wechatPushConditionList = []
        }
        // if (robotCallJob.wechatSendMethod !== 'SENDTOONE') {
        //   robotCallJob.transferCustomer = false
        // }
        // if (!this.configData.durationLimit) {
        //   robotCallJob.wechatConditionAlertLevelCode = []
        //   robotCallJob.wechatAlertChatDurationThreshold = 1
        // }
        if (autoRecalled === 'no') {
          robotCallJob.redialCondition = null
          robotCallJob.redialInterval = null
          robotCallJob.redialTimes = null
        } else {
          robotCallJob.redialInterval = robotCallJob.redialInterval * 60 // 传分钟数给后端
        }
        // 选择手机座席的时候，并发数与robotCount对换
        if (robotCallJob.phoneType === 'MOBILE') {
          const tmpCount = jobPhoneNumberIdList.length
          robotCallJob.robotCount = tmpCount
          // 选了一线多并发，则对换
          if (enableConcurrency) {
            robotCallJob.robotCount = formData.concurrencyQuota
            formData.concurrencyQuota = tmpCount
          }
        }
        if (this.editTaskId) {
          if (!robotCallJob.inactiveEndTime) {
            robotCallJob.inactiveEndTime = '00:00:00'
          }
          if (!robotCallJob.inactiveStartTime) {
            robotCallJob.inactiveStartTime = '00:00:00'
          }
        }
        const realInactiveTimeList = []
        let inactiveTimeIndex = 0
        robotCallJob.inactiveTimeList && robotCallJob.inactiveTimeList.forEach(({ startTime, endTime }) => {
          if (startTime && endTime && startTime.replace(/00:00:00/, '') && endTime.replace(/00:00:00/, '')) {
            realInactiveTimeList[inactiveTimeIndex] = {}
            realInactiveTimeList[inactiveTimeIndex].startTime = startTime
            realInactiveTimeList[inactiveTimeIndex].endTime = endTime
            inactiveTimeIndex++
          }
        })
        robotCallJob.inactiveTimeList = realInactiveTimeList
        const realFormData = {
          ...formData,
          admin: this.isAdmin,
          robotCallJob: {
            ...robotCallJob,
            priority: this.priority ? 0 : 100,
            transferTenantPhoneNumberId: robotCallJob.phoneType === 'MOBILE' ? robotCallJob.transferTenantPhoneNumberId : undefined,
            connectRedialCondition: this.configData.autoRecalled === 'yes' ? ( robotCallJob.connectRedialCondition.length > 0 ? robotCallJob.connectRedialCondition : null ) : null,
            tenantCallInterceptId: this.isDefendHarass ? robotCallJob.tenantCallInterceptId : 0
          }
        }
        if (!enableConcurrency) {
          realFormData.concurrencyQuota = robotCallJob.robotCount
        }
        taskAPI[this.editTaskId ? 'editRobotCallJob' : 'addRobotCallJob'](realFormData).then(() => {
          this.$message({
            message: this.editTaskId ? '编辑任务成功' : '新建任务成功',
            type: 'success'
          })
          this.editTaskId ? this.$emit('update') : this.__addTaskSuccess(true)
          this.close()
        })
      })
      this.submitBtnDisabled = false
    },
    inputLength(){
      if( this.formFields.robotCallJob.description.replace(/\s/g, '').length === 200 ){
        this.maxLength = 200
      } else if( this.formFields.robotCallJob.description.replace(/\s/g, '').length > 200 ){
        let realLength = this.formFields.robotCallJob.description.length
        let lastLength = 0
        let copyLength = 0
        for( let i = 0; i < realLength; i++ ){
          if( !this.formFields.robotCallJob.description[i].match(/\s/g)){
            lastLength = lastLength + 1
          }
          if( lastLength > 200 ){
            copyLength = i
            break
          }
        }
        this.formFields.robotCallJob.description = this.formFields.robotCallJob.description.substring(0,copyLength)
        this.maxLength = copyLength
      } else this.maxLength = 999
    },
    datePickerFocus(index) {
      this.datePickerIndex = index
    },
    onCloneInactiveDateGroup() {
      const inactiveDateList = this.formFields.robotCallJob.inactiveDateList
      if (inactiveDateList.length >= 3) {
        this.$message({
          message: '最多有3个不可拨打日期',
          type: 'error'
        })
        return
      }
      inactiveDateList.push({
        datePicker: []
      })
    },
    onRemoveInactiveDateGroup(index) {
      const inactiveDateList = this.formFields.robotCallJob.inactiveDateList
      inactiveDateList.splice(index, 1)
      this.$set(this.dialTimePeriod, 'inactiveDateList', inactiveDateList)
    }
  },
  computed: {
    ...mapGetters([
      'isLocal',
      'enableCsTransfer',
      'enableCsTransferTel',
      'enableCsSeat',
      'isRongLian',
      'NoLogoNorWx',
      'distributorLevel',
      'dialIntervalStart',
      'dialIntervalEnd',
      'customerStr'
    ]),
    validWords() {
      if( !this.formFields.robotCallJob.description)
        return 0
      else return this.formFields.robotCallJob.description.replace(/\s/g, '').length
    },
    aiCountMax() {
      if (this.concurrenceLimit < this.configData.AICount.total) {
        this.showConcurrenceLimit = true
        return this.concurrenceLimit
      }
      this.showConcurrenceLimit = false
      return this.configData.AICount.max
    },
    concurrenceLimit() {
      const { robotCallJob: { phoneType }, jobPhoneNumberIdList } = this.formFields
      const { outCallFullInfo: { LANDLINE, UNFIXED_CALL }} = this.optionData
      if (['LANDLINE', 'UNFIXED_CALL'].includes(phoneType) && jobPhoneNumberIdList.length) {
        const phoneNumberObj = [...LANDLINE, ...UNFIXED_CALL].find(item => item.tenantPhoneNumberId === jobPhoneNumberIdList[0])
        return phoneNumberObj && phoneNumberObj.concurrenceLimit ? phoneNumberObj.concurrenceLimit : 999
      }
      return 999
    },
    dailyCallCount() {
      const { robotCallJob: { phoneType }, jobPhoneNumberIdList } = this.formFields
      const { outCallFullInfo: { LANDLINE, UNFIXED_CALL }} = this.optionData
      if (['LANDLINE', 'UNFIXED_CALL'].includes(phoneType) && jobPhoneNumberIdList.length) {
        const phoneNumberObj = [...LANDLINE, ...UNFIXED_CALL].find(item => item.tenantPhoneNumberId === jobPhoneNumberIdList[0])
        return phoneNumberObj && phoneNumberObj.dailyCallCount ? phoneNumberObj.dailyCallCount : 999
      }
      return 999
    },
    csGrouponLineTip() {
      const { staffGroupList } = this.optionData
      const selectStaffGroupId = this.formFields.robotCallJob.csStaffGroupId
      if (Array.isArray(staffGroupList) && staffGroupList.length && selectStaffGroupId) {
        const selectItem = staffGroupList.find(item => item.csStaffGroupId === selectStaffGroupId)
        return selectItem ? (selectItem.onlineCount <= 0 && selectItem.groupType !== 'TEL') : false
      }
      return false
    },
    smsTemplateType() {
      const selectedSmsTpId = this.formFields.robotCallJob.smsTemplateId
      if (!selectedSmsTpId) {
        return ''
      }
      return this.optionData.smsTemplateList.find(item => item.smsTemplateId === selectedSmsTpId).type
    },
    showRange() {
      return !(this.concurrencyRange.min === 0 && this.concurrencyRange.max === 0)
    },
    editTaskId() {
      return this.$store.state.taskV2.editTaskId
    },
    selectTaskId() {
      return this.$store.state.taskV2.selectTaskId
    },
    taskList() {
      return this.$store.state.taskV2.taskList
    },
    selectTask() {
      return this.taskList.find(item => item.robotCallJobId === this.selectTaskId)
    },
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    },
    jobPhoneNumberSelect() {
      for (const key in jobPhoneNumberSelectConfig) {
        if (key === 'MOBILE') {
          jobPhoneNumberSelectConfig[key].multipleLimit = this.configData.AICount.total
        }
        jobPhoneNumberSelectConfig[key].options = this.optionData.outCallFullInfo[key]
      }
      return jobPhoneNumberSelectConfig[this.formFields.robotCallJob.phoneType]
    },
    smsAlertLevelIsCheckAll: {
      get() {
        const intentLevelTagList = this.configData.intentLevelTagList
        return intentLevelTagList.length > 0 && this.formFields.robotCallJob.smsAlertLevelCode.length === intentLevelTagList.length
      },
      set(value) {
        const smsAlertLevelCode = value ? this.configData.intentLevelTagList.map(item => item.code) : []
        this.$set(this.formFields.robotCallJob, 'smsAlertLevelCode', smsAlertLevelCode)
      }
    },
    smsAlertLevelIsIndeterminate() {
      const smsAlertLevelCode = this.formFields.robotCallJob.smsAlertLevelCode
      return smsAlertLevelCode.length > 0 && smsAlertLevelCode.length < this.configData.intentLevelTagList.length
    },
    // wechatAlertLevelIsCheckAll: {
    //   get() {
    //     const intentLevelTagList = this.configData.intentLevelTagList
    //     return intentLevelTagList.length > 0 && this.formFields.robotCallJob.wechatAlertLevelCode.length === intentLevelTagList.length
    //   },
    //   set(value) {
    //     const wechatAlertLevelCode = value ? this.configData.intentLevelTagList.map(item => item.code) : []
    //     this.$set(this.formFields.robotCallJob, 'wechatAlertLevelCode', wechatAlertLevelCode)
    //   }
    // },
    // wechatAlertLevelIsIndeterminate() {
    //   const intentLevelTagList = this.configData.intentLevelTagList
    //   const wechatAlertLevelCode = this.formFields.robotCallJob.wechatAlertLevelCode
    //   return intentLevelTagList.length > 0 && wechatAlertLevelCode.length > 0 && wechatAlertLevelCode.length < intentLevelTagList.length
    // },
    autoRecalledIsCheckAll: {
      get() {
        return this.formFields.robotCallJob.redialCondition.length === this.configData.redialCondition.length
      },
      set(isCheckAll) {
        const redialCondition = isCheckAll ? this.configData.redialCondition : []
        this.$set(this.formFields.robotCallJob, 'redialCondition', redialCondition)
      }
    },
    autoRecalledIsIndeterminate() {
      const redialConditionLength = this.formFields.robotCallJob.redialCondition
      return redialConditionLength > 0 && redialConditionLength < this.configData.redialCondition.length
    },
    isAdmin() {
      return this.$route.query.isAdmin === 'true'
    },
    concurrencyRange() {
      const { robotCallJob: { phoneType, robotCount }, jobPhoneNumberIdList } = this.formFields
      let max = 0
      let min = 0
      if (!this.canuseConcurrency()) {
        return { max, min }
      }
      if (phoneType === 'MOBILE') {
        max = Math.min(Math.max(jobPhoneNumberIdList.length - 1, 0), this.configData.AICount.total)
        min = Math.min(1, max)
      } else {
        max = this.distributorLevel === 0 ? 2 * robotCount : this.allConcurrencyCount
        // max = this.allConcurrencyCount// 2 * robotCount
        min = robotCount + 1
        if (min > max) {
          min = max
        }
      }
      return { min, max }
    },
    concurrencyTip() {
      const { robotCallJob: { phoneType, robotCount }, jobPhoneNumberIdList = [], enableConcurrency } = this.formFields
      if (!enableConcurrency) return false
      if (phoneType === 'MOBILE') {
        return jobPhoneNumberIdList.length <= 1
      }
      return robotCount <= 0
    },
    weChatSendMethodList() {  //未开通人工介入的客户不显示优先推送给介入人选项-ml
      if (this.enableCsTransfer || this.enableCsTransferTel)  return constant.wechatAlertTypeENUM
      else {
        return constant.wechatAlertTypeENUM.filter((value,index) => {
          return value.key != 'SENDTOTRANSFER'
        })
      }
    },
    isCalled() { // 判断自动重拨是否未选择
      if (this.configData.autoRecalled === 'yes') {
        if (this.isListening) {
          return this.formFields.robotCallJob.connectRedialCondition.length == 0 && this.formFields.robotCallJob.redialCondition.length == 0
        } else {
          return this.formFields.robotCallJob.redialCondition.length == 0
        }
      }else {
        return false
      }
    }
  },
  watch: {
    'formFields.robotCallJob.mode': {
      handler: function(val) {
        if (val === 'MANUAL') {
          this.$set(this.formFields.robotCallJob, 'startTime', null)
        }
      }
    },
    'formFields.robotCallJob.dialogFlowId': {
      handler: function(val) {
        this.requestJumpToHumanServiceExist()
        this.requestIntentLevelTag(val)
        this.requestDialogFlowSmsTemplate(val)
        this.formFields.robotCallJob.csStaffGroupId = undefined
      },
      deep: true
    },
    // 'formFields.robotCallJob.wechatAlertLevelCode': {
    //   handler: function(val) {
    //     const intentLevelTagList = this.configData.intentLevelTagList
    //     const wechatConditionAlertLevelCode = this.formFields.robotCallJob.wechatConditionAlertLevelCode.filter(item => !val.includes(item))
    //     const wechatDurationLimitList = intentLevelTagList.filter(item => !val.includes(item.code))
    //     this.$set(this.configData, 'wechatDurationLimitList', wechatDurationLimitList)
    //     this.$set(this.formFields.robotCallJob, 'wechatConditionAlertLevelCode', wechatConditionAlertLevelCode)
    //   },
    //   deep: true
    // },
    concurrencyRange: {
      handler(value) {
        this.formFields.concurrencyQuota = value.min
      },
      deep: true
    },
    'formFields.robotCallJob.wechatSendMethod':{  //未开通人工介入的客户若已经选中优先推送给介入人选项则显示为依次推送-ml
      handler: function(val) {
        if (!this.enableCsTransfer && !this.enableCsTransferTel && val === 'SENDTOTRANSFER') {
          this.$set(this.formFields.robotCallJob, 'wechatSendMethod', 'SENDTOONE')
        }
      }
    }
  }
}
</script>

<style lang="css" scoped>
  @keyframes task-dialog-fade-in {
    0% {
      transform: translate3d(100%, 0, 0);
      opacity: 0;
    }
    100% {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
  @keyframes task-dialog-fade-out {
    0% {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
    100% {
      transform: translate3d(100%, 0, 0);
      opacity: 0;
    }
  }
  .add-task.dialog-fade-enter-active {
    animation: task-dialog-fade-in .3s;
  }
  .add-task.dialog-fade-leave-active {
    animation: task-dialog-fade-out .3s;
  }
</style>
<style lang="scss" scoped>
@import "src/styles/mixin.scss";
$color-border: #D8D8D8;

/deep/ .el-dialog {
  float: right;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  .add-task-form {
    padding-top: 22px;
    padding-bottom: 60px;
    .intention-wrap {
      display: flex
    }
    .intention:nth-of-type(1) {
      width:100px;
    }
    .intention:nth-of-type(2),  .intention:nth-of-type(3) {
      flex: 1
    }
    .error-text {
      position: absolute;
      left: 0;
      bottom: -22px;
      color: #f56c6c;
      font-size: 12px;
    }
    @include elSwitch();
    .pull-left {
      float: left;
    }
    .customer-user-push {
      margin-left: 18px;
      .el-checkbox__label {
        font-size: 12px;
      }
    }
    .form-item-double-time {
      width: 447px;
      margin-bottom: 0;
      .edit-group {
        margin-left: 10px;
      }
      .edit-group-tip {
        display: inline-block;
        vertical-align: text-top;
        font-size: 12px;
        line-height: 16px;
        padding-top: 1px;
        color: #666666;
      }
      .daily-time-select {
        width: 140px;
      }
      .line {
        text-align: center;
      }
      .el-form-item__content .el-form-item__content {
        margin-left: 0 !important;
      }
      /deep/ .el-checkbox {
        margin-right: 20px;
      }
    }
    .sms-alert-checkbox-group {
      display: inline-block;
      vertical-align: top;
      margin-left: 30px;
      white-space: normal;
      .el-checkbox {
        margin-left: 0;
        margin-right: 30px;
      }
    }
    .empty-dialogFlow-tip {
      color: #f90;
      font-size: 12px;
    }
    .wechat-alert-group {
      white-space: normal;
      // .el-checkbox {
      //   margin-left: 0;
      //   margin-right: 30px;
      // }
      .add-duration-limit {
        width: 164px;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        color: #000000;
        border-radius: 2px;
        background-color: #f0f0f0;
        text-align: center;
        cursor: pointer;
        i {
          margin-right: 4px;
        }
      }
      .duration-limit-area {
        .tip {
          font-size: 12px;
          color: #E99209;
          line-height: 17px;
        }
        .area-content {
          margin-top: 3px;
          padding: 10px 18px 17px 10px;
          background-color: #f7f7f7;
          .limit-intent {
            overflow: hidden;
            .label {
              float: left;
              margin-right: 10px;
              color: #000000;
            }
          }
        }
        .duration-span {
          display: inline-block;
          font-size: 14px;
          color: #000000;
        }
        .threshold-input {
          width: 70px;
          input {
            width: 70px;
            height: 26px;
            text-align: right;
            padding-right: 0;
            padding-left: 0;
          }
        }
        .const-icon-delete {
          float: right;
          cursor: pointer;
        }
      }
    }

    .autorecall-checkbox-group {
      display: inline-block;
    }
    .redial-interval-times {
      .el-form-item__label {
        width: 60px !important;
      }
      .el-form-item__content {
        margin-left: 80px !important;
      }
      .el-input {
        width: 80px;
        margin-right: 10px;
      }
      .el-select {
        width: 110px;
        margin-right: 10px;
        .el-input {
          width: 120px;
        }
      }
      .icon-tip {
        margin-left: 5px;
      }
      .limit-text {
        color: #666666;
        font-size: 12px;
      }
    }
    .unit {
      display: inline-block;
      margin-left: 10px;
      font-size: 12px;
      color: #000000;
    }
    .icon-tip {
      margin-left: 30px;
      font-size: 18px;
      vertical-align: middle;
      &.const-cs-group-icon {
        margin-left: 0;
      }
      &.policy-icon-tip {
        vertical-align: bottom;
      }
    }
    .red-tip {
      color: #f56c6c;
      font-size: 14px;
    }
    .desc-textarea {
      width: 300px;
    }
    span.red {
      color: red;
    }
  }
  .el-dialog__header {
    margin-bottom: 0;
    padding: 0 24px;
    line-height: 54px;
    background-color: white;
    border-bottom: 1px solid $color-border;
  }
  .el-dialog__body {
    padding: 0 !important;
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    @include transparentScrollBar();
  }
  .el-input-number {
    .el-input {
      width: auto;
    }
  }
  .concurrency-form-item,
  .ai-form-item {
    .el-form-item__label {
      width: 60px !important;
    }
    .el-form-item__content {
      margin-left: 60px !important;
    }
    .el-tooltip {
      margin-left: 0;
      vertical-align: text-top;
    }
  }
  .intent-checkbox-group {
    .el-checkbox__label {
      padding-left: 5px;
    }
    .el-checkbox+.el-checkbox {
      margin-left: 10px;
    }
  }
  .inline-block {
    display: inline-block;
    .phone-number-limit {
      color: #F08600;
      font-size: 12px;
    }
  }
  .footer {
    width: 1010px;
    position: fixed;
    bottom: 0;
    background-color: white;
    z-index: 10;
    padding: 10px 30px;
    border-top: 1px solid #dddddd;
    text-align: right;
  }
  .tag-button {
    display: inline-block;
    margin: 0 10px;
    border: none;
    background: transparent;
    cursor: pointer;
  }
}
.env-check{
  position: relative;
  font-size: 12px;
  .text{
    color:#1890ff;
    display: inline-flex;
    // height: 12px;
    overflow: hidden;
    position: relative;
    text-decoration:underline;
    text-decoration-color: #1890ff;
    cursor: pointer;
    img{
      position: absolute;
      top: 100%;
      left:-100%;
      z-index: 99;
      width: 600px;
    }
  }
  .text:hover{
    overflow: visible;
  }
}
.el-select-dropdown__item.select-all-option {
  cursor: auto;
}
.input-length-red{
  color:red
}
</style>
