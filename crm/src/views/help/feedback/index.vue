<template>
  <div id="feedback">
    <el-tabs class="shadow-box" v-model="activeName">
      <el-tab-pane label="过往反馈" name="first">
        <past-feedback v-if="activeName=='first'" ref='uncompleted'></past-feedback>
      </el-tab-pane>
      <el-tab-pane label="问题反馈" name="second" lazy>
        <issue-feedback
        @shiftTab="shiftTab" v-if="activeName=='second'" ></issue-feedback>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import issueFeedback from './components/issueFeedback'
import pastFeedback from './components/pastFeedback'

export default {
  name: 'speechCraft',
  components: {
    issueFeedback,
    pastFeedback
  },
  data() {
    return {
      activeName: 'first'
    }
  },
  created() {
  },
  computed: {
  },
  methods: {
    shiftTab() {
      this.activeName = 'first'
    }
  }
}
</script>

<style lang="scss" scoped>
  #feedback {
    height: 100%;
    background: #fff;
  }
  #feedback .el-tabs{
    background: #fff;
  }

  #feedback .el-tabs__nav {
    left: 20px;
  }
  .el-tabs .el-tabs__item /deep/{
    font-size: 14px !important;
  }
</style>
