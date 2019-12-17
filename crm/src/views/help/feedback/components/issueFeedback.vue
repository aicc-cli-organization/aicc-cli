<template>
  <div id="issue-feedback">
    <el-form
      ref="form"
      label-width="100px"
      class="mt20"
      :model="form"
      :rules="rules"
      >
      <el-form-item label="问题类型：" required prop="type">
        <el-select v-model="form.type" class="w240">
          <el-option
            v-for="item in issueTypeOptions"
            :key="item.key"
            :value="item.key"
            :label="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话：" prop="phone">
        <el-input v-model="form.phone" class="w240"></el-input>
      </el-form-item>
      <el-form-item label="问题描述：" prop="content">
        <el-input v-model="form.content" class="w460" rows="10" type="textarea"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import * as feedbackAPI from '@/api/feedback'
import { phoneNumberregex } from '@/utils/regexp'

export default {
  data() {
    return {
      form: {},
      issueTypeOptions: [
        {
          key: 'OFFICIAL',
          value: '事务性'
        }, {
          key: 'ERROR',
          value: '故障类'
        }, {
          key: 'ADVICE',
          value: '意见建议'
        }
      ],
      rules: {
        type: [{ required: true, message: '请选择问题类型', trigger: 'change' }],
        phone: [{
          pattern: phoneNumberregex, message: '请输入正确的联系电话'
        }],
        content: [{
          required: true, message: '请输入问题描述'
        }, {
          max: 200, message: '长度不应超过200字符', trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    cancel() {
      this.$emit('shiftTab')
    },
    submit() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          feedbackAPI.create({
            ...this.form
          }).then(({ data }) => {
            if (data.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.$refs.form.resetFields()
              this.$emit('shiftTab')
            } else {
              this.$message({
                message: '操作失败',
                type: 'error'
              })
            }
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~src/styles/variables.scss';
#issue-feedback {
 height: calc(100vh - 160px); 
}
.w240 {
  width: 300px;
}
.w460 {
  width: 460px;
}
</style>