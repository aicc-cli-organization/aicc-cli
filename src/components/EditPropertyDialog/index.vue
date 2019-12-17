<template>
	<yiwise-dialog
		title="编辑自定义变量"
    :visible.sync="innerVisible"
    :append-to-body="true"
    @open="handleDialogOpen"
    @close="handleDialogClose"
    @confirm="handleSubmit"
	>
    <el-form
      :model="propertyData"
      :rules="rules"
      ref="form"
      label-width="80px"
    >
      <el-form-item
        v-for="(value, key) in propertyData"
        :key="key"
        :label="key"
        :prop="key"
      >
        <el-input v-model="propertyData[key]">
        </el-input>
      </el-form-item>
    </el-form>
	</yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'

export default {
  name: 'EditPropertyDialog',
  components: {
    YiwiseDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    propertyData: {
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
    return {
      rules: {}
    }
  },
  methods: {
    handleInputChange(key, value) { // 变量输入框改变事件
      this.propertyData = {
        ...this.propertyData,
        [key]: value
      }
    },
    handleDialogOpen() {
      this.initRules()
    },
    handleDialogClose() {
      this.$refs.form.resetFields()
    },
    initRules() { // 初始化表单rules
      for(let key in this.propertyData) {
        this.rules[key] = [{
          required: true,
          message: `请输入${key}`
        }]
      }
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submit', { ...this.propertyData })
          this.innerVisible = false
        }
      })
    }
  }
}
</script>
