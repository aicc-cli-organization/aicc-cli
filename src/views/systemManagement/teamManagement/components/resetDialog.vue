<template>
  <yiwise-dialog
    :visible.sync="innerVisible"
    title="重置密码"
    @close="handleDialogClose"
    @confirm="handleSubmit"
  >
    <el-form
      :model="formData"
      ref="form"
      label-width="90px"
      :rules="rules"
    >
      <el-form-item
        label="用户名"
      >
        {{defaultData.nickname}}
      </el-form-item>
      <el-form-item
        label="新密码"
        prop="password"
      >
        <el-input
          type="password"
          v-model="formData.password"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        label="确认新密码"
        prop="confirmPassword"
      >
        <el-input
          type="password"
          v-model="formData.confirmPassword"
        >
        </el-input>
      </el-form-item>
    </el-form>
  </yiwise-dialog>  
</template>

<script>
  import { YiwiseDialog } from 'yiwise-components'
  import { resetPassword } from '@/api/users'

  export default {
    name: 'ResetDialog',
    components: {
      YiwiseDialog
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      defaultData: {
        type: Object,
        default() {
          return {}
        }
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
      }
    },
    data() {
      const validatePass = (rule, value, callback) => { // 校验新密码
        if (value && (value.length < 6 || value.length > 12)) {
          callback('密码需为6-12位')
        } else if (this.formData.confirmPassword) { // 校验再次输入
          this.$refs.form.validateField('confirmPassword')
        }
        callback()
      }
      const validatePassConfirm = (rule, value, callback) => {
        if (value && value !== this.formData.password) {
          callback(new Error('两次输入密码不一致!'))
        }
        callback()
      }
      return {
        formData: {
          password: undefined,
          confirmPassword: undefined
        },
        rules: {
          password: [{
            required: true, message: '请输入密码'
          }, {
            validator: validatePass
          }],
          confirmPassword: [{
            required: true, message: '请再次输入密码'
          }, {
            validator: validatePassConfirm
          }]
        }
      }
    },
    methods: {
      handleDialogClose() {
        this.$refs.form.resetFields()
        this.formData = {
          password: undefined
        }
      },
      handleSubmit() {
        this.$refs.form.validate(async(valid) => {
          if (valid) {
            try {
              const { password, confirmPassword } = this.formData
              await resetPassword({
                userId: this.defaultData.userId,
                newPassword: password,
                confirmNewPassword: confirmPassword
              })
              this.$message.success('重置成功')
              this.innerVisible = false
              this.$emit('change')
            } catch (error) {
              return
            }
          }
        })
      }
    }
  }
</script>
