<template>
  <commonForm
    ref="form"
    firstLabel="接待节点名称"
    :form="form"
    :rules="rules"
    :editData="editData"
    @cancel="cancel"
    @submit="submitTime"
  >
    <div class="title no-border">接待方式</div>
    <el-form-item label="" prop="receptionType">
      <el-select v-model="form.receptionType" @change="handleReceptionChange" placeholder="请选择接待方式">
        <el-option value="AI" label="AI接待"></el-option>
        <el-option value="HUMAN" label="PC端人工接待"></el-option>
        <el-option value="CALL_CENTER" label="第三方呼叫中心"></el-option>
        <el-option value="PHONE" label="话机端人工接待"></el-option>
      </el-select>
    </el-form-item>

    <div class="border-after BFC" v-if="form.receptionType === 'AI'">
      <div class="title">接待坐席组</div>
      <el-select v-model="form.aiCsStaffGroupId" placeholder="请选择接待坐席组" @change="handleAIStaffGroupChange">
        <el-option v-for="(group, key) in AIGroupList" :key="key" :value="group.csStaffGroupId" :label="group.groupName"></el-option>
      </el-select>

      <template v-if="hasCS">
        <div class="title">人工介入坐席组</div>
        <el-select v-model="form.humanCsStaffGroupId" placeholder="请选择接待坐席组" @change="handleAICsStaffGroupChange">
          <el-option v-for="(group, key) in csGroupList" :key="key" :value="group.csStaffGroupId" :label="group.groupName"></el-option>
        </el-select>
      </template>
    </div>

    <div class="border-after BFC" v-if="form.receptionType === 'CALL_CENTER'">
      <div class="title">接待坐席组</div>
      <el-select v-model="form.humanCsStaffGroupId" placeholder="请选择接待坐席组" @change="handleThirdPartChange">
        <el-option v-for="(group, key) in thirdPartList" :key="key" :value="group.csStaffGroupId" :label="group.groupName"></el-option>
      </el-select>
    </div>

    <div class="border-after BFC" v-if="form.receptionType === 'PHONE'">
      <div class="title">接待坐席组</div>
      <el-select v-model="form.humanCsStaffGroupId" placeholder="请选择接待坐席组" @change="handlePhoneChange">
        <el-option v-for="(group, key) in phoneList" :key="key" :value="group.csStaffGroupId" :label="group.groupName"></el-option>
      </el-select>
    </div>

    <div class="border-after BFC" v-if="form.receptionType === 'HUMAN'">
      <div class="title">接待坐席组</div>
      <el-select v-model="form.humanCsStaffGroupId" placeholder="请选择接待坐席组" @change="handleHumanCsStaffGroupChange">
        <el-option v-for="(group, key) in csNotPhoneGroupList" :key="key" :value="group.csStaffGroupId" :label="group.groupName"></el-option>
      </el-select>

      <div class="title">分配方式</div>
      <el-select v-model="form.assignType" placeholder="请选择接待方式">
        <el-option v-for="(value, key) in distributeTypes" :key="key" :value="key" :label="value"></el-option>
      </el-select>
    </div>

    <div class="border-after BFC" v-if="form.receptionType && form.receptionType !== 'CALL_CENTER'">
      <div class="title" v-if="form.receptionType">坐席组属性</div>

      <template v-if="form.receptionType === 'AI'">
        <div class="inner-item">
          <span class="label">应用话术：</span>
          <span class="inner-content">{{dialogFlowName || '--'}}</span>
        </div>
        <div class="inner-item">
          <span class="label">AI坐席数量：</span>
          <span class="inner-content">{{AICount}}个</span>
        </div>
        <template v-if="hasCS">
          <div class="inner-item">
            <span class="label">人工坐席组成员：</span>
            <span class="inner-content">{{aiCsStaffNames || '--'}}</span>
          </div>
          <div class="inner-item">
            <span class="label">人工坐席数量：</span>
            <span class="inner-content">{{aiCsCount}}个</span>
          </div>
        </template>
      </template>

      <template v-else-if="form.receptionType === 'HUMAN'">
        <div class="inner-item">
          <span class="label">坐席组成员：</span>
          <span class="inner-content">{{csStaffNames}}</span>
        </div>
        <div class="inner-item">
          <span class="label">坐席数量：</span>
          <span class="inner-content">{{csSeatCount}}个</span>
        </div>
      </template>

      <template v-else-if="form.receptionType === 'PHONE'">
        <div class="inner-item">
          <span class="label">坐席组成员：</span>
          <span class="inner-content">{{csStaffNames}}</span>
        </div>
        <div class="inner-item">
          <span class="label">坐席数量：</span>
          <span class="inner-content">{{csSeatCount}}个</span>
        </div>
      </template>
    </div>

    <div class="block no-border">
      <!-- <div class="title no-border">排队背景音</div>
      <luyin></luyin>
      
      <div class="title no-border">超时配置</div>
      <el-input-number class="mt14" v-model="form.num8" controls-position="right" :min="1" :max="10"></el-input-number>
      <span>秒未接入判定为超时</span> -->

      <div class="mt20" v-if="form.receptionType === 'AI'">
        <div class="title mt0 inline">结束后是否返回：</div>
        <el-radio-group class="short-margin-radio" v-model="form.isReturn">
          <el-radio class="flex-center" :label="true">是</el-radio>
          <el-radio class="flex-center" :label="false">否</el-radio>
        </el-radio-group>
      </div>
    </div>
  </commonForm>
