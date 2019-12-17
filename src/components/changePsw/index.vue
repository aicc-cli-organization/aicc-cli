<template>
  <yiwise-dialog
    title="修改密码"
    @confirm="handleSubmit"
    @cancel="handleClose"
    :visible.sync="innerVisible"
  >
    <el-form
      :model="passwordForm"
      ref="form"
      label-width="120px"
      :rules="rules"
    >
      <el-form-item
        label="旧密码"
        prop="oldPassword"
        :error="oldError"
      >
        <el-input
          type="password"
          v-model="passwordForm.oldPassword"
          auto-complete="off"
          @input="handleOldChange"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input type="password" v-model="passwordForm.newPassword" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input type="password" v-model="passwordForm.confirmPassword" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>
  </yiwise-dialog>
</template>

<script>
  import { YiwiseDialog } from 'yiwise-components'
  import { changePassword } from '@/api/users'
  import { mapGetters, mapActions } from 'vuex'

  export default {
    name: 'ChangePassword',
    components: {
      YiwiseDialog
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ...mapGetters(['userId']),
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
        } else if (this.passwordForm.confirmPassword) { // 校验再次输入
          this.$refs.form.validateField('confirmPassword')
        }
        callback()
      }
      const validatePassConfirm = (rule, value, callback) => {
        if (value && value !== this.passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致!'))
        }
        callback()
      }
      return {
        passwordForm: {},
        rules: {
          oldPassword: [{
            required: true, message: '请输入旧密码'
          }],
          newPassword: [{
            required: true, message: '请输入新密码'
          }, {
            validator: validatePass
          }],
          confirmPassword: [{
            required: true, message: '请再次输入密码'
          }, {
            validator: validatePassConfirm
          }]
        },
        oldError: ''
      }
    },
    methods: {
      ...mapActions(['set_resetPsw']),
      handleClose() {
        this.passwordForm = {}
      },
      handleSubmit() {
        this.oldError = ''
        this.$refs.form.validate(async(valid) => {
          if (valid) {
            const { oldPassword, newPassword, confirmPassword } = this.passwordForm
            try {
              await changePassword({
                oldPwd: oldPassword,
                newPwd: newPassword,
                confirmNewPwd: confirmPassword,
                userId: this.userId
              })
              this.set_resetPsw(false)
              this.$message.success('修改成功')
              this.innerVisible = false
            } catch (error) {
              return
              // this.handleError(error)
            }
          }
        })
      },
      handleOldChange() {
        this.oldError = ''
      },
      handleError(err) {
        if (err.code === 701) { // TODO:旧密码错误
          this.oldError = err.resultMsg
        }
      }
    }
  }
</script>

