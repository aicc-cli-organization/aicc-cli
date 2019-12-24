<template>
  <div id="system-announcement">
    <yiwise-dialog
      :title="title"
      width="620px"
      :visible.sync="dialogVisible"
      @close="close()"
      :inPopover="inPopover"
      @confirm="handleConfirm()"
    >
      <div class="mb30">
        {{message}}
      </div>
    </yiwise-dialog>
    <message-pagination-table
      :url="url"
      ref="table"
      :type="type"
      :appType="appType"
      :inPopover="inPopover"
      @showDialog="showDialog"
      @HIDE_SYSTEM_ANNOUNCEMENT_DOT="$emit('HIDE_SYSTEM_ANNOUNCEMENT_DOT')"
      @HIDE_WARNNING_MESSAGE_DOT="$emit('HIDE_WARNNING_MESSAGE_DOT')">
    </message-pagination-table>
  </div>
</template>
<script>
import YiwiseDialog from '@aicc/components/YiwiseDialog'
import messagePaginationTable from '../messagePaginationTable'

export default {
  components: {
    messagePaginationTable,
    YiwiseDialog
  },
  props: {
    type: {
      type: String,
      default() {
        return undefined
      }
    },
    inPopover: {
      type: Boolean,
      default: false
    },
    appType: {
      // 区分crm和ope应用
      validator(value) {
        return ['crm', 'ope', 'boss'].indexOf(value) !== -1
      },
      default: 'crm'
    }
  },
  data() {
    return {
      title: undefined,
      dialogVisible: false,
      list: [],
      message: undefined,
      internalCurrentSize: 20,
      internalCurrentPage: 1
    }
  },
  computed: {
    url() {
      if (this.type === 'warnningMessage') {
        return this.appType === 'crm'
          ? '/apiEngine/messageQueue/listAll'
          : '/apiBoss/msgNotify/getAlertMsgList' // 目前只区分crm和boss两种
      } else {
        return this.appType === 'crm'
          ? '/apiEngine/announcement/getAll'
          : '/apiBoss/msgNotify/getSystemMsgList' // 目前只区分crm和boss两种
      }
    }
  },
  methods: {
    handleCurrentChange() {},
    handleSizeChange() {},
    loadData() {
      this.$refs.table.loadData()
    },
    close() {},
    handleConfirm() {
      this.dialogVisible = false
    },
    showDialog(text, title) {
      this.message = text
      this.dialogVisible = true
      this.title = title || this.title
    }
  }
}
</script>
<style lang="scss" scoped>
#system-announcement {
  margin-bottom: 20px;

  /deep/ .el-dialog__body {
    padding: 0 30px 0 30px !important;
  }
}
</style>
