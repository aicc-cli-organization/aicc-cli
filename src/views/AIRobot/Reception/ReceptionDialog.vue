<template>
  <yiwise-dialog
    class="reception-dialog"
    :title="type === 'add' ? '新增接待场景' : '编辑接待场景'"
    :visible.sync="innerVisible"
    @open="handleDialogOpen"
    @close="handleDialogClose"
    @confirm="handleSubmit"
  >
    <el-form
      ref="form"
      label-width="110px"
      :model="formModel"
      :rules="rules"
    >
      <el-form-item
        v-if="enableIvr"
        prop="enabledIvr"
        label="开启IVR导航模式">
        <el-switch v-model="formModel.enabledIvr"></el-switch>
      </el-form-item>
      <el-form-item
        key="phoneNumberId"
        label="线路："
        prop="tenantPhoneNumberInfo.phoneNumberId"
      >
        <el-select
          placeholder="选择线路"
          v-model="formModel.tenantPhoneNumberInfo"
          value-key="phoneNumberId"
          :filterable="true"
        >
          <el-option
            v-for="line in lineList"
            :key="line.phoneNumberId"
            :value="line"
            :label="line.phoneName || line.phoneNumber"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <template v-if="formModel.enabledIvr">
        <el-form-item
          key="ivrNavigationInfoId"
          prop="ivrNavigationInfoId"
          label="IVR导航">
          <el-select
            filterable
            @visible-change="loadIVRList"
            v-model="formModel.ivrNavigationInfoId"
            placeholder="请选择IVR导航">
            <el-option
              v-for="(item, index) in IVRList"
              :key="index"
              :label="item.name"
              :value="item.ivrNavigationInfoId"
            ></el-option>
          </el-select>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item
          v-if="formModel.tenantPhoneNumberInfo && formModel.tenantPhoneNumberInfo.phoneNumberId"
          label="外显号码："
        >
          {{formModel.tenantPhoneNumberInfo.sipAccount || emptyPlaceholder}}
        </el-form-item>
        <el-form-item
          v-if="formModel.tenantPhoneNumberInfo && formModel.tenantPhoneNumberInfo.phoneNumberId"
          label="号码名称："
        >
          {{formModel.tenantPhoneNumberInfo.phoneName || formModel.tenantPhoneNumberInfo.phoneNumber || emptyPlaceholder}}
        </el-form-item>
        <el-form-item
          label="坐席组："
          prop="csStaffGroup.csStaffGroupId"
        >
          <el-select
            placeholder="选择坐席组"
            value-key="csStaffGroupId"
            v-model="formModel.csStaffGroup"
            :filterable="true"
          >
            <el-option
              v-for="item in staffGroupList"
              :key="item.csStaffGroupId"
              :value="item"
              :label="item.groupName"
            >
            </el-option>
          </el-select>
          <div
            class="extra"
            v-if="formModel.csStaffGroup && formModel.csStaffGroup.csStaffGroupId && !formModel.csStaffGroup.onlineCount && formModel.csStaffGroup.groupType === 'CS'"
          >
            当前坐席组暂无在线坐席，消息将无法推送，请谨慎选择！
          </div>
        </el-form-item>
        <el-form-item
          v-if="formModel.csStaffGroup && formModel.csStaffGroup.csStaffGroupId"
          label="坐席类型："
        >
          {{staffGroupTypeEnum[formModel.csStaffGroup.groupType] || emptyPlaceholder}}
        </el-form-item>
        <el-form-item
          v-if="formModel.csStaffGroup && formModel.csStaffGroup.csStaffGroupId"
          label="应用话术："
        >
          {{formModel.csStaffGroup.dialogFlowName || emptyPlaceholder}}
        </el-form-item>
        <el-form-item
          v-if="formModel.csStaffGroup && formModel.csStaffGroup.csStaffGroupId"
          label="坐席数量："
        >
          <span v-if="formModel.csStaffGroup.groupType === 'CS' && formModel.csStaffGroup.csStaffList">
            <span>{{formModel.csStaffGroup.csStaffList.length}}个，</span>
            <span
              v-for="(item, index) in formModel.csStaffGroup.csStaffList"
              :key="item.csStaffId"
            >
              {{item.csName}}
              <span v-if="index !== formModel.csStaffGroup.csStaffList.length - 1">、</span>
            </span>
          </span>
          <span v-else>{{formModel.csStaffGroup.groupCapacity || 0}}个</span>
        </el-form-item>
        <el-form-item
          label="分配方式："
          prop="distributionMode"
        >
          <el-select
            placeholder="选择分配方式"
            v-model="formModel.distributionMode"
            :filterable="true"
            :disabled="distributionModeDisabled"
          >
            <el-option
              v-for="(value, key) in staffDistributeTypeEnum"
              :key="key"
              :value="key"
              :label="value"
            >
            </el-option>
          </el-select>
          <el-tooltip
            placement="top"
          >
            <div slot="content" class="tip-content">
              <div>熟客分配：根据在线坐席对{{customerStr}}的熟悉程度进行分配，对{{customerStr}}越熟悉越优先；如果是陌生{{customerStr}}遵循“空闲分配”原则；</div>
              <div>空闲分配：根据在线坐席空闲时间长短进行分配，空闲越久越优先；</div>
              <div>随机分配：随机分配给在线坐席。</div>
            </div>
            <i class="keyword-help el-icon-question"></i>
          </el-tooltip>
        </el-form-item>
      </template>
      <el-form-item
        label="场景描述："
        prop="remark"
      >
        <el-input
          type="textarea"
          placeholder="输入场景描述"
          v-model="formModel.remark"
        >
        </el-input>
      </el-form-item>
    </el-form>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import { staffDistributeTypeEnum, staffGroupTypeEnum } from '@/utils/enum'
