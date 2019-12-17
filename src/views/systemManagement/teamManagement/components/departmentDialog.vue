<template>
  <yiwise-dialog
    :visible.sync="innerVisible"
    :title="type === 'add' ? '新增部门' : '编辑部门'"
    @open="handleDialogOpen"
    @close="handleDialogClose"
    @confirm="handleSubmit"
  >
    <el-form
      ref="form"
      label-width="85px"
      :model="organizationDetail"
      :rules="rules"
    >
      <el-form-item
        label="上级部门"
        prop="parentId"
      >
        <el-select
          :disabled="type === 'add' || organizationDetail.parentId === 0"
          v-model="organizationDetail.parentId"
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
        label="部门名称"
        prop="name"
        :error="nameError"
      >
        <el-input
          placeholder="输入部门名称"
          v-model="organizationDetail.name"
          @input="handleNameChange"
        >
        </el-input>
      </el-form-item>
      <!-- <el-form-item
        label="部门负责人"
        prop="managerUserId"
      >
        <el-select
          placeholder="选择部门负责人"
          v-model="organizationDetail.managerUserId"
        >
          <el-option
            v-for="item in userList"
            :key="item.userId"
            :value="item.userId"
            :label="item.nickName"
          >
          </el-option>
        </el-select>
      </el-form-item> -->
    </el-form>  
  </yiwise-dialog>
</template>

<script>
  import { YiwiseDialog } from 'yiwise-components'
  import { getOrganizationList, getOrganizationDetail, addOrganization, editOrganization } from '@/api/organizations'
  import { getAllUserList } from '@/api/users'

  export default {
    name: 'DepartmentDialog',
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
      }
    },
    props: {
      type: {
        default: 'add',
        validator(value) {
          return ['add', 'edit'].indexOf(value) !== -1
        }
      },
      id: [Number, String],
      visible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        organizationList: [],
        userList: [],
        organizationDetail: {},
        nameError: '',
        rules: {
          parentId: [{
            required: true, message: '请选择上级部门'
          }],
          name: [{
            required: true, message: '请输入部门名称'
          }, {
            min: 3, max: 20, message: '部门名称应为3-20个字'
          }],
          managerUserId: [{
            required: true, message: '请选择部门负责人'
          }]
        }
      }
    },
    methods: {
      async loadOrganizationList() { // 加载组织架构列表
        try {
          const { data } = await getOrganizationList()
          if (data.data) {
            this.organizationList = data.data
            // .concat({
            //   id: 0,
            //   name: '无'
            // })
          } else {
            this.organizationList = []
          }
        } catch (error) {
          return
        }
      },
      async loadUserList() { // 加载成员列表
        try {
          const { data } = await getAllUserList()
          this.userList = data.data || []
        } catch (error) {
          return
        }
      },
      async loadOrganizationDetail(id) { // 加载组织架构详情
        try {
          const { data } = await getOrganizationDetail({
            id
          })
          if (data.data) {
            const { parentId, managerUserId } = data.data
            this.organizationDetail = {
              ...data.data,
              managerUserId: managerUserId || '',
              parentId: parentId
            }
          }
        } catch (error) {
          return
        }
      },
      handleDialogOpen() {
        this.loadOrganizationList()
        this.loadUserList()
        if (this.type === 'edit') {
          this.loadOrganizationDetail(this.id)
        } else {
          this.organizationDetail = {
            ...this.organizationDetail,
            parentId: this.id
          }
        }
      },
      handleDialogClose() {
        this.organizationDetail = {}
        this.$refs.form.resetFields()
      },
      handleSubmit() {
        this.nameError = ''
        this.$refs.form.validate(async(valid) => {
          if (valid) {
            this.nameError = ''
            try {
              if (this.type === 'add') {
                await addOrganization(this.organizationDetail)
                this.$message.success('新增成功')
              } else if (this.type === 'edit') {
                await editOrganization(this.organizationDetail)
                this.$message.success('编辑成功')
              }
              this.innerVisible = false
              this.$emit('submit')
            } catch (error) {
              this.handleError(error)
            }
          }
        })
      },
      handleError(err) {
        if (err.code === 700) { // 唯一性校验错误
          if (err.data && err.data.name) {
            this.nameError = err.data.name
          }
        }
      },
      handleNameChange() { // 部门名称改变，清楚nameError
        this.nameError = ''
      }
    }
  }
</script>
