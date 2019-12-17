<template>
  <div id="task-detail">
    <el-tabs class="shadow-box" v-model="activeName">
      <el-tab-pane label="意向分析" name="first" lazy v-if="hasAccess('crm_intentionAnals_view')">
        <intent-analysis @update="update" @refresh="refreshUncompleted"></intent-analysis>
      </el-tab-pane>
      <el-tab-pane label="时段分析" name="second" v-if="hasAccess('crm_timeAnals_view')">
        <data-by-hour-analysis v-if="activeName=='second'" ref='uncompleted'></data-by-hour-analysis>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import intentAnalysis from './components/intentAnalysis'
import dataByHourAnalysis from './components/dataByHourAnalysis'

export default {
  name: 'speechCraft',
  components: {
    intentAnalysis,
    dataByHourAnalysis
  },
  data() {
    return {
      activeName: 'first'
    }
  },
  created() {
    if (!this.hasAccess('crm_intentionAnals_view')) {
      this.activeName =  'second'
    }
  },
  computed: {
    robotCallJobId() {
      return this.$store.state.task.robotCallJobId
    }
  },
  methods: {
    update() {
      this.$emit('update')
    },
    refreshUncompleted() {
      this.$refs.uncompleted.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
  #task-detail .el-tabs{
    background: #fff;
  }

  #task-detail .el-tabs__nav {
    left: 20px;
  }
  .el-tabs .el-tabs__item /deep/{
    font-size: 14px !important;
  }
</style>
