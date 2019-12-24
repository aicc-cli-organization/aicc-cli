<!-- 添加账户 -->
<template>
<el-dialog
    v-bind="$attrs"
    width="600px"
    title="编辑网关"
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
        
        <el-form-item label="设备名称："
          prop="deviceName" label-width="120px" style="display: inline-block;width:80%;">
          <el-input v-model="form.deviceName"></el-input>
        </el-form-item>

      </el-form>
    <div slot="footer" class="dialog-footer" v-if="hasFooter">
      <el-button @click="cancelBtn()">取 消</el-button>
      <el-button type="primary" @click="confirmBtn()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { updateGateway } from '@/api/gateway'

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
    }
  },
  data() {
    return {
      form: {
        phoneType: 'MOBILE'
      },
      formRules: {
        deviceName: [{ required: true, message: '请输入设备名称', trigger: 'change' }]
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
    confirmBtn() {
      this.update()
    },
    cancelBtn() {
      this.$emit('update:visible', false)
    },
    handleDialogOpen() {
      this.form = {
        ...this.row,
        name: undefined,
        deviceName: this.row.name
      }
      this.$emit('open')
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    handleDialogClose() {
      this.form = {
        deviceId: undefined
      }
      this.$emit('close')
    },
    update() {
      this.$refs['form'].validate((valid) => {
        const { gatewayId, deviceId, deviceName } = this.form
        if (valid) {
          updateGateway({
            gatewayId, deviceId, deviceName
          }).then(({ data }) => {
            this.formVisible = false
            if (data.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.$emit('success', this.form.deviceId)
            }
            this.$emit('update:visible', false)
            this.$emit('confirm')
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__body {
  padding: 0 20px 40px 20px!important;
  max-height: 100px;
  min-height: 100px;
  overflow-y: scroll;
}
</style>