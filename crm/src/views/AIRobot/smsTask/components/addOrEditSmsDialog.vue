<template>
  <yiwise-dialog
    class="add-or-edit-dialog"
    :visible.sync="innerVisible"
    :title="title"
    @confirm="onSubmit"
    @close="resetFields"
  >
    <el-form
      ref="form"
      :rules="formRules"
      :model="formFields"
      label-width="80px"
    >
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="formFields.name" placeholder="请输入任务名称"></el-input>
      </el-form-item>
      <el-form-item label="启动方式" prop="mode">
        <el-radio-group v-model="formFields.mode">
          <el-radio label="MANUAL">手动启动</el-radio>
          <el-radio label="AUTO">自动启动</el-radio>
        </el-radio-group>
        <el-tooltip effect="dark" placement="top-start">
          <div slot="content">手动启动：新建任务后，在可发送时段，系统不会开启短信任务，需要用户手动点击启动！<br />自动启动：新建任务后，在可发送时段，系统将自动开启短信任务！</div>
          <i class="el-icon-question const-icon-tip"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="短信模版" prop="smsTemplateId" class="sms-template-item">
        <el-select class="template-select" placeholder="请选择短信模版" v-model="formFields.smsTemplateId" @visible-change="loadSmsTemplateList" :disabled="isEdit" filterable>
          <el-option
            v-for="(item, index) in smsTemplateList"
            :key="index"
            :label="item.name"
            :value="item.smsTemplateId"
          ></el-option>
        </el-select>
        <el-tooltip effect="dark" placement="top-start" v-if="financeTip">
          <div slot="content">{{financeTip}}</div>
          <i class="el-icon-question const-icon-tip"></i>
        </el-tooltip>
      </el-form-item>
      <span v-if="formFields.mode === 'AUTO'">
        <el-form-item label="启动日期" prop="startTime">
          <el-date-picker
            value-format="yyyy-MM-dd"
            placeholder="请选择日期"
            v-model="formFields.startTime"
            :picker-options="{
              disabledDate(time) {
                return time.getTime() < Date.now() - 8.64e7;
              }
            }"
          ></el-date-picker>
        </el-form-item>
      </span>
      <el-form-item label="启动时间" class="daily-time-item" required>
        <el-col :span="11">
          <el-form-item prop="dailyStartTime">
            <el-time-select
              v-model="formFields.dailyStartTime"
              placeholder="开始时间"
              :picker-options="{
                start: isAdmin ? '00:00' : '09:00',
                end: isAdmin ? '23:50' : this.endTime,
                step: '00:10',
                maxTime: formFields.dailyEndTime
              }"
            ></el-time-select>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-form-item prop="dailyEndTime">
            <el-time-select
              v-model="formFields.dailyEndTime"
              placeholder="结束时间"
              :picker-options="{
                start: isAdmin ? '00:00' : '09:00',
                end: isAdmin ? '23:50' : this.endTime,
                step: '00:10',
                minTime: formFields.dailyStartTime
              }"
            ></el-time-select>
          </el-form-item>
          <el-tooltip effect="dark" placement="top-start" v-if="formFields.smsTemplateId">
            <div slot="content">系统会在该时间段发送短信，若超出该时间段，为避免打扰用户休息，每日9:00至次日{{endTime}}短信会自动延时发送！</div>
            <i class="el-icon-question const-icon-tip"></i>
          </el-tooltip>
        </el-col>
      </el-form-item>
      <el-form-item label="任务描述" prop="description">
        <el-input class="desc-textarea" type="textarea" :rows="3" placeholder="请输入任务描述" v-model="formFields.description"></el-input>
      </el-form-item>
    </el-form>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import * as SmsAPI from '@/api/sms'
import * as taskAPI from '@/api/task'

