<template>
  <div class="form-con">
    <el-form ref="form" :model="form" :rules="rules" label-width="0">
      <div class="head">
        <div class="title">{{firstLabel}}</div>
        <el-form-item label="" prop="nodeName">
          <el-input v-model="form.nodeName" placeholder="请输入节点名称"></el-input>
        </el-form-item>
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <div class="footer">
        <div class="title">最后修改</div>
        <div class="info">
          <span>{{editData.updateUserName}}</span>
          <span>{{editData.updateTime}}</span>
        </div>
      </div>
    </el-form>
    <div class="footer-btns">
      <el-button @click="$emit('cancel')">重置</el-button>
      <el-button type="primary" @click="$emit('submit')">确定</el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['form', 'rules', 'editData', 'firstLabel'],
  data() {
    return {}
  },
  methods: {
    validate(cb) {
      this.$refs.form.validate(cb)
    },
    resetFields() {
      this.$refs.form.resetFields()
    }
  }
}
</script>
