<template>
  <yiwise-dialog
    title="编辑个人信息"
    :visible.sync="innerVisible"
    @open="handleDialogOpen"
    @confirm="handleSubmit"
  >
    <el-form
      label-width="80px"
      :model="defaultData"
      :rules="rules"
      ref="form"
    >
      <el-form-item
        label="姓名"
        prop="name"
      >
        <el-input
          placeholder="输入姓名"
          v-model="defaultData.name"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        label="联系电话"
        prop="phoneNumber"
        :error="phoneNumberError"
      >
        <el-input
          placeholder="输入联系电话"
          v-model="defaultData.phoneNumber"
          @input="handlePhoneNumberChange"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        label="性别"
        prop="gender"
      >
        <el-radio-group
          v-model="defaultData.gender"
        >
          <el-radio
            v-for="(value, key) in genderEnum"
            :key="key"
            :label="key"
          >
            {{value}}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="职位"
        prop="job"
      >
        <el-input
          placeholder="输入职位"
          v-model="defaultData.job"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        label="工作描述"
        prop="comment"
      >
        <el-input
          placeholder="输入工作描述"
          type="textarea"
          v-model="defaultData.comment"
        >
        </el-input>
      </el-form-item>
    </el-form>
  </yiwise-dialog>
</template>

<script>
  import { YiwiseDialog } from 'yiwise-components'
  import { genderEnum } from '@/utils/enum'
  import { phoneNumberregex } from '@/utils/regexp'
  import { updateUserInfo } from '@/api/personalInfo'
  import { mapGetters } from 'vuex'

  export default {
    name: 'PersonalDialog',
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
      ...mapGetters([
        'userId',
        'name',
        'gender',
        'position',
        'description',
        'phoneNumber'
      ]),
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
        genderEnum,
        defaultData: {},
        rules: {
          name: [{
            required: true, message: '请输入姓名'
          }, {
            min: 2, max: 10, message: '姓名为2-10个字'
          }],
          phoneNumber: [{
            required: true, message: '请输入联系电话'
          }, {
            pattern: phoneNumberregex, message: '请输入正确的联系电话'
          }],
          comment: [{
            max: 30, message: '工作描述不能超过30个字'
          }]
        },
        phoneNumberError: ''
      }
    },
    methods: {
      handleDialogOpen() {
        this.defaultData = {
          userId: this.userId,
          name: this.name,
          phoneNumber: this.phoneNumber,
          gender: this.gender,
          job: this.position,
          comment: this.description
        }
      },
      handleSubmit() {
        this.phoneNumberError = ''
        this.$refs.form.validate(async(valid) => {
          if (valid) {
            try {
              await updateUserInfo(this.defaultData)
              this.$message.success('修改成功')
              this.innerVisible = false
              this.$emit('change')
            } catch (error) {
              // this.handleError(error)
              return
            }
          }
        })
      },
      handlePhoneNumberChange() {
        this.phoneNumberError = ''
      },
      handleError(err) {
        if (err.code === 700) { // TODO:唯一性校验错误
          if (err.data && err.data.phoneNumber) {
            this.phoneNumberError = err.data.phoneNumber
          }
        }
      }
    }
  }
</script>