</template>

<script>
import luyin from './luyin'
import { distributeTypes } from '@/utils/enum'
import { saveNode, updateNode } from '@/api/ivr'
import { checkDialogFlowCsStatus } from '@/api/talk'
import { fetchStaffGroupList } from '@/api/numberpool'
import { getRECEPTIONIntentBranches } from '../utils'
import commonForm from './commonForm'
export default {
  components: { luyin, commonForm },
  props: {
    editData: [Object],
    nodeIndex: [Number],
    type: [String],
    myDiagram: [Object, undefined]
  },
  data() {
    return {
      distributeTypes,
      csGroupList: [],
      AIGroupList: [],
      csNotPhoneGroupList: [],
      thirdPartList: [],
      phoneList: [],
      // 所选坐席组是否应用了人工介入话术
      hasCS: false,
      dialogFlowName: '',
      AICount: 0,
      csSeatCount: 0,
      aiCsStaffNames: '',
      aiCsCount: 0,
      csStaffNames: '',
      dialogFlowId: undefined,
      form: {
        nodeName: '',
        receptionType: '',
        assignType: 'RANDOM',
        isReturn: false,
        aiCsStaffGroupId: undefined,
        aiCsStaffGroupName: undefined,
        humanCsStaffGroupId: undefined,
        humanCsStaffGroupName: undefined
      },
      rules: {
        nodeName: [
          { required: true, message: '请输入节点名称' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ],
        receptionType: [
          { required: true, message: '请选择接待方式' }
        ]
      }
    }
  },
  computed: {
    selectIVRId() {
      return this.$store.state.ivr.selectIVRId
    }
  },
  watch: {
    editData() {
      this.initData()
    }
  },
  methods: {
    submitTime() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          if (this.form.receptionType === 'AI') {
            if (!this.form.aiCsStaffGroupId) {
              this.$message.error('请选择接待坐席组')
              return
            }
            if (this.hasCS && !this.form.humanCsStaffGroupId) {
              this.$message.error('请选择人工介入坐席组')
              return
            }
          } else {
            if (!this.form.humanCsStaffGroupId) {
              this.$message.error('请选择接待坐席组')
              return
            }
          }

          let { data } = await (this.editData.id ? updateNode : saveNode)({
            ivrNavigationInfoId: this.selectIVRId,
            data: {
              id: this.editData.id || undefined,
              ...this.form,
              name: this.form.nodeName,
              dialogFlowId: this.dialogFlowId,
              type: 'RECEPTION', // 节点类型 START 开始节点 TIME 时间节点 AUDIO 语音节点 CHOOSE 选择节点 RECEPTION 接待节点 HANGUP 挂断节点
              webData: this.myDiagram.model.findNodeDataForKey(this.editData.key).loc
            }
          })
          data = data.data

          this.$message.success('保存成功')

          const intentBranches = getRECEPTIONIntentBranches(data)
          this.$emit('succuss', {
            ...data,
            loc: data.webData,
            id: data.id,
            nodeName: data.name,
            preKey: this.editData.key,
            intentBranches
          })
        }
      })
    },
    async loadAIList() { // 加载AI坐席组
      const { data } = await fetchStaffGroupList({
        pageSize: 999,
        groupType: 'AI'
      })
      if (data.data) {
        this.AIGroupList = data.data.content || []
      }
    },
    async loadCSList() { // 加载人工介入坐席组
      const { data } = await fetchStaffGroupList({}, 'pageSize=999&groupTypeLis%5B%5D=CS&groupTypeList%5B%5D=TEL')
      if (data.data) {
        this.csGroupList = data.data.content || []
      }
    },
    async loadCSNotPhoneList() { // 加载非移动端人工介入坐席组
      const { data } = await fetchStaffGroupList({
        pageSize: 999,
        groupType: 'CS'
      })
      if (data.data) {
        this.csNotPhoneGroupList = data.data.content || []
      }
    },
    async loadThirdPartList() { // 加载第三方呼叫中心坐席组
      const { data } = await fetchStaffGroupList({
        pageSize: 999,
        groupType: 'THIRD_PARTY'
      })
      if (data.data) {
        this.thirdPartList = data.data.content || []
      }
    },
    async loadPhoneList() { // 加载话机端坐席组
      const { data } = await fetchStaffGroupList({
        pageSize: 999,
        groupType: 'TEL'
      })
      if (data.data) {
        this.phoneList = data.data.content || []
      }
    },
    async handleAIStaffGroupChange(v) {
      const group = this.AIGroupList.find(group => group.csStaffGroupId === v) || {}
      const dialogFlowId = group.dialogFlowId

      this.form.aiCsStaffGroupName = group.groupName
      this.dialogFlowName = group.dialogFlowName
      this.dialogFlowId = group.dialogFlowId
      this.AICount = group.groupCapacity || 0

      if (dialogFlowId) {
        const { data } = await checkDialogFlowCsStatus({
          dialogFlowId
        })
        this.hasCS = data.data.jumpToHumanServiceExist || data.data.humanInterventionExist
      } else {
        this.hasCS = false
      }
    },
    handleReceptionChange() {
      this.form.humanCsStaffGroupId = this.editData.receptionType === this.form.receptionType
        ? this.editData.humanCsStaffGroupId || undefined
        : undefined
      this.form.aiCsStaffGroupId = this.editData.receptionType === this.form.receptionType
        ? this.editData.aiCsStaffGroupId || undefined
        : undefined
    },
    handleAICsStaffGroupChange(v) {
      const group = this.csGroupList.find(group => group.csStaffGroupId === v) || {}
      this.form.humanCsStaffGroupName = group.groupName || null
      this.aiCsStaffNames = (group.csStaffList || []).map(item => item.csName).join(',')
      this.aiCsCount = group.groupCapacity || 0
    },
    handleHumanCsStaffGroupChange(v) {
      const group = this.csNotPhoneGroupList.find(group => group.csStaffGroupId === v) || {}
      this.form.humanCsStaffGroupName = group.groupName || null
      this.csStaffNames = (group.csStaffList || []).map(item => item.csName).join(',')
      this.csSeatCount = group.groupCapacity || 0
      this.dialogFlowId = group.dialogFlowId
    },
    handleThirdPartChange(v) {
      const group = this.thirdPartList.find(group => group.csStaffGroupId === v) || {}
      this.form.humanCsStaffGroupName = group.groupName || null
    },
    handlePhoneChange(v) {
      const group = this.phoneList.find(group => group.csStaffGroupId === v) || {}
      this.form.humanCsStaffGroupName = group.groupName || null
      this.csStaffNames = (group.transferList || []).map(item => (item.userName ? item.userName + '-' : '') + item.transferNumber).join(',')
      this.csSeatCount = group.groupCapacity || 0
    },
    cancel() {
      this.initData()
    },
    hasWrongData(hasWrongcb, noWrongcb) {
      if (this.type === 'add') {
        hasWrongcb()
      } else {
        if(Object.keys(this.form).find(key => {if(this.form[key] !== this.editData[key])console.log(key);return this.form[key] !== this.editData[key]})) {
          hasWrongcb()
        } else {
          noWrongcb()
        }
      }
    },
    initData() {
      this.savedOrSaving = false
      this.$refs.form.resetFields()

      if (this.type === 'add') {
        this.form = {
          nodeName: '接待节点' + this.nodeIndex,
          receptionType: '',
          assignType: 'RANDOM',
          isReturn: false,
          aiCsStaffGroupId: undefined,
          aiCsStaffGroupName: undefined,
          humanCsStaffGroupId: undefined,
          humanCsStaffGroupName: undefined
        }
        this.hasCS = false
        this.dialogFlowName = ''
        this.AICount = 0
        this.csSeatCount = 0
        this.aiCsStaffNames = ''
        this.aiCsCount = 0
        this.csStaffNames = ''
        this.dialogFlowId = undefined
      } else {
        Promise.all([this.loadAIList(), this.loadCSList(), this.loadCSNotPhoneList(), this.loadThirdPartList(), this.loadPhoneList()]).then(() => {
          Object.keys(this.form).forEach(key => this.form[key] = this.editData[key])
          if (this.form.receptionType === 'AI') {
            this.handleAIStaffGroupChange(this.form.aiCsStaffGroupId)
            this.handleAICsStaffGroupChange(this.form.humanCsStaffGroupId)
          } else if (this.form.receptionType === 'HUMAN')  {
            this.handleHumanCsStaffGroupChange(this.form.humanCsStaffGroupId)
          } else if (this.form.receptionType === 'CALL_CENTER')  {
            this.handleThirdPartChange(this.form.humanCsStaffGroupId)
          } else if (this.form.receptionType === 'PHONE')  {
            this.handlePhoneChange(this.form.humanCsStaffGroupId)
          }
        })
      }
    }
  },
  mounted() {
    this.initData()
    this.loadAIList()
    this.loadCSList()
    this.loadCSNotPhoneList()
    this.loadThirdPartList()
    this.loadPhoneList()
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
.inner-item {
  font-size: 12px;
  line-height: 22px;
  color: $--color-text-regular;
  .inner-content {
    color: #000;
  }
}

.short-margin-radio {
  .el-radio {
    display: inline-flex;
    & + .el-radio {
      margin-left: 13px;
    }
  }
}
</style>

