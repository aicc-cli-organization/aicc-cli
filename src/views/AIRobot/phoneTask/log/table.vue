<template>
  <pagination-table
    class="table"
    ref="table"
    url="/apiEngine/operationLog/jobLogList"
    :data="tableData.content"
    :autoLoad="false"
    :headers="{
      'Content-Type': 'application/json'
    }"
    @current-change="handleCurrentChange"
    @size-change="handleSizeChange"
    :max-height="clientHeight - 255"
  >
    <el-table-column
      prop="operationType"
      label="操作类型"
      width="">
      <template slot-scope="scope">
        {{config.OPERATION_TYPE_TEXT[scope.row.operationType]}}
      </template>
    </el-table-column>
    <el-table-column
      prop="createdByUserName"
      label="执行者"
      width="">
    </el-table-column>
    <el-table-column
      prop="createTime"
      label="执行时间"
      width="">
    </el-table-column>
  </pagination-table>
</template>

<script>
import { PaginationTable } from 'yiwise-components'
import { mapGetters } from 'vuex'
import {
  OPERATION_TYPE_TEXT
} from './config'

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
      tableData: {},
      config: {
        OPERATION_TYPE_TEXT
      }
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
    PaginationTable
  },
  methods: {
    handleCurrentChange(page) {
      this.loadData({
        pageNum: page
      })
    },
    handleSizeChange(size) {
      this.loadData({
        pageSize: size
      })
    },
    loadData(params = {}, cb) {
      if (!this.selectTaskId) {
        return
      }
      params = {
        ...this.paginationParams,
        ...params,
        refId: this.selectTaskId
      }
      this.$refs.table.loadData(params, tableData => {
        this.tableData = tableData
        if (cb) {
          cb()
        }
      })
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
