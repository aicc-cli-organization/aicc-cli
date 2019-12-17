<!-- 修改拨打间隔 -->
<template>
  <yiwise-dialog
    width="800px"
    title="设置拨打间隔"
    :visible.sync="innerVisible"
    :close-on-click-modal="false"
    @open="handleDialogOpen"
    @close="handleDialogClose"
    @confirm="setCallInterval"
  >
    <el-form
      :model="form"
      ref="form"
      label-width="120px"
      :rules="formRules">
      <el-form-item label="AI拨打间隔：" label-width="120px" prop="callInterval" required>
        <el-input-number v-model="form.callInterval" :min="1" :precision="0" :step="1" :max="600"></el-input-number><span class="ml15">秒</span>
      </el-form-item>
    </el-form>
  </yiwise-dialog>
</template>
<script>
import { YiwiseDialog } from 'yiwise-components'
import * as phoneCardAPI from '@/api/phoneCard'

export default {
  name: 'index',
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
    }
  },
  components: {
    YiwiseDialog
  },
  data() {
    return {
      form: {},
      formRules: {}
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
  methods: {
    handleDialogOpen() {
      this.form = {
        ...this.row
      }
    },
    handleDialogClose() {
      this.$refs.form.resetFields()
    },
    async setCallInterval() {
      await phoneCardAPI.updateCallInterval({
        phoneNumberId: this.form.phoneNumberId,
        callInterval: this.form.callInterval
      })

      this.$message.success('操作成功')
      this.innerVisible = false
      this.$emit('success')
    }
  }
}
</script>

