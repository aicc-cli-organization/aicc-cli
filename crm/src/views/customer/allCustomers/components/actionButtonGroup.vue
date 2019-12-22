<template>
  <div class="table-top-action">
    <div class="action-left" v-if="hasAccess('crm_allCus_del')">
      <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
      <span class="checked-count ml5">已选中
        <span class="num">{{checkedCount}}</span>项
      </span>
    </div>

    <!-- 左浮 按钮组 -->
    <div class="title left ml15">
      <el-button type="primary" plain @click="$router.push('/customer/whiteList')" v-if="hasAccess('crm_whiteList_view')">{{customerStr}}白名单</el-button>
      <el-button type="primary" plain @click="$router.push('/customer/customerGroup')" v-if="hasAccess('crm_group_view')">{{customerStr}}分组</el-button>
    </div>

    <!-- 右浮 按钮组 -->
    <div class="title right">
      <div class="">
        <el-button type="primary" class="right-item" @click="handleBatchDel" v-if="hasAccess('crm_allCus_del')">批量删除</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import * as customerAPI from '@/api/customer'
import { mapGetters } from 'vuex'

export default {
  props: {
    checkedCount: {
      type: Number,
      default: 0
    },
    value: {
      type: Boolean,
      default: false
    },
    multipleSelection: {
      type: Array,
      default() {
        return []
      }
    },
    paginationParams: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    customerPersonIds() {
      return this.multipleSelection.map(item => item.customerPersonId)
    },
    allChecked: {
      get() {
        return this.value
      },
      set(newValue) {
        this.$emit('input', newValue)
      }
    }
  },
  methods: {
    handleAllChecked() {
      this.$emit('all-check')
    },
    async handleBatchDel() { // 批量删除
      if (this.allChecked) {
        await customerAPI.deleteCustomer({
          ...this.paginationParams,
          customerPersonListType: 'ADMIN_LIST'
        })
      } else {
        const customerPersonIds = this.customerPersonIds
        if (customerPersonIds.length === 0) {
          this.$message.error(`请先选择${this.customerStr}`)
          return
        }
        await customerAPI.deleteCustomer({
          customerPersonIds,
          customerPersonListType: 'ADMIN_LIST'
        })
      }

      this.$message.success('删除成功')
      this.$emit('loadData')
    }
  }
}
</script>


<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/placeholder.scss';
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .el-dialog{
    padding: 0px 0px;
  }

  .table-top-action {
    > span {
      @extend %tableAction;
    }
  }

  .preview {
    @extend %tableAction;
  }
</style>