<template>
  <pagination-table
    ref="table"
    url="/apiEngine/operationLog/jobLogList"
    :autoLoad="false"
    :headers="{
      'Content-Type': 'application/json'
    }"
    :max-height="clientHeight - 255"
  >
    <yiwise-table-column
      prop="operationType"
      label="操作类型"
    >
      <template slot-scope="scope">
        {{LOG_TYPE_ENUM[scope.row.operationType]}}
      </template>
    </yiwise-table-column>
    <yiwise-table-column
      prop="createdByUserName"
      label="执行者"
    >
    </yiwise-table-column>
    <yiwise-table-column
      prop="createTime"
      label="执行时间"
    >
    </yiwise-table-column>
  </pagination-table>
</template>

<script>
import { PaginationTable, YiwiseTableColumn } from 'yiwise-components'
import { mapGetters } from 'vuex'
import { LOG_TYPE_ENUM } from '../config/enum'

export default {
  props: {
    pagingParams: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      paginationParams: {
        pageNum: 1,
        pageSize: 20
      },
      LOG_TYPE_ENUM
    }
  },
  computed: {
    ...mapGetters([
      'clientHeight'
    ]),
    selectTaskId() {
      return this.$store.state.taskV2.selectTaskId
    }
  },
  components: {
    PaginationTable,
    YiwiseTableColumn
  },
  methods: {
    loadData(params = {}) {
      if (!this.selectTaskId) {
        return
      }
      params = {
        ...this.paginationParams,
        ...params,
        refId: this.selectTaskId
      }
      this.$refs.table.loadData(params)
    }
  },
  mounted() {
    this.loadData()
  },
  watch: {
    pagingParams: {
      handler(value) {
        this.loadData(value)
      },
      deep: true
    },
    selectTaskId() {
      this.loadData()
    }
  }
}
</script>
