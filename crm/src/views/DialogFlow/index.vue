<template>
  <dialog-flow v-bind="$attrs" :enableCs="enableCsTransfer || enableCsTransferTel" @environmentTest="environmentTest">
    <div slot="history">
      <history v-bind="$attrs" :type="'wordsTraining'" url="/apiEngine/callRecord/getInfoListFromTraining"></history>
    </div>
  </dialog-flow>
</template>

<script>
import { DialogFlow } from 'yiwise-components'
import History from './history'
import { mapGetters } from 'vuex'

export default {
  components: {
    DialogFlow,
    History
  },
  computed: {
    ...mapGetters(['enableCsTransfer', 'enableCsTransferTel', 'hasEnvironmentTest'])
  },
  methods: {
    environmentTest(hasTest) {
      this.hasEnvironmentTest = hasTest
      this.$store.commit('SET_ENVIRONMENT', hasTest)
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .talk-detail {
  flex: 1;
  .el-tab-pane {
    width: 100%;
  }
}
</style>
