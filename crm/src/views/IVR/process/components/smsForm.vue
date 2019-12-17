<template>
  <commonForm
    ref="form"
    firstLabel="时间节点名称"
    :form="form"
    :rules="rules"
    :editData="editData"
    @cancel="cancel"
    @submit="submitTime"
  >
    <div class="title">发送短信选择</div>
    <div class="time-container">
      <el-form-item prop="smsTemplateId">
        <el-select
          class="mt10"
          v-model="form.smsTemplateId"
          placeholder="请选择短信模板"
          filterable
          remote
          clearable
          :remote-method="getSmsTemplateList"
          @change="handleSMSSearch">
          <el-option v-for="(group, key) in smsList" :key="key" :value="group.smsTemplateId" :label="group.name"></el-option>
        </el-select>
      </el-form-item>
    </div>
  </commonForm>
</template>

<script>
import { cloneJSON } from '@/utils'
import { saveNode, updateNode } from '@/api/ivr'
import { getSmsList } from '@/api/sms'
import commonForm from './commonForm'
export default {
  components: { commonForm },
  props: {
    editData: [Object],
    nodeIndex: [Number],
    type: [String],
    myDiagram: [Object, undefined]
  },
  data() {
    return {
      form: {
        nodeName: '',
        smsTemplateId: undefined
      },
      rules: {
        nodeName: [
          { required: true, message: '请输入节点名称' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ],
        smsTemplateId: [
          { required: true, message: '请选择短信模板' }
        ]
      },
      savedOrSaving: false,
      smsList: []
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
          this.savedOrSaving = true

          let { data } = await (this.editData.id ? updateNode : saveNode)({
            ivrNavigationInfoId: this.selectIVRId,
            data: {
              id: this.editData.id || undefined,
              name: this.form.nodeName,
              type: 'SMS', // 节点类型 START 开始节点 TIME 时间节点 AUDIO 语音节点 CHOOSE 选择节点 RECEPTION 接待节点 HANGUP 挂断节点
              nextNodeId: this.editData.nextNodeId,
              smsTemplateId: this.form.smsTemplateId,
              webData: this.myDiagram.model.findNodeDataForKey(this.editData.key).loc
            }
          })
          data = data.data

          this.$message.success('保存成功')

          this.$emit('succuss', {
            ...data,
            loc: data.webData,
            id: data.id,
            nodeName: data.name,
            preKey: this.editData.key
          })
        }
      })
    },
    handleSMSSearch(val) {
      if (val === '') {
        this.getSmsTemplateList()
      }
    },
    async getSmsTemplateList(name) {
      const { data } = await getSmsList({
        status: 'APPROVED',
        name
      })
      this.smsList = data.data.content || []
    },
    cancel() {
      this.initData()
    },
    hasWrongData(hasWrongcb, noWrongcb) {
      if (this.type === 'add') {
        hasWrongcb()
      } else {
        if(Object.keys(this.form).find(key => this.form[key] !== this.editData[key])) {
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
        this.form.nodeName = '短信节点' + this.nodeIndex
        this.form.smsTemplateId = undefined
      } else {
        Object.keys(this.form).forEach(key => this.form[key] = this.editData[key])
      }
    }
  },
  mounted() {
    this.initData()
    this.getSmsTemplateList()
  }
}
</script>

<style lang="scss" scoped>
.time-container {
  border-bottom: none !important;
}
</style>

