<!-- 客户扩容 -->
<template>
<el-dialog
    v-bind="$attrs"
    :title="dialogTitle"
    :width="$attrs.width || '620px'"
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
      <el-form-item label="姓名" label-width="120px" prop="userId">
        <el-select
          filterable
          remote
          reserve-keyword
          style="width: 200px;"
          :remote-method="requestUserList"
          v-model="form.userId"
          placeholder="请选择员工"
          >
          <el-option
            v-for="item in filterUserListOptions"
            :key="item.userId"
            :label="item.userName"
            :value="item.userId">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="呼出线路" label-width="120px" prop="phoneNumberIdList">
        <el-select
          v-model="form.phoneNumberIdList"
          multiple
          place
          style="width: 200px;"
          size="mini"
          placeholder="请选择线路"
        >
          <el-option
            v-for="item in phoneNumberOptions"
            :key="item.phoneNumberId"
            :value="item.phoneNumberId"
            :label="(item.phoneName ? (item.phoneName + '-') : '') + (item.phoneNumber || '')"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" v-if="hasFooter">
      <el-button @click="cancelBtn()">取 消</el-button>
      <el-button type="primary" @click="confirmBtn()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { createOrUpdateAccount } from '@/api/numberpool'
import * as usersAPI from '@/api/users'
import * as numberpoolAPI from '@/api/numberpool'

export default {
  name: 'index',
  components: {
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
    dialogTitle() {
      if (this.row.addOrEdit === 'ADD') {
        return '新增人工坐席'
      } else {
        return '编辑人工坐席'
      }
    }
  },
  data() {
    return {
      filterUserListOptions: [],
      phoneNumberOptions: [],
      filterCreateByUserId: undefined,
      form: {},
      formRules: {
        phoneNumberIdList: [{ required: true, message: '请选择线路', trigger: 'blur' }],
        userId: [{ required: true, message: '请选择员工', trigger: 'blur' }]
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
  methods: {
    requestUserList(val, isInit) {
      usersAPI.getUserByTenant({
        username: val,
        pageSize: 20,
        pageNum: 1
      }).then(({ data }) => {
        this.filterUserListOptions = data.data.content
        if (isInit) {
          this.filterCreateByUserId = this.filterUserListOptions[0].userId
        }
      })
    },
    getNumberPoolList() {
      numberpoolAPI.getTenantPhoneNumberList().then(({ data }) => {
        this.phoneNumberOptions = data.data
      })
    },
    confirmBtn() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.addOrEdit()
          this.$emit('update:visible', false)
          this.$emit('confirm')
        }
      })
    },
    cancelBtn() {
      this.$emit('update:visible', false)
    },
    addOrEdit() {
      if (this.row.addOrEdit === 'ADD') {
        this.add()
      } else {
        this.update()
      }
    },
    handleDialogOpen() {
      this.getNumberPoolList()
      this.requestUserList()
      this.$emit('open')
      this.form = {
        ...this.row,
        phoneNumberIdList: this.row.phoneNumberIdList || []
      }
    },
    handleDialogClose() {
      this.form = {
        phoneNumberIdList: []
      }
      this.$emit('close')
    },
    add() {
      const { userId, phoneNumberIdList } = this.form
      createOrUpdateAccount({
        userId, phoneNumberIdList
      }).then(({ data }) => {
        this.$emit('success')
      })
    },
    update() {
      const { userId, phoneNumberIdList, csStaffId } = this.form
      createOrUpdateAccount({
        userId, phoneNumberIdList, csStaffId
      }).then(({ data }) => {
        this.$emit('success')
      })
    }
  }
}
</script>

