<template>
  <div class="lines">
    <el-tabs>
      <el-tab-pane label="外呼与接听">
        <call-and-answer-total
        :title="'外呼和接听总量'"
        :unit="'次'"
        :stats="fullStatsInfo.callJobStatsBrokenLine"></call-and-answer-total>
      </el-tab-pane>
      <el-tab-pane label="接听率">
        <answer-ratio
          :stats="fullStatsInfo.callJobStatsBrokenLine"></answer-ratio>
      </el-tab-pane>
      <el-tab-pane label="通话时长">
        <total-and-average-duration
          :title="'总通话时长和平均通话时长'"
          :unit="'秒'"
          :stats="fullStatsInfo.callJobStatsBrokenLine"></total-and-average-duration>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import CallAndAnswerTotal from '@/components/Charts/callAndAnswerTotal'
import AnswerRatio from '@/components/Charts/answerRatio'
import TotalAndAverageDuration from '@/components/Charts/totalAndAverageDuration'

export default {
  props: {
    fullStatsInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components: {
    CallAndAnswerTotal,
    AnswerRatio,
    TotalAndAverageDuration
  }
}
</script>

<style lang="scss" scoped>
.lines {
  margin-top: 20px;
  background-color: white;

  /deep/ .el-tabs__content {
    padding-top: 33px;
  }
}
</style>
