<template>
  <div id="number-pool">
    <pagination-table
      url="/apiEngine/tenantPhoneNumber/listAll"
      :pageZero="true"
      ref="table"
      stripe
      :server="'engine'"
      :pageable="false"
      :isPagination="false"
      :max-height="clientHeight - 176"
    >
      <el-table-column
        fixed
        label="电话号码"
        width="300">
        <template slot-scope="scope">
          <span>{{scope.row.phoneNumber}}</span>
          <el-tag size="small" v-if="scope.row.phoneSource === 'SELF_OWN'">自有线路</el-tag>
          <el-tag size="small" v-if="scope.row.enabledStatus === 0">已解绑</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneName"
        label="号码名称">
      </el-table-column>
      <el-table-column
        prop="phoneType"
        label="电话类型">
        <template slot-scope="scope">
            {{ parsePhoneType(scope.row.phoneType)}}
          </template>
      </el-table-column>
        <el-table-column
          prop="phoneNumber"
          label="线路用途"
          width="">
          <template slot-scope="scope">
            {{useText(scope.row)}}
          </template>
        </el-table-column>
      <el-table-column
        label="账户余额（元）">
        <template slot-scope="scope">
          <span>{{scope.row.accountFare / 1000}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="话费单价">
        <template slot-scope="scope">
          <template v-if="scope.row.phoneType === 'MESSAGE'">
            <span>金融短信：7分/条；</span><br>
            <span>其他短信：5分/条；</span>
          </template>
          <template v-else>
            <span v-if="scope.row.supportCallOut">本地通话：{{scope.row.localBillRate / 10}}分/分钟；</span><br>
            <span v-if="scope.row.supportCallOut">外地通话：{{scope.row.otherBillRate / 10}}分/分钟；</span><br>
            <span v-if="scope.row.supportCallIn">
              <span v-if="scope.row.supportCallOut">呼入：</span>
              {{scope.row.monthlyBillRate / 10}}元/月
            </span>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="号码备注">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.phoneSource === 'SELF_OWN' && scope.row.enabledStatus===1"
            @click="openEdit(scope.row)" type="text" size="small">编辑</el-button>
          <el-button
            v-if="scope.row.accountFare > 0 && scope.row.phoneSource !== 'SELF_OWN' &&
              scope.row.phoneType !=='MOBILE' && scope.row.enabledStatus===1 && hasAccess('crm_lineList_balanceTransfer')"
            @click="openTransfer(scope.row)" type="text" size="small">余额转移</el-button>
        </template>
      </el-table-column>
    </pagination-table>
    <yiwise-dialog title="编辑号码"
      @confirm="update()"
      :visible.sync="dialogFormVisible">
      <el-form
        :model="numberForm"
        ref="numberForm"
        :rules="numberFormRules">
        <el-form-item label="电话号码" :label-width="formLabelWidth" prop="phoneNumber">
          <el-input v-model="numberForm.phoneNumber" auto-complete="off"  disabled></el-input>
        </el-form-item>
        <el-form-item v-if="phoneType === 'MOBILE'" label="号码名称" :label-width="formLabelWidth" prop="phoneName">
          <el-input v-model="numberForm.phoneName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="号码备注" :label-width="formLabelWidth" prop="remark">
          <el-input v-model="numberForm.remark" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
    </yiwise-dialog>
    <yiwise-dialog title="余额转移"
      @confirm="transfer()"
      :visible.sync="dialogFormVisibleTransfer">
      <el-form
        :model="transferForm"
        ref="transferForm"
        :rules="transferFormRules">
        <el-form-item label="电话号码" :label-width="formLabelWidth" >
          <span>{{transferForm.phoneNumber}}</span>
        </el-form-item>
        <el-form-item label="账户余额" :label-width="formLabelWidth" >
          <span>{{transferForm.accountFare / 1000}}元</span>
        </el-form-item>
        <el-form-item label="将余额转移到" :label-width="formLabelWidth" prop="targetId">
          <el-select v-model="transferForm.targetId" placeholder="请选择线路" class="w250">
            <el-option
            v-for="item in lines"
            v-if="item.tenantPhoneNumberId !== transferForm.tenantPhoneNumberId && item.phoneType !=='MOBILE'"
            :key="item.tenantPhoneNumberId"
            :label="item.phoneNumber"
            :value="item.tenantPhoneNumberId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转移金额" :label-width="formLabelWidth" prop="transferMoney" class="w400">
          <el-input v-model="transferForm.transferMoney" auto-complete="off" class="w250"></el-input>
          <span>元</span>
        </el-form-item>
      </el-form>
    </yiwise-dialog>
  </div>
</template>

<script>
  import * as numberpoolAPI from '@/api/numberpool'
  import PaginationTable from '@/components/PaginationTable'
  import { YiwiseDialog } from 'yiwise-components'
  import { mapGetters } from 'vuex'
  import * as constant from '@/utils/constant'

  export default {
    name: 'NumberPool',
    components: {
      PaginationTable,
      YiwiseDialog
    },
    computed: {
      ...mapGetters(['clientHeight']),
      userId() {
        return this.$store.state.user.userId
      },
      tenantId() {
        return this.$store.state.user.tenantId
      },
      lines() {
        let owner
        this.bindedLines.forEach((value, index) => {
          if (value.phoneNumber === this.transferForm.phoneNumber) owner = value.ownerDistributorId
        })
        return this.bindedLines.filter((value, index) => {
          if (this.transferForm.phoneType === 'MESSAGE' && value.phoneType !== 'MESSAGE') return true
          if (value.phoneNumber === this.transferForm.phoneNumber) return false
          if (value.ownerDistributorId === owner) return true
          if (value.phoneType === 'MESSAGE') return true
          return false
        })
      }
    },
    methods: {
      async update() {
        try {
          await numberpoolAPI.updateNumber({
            tenantPhoneNumberId: this.numberForm.tenantPhoneNumberId,
            phoneName: this.numberForm.phoneName,
            remark: this.numberForm.remark
          })
          this.$message({
            message: '更新成功',
            type: 'success'
          })
          this.$nextTick(() => {
            this.requestPhoneList()
          })
          this.dialogFormVisible = false
        } catch (error) {
          this.$message({
            message: '更新失败',
            type: 'error'
          })
        }
      },
      useText(row) {
        if (row.phoneType === 'MESSAGE') {
          return '短信发送'
        }

        if (row.supportCallIn && row.supportCallOut) {
          return '支持外呼和呼入'
        } else if (!row.supportCallIn && row.supportCallOut) {
          return '仅支持外呼'
        } else if (row.supportCallIn && !row.supportCallOut) {
          return '仅支持呼入'
        } else {
          return '不支持外呼，也不支持呼入'
        }
      },
      async transfer() {
        this.$refs.transferForm.validate(async valid => {
          if (!valid) return
          else {
            if (this.transferForm.transferMoney * 1000 > this.transferForm.accountFare) {
              this.$message({
                message: '转移金额需小于账户余额',
                type: 'error'
              })
              return
            }

            try {
              await numberpoolAPI.transferLineMoney({
                originId: this.transferForm.tenantPhoneNumberId,
                targetId: this.transferForm.targetId,
                transferMoney: this.transferForm.transferMoney
              })
              this.$message({
                message: '转移成功',
                type: 'success'
              })
              this.$nextTick(() => {
                this.requestPhoneList()
              })
              this.dialogFormVisibleTransfer = false
            } catch (error) {
              this.$message({
                message: '转移失败',
                type: 'error'
              })
            }
          }
        })
      },
      parsePhoneType(type) {
        return {
          ...constant.phoneTypeENUM,
          'MESSAGE': '短信'
        }[type]
      },
      openEdit(row) {
        this.numberForm = { ...row }
        this.dialogFormVisible = true
        this.phoneType = row.phoneType
      },
      openTransfer(row) {
        this.transferForm = { ...row }
        if (this.transferForm.phoneType === 'MESSAGE') {
          this.transferForm.tenantPhoneNumberId = -1
        }
        this.dialogFormVisibleTransfer = true
      },
      requestPhoneList(page = 1, size = 20) {
        this.$refs.table.loadData(page, size)
      }
    },
    mounted() {
      numberpoolAPI.getBindLineList().then(({ data }) => {
        data.data.forEach(item => {
          if (item.phoneType === 'MESSAGE') {
            item.tenantPhoneNumberId = -1
            item.phoneNumber = '短信'
          }
        })
        this.bindedLines = data.data
      })
    },
    data() {
      return {
        numberFormRules: {
          name: [{ required: true, trigger: 'blur', message: '请输入名称' },
            { min: 1, max: 50, message: '长度在1到50个字符', trigger: 'blur' }]
        },
        transferFormRules: {
          targetId: [{ required: true, trigger: 'change', message: '请选择线路' }],
          transferMoney: [{ required: true, trigger: 'blur', message: '请输入转移金额' }]
        },
        currentPage: 1,
        dialogFormVisible: false,
        dialogFormVisibleTransfer: false,
        numberForm: {},
        transferForm: {},
        tableData: [],
        bindedLines: [],
        phoneType: '',
        formLabelWidth: '105px'
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../styles/variables';

  .w250{
    width: 250px;
  }

  .w400{
    width: 400px;
  }

  #number-pool {
    height: calc(100vh - 138px);
    background: #fff;
    position: relative;
  }

  #number-pool .bottom-pagination{
    height: 46px;
    border-top: 1px solid #dadadb;
    position: absolute;
    bottom: 0;
    width: 100%;
  }
  #number-pool .pagination-container {
    width: 500px;
    margin: 8px auto;
  }
  #number-pool .el-input--medium .el-input__inner {
    height: 28px !important;
  }
  #number-pool .el-input--medium .el-input__icon {
    line-height: 28px !important;
  }
</style>
