<template>
  <div id="record-detail">
    <div class="button-container">
      <el-button size="medium" style="border: none;background:transparent" icon="el-icon-arrow-left" class="f14 mt15 mr15 mb15" @click="back()">
        <span class="f14">返回</span>
      </el-button>
    </div>
    <div class="pl16 mt10 mb10 pr20 clearfix">
      <el-checkbox v-model="allChecked" @change="handleAllChecked">全选</el-checkbox>
        <span class="checked-count ml5">已选中
        <span class="num">{{checkedCount}}</span>项
      </span>
      <option-search-input
        width="270px"
        ref="optionSearchInput"
        v-model="searchValue"
        @search="loadData"
        :option-list="optionList"
        option-width="110px"
      ></option-search-input>
      <!-- <el-input class="w200 mr10" :style="{width: '200px'}" placeholder="客户名/联系电话"  size="small" v-model="filterPhoneNumber">
        <el-button class="w30" slot="append" icon="el-icon-search"  size="small" @click="search()"></el-button>
      </el-input> -->
      <el-button class="w150 f12" type="primary" @click="clearFilter()">清空筛选条件</el-button>
      <div class="action-right float-r">
        <el-button type="primary" class="right-item" @click="handleOutWhiteList">退出白名单</el-button>
      </div>
      <div class="action-right float-r import-batch" >
        <el-button type="primary" class="right-item" @click="handleBatchImport">批量导入</el-button>
      </div>
    </div>

    <pagination-table
      :server="'engine'"
      :url="`/apiEngine/customerWhiteList/queryInfoLists`"
      ref="table"
      stripe
      :pageZero="false"
      @totalSizeChange="handleTotalSizeChange"
      @selection-change="handleSelectionChange"
      @select="handleSelectChange"
      @select-all="handleSelectAll"
      @refreshTable="handleRefreshTable"
      :headers="{
        'Content-Type': 'application/json'
       }">
      <el-table-column type="selection" width="55px"></el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
        width="">
        <template slot-scope="{ row }">
          {{row.name || emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneNumber"
        label="联系电话"
        width="">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="加入原因"
        width="">
        <template slot-scope="{ row }">
          {{addTypeEnum[row.addType] || emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        prop="comment"
        label="备注"
        width="">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="加入白名单时间"
        width="">
      </el-table-column>
      <el-table-column
        prop="createdByUserName"
        label="创建者"
        width="">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="">
        <template slot-scope="scope">
          <!--TODO  编辑客户-->
          <!--<el-button @click="showHistory(scope.row)" type="text" size="small">编辑</el-button>-->
          <YiwisePopConfirm :label="`确认移除该${customerStr}吗？`" @submit="removeFromWhiteList(scope.row)">
            <el-button type="text" size="small">退出白名单</el-button>
          </YiwisePopConfirm>
          <span class="operation" @click="editComment(scope.row)">修改备注</span>
          <!--<el-button @click="removeFromWhiteList(scope.row)" type="text" size="small">退出白名单</el-button>-->
        </template>
      </el-table-column>
    </pagination-table>
    <yiwise-dialog
      title="修改备注"
      :visible.sync="editCommentVisible"
      width="620px"
      @close="handleClose"
      @confirm="handleSubmit"
    >
      <el-form
        :model="customerGroupForm"
        ref="customerGroupForm"
        :rules="customerGroupFormRules">
        <el-form-item label="备注" prop="comment" label-width="50px">
          <el-input v-model="customerGroupForm.comment"></el-input>
        </el-form-item>
      </el-form>
    </yiwise-dialog>
    <add-share-whitelist-dialog
      :visible.sync="batchImportVisible"
      @refresh="loadData"
    >
    </add-share-whitelist-dialog>

  </div>
</template>

<script>
  import { OptionSearchInput, YiwiseDialog, YiwisePopConfirm } from 'yiwise-components'
  import paginationTable from '@/components/PaginationTable'
  import addShareWhitelistDialog from '@/components/addShareWhitelistDialog'
  import TableCheckAll from '@/mixins/tableCheckAll'
  import * as customerAPI from '@/api/customer'
  import { addTypeEnum } from '@/utils/enum'
  import { emptyPlaceholder } from '@/utils/constant'
  import { mapGetters } from 'vuex'

  const optionList = [
    {
      label: '姓名',
      searchKey: 'name',
      placeholder: '请输入姓名'
    },
    {
      label: '联系电话',
      searchKey: 'phoneNumber',
      placeholder: '请输入联系电话'
    }
  ]

  export default {
    // 处理table全选的mixin
    mixins: [TableCheckAll],
    components: {
      YiwisePopConfirm,
      paginationTable,
      OptionSearchInput,
      YiwiseDialog,
      addShareWhitelistDialog
    },
    computed: {
      ...mapGetters(['customerStr']),
      paginationParams() {
        return {
          ...this.searchValue
        }
      }
    },
    watch: {
    },
    data() {
      return {
        multipleSelection: [], // 当前选中的table行
        statusValue: '',
        statusOptions: [],
        willingValue: '',
        willingOptions: [],
        filterPhoneNumber: null,
        jobName: this.$route.query.jobName,
        optionList,
        searchValue: undefined,
        addTypeEnum,
        emptyPlaceholder,
        editCommentVisible: false,
        customerGroupForm: {},
        customerGroupFormRules: {
          comment: [
            { min: 0, max: 20, message: '长度在0到20个字符', trigger: 'blur' }
          ]
        },
        batchImportVisible: false
      }
    },
    methods: {
      back() {
        if (this.jobName) this.$router.push({ path: `/callcenter/task?jobName=${this.jobName}` })
        else this.$router.back()
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
        // 这个函数时定义在mixin中，用于处理全选操作的
        this._handleSelectionChange && this._handleSelectionChange(val)
      },
      handleClose() {
        this.$refs.customerGroupForm.resetFields()
      },
      editComment(row) {
        this.customerGroupForm = {
          comment: row.comment,
          customerWhiteListId: row.customerWhiteListId
        }
        this.editCommentVisible = true
      },
      handleSubmit() {
        this.$refs.customerGroupForm.validate(
          async validate => {
            if (validate) {
              await customerAPI.updateComment({
                ...this.customerGroupForm
              })

              this.$message.success('修改成功')
              this.loadData()
              this.editCommentVisible = false
            }
          }
        )
      },
      async handleOutWhiteList() {
        let params
        if (this.allChecked) {
          params = this.paginationParams
        } else {
          const idList = this.multipleSelection.map(item => item.customerPersonId)

          if (!idList.length) {
            this.$message.error(`请选择需要退出白名单的${this.customerStr}`)
            return
          }

          params = {
            customerPersonIds: idList
          }
        }

        await customerAPI.deleteByQuery({
          ...params
        })
        this.$message.success('操作成功')
        this.loadData()
      },
      async handleBatchImport() {
        this.batchImportVisible = true
      },
      showHistory() {},
      search() {
        this.$nextTick(this.loadData())
      },
      loadData(page = 1, size = 20) {
        this.$refs.table.loadData(page, size, this.paginationParams)
      },
      clearFilter() {
        this.filterPhoneNumber = null
        this.$refs.optionSearchInput.reset((params) => {
          this.searchValue = params
        })

        this.$nextTick(this.loadData())
      },
      removeFromWhiteList(row) {
        customerAPI.removeFromWhiteList(row.customerPersonId ? [row.customerPersonId] : []).then(({ data }) => {
          if (data.code === 200) {
            this.$message.success('退出成功')
          } else {
            this.$message({
              message: '退出失败',
              type: 'error'
            })
          }
          this.loadData()
        })
      }
    },
    activated() {
      this.loadData()
    }
  }
</script>
<style lang="scss" scoped>
@import 'src/styles/variables.scss';
@import 'src/styles/placeholder.scss';

.import-batch {
  margin-right:10px
}
.el-table {
  .operation {
    @extend %tableAction;
  }
  .property-item {
    display: inline-block;
    margin-right: 10px;
  }
}
.button-container {
  border-bottom: 1px solid #eaeaea;
  span {
    color: #333;
  }
}
#record-detail{
  background: #fff;
  height: 100%;
}
</style>
