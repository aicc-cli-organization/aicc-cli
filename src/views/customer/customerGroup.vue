<template>
  <div id="customer-group">
    <div class="button-container clearfix">
      <el-button style="border: none;background:transparent" icon="el-icon-arrow-left" class="mt15 mr15 mb15 left" @click="back()">
        返回
      </el-button>
      <el-button type="primary" class="mt15 mr15 mb15 right" @click="showCustomerGroupForm">新建{{customerStr}}分组</el-button>
    </div>
    <PaginationTable
      url="/apiEngine/customerGroup/listGroup"
      ref="table"
      :server="'engine'"
      stripe
      :pageZero="false"
      @current-change="page => this.curPage = page"
      >
      <el-table-column
        fixed
        prop="name"
        :label="`${customerStr}分组`"
        width="">
      </el-table-column>
      <el-table-column
        prop="username"
        label="创建人"
        width="">
      </el-table-column>
      <el-table-column
        prop="createTime"
        :show-overflow-tooltip="true"
        label="创建时间"
        width="">
      </el-table-column>
      <el-table-column
        prop="comment"
        :show-overflow-tooltip="true"
        label="备注"
        width="">
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <div slot-scope="{ row }">
          <span class="operation" @click="handleEditItem(row)">
            编辑
          </span>
          <yiwise-pop-confirm
            label="确定删除该分组吗？"
            @submit="handleCustomerDelete(row)"
            >
            <span class="operation">删除</span>
          </yiwise-pop-confirm>
        </div>
      </el-table-column>
    </PaginationTable>
    <yiwise-dialog
      :title="type === 'add' ? `新建${customerStr}分组` : '编辑分组'"
      :visible.sync="customerGroupFormVisible"
      width="620px"
      @close="closeAndClearCustomerGroupForm()"
      @confirm="addCustomerGroup"
    >
      <el-form
        :model="customerGroupForm"
        ref="customerGroupForm"
        :rules="customerGroupFormRules">
        <el-form-item :label="`${customerStr}分组名称`" prop="name" label-width="120px" class="is-required">
          <el-input v-model="customerGroupForm.name" auto-complete="on"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="comment" label-width="120px">
          <el-input v-model="customerGroupForm.comment"></el-input>
        </el-form-item>
      </el-form>
    </yiwise-dialog>
  </div>
</template>
<script>
import PaginationTable from '@/components/PaginationTable'
import { YiwiseDialog, YiwisePopConfirm } from 'yiwise-components'
import * as customerAPI from '@/api/customer'
import { mapGetters } from 'vuex'

export default {
  components: {
    YiwiseDialog,
    PaginationTable,
    YiwisePopConfirm
  },
  data() {
    const validator = (rule, value, cb) => {
      if (!value) {
        cb(new Error(`请输入${this.customerStr}分组名称`))
      } else {
        cb()
      }
    }

    return {
      customerGroupFormVisible: false,
      customerGroupForm: {},
      customerGroupFormRules: {
        name: [{ validator, trigger: 'blur' },
          { min: 1, max: 20, message: '长度在1到20个字符', trigger: 'blur' }]
      },
      type: 'add',
      curPage: 1,
      jobName: this.$route.query.jobName
    }
  },
  computed: {
    ...mapGetters(['customerStr'])
  },
  methods: {
    back() {
      if (this.jobName) this.$router.push({ path: `/callcenter/task?jobName=${this.jobName}` })
      else this.$router.back()
    },
    closeAndClearCustomerGroupForm() {

    },
    addCustomerGroup() {
      this.$refs.customerGroupForm.validate(
        async validate => {
          if (validate) {
            await customerAPI[this.type === 'add' ? 'addCustomerGroup' : 'updateCustomerGroup']({
              ...this.customerGroupForm
            })
            this.$message.success(`${this.type === 'add' ? '创建' : '编辑'}${this.customerStr}分组成功`)
            this.loadData(this.type === 'add' ? 1 : this.curPage)
            this.customerGroupFormVisible = false
          }
        }
      )
    },
    handleEditItem(row) {
      this.type = 'edit'
      this.customerGroupForm = {
        customerGroupId: row.customerGroupId,
        name: row.name,
        comment: row.comment
      }
      this.customerGroupFormVisible = true
    },
    async handleCustomerDelete(row) {
      const { data } = await customerAPI.checkDeletable({
        customerGroupId: row.customerGroupId
      })
      if (data.data) {
        await customerAPI.deleteGroup({
          customerGroupId: row.customerGroupId
        })
        this.$message.success('删除成功')
        this.loadData(this.curPage)
      } else {
        this.$message.error('此分组已被使用，不能删除')
      }
    },
    getCustomerGroupList() {
      this.$nextTick(() => {
        this.loadData()
      })
    },
    loadData(page = 1, size = 20) {
      this.$refs.table.loadData(page, size)
    },
    showCustomerGroupForm() {
      this.type = 'add'
      this.customerGroupForm = {
        name: '',
        comment: ''
      }
      this.customerGroupFormVisible = true
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~src/styles/variables.scss';
@import '~src/styles/placeholder.scss';

.el-table {
  .operation {
    @extend %tableAction;
  }
  .property-item {
    display: inline-block;
    margin-right: 10px;
  }
}
#customer-group {
  background: #fff;
  .button-container {
    padding: 5px 10px;
  }
}
</style>
