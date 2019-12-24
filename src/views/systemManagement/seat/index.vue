<template>
  <div id="task-detail" class="yw-container">
    <el-tabs class="shadow-box" v-model="activeName">
      <el-tab-pane label="AI坐席" name="seatInfo" v-if="hasAccess('crm_AISeat_view')">
        <seat-info v-if="activeName=='seatInfo'"></seat-info>
      </el-tab-pane>
      <el-tab-pane label="人工坐席" name="csSeat" v-if="enableCsSeat && hasAccess('crm_cusSeat_view')">
        <cs-seat v-if="activeName=='csSeat'"></cs-seat>
      </el-tab-pane>
      <el-tab-pane label="坐席组" name="seatGroup" v-if="enableCsSeat && hasAccess('crm_seatGroup_view')">
        <seat-group v-if="activeName=='seatGroup'"></seat-group>
      </el-tab-pane>
      <!-- <el-tab-pane label="线路列表" name="numberList" v-if="hasAccess('crm_lineList_view')">
        <number-list v-if="activeName=='numberList'"></number-list>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
  import csSeat from './components/csSeat'
  import seatGroup from './components/seatGroup'
  import numberList from './components/numberList'
  import SeatInfo from './components/seatInfo'
  import { mapGetters } from 'vuex'

  export default {
    name: 'speechCraft',
    computed: {
      ...mapGetters(['enableCsSeat', 'enableCsTransfer', 'enableCsTransferTel', 'enableCallIn']),
      taskId() {
        return this.$store.state.task.taskId
      }
    },
    components: {
      csSeat,
      SeatInfo,
      numberList,
      seatGroup
    },
    data() {
      return {
        activeName: 'seatInfo'
      }
    },
    created() {
    },
    methods: {
      handleClick() {}
    },
    mounted() {
      if (!this.hasAccess('crm_AISeat_view')) {
        if (this.enableCsSeat && this.hasAccess('crm_cusSeat_view')) {
          this.activeName = 'csSeat'
        } else if (this.enableCsSeat && this.hasAccess('crm_seatGroup_view')) {
          this.activeName = 'seatGroup'
        } else if (this.hasAccess('crm_lineList_view')) {
          this.activeName = 'numberList'
        }
      }
    }
  }
</script>

<style lang="scss">
  #task-detail {
    height: 100%;
  }
  #task-detail .el-tabs{
    background: #fff;
  }
</style>
