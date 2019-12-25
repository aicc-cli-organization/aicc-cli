<!-- 修改拨打间隔 -->
<template>
<el-dialog
    v-bind="$attrs"
    width="600px"
    title="拔卡"
    :visible.sync="visible"
    @open="handleDialogOpen"
    @close="handleDialogClose"
  >
    <el-form
        :model="form"
        ref="form"
        label-width="120px"
        :rules="formRules">
        <el-form-item label="电话id" v-show="false" label-width="120px">
          <span>{{form.phoneNumberId}}</span>
        </el-form-item>
        <el-form-item label-width="120px">
          <span>确定要清除以下信息？</span>
        </el-form-item>
        <el-form-item label="电话号码" label-width="120px">
          <span>{{form.phoneNumber || '----'}}</span>
        </el-form-item>
        <el-form-item label="号码名称" label-width="120px">
          <span>{{form.phoneName || '----'}}</span>
        </el-form-item>
        <el-form-item :label="`${customerStr}名称`" label-width="120px" v-if="form.ownerTenantId==0 && form.bindingTenantNameList && form.bindingTenantNameList.length > 0">
          <span>{{form.bindingTenantNameList[0].tenantName || '----'}}</span>
        </el-form-item>
        <el-form-item label="外地外呼前缀" label-width="120px">
          <span>{{form.otherCallPrefix || '----'}}</span>
        </el-form-item>
        <el-form-item label="号码归属地" label-width="120px">
          <span>{{form.province || '--'}}-{{form.city || '--'}}</span>
        </el-form-item>
      </el-form>
    <div slot="footer" class="dialog-footer" v-if="hasFooter">
      <el-button @click="cancelBtn()">取 消</el-button>
      <el-button type="primary" @click="confirmBtn()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { pullOutPhoneCard } from '@/api/gateway'
import { mapGetters } from 'vuex'

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
      formRules: {}
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
  computed: {
    ...mapGetters([
      'customerStr'
    ])
  },
  methods: {
    pullOutPhoneCard(row) {
      pullOutPhoneCard({
        phoneNumberId: this.form.phoneNumberId
      }).then(() => {
        this.$emit('success')
        this.$message.success('拔卡成功')
      })
    },
    confirmBtn() {
      this.pullOutPhoneCard()
      this.$emit('close')
      // this.$emit('confirm')
    },
    cancelBtn() {
      this.$emit('close')
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
    }
  }
}
</script>

