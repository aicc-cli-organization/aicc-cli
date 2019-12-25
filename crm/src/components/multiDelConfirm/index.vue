<template>
  <yiwise-pop-confirm
    trigger="manual"
    :visible="multiDelPopConfirmVisible"
    :label="`确定删除所选${customerStr}？`"
    @submit="handleSubmit"
    @cancel="multiDelPopConfirmVisible = false"
  >
    <el-button type="primary" class="right-item" @click="handleDelClick">批量删除</el-button>
  </yiwise-pop-confirm>
</template>

<script>
import { YiwisePopConfirm } from 'yiwise-components'
import { mapGetters } from 'vuex'
export default {
  components: { YiwisePopConfirm },
  props: {
    multipleSelection: {
      type: Array,
      default: () => []
    },
    onSubmit: {
      type: Function,
      default: async () => {}
    }
  },
  data() {
    return {
      multiDelPopConfirmVisible: false
    }
  },
  computed:{
    ...mapGetters(['customerStr'])
  },
  methods: {
    handleDelClick() {
      if (!this.multipleSelection || !this.multipleSelection.length) {
        this.$message.error(`请先选择${this.customerStr}`)
      } else {
        this.multiDelPopConfirmVisible = true
      }
    },
    async handleSubmit() {
      await this.onSubmit()
      this.multiDelPopConfirmVisible = false
    }
  }
}
</script>

