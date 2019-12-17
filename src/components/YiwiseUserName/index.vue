<template>
  <div class="name-container">
    {{name || emptyPlaceholder}}
    <i
      v-if="inShareWhiteList"
      class="iconfont icon-gongxiangbaimingdanx const-icon-share"
    ></i>
    <img v-if="!inShareWhiteList && inWhiteList" src="/static/img/kehu_baimingdan.png">
  </div>
</template>

<script>
import { emptyPlaceholder } from '@/utils/constant'
export default {
  name: 'YiwiseUserName',
  data() {
    return {
      emptyPlaceholder
    }
  },
  props: {
    name: {
      type: String,
      default: emptyPlaceholder
    },
    inWhiteList: {
      type: Boolean,
      default: false
    },
    inShareWhiteList: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
  .name-container {
    display: flex;
    align-items: center;
    img {
      width: 16px;
      height: 16px;
      margin-left: 5px;
      flex-shrink: 0;
    }
    .const-icon-share {
      margin-left: 5px;
      color: #666666;
    }
  }
</style>

