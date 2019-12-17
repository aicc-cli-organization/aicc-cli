<template>
    <div id="customer-concern-tags" :class="{large: area=='LARGE', normal: area=='NORMAL'}">
      <el-tag v-for="(index, item) in customerConcern" :key="index">{{item}}</el-tag>
      <el-tag v-if="customerConcern.length==0">暂无关注点</el-tag>
    </div>
</template>

<script>
export default {
  props: {
    customerConcern: {
      type: Array,
      default() {
        return ['暂无关注点']
      }
    },
    area: {
      type: String,
      default: 'NORMAL'
    }
  }
}
</script>

<style scoped>
/deep/ .el-tag{
  margin: 10px 10px 0 0;
}
.normal {
  height: 140px;
}
.large {
  height: 239px;
}
  #customer-concern-tags{
    padding: 0 0 0 10px;
    overflow: hidden;
  }
  /deep/ .el-tag {
    width: 70px;
    height: 26px;
    box-sizing: content-box;
    text-align: center;
    line-height: 26px;
    color: #333;
    border: 1px solid #d3d4de;
  }
</style>
