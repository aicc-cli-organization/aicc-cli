<!-- 客户扩容 -->
<template>
<el-dialog
    class="seat-group-dialog"
    v-bind="$attrs"
    :title="dialogTitle"
    :width="$attrs.width || '700px'"
    :visible.sync="innerVisible"
    :close-on-click-modal="false"
    @open="handleDialogOpen"
    @close="handleDialogClose"
  >
    <el-form
      :model="form"
      ref="form"
      label-width="120px"
      :rules="formRules">
      <el-form-item prop="groupName" label="坐席组名：">
        <el-input v-model="form.groupName" placeholder="输入坐席组名"></el-input>
      </el-form-item>
      <el-form-item prop="groupType" label="坐席类型：">
        <div class="radio-group">
          <el-radio-group v-model="form.groupType" :disabled="row.addOrEdit=='EDIT'">
            <el-radio label="CS">人工</el-radio>
            <el-radio label="AI" v-if="enableCallIn">AI</el-radio>
            <el-radio label="THIRD_PARTY">第三方呼叫中心</el-radio>
            <el-radio label="TEL">话机端</el-radio>
          </el-radio-group>
          <el-tooltip
            popper-class="radio-group-tooltip"
            placement="top"
            :content="enableIvr ? `话机端坐席组可用于话机端人工介入与IVR导航接待${customerStr}` : '话机端坐席组可用于话机端人工介入'"
          >
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
      </el-form-item>

      <el-form-item v-if="form.groupType === 'THIRD_PARTY'" label="坐席组地址：" prop="transferSipUri">
        <el-input
          placeholder="输入坐席组地址"
          v-model="form.transferSipUri"
        >
        </el-input>
      </el-form-item>

      <el-form-item prop="transferList" label="坐席号码：" v-if="form.groupType === 'TEL'">
        <el-select
          filterable
          allow-create
          default-first-option
          v-model="form.transferList"
          @change="handleTransferChange"
          placeholder="请选择或输入坐席号码"
          :multiple="true"
          value-key="userId"
          popper-class="isSeatGroupSelect"
        >
          <el-option
            v-for="item in filterUserListOptions"
            :key="item.userId"
            :label="item.userName + '-' + item.phoneNumber"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>

      <pagination-table
        class="table"
        v-if="form.groupType === 'TEL'"
        :data="form.transferList"
        :autoLoad="false"
        :isPagination="false"
        :max-height="200"
      >
        <yiwise-table-column
          label="坐席姓名"
          prop="userName"
        >
        </yiwise-table-column>
        <yiwise-table-column
          label="坐席号码"
          prop="phoneNumber"
        >
        </yiwise-table-column>
        <yiwise-table-column
          label="操作"
        >
          <template slot-scope="{ $index }">
            <yiwise-pop-confirm
              label="确定删除该坐席吗？"
              @submit="handleSeatDelete($index)"
            >
              <span class="delete">删除</span>
            </yiwise-pop-confirm>
          </template>
        </yiwise-table-column>
      </pagination-table>

      <el-form-item
        v-if="form.groupType === 'TEL'"
        label="使用线路："
      >
        <div class="radio-group">
          <el-radio-group v-model="form.phoneType" @change="handlePhoneTypeChange">
            <el-radio label="LANDLINE">固话</el-radio>
            <el-radio label="UNFIXED_CALL">无主叫</el-radio>
          </el-radio-group>
          <el-tooltip
            popper-class="radio-group-tooltip"
            placement="top"
            content="“使用线路”的作用是在出现人工介入请求时及时呼叫坐席组成员监听"
          >
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
      </el-form-item>

      <el-form-item
        :class="form.phoneNumberInfo && form.phoneNumberInfo.tenantPhoneNumberId ? 'line-active' : ''"
        ref="line"
        prop="phoneNumberInfo"
        v-if="form.groupType === 'TEL'"
        :label="form.phoneType === 'LANDLINE' ? '固话线路：' : '无主叫线路：'"
      >
        <div class="line">
          <el-select
            v-if="form.phoneType === 'LANDLINE'"
            class="select"
            placeholder="请选择固话线路"
            v-model="form.phoneNumberInfo"
            value-key="tenantPhoneNumberId"
            :filterable="true"
          >
            <el-option
              v-for="item in landlineList"
              :key="item.tenantPhoneNumberId"
              :value="item"
              :label="item.phoneName || item.phoneNumber"
            >
            </el-option>
          </el-select>
          <el-select
            v-else
            class="select"
            placeholder="请选择无主叫线路"
            v-model="form.phoneNumberInfo"
            value-key="tenantPhoneNumberId"
            :filterable="true"
          >
            <el-option
              v-for="item in unfixedList"
              :key="item.tenantPhoneNumberId"
              :value="item"
              :label="item.phoneName || item.phoneNumber"
            >
            </el-option>
          </el-select>
          <span v-if="form.phoneNumberInfo && form.phoneNumberInfo.tenantPhoneNumberId" class="tip">
            线路有同一号码一天拨打<span>{{form.phoneNumberInfo ? form.phoneNumberInfo.dailyCallCount : 0}}</span>次的限制
          </span>
          <el-tooltip
            popper-class="radio-group-tooltip"
            placement="top"
            content="请尽量选择对同一号码没有拨打限制的线路，以保障坐席可及时收到监听请求"
          >
            <i class="el-icon-question"></i>
          </el-tooltip>
        </div>
      </el-form-item>

      <!-- 话术 -->
      <el-form-item ref="dialogflow" prop="dialogFlowId" key="dialogFlowId"
        label="应用话术：" v-if="form.groupType=='AI'">
        <el-select filterable v-if="form.groupType=='AI'"
          v-model="form.dialogFlowId"
          placeholder="选择话术"
        >
          <el-option
            v-for="item in filterDialogFlowOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        label="人工介入坐席组："
        prop="transferCsStaffGroupId"
        v-if="form.groupType=='AI' && humanInterventionExist"
      >
        <el-select
          :filterable="true"
          v-model="form.transferCsStaffGroupId"
          placeholder="选择坐席组"
        >
          <el-option
            v-for="item in groupList"
            :key="item.csStaffGroupId"
            :value="item.csStaffGroupId"
            :label="item.groupName"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item v-if="form.groupType=='CS'" key="csStaffIdList"
        label="坐席组成员：" prop="csStaffIdList">
        <el-select v-if="form.groupType=='CS'"
          filterable
          multiple
          reserve-keyword
          v-model="form.csStaffIdList"
          :remote-method="requestCsAccountOptions"
          placeholder="坐席"
          >
          <el-option
            v-for="item in csAccountOptions"
            :key="item.csStaffId"
            :label="item.csName"
            :value="item.csStaffId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="坐席数量：" v-if="form.groupType=='AI'" prop="groupCapacity">
        <el-input-number
          v-model="form.groupCapacity"
          :precision="0"
          :min="1"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" v-if="hasFooter">
      <el-button @click="cancelBtn()">取 消</el-button>
      <el-button type="primary" @click="confirmBtn()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { addOrUpdateGroup, csAccountList, fetchStaffGroupList, getActiveTenantPhoneNumberList } from '@/api/numberpool'
