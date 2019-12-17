<template>
  <div class="" style="padding: 0 12px">
    <el-table
      stripe
      border
      :data="tableStats"
      style="width: 100%">
      <el-table-column
        prop="hours"
        label="时间段"
        width="200">
      </el-table-column>
      <el-table-column
        prop="call"
        label="外呼次数（通）"
        width="250">
        <template slot-scope="scope">
          <span :class="{red: scope.row.call == maxCall && scope.row.call != 0}">
            {{scope.row.call || '--'}}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="answer"
        label="接听率（%）"
        width="200">
        <template slot-scope="scope">
          <span :class="{red: scope.row.answer == maxAnswer && scope.row.answer != 0}">
            {{scope.row.call == 0 ? '--' : scope.row.answer}}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="duration"
        label="平均通话时长（s）"
        width="200">
        <template slot-scope="scope">
          <span :class="{red: scope.row.duration == maxDuration && scope.row.duration != 0}">
            {{scope.row.call == 0 ? '--' : scope.row.duration}}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="ABRatio"
        label=""
      >
        <template slot="header" slot-scope="scope">
          重点关注{{customerStr}}占比（%）
        <el-popover
            title="提示"
            trigger="hover"
            placement="right"
            width="420"
          >
          <i class="el-icon-question const-icon-tip" slot="reference"></i>
          <div>重点关注{{customerStr}}意向为“{{firstTag}}”“{{secondTag}}”</div>
        </el-popover>
      </template>
        <template slot-scope="scope">
          <span :class="{red: scope.row.ABRatio == maxABRatio && scope.row.ABRatio != 0}">
            {{scope.row.call == 0 ? '--' : scope.row.ABRatio}}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  export default {
    props: {
      stats: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      return {
        maxCall: null,
        maxAnswer: null,
        maxDuration: null,
        maxABRatio: null,
        tableStats: [],
        firstTag: undefined,
        secondTag: undefined
      }
    },
    computed: {
      ...mapGetters([
        'customerStr'
      ])
    },
    watch: {
      stats: {
        handler: function(val) {
          if (JSON.stringify(val) === '{}') {
            return
          }
          this.maxAnswer = Math.max(...val.answeredTaskRateTimeList)
          this.maxDuration = Math.max(...val.averageDurationTimeList)
          this.maxABRatio = Math.max(...val.customerABPercentTimeList)
          this.maxCall = Math.max(...val.taskCallTotalTimeList)
          this.firstTag = val.intentLevelTagDetailList && val.intentLevelTagDetailList[0].name || '--'
          this.secondTag = val.intentLevelTagDetailList && val.intentLevelTagDetailList[1].name || '--'
          this.tableStats = []
          const startHour = val.activeHour[0]
          const endHour = val.activeHour[1] -1
          for (let i = startHour; i <= endHour; i++) {
            this.tableStats.push({
              hours: '' + i + ':00-' + (i + 1) + ':00',
              call: val.taskCallTotalTimeList[i],
              answer: val.answeredTaskRateTimeList[i],
              duration: val.averageDurationTimeList[i],
              ABRatio: val.customerABPercentTimeList[i]
            })
          }
        },
        deep: true
      }
    }
  }
</script>
<style scoped>
.red {
  color: red;
}
</style>
