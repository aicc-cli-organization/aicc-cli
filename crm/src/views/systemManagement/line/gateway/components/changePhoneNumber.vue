<!-- 更改卡号 -->
<template>
<el-dialog
    v-bind="$attrs"
    width="600px"
    title="更改卡号"
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
      <el-form-item label="原号码" v-show="false" prop="phoneNumberId" label-width="120px">
        <span>12312</span>
      </el-form-item>
      <el-form-item label="原号码" prop="phoneNumber" label-width="120px">
        <span>{{form.phoneNumber}}</span>
      </el-form-item>
      <el-form-item label="更换为" prop="newPhoneNumber" label-width="120px">
        <el-input v-model="form.newPhoneNumber"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" v-if="hasFooter">
      <el-button @click="cancelBtn()">取 消</el-button>
      <el-button type="primary" @click="confirmBtn()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { gatewayChangeCard } from '@/api/gateway'
import { phoneNumberregex } from '@/utils/regexp'

export default {
  name: 'index',
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    }
  },
  data() {
    return {
      form: {},
      formRules: {
        newPhoneNumber: [{
          required: true, message: '请输入联系电话'
        }, {
          pattern: phoneNumberregex, message: '请输入正确的联系电话'
        }]
      }
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
  watch: {
    row(val) {
    }
  },
  methods: {
    confirmBtn() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.changeCard()
          this.$emit('update:visible', false)
          this.$emit('confirm')
        }
      })
    },
    cancelBtn() {
      this.$emit('update:visible', false)
    },
    handleDialogOpen() {
      this.$emit('open')
      this.form = {
        ...this.row
      }
    },
    handleDialogClose() {
      this.$refs.form.resetFields()
      this.$emit('close')
    },
    changeCard() {
      gatewayChangeCard({
        ...this.form
      }).then(({ data }) => {
        this.formVisible = false
        if (data.code === 200) {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.$emit('success')
        } else {
          this.$message({
            message: '操作失败',
            type: 'error'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__body {
  padding: 0 15px 0 0 !important;
  max-height: 500px;
}
</style>