import { checkDialogFlowCsStatus } from '@/api/talk'
import * as usersAPI from '@/api/users'
import * as numberpoolAPI from '@/api/numberpool'
import * as talkAPI from '@/api/talk'
import { PaginationTable, YiwiseTableColumn, YiwisePopConfirm } from 'yiwise-components'
import { mapGetters } from 'vuex'
import { phoneNumberregex } from '@/utils/regexp'

export default {
  name: 'index',
  components: {
    PaginationTable,
    YiwiseTableColumn,
    YiwisePopConfirm
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    },
    dialogTitle() {
      if (this.row.addOrEdit === 'ADD') {
        return '新增坐席组'
      } else {
        return '编辑坐席组'
      }
    },
    ...mapGetters(['enableCsTransfer', 'enableCsTransferTel', 'enableIvr', 'enableCallIn', 'customerStr'])
  },
  data() {
    return {
      csAccountOptions: [],
      filterUserListOptions: [],
      filterDialogFlowOptions: [],
      phoneNumberOptions: [],
      filterCreateByUserId: undefined,
      form: {
        csStaffIdList: [],
        groupType: 'AI',
        transferList: [],
        phoneType: 'LANDLINE', // 线路类型
      },
      formRules: {
        groupName: [{ required: true, message: '请输入坐席组名', trigger: 'change' },
          { max: 10, message: '长度在10个字符以内', trigger: 'change' }],
        groupType: [{ required: true, message: '请选择坐席类型', trigger: 'change' }],
        dialogFlowId: [{ required: true, message: '请选择话术', trigger: 'change' }],
        csStaffIdList: [{ required: true, message: '请选择坐席人员', trigger: 'change' }],
        groupCapacity: [{ required: true, message: '请输入坐席数量', trigger: 'change' }],
        userId: [{ required: true, message: '请选择员工', trigger: 'blur' }],
        transferCsStaffGroupId: [{ required: true, message: '请选择人工介入坐席组', trigger: 'change' }],
        transferList: [{ required: true, message: '请选择坐席号码', trigger: 'change' }],
        phoneNumberInfo: [{ required: true, message: '请选择线路', trigger: 'change' }],
        transferSipUri: [{ required: true, message: '请输入坐席组地址' }]
      },
      humanInterventionExist: false, // 话术是否存在人工介入
      groupList: [], // 坐席组
      landlineList: [], // 固话线路列表
      unfixedList: [] // 无主叫列表
    }
  },
  props: {
    row: {
      type: Object,
      default() {
        return {}
      }
    },
    visible: {
      type: Boolean,
      default: false
    },
    hasFooter: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    this.requestDialogFlowList()
    this.requestCsAccountOptions()
  },
  watch: {
    'form.dialogFlowId': { // 话术改变时判断转人工相关
      async handler(dialogFlowId) {
        if (dialogFlowId) {
          const { data } = await checkDialogFlowCsStatus({
            dialogFlowId
          })
          if (data.data) {
            const { humanInterventionExist, jumpToHumanServiceExist } = data.data
            this.humanInterventionExist = humanInterventionExist
            if (jumpToHumanServiceExist) { // 存在转人工
              this.$message.error('该话术已存在转人工设置')
              this.$set(this.form, 'dialogFlowId', '')
              this.$nextTick(() => {
                this.$refs.dialogflow.clearValidate()
              })
            }
          }
        }
      }
    }
  },
  methods: {
    requestUserList() {
      numberpoolAPI.getUserAllByTenant({
        pageSize: 999,
        pageNum: 1
      }).then(({ data }) => {
        this.filterUserListOptions = data.data.content || []
      })
    },
    handleTransferChange(v) {
      const arr = v || []
      const index = arr.findIndex(item => typeof item === 'string')

      if (index !== -1) {
        if (!phoneNumberregex.test(arr[index])) {
          arr.splice(index, 1)
          this.$message.error('添加的号码是非法的手机或座机号')
        } else {
          arr.splice(index, 1, {
            phoneNumber: arr[index],
            userName: ''
          })
        }
      }
      this.form.transferList = arr
    },
    requestCsAccountOptions(val) {
      csAccountList({
        searchName: val,
        enabledStatus: 'ENABLE',
        pageNum: 1,
        pageSize: 999
      }).then(({ data }) => {
        this.csAccountOptions = data.data.content
      })
    },
    getNumberPoolList() {
      numberpoolAPI.getTenantPhoneNumberList().then(({ data }) => {
        this.phoneNumberOptions = data.data
      })
    },
    confirmBtn() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.addOrEdit()
          this.$emit('confirm')
        }
      })
    },
    requestDialogFlowList() {
      talkAPI.fetchFlowList({
        pageNum: 1,
        pageSize: 100,
        published: true
      }).then(({ data }) => {
        this.filterDialogFlowOptions = data.data.content
      })
    },
    cancelBtn() {
      this.$emit('update:visible', false)
    },
    addOrEdit() {
      if (this.row.addOrEdit === 'ADD') {
        this.add()
      } else {
        this.update()
      }
    },
    handleDialogOpen() {
      this.getNumberPoolList()
      this.requestUserList()
      this.loadGroupList()
      this.loadActivePhoneNumber()
      this.$emit('open')
      if (this.row.addOrEdit === 'EDIT') {
        this.form = {
          ...this.form,
          ...this.row,
          transferList: this.row.transferList ? [...this.row.transferList] : []
        }
        if (this.row.groupType === 'TEL') {
          this.form.phoneNumberInfo = this.row.phoneNumberInfoList[0]
        }
        if (this.row.csStaffList) {
          this.$set(this.form, 'csStaffIdList', this.row.csStaffList.map(item => item.csStaffId))
        }
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
    },
    handleDialogClose() {
      this.form = {
        groupType: 'AI',
        phoneType: 'LANDLINE',
        transferList: [],
        csStaffIdList: []
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.humanInterventionExist = false
      this.$emit('close')
    },
    add() {
      const { groupName, dialogFlowId, groupCapacity, groupType,
        csStaffIdList, transferCsStaffGroupId, transferList, phoneNumberInfo, transferSipUri } = this.form
      addOrUpdateGroup({
        groupName,
        groupType,
        dialogFlowId: groupType === 'AI' ? dialogFlowId : undefined,
        groupCapacity: groupType === 'AI' ? groupCapacity : undefined,
        csStaffIdList: groupType === 'CS' ? csStaffIdList : undefined,
        transferCsStaffGroupId: groupType === 'AI' ? transferCsStaffGroupId: undefined,
        transferNumberList: groupType === 'TEL' ? transferList.map(item => item.phoneNumber) : undefined,
        tenantPhoneNumberIdList: groupType === 'TEL' ? [phoneNumberInfo.tenantPhoneNumberId] : undefined,
        transferSipUri: groupType === 'THIRD_PARTY' ? transferSipUri : undefined
      }).then(({ data }) => {
        this.$emit('success')
        this.$emit('update:visible', false)
      })
    },
    update() {
      const { csStaffGroupId, groupName, dialogFlowId, groupCapacity, groupType,
        csStaffIdList, transferCsStaffGroupId, transferList, phoneNumberInfo, transferSipUri } = this.form
      addOrUpdateGroup({
        csStaffGroupId,
        groupName,
        groupType,
        dialogFlowId: groupType === 'AI' ? dialogFlowId : undefined,
        groupCapacity: groupType === 'AI' ? groupCapacity : undefined,
        csStaffIdList: groupType === 'CS' ? csStaffIdList : undefined,
        transferCsStaffGroupId: groupType === 'AI' ? transferCsStaffGroupId: undefined,
        transferNumberList: groupType === 'TEL' ? transferList.map(item => item.phoneNumber) : undefined,
        tenantPhoneNumberIdList: groupType === 'TEL' ? [phoneNumberInfo.tenantPhoneNumberId] : undefined,
        transferSipUri: groupType === 'THIRD_PARTY' ? transferSipUri : undefined
      }).then(({ data }) => {
        this.$emit('success')
        this.$emit('update:visible', false)
      })
    },
    async loadGroupList() { // 加载人工介入坐席组
      const { data } = await fetchStaffGroupList({
        pageSize: 999,
        groupType: 'CS'
      })
      if (data.data) {
        this.groupList = data.data.content || []
      }
    },
    handleSeatDelete(index) { // 删除坐席
      this.form.transferList.splice(index, 1)
    },
    async loadActivePhoneNumber() { // 加载线路列表
      const { data } = await getActiveTenantPhoneNumberList()
      if (data.data) {
        const { LANDLINE = [], UNFIXED_CALL = [] } = data.data
        this.landlineList = LANDLINE
        this.unfixedList = UNFIXED_CALL
      }
    },
    handlePhoneTypeChange() { // 切换线路类型
      this.$set(this.form, 'phoneNumberInfo', undefined)
      this.$nextTick(() => {
        this.$refs.line.clearValidate()
      })
    }
  }
}
</script>
<style lang="scss">
@import 'src/styles/placeholder.scss';

.seat-group-dialog {
  .radio-group {
    white-space: nowrap;
    i {
      display: inline-block;
      margin-left: 10px;
    }
  }
  .table {
    margin-bottom: 10px;
  }
  .el-dialog__body {
    max-height: 600px;
  }
  .delete {
    @extend %tableAction;
  }
  .line-active {
    > label {
      line-height: 48px;
    }
  }
  .line {
    white-space: nowrap;
    > .select {
      width: 150px;
      margin-right: 10px;
    }
    > .tip {
      display: inline-block;
      width: 126px;
      white-space: normal;
      vertical-align: middle;
      line-height: $--font-line-height-primary;
      > span {
        color: $--color-danger;
      }
    }
  }
}
.radio-group-tooltip {
  width: 200px;
}
</style>
