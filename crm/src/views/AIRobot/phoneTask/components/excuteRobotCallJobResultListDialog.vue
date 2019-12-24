<template>
  <yiwise-dialog
    :visible.sync="innerVisible"
    confirm-word="我知道了"
    @confirm="innerVisible = false"
  >
    <span slot="title" class="title">
      <i class="iconfont icon-tishix"></i>
      <span>以下任务操作失败</span>
    </span>
    <el-table :data="list" height="230">
      <el-table-column
        label="任务名称"
        prop="robotCallJobName"
      ></el-table-column>
      <el-table-column
        label="失败原因"
        prop="msg"
      ></el-table-column>
    </el-table>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  components: {
    YiwiseDialog
  },
  data() {
    return {
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
  watch: {
    visible(value) {
      if (!value) {
        this.$emit("update:list", [])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__header {
  margin-bottom: 0;
}

/deep/ .el-dialog__body {
  padding: 20px !important;
}

.title {

  i {
    color: #E4B03F;
    vertical-align: middle;
  }
}
</style>

