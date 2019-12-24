<template>
  <yiwise-dialog
    :visible.sync="innerVisible"
    :title="type === 'add' ? '新增成员' : '编辑成员'"
    @open="handleDialogOpen"
    @close="handleDialogClose"
    @confirm="handleSubmit"
  >
    <el-form
      ref="form"
      :model="userDetail"
      label-width="100px"
      :rules="rules"
    >
      <el-form-item
        label="用户名"
        prop="nickname"
        :error="usernameError"
      >
        <el-input
          placeholder="输入用户名"
          v-model="userDetail.nickname"
          @input="handleUsernameChange"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        label="姓名"
        prop="name"
      >
        <el-input
          placeholder="输入姓名"
          v-model="userDetail.name"
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
          v-model="userDetail.phoneNumber"
          @input="handlePhoneNumberChange"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        label="角色"
        prop="roleId"
      >
        <el-select
          placeholder="选择角色"
          v-model="userDetail.roleId"
          v-if="!isAdmin"
        >
          <el-option
            v-if="item.type !== 'BUILT_IN_SUPERADMIN'"
            v-for="item in roleList"
            :key="item.id"
            :value="item.id"
            :label="item.name"
          >
          </el-option>
        </el-select>
        <span v-else>{{roleName}}</span>
      </el-form-item>
      <el-form-item
        v-if="type === 'edit'"
        label="所属部门"
        prop="organizationId"
      >
        <el-select
          v-model="userDetail.organizationId"
        >
          <el-option
            v-for="item in organizationList"
            :key="item.id"
            :value="item.id"
            :label="item.name"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="设置为负责人"
        prop="isManager"
      >
        <el-radio-group v-model="userDetail.isManager">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="`可领取${customerStr}数`"
        prop="customerCountLimit"
      >
        <el-input-number
          v-model="userDetail.customerCountLimit"
        >
        </el-input-number>
        <span>为0则表示不限制</span>
      </el-form-item>
      <el-form-item
        :label="`可拥有${customerStr}天数`"
        prop="customerDaysLimit"
      >
        <el-input-number
          v-model="userDetail.customerDaysLimit"
        >
        </el-input-number>
        <span>为0则表示不限制</span>
      </el-form-item>
      <el-form-item
        label="可拥有坐席数"
        prop="robotCountLimit"
      >
        <el-input-number
          v-model="userDetail.robotCountLimit"
        >
        </el-input-number>
        <span>为0则表示不限制</span>
      </el-form-item>
    </el-form>
  </yiwise-dialog>
</template>

<script>
  import { YiwiseDialog } from 'yiwise-components'
  import { phoneNumberregex, usernameExp } from '@/utils/regexp'
  import { fetchRoleList } from '@/api/roles'
  import { getUserDetail, addUser, editUser, promotion, demotion } from '@/api/users'
  import { getOrganizationList } from '@/api/organizations'
  import { mapGetters } from 'vuex'

  export default {
    name: 'UserDialog',
    components: {
      YiwiseDialog
    },
    props: {
      type: {
        default: 'add',
        validator(value) {
          return ['add', 'edit'].indexOf(value) !== -1
        }
      },
      userId: [Number, String],
      isAdmin: [Boolean],
      visible: {
        type: Boolean,
        default: false
      },
      organizationId: [Number, String]
    },
    computed: {
      ...mapGetters(['customerStr']),
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
        rules: {
          nickname: [{
            required: true, message: '请输入用户名'
          }, {
            min: 2, max: 10, message: '用户名为2-10个字'
          }],
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
          roleId: [{
            required: true, message: '请选择角色'
          }],
          organizationId: [{
            required: true, message: '请选择所属部门'
          }]
        },
        userDetail: {
          isManager: false
        },
        roleName: '',
        roleList: [],
        organizationList: [],
        usernameError: '',
        phoneNumberError: ''
      }
    },
    methods: {
      handleDialogOpen() {
        this.loadRoleList()
        if (this.type === 'edit') {
          this.loadRoleDetail(this.userId)
          this.loadOrganizationList()
        } else {
          this.userDetail = {
            customerCountLimit: 0,
            customerDaysLimit: 0,
            robotCountLimit: 0,
            isManager: false
          }
        }
      },
      handleDialogClose() {
        this.userDetail = {
          isManager: false
        }
        this.roleName = ''
        this.$refs.form.resetFields()
      },
      async loadRoleList() { // 加载角色列表
        try {
          const { data } = await fetchRoleList()
          this.roleList = data.data || []
        } catch (error) {
          return
        }
      },
      async loadOrganizationList() { // 加载组织列表
        try {
          const { data } = await getOrganizationList()
          this.organizationList = data.data || []
        } catch (error) {
          return
        }
      },
      async loadRoleDetail(userId) { // 加载角色详情
        try {
          if (this.userId) {
            const { data } = await getUserDetail({
              userId
            })
            if (data.data) {
              this.userDetail = {
                ...data.data,
                organizationId: this.organizationId
              }
              this.roleName = data.data.roleName
            } else {
              this.userDetail = { organizationId: this.organizationId }
            }
          }
        } catch (error) {
          return
        }
      },
      handleSubmit() {
        this.usernameError = ''
        this.phoneNumberError = ''
        this.$refs.form.validate(async(valid) => {
          if (valid) {
            const params = {
              organizationId: this.organizationId,
              ...this.userDetail
            }
            try {
              if (this.type === 'add') {
                const { data } = await addUser(params)
                this.$message.success('新增成功')
                this.$emit('addSuc', data.data)
              } else if (this.type === 'edit') {
                await editUser({
                  ...params,
                  userId: this.userId
                })
                this.$message.success('编辑成功')
              }
              this.innerVisible = false
              this.$emit('change')
            } catch (error) {
              return
              // this.handleError(error)
            }
          }
        })
      },
      handleError(err) {
        if (err.code === 700) { // TODO:唯一性校验错误
          if (err.data) {
            if (err.data.nickname) {
              this.usernameError = err.data.nickname
            }
            if (err.data.phoneNumber) {
              this.phoneNumberError = err.data.phoneNumber
            }
          }
        }
      },
      handleUsernameChange() { // 用户名改变清楚error
        this.usernameError = ''
      },
      handlePhoneNumberChange() {
        this.phoneNumberError = ''
      }
    }
  }
</script>
