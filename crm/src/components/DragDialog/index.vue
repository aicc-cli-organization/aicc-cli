<template>
  <div
    ref="wrap"
    class="drag-dialog"
    v-show="innerVisible"
    :style="wrapStyle"
  >
    <div
      class="header"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
    >
      <span>
        <slot name="title"></slot>
      </span>
      <i v-if="showCloseIcon" class="el-icon-close" @click.stop="handleCloseClick"></i>
    </div>
    <slot name="body"></slot>
  </div>
</template>

<script>
export default {
  name: 'DragDialog',
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '418px'
    },
    showCloseIcon: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newVisible) {
        this.$emit('update:visible', newVisible)
      }
    }
  },
  data() {
    return {
      wrapStyle: {
        width: this.width
      },
      startMouseX: 0,
      startMouseY: 0,
      startModalLeft: 0,
      startModalTop: 0
    }
  },
  methods: {
    handleCloseClick() {
      this.innerVisible = false
    },
    handleMouseDown(e) { // 按下鼠标记录当前位置
      this.startMouseX = e.clientX
      this.startMouseY = e.clientY
      const { offsetParent } = e.currentTarget
      this.startModalLeft = offsetParent.offsetLeft
      this.startModalTop = offsetParent.offsetTop
      const { wrap } = this.$refs
      if (wrap) {
        document.body.addEventListener('mousemove', this.handleMouseMove)
      }
    },
    handleMouseMove(e) {
      // console.log(e.clientY, this.startMouseY)
      this.wrapStyle = {
        width: this.width,
        top: e.clientY - this.startMouseY + this.startModalTop + 'px',
        left: e.clientX - this.startMouseX + this.startModalLeft + 'px'
      }
    },
    handleMouseUp() {
      const { wrap } = this.$refs
      if (wrap) {
        document.body.removeEventListener('mousemove', this.handleMouseMove)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';

  .drag-dialog {
    position: fixed;
    z-index: $--index-popper;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: $--color-white;
    box-shadow: 2px 2px 24px 0px rgba(149,149,149,0.5);
    border-top-left-radius: $--border-radius-large;
    border-top-right-radius: $--border-radius-large;
    > .header {
      position: relative;
      font-size: $--font-size-base;
      padding: 14px;
      background: $--color-primary;
      color: $--color-white;
      border-top-left-radius: $--border-radius-large;
      border-top-right-radius: $--border-radius-large;
      > span {
        font-weight: $--font-weight-medium;
      }
      > i {
        cursor: pointer;
        position: absolute;
        right: 14px;
        top: 15px;
      }
    }
  }
</style>
