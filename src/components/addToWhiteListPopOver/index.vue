<template>
  <el-popover
    v-model="addWhiteListvisible"
    trigger="manual"
    placement="top"
    width="280"
    v-bind="$attrs"
  >
    <div>请选择加入白名单原因:</div>
    <el-radio-group
      class="radio"
      v-model="type"
    >
      <el-radio v-for="(value, key) in addTypeEnum" :key="key" :label="key">{{value}}</el-radio>
    </el-radio-group>
    <div class="action">
      <el-button size="mini" type="text" @click="addWhiteListvisible = false">取消</el-button>
      <el-button type="primary" size="mini" @click="handleJoinWhiteList">确定</el-button>
    </div>
    <div
      slot="reference"
      @click="addWhiteListvisible = true"
      class="slot"
    >
      <slot></slot>
    </div>
  </el-popover>
</template>

<script>
import { addWhiteList } from '@/api/customer'
import { addTypeEnum } from '@/utils/enum'
export default {
  name: 'YiwisePopConfirm',
  props: {
    label: {
      type: String,
      default: ''
    },
    customerPersonId: {}
  },
  data() {
    return {
      addWhiteListvisible: false,
      type: Object.keys(addTypeEnum)[0],
      addTypeEnum
    }
  },
  methods: {
    async handleJoinWhiteList() { // 加入白名单
      try {
        await addWhiteList({
          customerPersonId: this.customerPersonId,
          type: this.type
        })
        this.$message.success('加入成功')
        this.addWhiteListvisible = false
        this.$emit('refresh')
      } catch (error) {
        return
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .action {
    text-align: right;
    margin: 0;
  }
  .slot {
    display: inline-block;
  }
  .el-radio+.el-radio {
    margin-left: 15px;
  }
  .el-radio-group {
    margin: 10px 0 5px 0;
  }
</style>

