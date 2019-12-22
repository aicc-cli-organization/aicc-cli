<template>
  <el-tabs class="yw-container">
    <el-tab-pane label="外呼历史">
      <page-component v-if="callOutType === 'AI_CALL_OUT'" v-bind="$attrs" :type="'callTask'" url="/apiEngine/callRecord/getInfoListFromJob" key="AI_CALL_OUT">
        <call-out-type slot="typeSelect" :callOutType.sync="callOutType"></call-out-type>
      </page-component>
      <customer-sit v-if="callOutType === 'CS_CALL_OUT'" v-bind="$attrs" :type="'CS_CALL_OUT'" key="CS_CALL_OUT">
        <call-out-type slot="typeSelect" :callOutType.sync="callOutType"></call-out-type>
      </customer-sit>
      <page-component v-if="callOutType === 'FAST_CALL_OUT'" v-bind="$attrs" :type="'fastCall'" url="/apiEngine/callRecord/getInfoListFromDirectCall" key="FAST_CALL_OUT">
        <call-out-type slot="typeSelect" :callOutType.sync="callOutType"></call-out-type>
      </page-component>
    </el-tab-pane>
    <el-tab-pane label="呼入历史" lazy v-if="enableCallIn || enableIvr">
      <receptions v-if="callInType === 'AI_CALL_IN'" v-bind="$attrs" receptionType="AI" key="AI" seatType="AI">
        <call-in-type slot="typeSelect" :callInType.sync="callInType"></call-in-type>
      </receptions>
      <receptions v-if="callInType === 'CS_CALL_IN'" v-bind="$attrs" receptionType="person" key="CS" seatType="CS">
        <call-in-type slot="typeSelect" :callInType.sync="callInType"></call-in-type>
      </receptions>
      <receptions v-if="callInType === 'IVR_CALL_IN'" v-bind="$attrs" receptionType="IVR" key="IVR" seatType="IVR">
        <call-in-type slot="typeSelect" :callInType.sync="callInType"></call-in-type>
      </receptions>
    </el-tab-pane>
    <!-- <el-tab-pane label="AI外呼">
      <page-component v-bind="$attrs" :type="'callTask'" url="/apiEngine/callRecord/getInfoListFromJob"></page-component>
    </el-tab-pane>
    <el-tab-pane label="人工外呼" lazy v-if="userEnableCsSeat">
      <customer-sit v-bind="$attrs"></customer-sit>
    </el-tab-pane>
    <el-tab-pane label="AI接待" lazy v-if="enableCallIn">
      <receptions v-bind="$attrs" receptionType="AI"></receptions>
    </el-tab-pane>
    <el-tab-pane label="人工接待" lazy v-if="userEnableCsSeat && enableCallIn">
      <receptions v-bind="$attrs" receptionType="person"></receptions>
    </el-tab-pane>
    <el-tab-pane label="快速拨打" lazy>
      <page-component v-bind="$attrs" :type="'fastCall'" url="/apiEngine/callRecord/getInfoListFromDirectCall"></page-component>
    </el-tab-pane>
    <el-tab-pane label="话术训练" lazy>
      <page-component v-bind="$attrs" :type="'wordsTraining'" url="/apiEngine/callRecord/getInfoListFromTraining"></page-component>
    </el-tab-pane> -->
  </el-tabs>
</template>

<script>
  import pageComponent from './pageComponent'
  import customerSit from './customerSit'
  import receptions from './receptions'
  import CallOutType from './components/callOutType'
  import CallInType from './components/callInType'
  import { mapGetters } from 'vuex'

  export default {
    components: {
      pageComponent,
      customerSit,
      receptions,
      CallOutType,
      CallInType
    },
    computed: {
      ...mapGetters([
        'userEnableCsSeat',
        'enableCallIn',
        'enableIvr'
      ])
    },
    data() {
      return {
        callOutType: 'AI_CALL_OUT',
        callInType: 'AI_CALL_IN'
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/extend.scss';

  .yw-container {
    height: 100%;
    /deep/ .el-tabs__header {
      margin-bottom: 0;
    }
  }
</style>

