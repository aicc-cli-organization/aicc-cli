<template>
  <nlp-dialog v-bind="$attrs" :enableCs="enableCsTransfer || enableCsTransferTel">
    <div slot="history">
      <history
        v-bind="$attrs"
        :type="'wordsTraining'"
        url="/apiEngine/callRecord/getInfoListFromTraining"
        nlp
      ></history>
    </div>
  </nlp-dialog>
</template>

<script>
import { NlpDialog } from 'yiwise-components'
import { mapGetters } from 'vuex'
import History from './history'

export default {
  components: {
    NlpDialog,
    History
  },
  computed: {
    ...mapGetters(['enableCsTransfer', 'enableCsTransferTel'])
  }
}
</script>
