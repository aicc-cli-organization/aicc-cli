<template>
  <div class="collapse-item" :style="wrapStyle">
    <div class="header">
      <span>{{title || emptyPlaceholder}}</span>
      <i
        :class="isCollapse ? 'el-icon-caret-bottom' : 'el-icon-caret-top'"
        @click="handleToggleCollapse"
      >
      </i>
    </div>
    <div
      ref="content"
      class="content"
      :class="isCollapse ? 'collapse' : ''"
    >
      参考答案：{{answer || emptyPlaceholder}}
    </div>
  </div>
</template>

<script>
import { emptyPlaceholder } from '@/utils/constant'

export default {
  name: 'CollapseItem',
  props: {
    title: {
      type: String,
      default: ''
    },
    answer: {
      type: String,
      default: '测试测试测试测试测试'
    }
  },
  data() {
    return {
      isCollapse: true, // 是否收起，默认收起
      contentHeight: 0, // content高度
      wrapStyle: {
        height: '33px'
      },
      emptyPlaceholder
    }
  },
  watch: {
    isCollapse(newValue) {
      if (newValue) {
        this.wrapStyle = {
          height: '33px'
        }
      } else {
        this.wrapStyle = {
          height: (this.contentHeight + 33 + 10) + 'px'
        }
      }
    }
  },
  methods: {
    handleToggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  },
  mounted() {
    const { content } = this.$refs
    if (content) {
      this.contentHeight = content.clientHeight
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';

  .collapse-item {
    background: #f2f2f2;
    border-radius: $--border-radius-base;
    padding: 10px 0;
    transition: all .3s;
    height: 33px;
    overflow: hidden;
    > .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      > span {
        font-weight: $--font-weight-medium;
      }
      > i {
        cursor: pointer;
      }
    }
    > .content {
      padding: 10px;
      margin: 10px 8px 0 8px;
      background: $--color-primary;
      color: $--color-white;
      border-radius: $--border-radius-large;
      line-height: 18px;
    }
  }
</style>