// 结束时间：若为金融短信模版，则为17:30，其他模版为20:00
const FINANCE_END_TIME = '20:00'
const OTHER_END_TIME = '20:00'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'add'
    },
    smsTaskDetail: {
      type: Object,
      default() {
        return {
          smsJob: {}
        }
      }
    }
  },
  data() {
    return {
      formFields: {
        name: undefined, // 任务名称
        mode: 'MANUAL', // AUTO: 自动任务，MANUAL: 手动任务,
        startTime: undefined, // 启动日期
        dailyStartTime: undefined,
        dailyEndTime: undefined,
        smsTemplateId: undefined, // 短信模版
        description: undefined
      },
      formRules: {
        name: [
          { required: true, message: '任务名称不能为空', trigger: 'blur' },
          { min: 1, max: 20, message: '不超过20个字符', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '启动日期不能为空' }
        ],
        dailyStartTime: [
          { required: true, message: '开始时间不能为空', trigger: 'blur' }
        ],
        dailyEndTime: [
          { required: true, message: '结束时间不能为空', trigger: 'blur' }
        ],
        smsTemplateId: [
          { required: true, message: '短信模版不能为空' }
        ],
        description: [
          { min: 1, max: 100, message: '不超过100个字符', trigger: 'blur' }
        ]
      },
      smsTemplateList: [],
      configDataMap: {},
      financeTip: '',
      endTime: OTHER_END_TIME
    }
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
    selectTaskId() {
      return this.$store.state.smsTask.selectSmsTaskId
    },
    isEdit() {
      return this.type === 'edit'
    },
    title() {
      return this.isEdit ? '编辑短信任务' : '新建短信任务'
    },
    taskList() {
      return this.$store.state.smsTask.taskList
    },
    isAdmin() {
      return this.$route.query.isAdmin === 'true'
    }
  },
  components: {
    YiwiseDialog
  },
  methods: {
    backfixDailyTime(originTime) {
      const backfix = ':00'
      return `${originTime}${backfix}`
    },
    removeBackfixDailyTime(backfixTime) {
      return backfixTime.substring(0, 5)
    },
    onSubmit() {
      this.$refs.form.validate(async isValid => {
        if (isValid) {
          const {
            dailyStartTime,
            dailyEndTime,
            startTime,
            mode
          } = this.formFields
          if (startTime && new Date(`${startTime.replace(/\s00:00:00/, '')} ${dailyStartTime}`).getTime() < new Date().getTime()) {
            this.$message({
              message: '启动时间不可晚于当前时刻',
              type: 'error'
            })
            return
          }
          const resultFormFields = {
            ...this.formFields,
            ...{
              startTime: (startTime && mode === 'AUTO') ? `${startTime.replace(/\s00:00:00/, '')} 00:00:00` : null,
              dailyStartTime: this.backfixDailyTime(dailyStartTime),
              dailyEndTime: this.backfixDailyTime(dailyEndTime),
              admin: this.isAdmin
            }
          }
          if (this.isEdit) {
            await SmsAPI.editSmsTask(resultFormFields)
            this.$message({
              message: '修改成功',
              type: 'success'
            })
            this.$emit('updateSuccess')
          } else {
            await SmsAPI.createSmsTask(resultFormFields)
            this.$message({
              message: '创建成功',
              type: 'success'
            })
            this.$store.dispatch('refreshSmsTask', 'addSuccess')
          }
          this.innerVisible = false
        }
      })
    },
    async loadSmsTemplateList(visible) {
      if (!visible) return
      this.smsTemplateList = (await SmsAPI.getSmsTemplateList({
        status: 'APPROVED'
      })).data.data.content
    },
    async loadSmsConfig() {
      const res = await taskAPI.getSmsConfig()
      const configDataMap = {}
      res.data.data.forEach(item => {
        configDataMap[item.configKey] = item.configValue
      })
      this.configDataMap = configDataMap
    },
    resetFields() {
      this.formFields = {
        name: undefined, // 任务名称
        mode: 'MANUAL', // AUTO: 自动任务，MANUAL: 手动任务,
        startTime: undefined, // 启动日期
        dailyStartTime: undefined,
        dailyEndTime: undefined,
        smsTemplateId: undefined, // 短信模版
        description: undefined
      }
      this.$refs.form.clearValidate()
    }
  },
  watch: {
    innerVisible: {
      handler: async function (newVal) {
        newVal && await this.loadSmsConfig()
        if (!(newVal && this.isEdit)) return
        await this.loadSmsTemplateList(true)
        const smsTaskDetail = (await SmsAPI.getSmsTaskDetail(this.selectTaskId)).data.data
        const { dailyStartTime, dailyEndTime } = smsTaskDetail.smsJob
        this.formFields = {
          ...this.formFields,
          ...smsTaskDetail.smsJob,
          ...{
            dailyStartTime: dailyStartTime.substring(0, 5),
            dailyEndTime: dailyEndTime.substring(0, 5)
          }
        }
      },
      deep: true
    },
    'formFields.smsTemplateId': {
      handler: function (newVal) {
        const smsItem = this.smsTemplateList.find(item => item.smsTemplateId === newVal)
        if (!smsItem) return
        const { yd_send_count, lt_send_count, dx_send_count } = this.configDataMap
        const type = smsItem.type
        this.financeTip = type === 'FINANCE' ? `金融短信发送数量必须达到要求：移动${yd_send_count}条起，联通${lt_send_count}条起，电信${dx_send_count}条起！` : ''
        this.endTime = type === 'FINANCE' ? FINANCE_END_TIME : OTHER_END_TIME
        if (this.type === 'edit') return
        this.formFields.dailyStartTime = ''
        this.formFields.dailyEndTime = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.add-or-edit-dialog {
  .template-select {
    width: 100%;
  }
  .daily-time-item {
    position: relative;
    margin-bottom: 0;
    /deep/ .el-input {
      width: 115px;
    }
    .line {
      text-align: center;
    }
    .const-icon-tip {
      position: absolute;
      right: -16px;
      top: 8px;
    }
  }
  .sms-template-item {
    .const-icon-tip {
      position: absolute;
      right: -16px;
      top: 8px;
    }
  }
  .desc-textarea {
    /deep/ textarea {
      resize: none;
    }
  }
  .const-icon-tip {
    font-size: 16px;
    margin-left: 10px;
    vertical-align: middle;
  }
}
</style>
