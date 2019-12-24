<template>
  <el-popover
    v-model="visible"
    trigger="hover"
    popper-class="global-popover_topnav-system"
    :visible-arrow="false"
    placement="bottom-start"
  >
    <span
      class="reference"
      :class="{'is-active': visible}"
      slot="reference"
    >
      {{menuTypeName}}
      <i class="el-icon-arrow-down const-icon-down"></i>
    </span>
    <div
      class="system-item"
      v-for="(subMenuItem, subMenuIndex) in subMenuList"
      :key="subMenuIndex"
    >
      <a
        class="system-item_link"
        @click="handleJump(subMenuItem)"
      >{{subMenuItem.text}}</a>
    </div>
  </el-popover>
</template>

<script>
export default {
  props: {
    menuTypeName: String,
    subMenuList: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      visible: false
    }
  },

  methods: {
    handleJump(subMenuItem) {
      // 判断是否开通该模块
      // this.$message.info('未开通该模块，请联系客户经理开通')
      location.href = subMenuItem.url
    }
  }
}
</script>

<style lang="scss" scoped>
.reference {
  display: inline-block;
  padding: 0 30px;
  line-height: 46px;
  &.is-active {
    color: #fff;
    background: #55607d;
    .const-icon-down {
      transform: rotate(180deg);
    }
  }
  .const-icon-down {
    margin-left: 5px;
    transition: transform ease .2s;
  }
}
</style>

<style lang="scss">
.global-popover_topnav-system {
  padding: 0;
  margin-top: 0 !important;
  .system-item {
    .system-item_link {
      display: inline-block;
      width: 100%;
      height: 48px;
      line-height: 48px;
      padding: 0 10px;
      color: #fff;
      background: #55607d;
      &:hover {
        background-color: #55607d;
      }
    }
  }
}
</style>
