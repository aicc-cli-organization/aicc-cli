<template>
  <div class="sub-page-operation-log">
    <filter-bar
      :paging-params.sync="pagingParams"
    ></filter-bar>
    <operation-log-table :pagingParams="pagingParams"></operation-log-table>
  </div>
</template>

<script>
import FilterBar from './filterBar'
import OperationLogTable from './table'

export default {
  data() {
    return {
      pagingParams: undefined
    }
  },
  components: {
    FilterBar,
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

