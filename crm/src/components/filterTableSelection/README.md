# 表单行数据条件筛选

# 参数
参数       说明           类型      可选值      默认值
filters   筛选内容项      array
multiple  是否能多选      boolean               true

# 事件
事件名称          说明               回调参数
filter-success   筛选条件变化触发     多选框的选中值 

# 插槽(Slot)
方法名     说明
title      表头项内容

demo:
<template slot="header">
  <filter-table-selection
    :filters="filters"
    @filter-success="filterSuccess"
  >
    <span slot="title">
      发票状态
    </span>
  </filter-table-selection>
</template>
<script>
  export default {
    data() {
      return {
        filters: [
          { text: '已寄出', value: '0' },
          { text: '已申请', value: '1' },
          { text: '开发票', value: '2' }
        ]
      }
    },
    methods: {
      filterSuccess(checkList) {
        
      }
    }
</script>