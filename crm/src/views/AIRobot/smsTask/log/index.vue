<template>
  <div class="sub-page-operation-log">
    <log-filter  :paging-params.sync="pagingParams"></log-filter>
    <operation-log-table :pagingParams="pagingParams"></operation-log-table>
  </div>
</template>

<script>
import LogFilter from './filter'
import OperationLogTable from './table'

export default {
  data() {
    return {
      pagingParams: undefined
    }
  },
  components: {
    LogFilter,
    OperationLogTable
  }
}
</script>

<style lang="scss" scoped>
.sub-page-operation-log {
  height: 100%;
  background-color: white;
  padding: 10px;
}
</style>

