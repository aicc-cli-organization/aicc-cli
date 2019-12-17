<template>
  <div class="descpition">
    <span class="label">任务描述:</span> 
    <div class="value">{{robotCallJobDetail.robotCallJob.description || '暂无描述'}}</div>
  </div>
</template>

<script>
export default {
  props: {
    robotCallJobDetail: {
      type: Object,
      default () {
        return {
          robotCallJob: {}
        }
      }
    }
  }

}
</script>

<style lang="scss" scoped>
.descpition {
  color: #666666;
  margin-top: 8px;
  white-space: normal;

  .label {
    float: left;
  }

  .value {
    margin-left: 65px;
    .span-item {
      display: inline-block;
      padding-right: 10px;
      border-right: 1px solid #d8d8d8;
      &:last-child {
        border-right: 0;
      }
    }
  }
}
</style>

