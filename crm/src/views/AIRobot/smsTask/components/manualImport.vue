<template>
  <yiwise-dialog
    :visible.sync="innerVisible"
    title="手动添加"
    @confirm="onSubmit"
  >
    <div class="textarea-wrap" @click="$refs.input.focus()">
      <el-tag v-for="(item, index) in phoneList" :key="index" closable @close="onRemovePhone(item)">{{item}}</el-tag>
      <el-input
        ref="input"
        class="phone-input"
        placeholder="可填写多个手机号，用换行的形式分开"
        v-model="tmpValue"
        :rows="4"
        @keyup.enter.native="onEnter">
      </el-input>
    </div>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import * as SmsAPI from '@/api/sms'

const phonereg = /^1[3456789]\d{9}$/

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tmpValue: '',
      phoneList: []
    }
  },
  components: {
    YiwiseDialog
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
    }
  },
  methods: {
    onEnter(event) {
      const phoneNumber = event.target.value.replace(/\n/g, "")
      if (!phonereg.test(phoneNumber)) {
        this.$message({
          message: '请输入手机号格式',
          type: 'error'
        })
        return
      }
      this.phoneList.push(phoneNumber)
      this.tmpValue = ''
      return false
    },
    onRemovePhone(phone) {
      const phoneIndex = this.phoneList.indexOf(phone)
      const copyList = this.phoneList.slice()
      copyList.splice(phoneIndex, 1)
      this.phoneList = copyList
    },
    async onSubmit() {
      if (!this.phoneList.length) {
        this.$message({
          message: '请输入手机号',
          type: 'error'
        })
        return
      }
      const res = await SmsAPI.manualImportSms({
        smsJobId: this.selectTaskId,
        phoneNumberList: this.phoneList
      })
      this.$message({
        message: `已成功导入${res.data.data || 0}个有限手机号，系统默认去重并去除错误手机号，只留下有效手机号。`,
        type: 'success'
      })
      this.$emit('importSuccess')
      this.phoneList = []
      this.tmpValue = ''
      this.innerVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.textarea-wrap {
  position: relative;
  height: 200px;
  border: 1px solid rgb(220, 223, 230);
  border-radius: 3px;
  margin-bottom: 20px;
  overflow-y: auto;
  .phone-input {
    display: inline-block;
    /deep/ .el-input__inner {
      border: 0;
    }
  }
}
</style>
