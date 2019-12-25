<template>
  <div id="task-layout">
    <div id="task-filter" v-if="!noFilter">
      <slot name="filter"></slot>
    </div>
    <div id="task-content">
      <div id="task-content-left">
        <slot name="left"></slot>
      </div>
      <div id="task-content-right">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    noFilter: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
#task-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  #task-filter {
    min-height: 32px;
  }
  #task-content {
    margin-top: 10px;
    flex: 1;
    display: flex;
    overflow: auto;
    #task-content-left {
      width: 260px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    #task-content-right {
      flex: 1;
      height: 100%;
      margin-left: 20px;
      overflow-x: hidden;
    }
  }
}
</style>
