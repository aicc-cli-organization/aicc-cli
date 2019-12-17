<template>
	<yiwise-dialog
		title="输入变量"
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
        v-for="(property, index) in propertyList"
        :key="index"
        :label="property"
        :prop="`${property}`"
      >
        <el-input
          v-if="property !== '性别'"
          :value="propertyData[`${property}`]"
          @input="value => handleInputChange(`${property}`, value)"
        >
        </el-input>
        <el-radio-group :value="propertyData[`${property}`]" @input="value => handleInputChange(`${property}`, value)" size="small" v-else>
          <el-radio label="MALE">男</el-radio>
          <el-radio label="FEMALE">女</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
	</yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'

export default {
  name: 'PropertyDialog',
  components: {
    YiwiseDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    propertyList: {
      type: Array,
      default() {
        return []
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
      propertyData: {}, // 变量数据集合
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
      this.propertyData = {}
      this.$refs.form.resetFields()
    },
    initRules() { // 初始化表单rules
      if (this.propertyList) {
        this.propertyList.forEach((property) => {
          this.rules[`${property}`] = [{
            required: true,
            message: `请输入${property}`
          }]
        })
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
