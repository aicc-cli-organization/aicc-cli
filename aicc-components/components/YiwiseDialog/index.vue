<template>
  <el-dialog
    v-bind="$attrs"
    :title="title"
    :width="$attrs.width || '620px'"
    :visible.sync="innerVisible"
    :close-on-click-modal="false"
    :modal="!inPopover"
    :append-to-body="true"
    @open="handleDialogOpen"
    @close="handleDialogClose"
    :class="[verticalAlign === 'middle' ? 'yiwise-dialog-middle' : 'yiwise-dialog-top', longer ? 'longer' : '']"
  >
    <template slot="title">
      <slot name="title"></slot>
    </template>
    <slot></slot>
    <div slot="footer" class="dialog-footer" v-if="hasFooter">
      <el-button v-if="hasConfirm"
        type="primary"
        @click="confirmBtn()"
        :loading="loading"
      >
        {{confirmWord}}
      </el-button>
      <el-button @click="cancelBtn()" v-if="hasCancel">{{cancelWord}}</el-button>
    </div>
    <div slot="footer" class="dialog-footer" v-else-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'YiwiseDialog',
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
      formLabelWidth: '80px'
    }
  },
  props: {
    title: String,
    inPopover: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    },
    hasFooter: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    verticalAlign: {
      // 垂直方向对齐方式
      validator(value) {
        return ['middle', 'top'].indexOf(value) !== -1
      },
      default: 'top'
    },
    confirmWord: {
      type: String,
      default: '确定'
    },
    cancelWord: {
      type: String,
      default: '取消'
    },
    hasCancel: {
      type: Boolean,
      default: true
    },
    hasConfirm: {
      type: Boolean,
      default: true
    },
    // 上下padding更大的dialog
    longer: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    confirmBtn() {
      this.$emit('confirm')
    },
    cancelBtn() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    },
    handleDialogOpen() {
      this.$emit('open')
    },
    handleDialogClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@aicc/styles/variables.scss';

.yiwise-dialog-top {
  /deep/ .el-dialog {
    transform: none;
    left: 0;
    position: relative;
    margin: 0 auto;
  }
}
.yiwise-dialog-middle {
  /deep/ .el-dialog {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
  }
}
/deep/ .el-dialog__body {
  max-height: 600px;
  overflow: auto;
  padding: 0 22%!important;
  font-size: $--font-size-small;
  color: $--color-text-primary;
}
/deep/ .el-dialog__footer {
  border-top: 1px solid #d0d6e2;
  padding: 12px 20px 12px 0;
  line-height: 0 !important;
}
/deep/ .el-dialog__title{
  font-size: 14px!important;
  font-weight: 700;

}

/deep/ .el-dialog__header{
  padding: 12px 20px;
  background: #f7f7f7;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
}
.longer {
  /deep/ {
    .el-dialog__header {
      margin-bottom: 61px;
    }
    .el-dialog__body {
      padding: 0 136px 60px 122px!important;
    }
  }
}

/deep/ .el-dialog__headerbtn {
  position: absolute;
  top: 12px;
  right: 18px;
  padding: 0;
  background: 0 0;
  border: none;
  outline: 0;
  cursor: pointer;
  font-size: 18px;
  i {
    color: $--color-text-regular;
  }
}
</style>