import { emptyPlaceholder } from '@/utils/constant'
import { fetchCallInLineList, fetchStaffGroupList } from '@/api/numberpool'
import * as IVRAPI from '@/api/ivr'
import { addReception, updateReception } from '@/api/reception'
import { mapGetters } from 'vuex'

export default {
  name: 'ReceptionDialog',
  components: {
    YiwiseDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      validator(value) {
        return ['add', 'edit'].indexOf(value) !== -1
      },
      default: 'add'
    },
    defaultData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters(['enableIvr', 'customerStr']),
    innerVisible: {
      get() {
        return this.visible
      },
      set(newVisible) {
        this.$emit('update:visible', newVisible)
      }
    }
  },
  data() {
    return {
      formModel: {
        enabledIvr: false,
        tenantPhoneNumberInfo: {},
        remark: undefined,
        csStaffGroup: {},
        distributionMode: undefined,
        ivrNavigationInfoId: undefined
      },
      distributionModeDisabled: false, // 随机分配是否禁用
      staffDistributeTypeEnum,
      staffGroupTypeEnum,
      emptyPlaceholder,
      lineList: [],
      staffGroupList: [],
      rules: {
        'tenantPhoneNumberInfo.phoneNumberId': [{
          required: true, message: '请选择线路列表'
        }],
        remark: [{
          required: true, message: '请输入接待描述'
        }],
        'csStaffGroup.csStaffGroupId': [{
          required: true, message: '请选择坐席组'
        }],
        distributionMode: [{
          required: true, message: '请选择分配方式'
        }],
        ivrNavigationInfoId: [{
          required: true, message: '请选择IVR导航'
        }]
      },
      IVRList: []
    }
  },
  watch: {
    'formModel.csStaffGroup': {
      handler(newGroup) {
        if (newGroup.groupType === 'AI') { // 坐席组为ai类型时，分配方式固定为随机分配
          this.formModel.distributionMode = 'RANDOM'
          this.distributionModeDisabled = true
        } else {
          this.distributionModeDisabled = false
        }
      }
    }
  },
  methods: {
    handleDialogOpen() {
      const { form } = this.$refs
      if (form) {
        form.clearValidate()
      }
      this.loadLineList()
      this.loadStaffGroupList()
      this.loadIVRList()
      if (this.type === 'edit') {
        const { csStaffGroup = {}, tenantPhoneNumberInfo = {}, remark, distributionMode, enabledIvr, ivrNavigationInfoId } = this.defaultData
        this.formModel = {
          enabledIvr,
          ivrNavigationInfoId,
          tenantPhoneNumberInfo: {
            ...tenantPhoneNumberInfo
          },
          remark,
          csStaffGroup: {
            ...csStaffGroup
          },
          distributionMode
        }
      }
    },
    handleDialogClose() {
      this.formModel = {
        tenantPhoneNumberInfo: {},
        remark: undefined,
        csStaffGroup: {},
        distributionMode: undefined
      }
      this.distributionModeDisabled = false
    },
    async loadLineList() { // 加载线路列表
      const { data } = await fetchCallInLineList({
        callInReceptionId: this.type === 'edit' ? this.defaultData.callInReceptionId : 0
      })
      this.lineList = data.data || []
    },
    async loadStaffGroupList() { // 加载坐席组列表
      const { data } = await fetchStaffGroupList({
        pageNum: 1,
        pageSize: 999,
        enabledStatus: 'ENABLE'
      })
      if (data.data) {
        this.staffGroupList = data.data.content || []
      }
    },
    async loadIVRList() {
      const res = await IVRAPI.pagingIVRInfo({
        pageNum: 1,
        pageSize: 999,
        status: 'FINISHED'
      })
      this.IVRList = res.data.data.content
    },
    handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const { tenantPhoneNumberInfo, remark, csStaffGroup, distributionMode, ivrNavigationInfoId, enabledIvr } = this.formModel
          const params = {
            enabledIvr,
            csStaffGroupId: csStaffGroup.csStaffGroupId,
            phoneNumberId: tenantPhoneNumberInfo.phoneNumberId,
            remark,
            distributionMode
          }
          const ivrParams = {
            enabledIvr,
            ivrNavigationInfoId,
            phoneNumberId: tenantPhoneNumberInfo.phoneNumberId,
            remark
          }
          const resultParams = enabledIvr ? ivrParams : params
          if (this.type === 'add') {
            await addReception(resultParams)
          } else {
            resultParams.callInReceptionId = this.defaultData.callInReceptionId
            await updateReception(resultParams)
          }
          this.$message.success(this.type === 'add' ? '添加成功' : '编辑成功')
          this.innerVisible = false
          this.$emit('data-change')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

.reception-dialog {
  .extra {
    margin-top: 6px;
    line-height: 1.5;
    font-size: $--font-size-small;
    color: $--color-danger;
  }
}
.tip-content {
  width: 380px;
  > div {
    &:nth-of-type(n + 2) {
      margin-top: 10px;
    }
  }
}
</style>

