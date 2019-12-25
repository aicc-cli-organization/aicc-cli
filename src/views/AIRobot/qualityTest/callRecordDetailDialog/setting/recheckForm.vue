<template>
  <el-form
    ref="form"
    class="recheck-form"
    label-width="80px"
    :model="formFields"
    :rules="formRules"
  >
    <el-form-item
      prop="score"
      label="得分"
    >
      <el-input
        size="small"
        v-model="formFields.score"
        class="score-input"
      ></el-input>分
    </el-form-item>
    <el-form-item
      prop="comment"
      label="备注"
    >
      <el-input
        v-model="formFields.comment"
        class="remark-input"
        type="textarea"
        resize="none"
        rows="3"
      >
      </el-input>
    </el-form-item>
    <el-button type="primary" class="submit-btn" @click="onSubmit">确定</el-button>
    <el-button @click="onCancel">取消</el-button>
  </el-form>
</template>

<script>
import * as qcAPI from '@/api/qualityTest'

const validateScore = (rule, value, callback) => {
  if (!value) {
    return callback('请输入得分')
  } else if (!Number.isInteger(+value)) {
    return callback('请输入数字')
  } else if (value < 0 || value > 100) {
    return callback('分值应该在0到100')
  }
  callback()
}
export default {
  props: {
    qcJobRecordId: [String, Number]
  },
  data() {
    return {
      formFields: {
        score: undefined,
        comment: undefined
      },
      formRules: {
        score: [
          { required: true, validator: validateScore, trigger: 'blur' }
        ],
        comment: [
          { required: true, message: '请输入备注', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    selectedTaskId() {
      return this.$store.state.qcTask.selectedTaskId
    }
  },
  methods: {
    onCancel() {
      this.$emit('update:visible', false)
    },
    onSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        await qcAPI.recheckQCJobRecord({
          qcJobRecordId: this.qcJobRecordId,
          qcJobId: this.selectedTaskId,
          ...this.formFields
        })
        this.$message({
          message: '复核成功',
          type: 'success'
        })
        this.$emit('recheckSuccess', {
          ...this.formFields
        })
        this.onCancel()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.recheck-form {
  .score-input {
    width: 60px;
    margin-right: 5px;
  }
  .remark-input {
    width: 300px;
  }
  .submit-btn {
    margin-left: 268px;
  }
}
</style>
