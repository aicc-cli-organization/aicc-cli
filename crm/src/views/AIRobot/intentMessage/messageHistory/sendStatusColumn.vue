<template>
  <span>
    <span v-if="sendStatus !== 'SEND_FAILURE' || !sendErrorMsg">{{constant.messageSendStatusENUM[sendStatus]}}</span>
    <el-popover
      v-if="sendStatus === 'SEND_FAILURE' && sendErrorMsg"
      placement="top"
      title=""
      width="160"
      trigger="hover"
      :content="sendErrorMsg">
      <span slot="reference" class="operation" v-if="sendStatus === 'SEND_FAILURE' && sendErrorMsg">{{constant.messageSendStatusENUM[sendStatus]}}</span>
    </el-popover>
  </span>
</template>

<script>
import * as constant from '@/utils/constant'

export default {
  props: {
    sendStatus: String,
    sendErrorMsg: String  
  },
  data() {
    return {
      constant
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
@import 'src/styles/placeholder.scss';

.operation {
  @extend %tableAction;
}
</style>
