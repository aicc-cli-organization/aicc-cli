<template>
  <yiwise-dialog
    class="distribute-dialog"
    title="转移"
    width="850px"
    :visible.sync="innerVisible"
    @confirm="handleSubmit"
  >
    <translate
      ref="translate"
      :visible="innerVisible"
      :assignCount="distributeType === 'BY_SELECTION' ? customerPersonIds.length : total"
      :disabledUserId="paginationParams.filterFollowUserId || userId"
    >
    </translate>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import Translate from '@/business/Translate'
import { mapGetters } from 'vuex'
import { distributeDirect, distributeAverage } from '@/api/customer'

export default {
  name: 'DistributeDialog',
  components: {
    YiwiseDialog,
    Translate
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    customerPersonIds: {
      type: Array,
      default() {
        return []
      }
    },
    distributeType: {
      type: String,
      default: 'BY_SELECTION'
    },
    paginationParams: {
      type: Object,
      default() {
        return {}
      }
    },
    total: {
      type: Number,
      default: 0
    }
  },
  computed: {
    ...mapGetters(['userId']),
    innerVisible: {
      get() {
        return this.visible
      },
      set(newVisible) {
        this.$emit('update:visible', newVisible)
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.translate.validate(async value => {
        if (value) {
          let params = {
            customerPersonListType: 'PRIVATE_LIST'
          }
          if (this.distributeType === 'BY_SELECTION') {
            params.customerPersonIds = this.customerPersonIds
          } else {
            params = {
              ...params,
              ...this.paginationParams
            }
          }
          if (value.type === 'direct') { // 直接分配
            params.transferInfoList = value.data
            await distributeDirect(params)
          } else {
            params.userIds = value.data
            await distributeAverage(params)
          }
          this.$message.success('转移成功')
          this.innerVisible = false
          this.$emit('success')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .distribute-dialog {
    /deep/ .el-dialog__body {
      padding: 0 14px!important;
    }
  }
</style>

