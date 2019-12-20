<template>
  <div class="multiple-filter">
    <div class="filter-item">
      <div class="label text-label">最近通话状态：</div>
      <el-checkbox
        :indeterminate="isIndeterminate"
        v-model="checkAll"
        @change="handleCheckAllChange"
        style="margin-bottom:0"
        >全部</el-checkbox>
      <el-checkbox-group v-model="checkList">
        <el-checkbox
          v-for="(item, index) in resultStatusMultipleOptions"
          :label="item.value"
          :key="index"
          :title="item.label"
          :value="item.label">
          {{item.label}}
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script>
  import { resultStatusMultipleOptions } from '@/utils/constant'

  export default {
    name: 'callStatusFilter',
    props: {
      value: {}
    },
    data() {
      return {
        resultStatusMultipleOptions: [
          ...resultStatusMultipleOptions,
          ...[
            {
              value: 'CALL_LOSS',
              label: '多并发呼损'
            }, {
              value: 'TRANSFER_ARTIFICIAL',
              label: '转人工呼损'
            }
          ]
        ],
        checkAll: false
      }
    },
    computed: {
      checkList: {
        get: function() {
          return this.value
        },
        set: function(val) {
          this.$emit('input', val)
          this.$emit('change', val)
        }
      },
      isIndeterminate() {
        const checkedCount = (this.checkList || []).length
        return checkedCount > 0 && checkedCount < this.resultStatusMultipleOptions.length
      }
    },
    watch: {
      checkList(newValue) {
        const checkedCount = (this.checkList || []).length
        this.checkAll = checkedCount === this.resultStatusMultipleOptions.length
      }
    },
    methods: {
      handleCheckAllChange(val) {
        this.checkList = val ? this.resultStatusMultipleOptions.map(item => item.value) : []
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '../filter.scss';
  .multiple-filter {
    padding: 8px 0px;
    margin: 0 14px 8px;
    background: #f7f7f7;
    /deep/ .el-checkbox {
      margin-bottom:5px
    }
    /deep/ .el-checkbox-group {
      margin-top: 6px;
    }
  }
</style>


