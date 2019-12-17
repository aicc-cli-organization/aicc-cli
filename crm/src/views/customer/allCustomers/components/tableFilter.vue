<template>
  <div class="button-container">
    <el-form :inline="true" size="small" class="button-form-inline no-padding">
      <el-form-item>
        <option-search-input
          width="270px"
          ref="optionSearchInput"
          v-model="filterSearchWords"
          @search="search()"
          :option-list="optionList"
          option-width="110px"
        ></option-search-input>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          @change="search()"
          v-model="filterCreationTime"
          type="daterange"
          value-format="yyyy-MM-dd"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <group-list-select v-model="customerGroupId" :placeholder="`${customerStr}分组`" @change="search()"></group-list-select>
      </el-form-item>
      <el-button class="w150 f12 right" type="primary" @click="clearFilter()">清空筛选条件</el-button>
    </el-form>
  </div>
</template>
<script>
import GroupListSelect from '@/components/GroupListSelect'
import { OptionSearchInput } from 'yiwise-components'
import { mapGetters } from 'vuex'

const optionList = [
  {
    label: '联系电话',
    searchKey: 'phoneNumber',
    placeholder: '请输入联系电话'
  },
  {
    label: '姓名',
    searchKey: 'name',
    placeholder: '请输入姓名'
  }
]

export default {
  components: {
    OptionSearchInput,
    GroupListSelect
  },
  data() {
    return {
      filterCreationTime: undefined,
      filterSearchWords: undefined,
      customerGroupId: undefined,
      optionList
    }
  },
  computed: {
    ...mapGetters(['customerStr']),
    paginationParams() {
      return {
        earliestCreationTime: this.filterCreationTime ? this.filterCreationTime[0] : undefined,
        latestCreationTime: this.filterCreationTime ? this.filterCreationTime[1] : undefined,
        ...this.filterSearchWords,
        customerGroupId: this.customerGroupId
      }
    }
  },
  methods: {
    search() {
      this.$emit('updatePaginationParams', {
        ...this.paginationParams,
        pageNum: 1
      })
    },
    clearFilter() {
      this.filterCreationTime = undefined
      this.$refs.optionSearchInput.reset((params) => {
        this.filterSearchWords = params
      })
      this.customerGroupId = undefined
      this.search()
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';
  .button-container {
    height: 52px;
    padding: 10px 8px 10px 15px;
    border-bottom: $--border-base;
    /deep/ .el-form-item .el-form-item__content {
      font-size: 0;
    }
  }
  #customer-management {
    height: 100%;
    position: relative;
  }
  .title {
    margin: 15px 16px 15px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .el-date-editor{
    width: 380px
  }

  .el-dialog{
    padding: 0px 0px;
  }

  .el-dialog__header{
    padding: 0px 0px;
    height: 48px;
    line-height: 48px;
    background: #f0f3f8;
  }

  .el-dialog__header .el-dialog__title {
    margin-left: 15px;
    font-size: 14px;
  }
  .el-dialog__header .el-dialog__headerbtn {
    margin-left: 15px;
    font-size: 14px;
  }

  .bottom-pagination{
    height: 46px;
    border-top: 1px solid #dadadb;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  .pagination-container {
    width: 500px;
    margin: 8px auto;
  }
  .message-box::-webkit-scrollbar {display:none}
  .message-box {
    overflow-y: scroll;
    max-height: 480px;
    padding-bottom: 120px;
  }
  .history-dialog{
    max-height: 85vh;
    overflow: hidden;
  }
  .action {
    > span {
      @extend %tableAction;
    }
  }

  .preview {
    @extend %tableAction;
  }

  .el-button + .el-button{
    margin-left: 5px;    
  }
  .border-box+.border-box {
    margin-top: 10px !important;
  }
  .border-box {
    margin: 20px 20px 0 20px;
    width: 296px;
    height: 100px;
    border-radius: 2px;
    border: 1px solid #d8d9de;
  }

  .colorBlack {
    color: #333;
  }

  .pre-text {
    width: 70px;
    height: 20px;
    margin-left: 20px;
    text-align: right;
    display: inline-block;
  }

  .left-area{
    background: #fff;
  }

  .button-container .el-form-item{
    margin: 0 5px 0 0;
  }

  .center-text {
    text-align: center;
    display: inline-block;
    width: 100%;
    line-height: 196px;
    font-size: 20px;
    color: #1890ff;
  }

  .move-to-select{
    position: absolute !important;
    bottom: 0;
  }
  .history-dialog{
    /deep/ .el-dialog__header{
      margin-bottom: 0;
    }
    /deep/ .el-dialog__body {
      padding: 0!important;
      display: flex;
      .detail-left {
        width: 342px;
        min-height: 555px;
      }
      .detail-right {
        padding-top: 14px;
        flex: 1;
      }
    }
  }
</style>
