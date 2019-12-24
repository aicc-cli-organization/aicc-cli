<template>
  <div>
    <new-pagination-table
      ref="table"
      :url="'/apiPlatform/robot/getRobot'"
      stripe
      :pageZero="false"
      :server="'engine'"
      :max-height="clientHeight - 176"
    >
      <el-table-column
        fixed
        prop="startTime"
        label="开始时间">
      </el-table-column>
      <el-table-column
        fixed
        prop="endTime"
        label="结束时间">
        <template slot-scope="{ row }">
          <div>
            {{row.endTime}}
            <el-tag v-if="row.expired" type="warning">已过期</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="usedTime"
        label="已使用时间（天）">
      </el-table-column>
      <el-table-column
        prop="count"
        label="数量">
      </el-table-column>
      <el-table-column
        prop="comment"
        label="备注">
      </el-table-column>
    </new-pagination-table>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import NewPaginationTable from '@/components/NewPaginationTable'
  import moment from 'moment'

  export default {
    components: {
      NewPaginationTable
    },
    computed: {
      ...mapGetters(['clientHeight'])
    },
    methods: {
      parseTime(time) {
        return moment(time).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  }
</script>

<style scoped>

</style>
