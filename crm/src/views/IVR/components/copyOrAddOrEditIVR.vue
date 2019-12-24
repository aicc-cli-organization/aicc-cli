<template>
  <yiwise-dialog
    :visible.sync="innerVisible"
    :title="titleMap[type]"
    confirmWord="保存"
    @confirm="onSave"
    @close="onClose"
  >
    <el-form
      ref="form"
      :rules="formRules"
      :model="formFields"
      label-width="100px"
    >
      <el-form-item
        prop="name"
        label="导航名称"
      >
        <el-input
          v-model="formFields.name"
          placeholder="请输入导航名称"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="description"
        label="导航描述"
      >
        <el-input
          v-model="formFields.description"
          type="textarea"
          placeholder="请输入导航描述"
          resize="none"
          rows="5"
        ></el-input>
      </el-form-item>
    </el-form>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import * as IVRAPI from '@/api/ivr'

const titleMap = {
  add: '新建语音导航',
  edit: '编辑语音导航',
  copy: '复制语音导航'
}

export default {
  props: {
    type: {
      validator: function(value) {
        return ['add', 'edit', 'copy'].indexOf(value) !== -1
      }
    },
    visible: {
      type: Boolean,
      default: false
    },
    initFormFields: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      formFields: {
        name: undefined,
        description: undefined
      },
      formRules: {
        name: [
          { validator: this.validateName, trigger: 'blur', required: true },
          { min: 1, max: 20, message: '长度在1到20个字符', trigger: 'blur' }
        ],
        description: [
          { min: 1, max: 50, message: '长度在1到50个字符', trigger: 'blur' }
        ]
      },
      titleMap,
      tmpName: undefined
    }
  },
  components: {
    YiwiseDialog
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newVal) {
        this.$emit('update:visible', newVal)
      }
    }
  },
  methods: {
    async validateName(rule, value, callback) {
      if (!value) {
        return callback(new Error('请输入名称'))
      }
      if (this.type === 'edit' && this.tmpName === value) {
        return callback()
      }
      const res = await IVRAPI.checkIVRNameExist({
        name: value
      })
      if (res.data.data) {
        return callback(new Error('该导航名已被占用，不可重名！'))
      }
      return callback()
    },
    onSave() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        if (this.type === 'add') {
          await IVRAPI.addIVRInfo(this.formFields)
          this.$emit('addSuccess')
          this.onClose()
          return
        }
        if (this.type === 'edit') {
          await IVRAPI.updateIVRInfo(this.formFields)
          this.$emit('editSuccess')
          this.onClose()
          return
        }
        await IVRAPI.copyIVRInfo(this.formFields)
        this.$emit('copySuccess')
        this.onClose()
      })
    },
    onClose() {
      this.$refs.form.resetFields()
      this.innerVisible = false
    }
  },
  watch: {
    innerVisible: {
      handler: function(newVal) {
        if (newVal && this.type !== 'add') {
          this.tmpName = this.initFormFields.name
          this.formFields = {
            ...this.formFields,
            ...this.initFormFields
          }
        }
      }
    }
  }
}
</script>
