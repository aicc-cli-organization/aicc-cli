<template>
  <div id="port-list">
    <PaginationTable
      :url="'/apiEngine/gateway/list'"
      stripe
      :method="'get'"
      :autoLoad="false"
      :server="'engine'"
      :max-height="clientHeight - 245"
      :pageZero="false"
      :params="paginationParams"
      :headers="{
        'Content-Type': 'application/json'
      }"
      ref="table">
      <el-table-column
        prop="devicePort"
        label="端口编号"
        width="90">
        <template slot-scope="{ row }">
          <span>{{row.devicePort}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="sipAccount"
        label="VOIP账号"
        width="120">
      </el-table-column>
      <el-table-column
        prop="sipPassword"
        label="密码"
        width="100">
      </el-table-column>
      <el-table-column
        prop="phoneName"
        label="号码名称"
        width="120">
      </el-table-column>
      <el-table-column
        prop="phoneNumber"
        label="电话号码"
        width="140">
        <template slot-scope="{ row }">
          <span>{{row.phoneNumber || '--'}}</span>
          <lineStatus :row="row"></lineStatus>
        </template>
      </el-table-column>
      <el-table-column
        prop="defaultCallPrefix"
        label="默认外呼前缀"
        width="">
      </el-table-column>
      <el-table-column
        prop="otherCallPrefix"
        label="外地外呼前缀"
        width="">
      </el-table-column>
      <el-table-column
        prop=""
        label="号码归属省市"
        width="120">
        <template slot-scope="scope">
          {{scope.row.province}}-{{scope.row.city}}
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="备注"
        width="120">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="200">
        <template slot-scope="scope">
          <el-button @click="showChangeCardDialog(scope.row)" type="text">更改卡号</el-button>
          <el-button @click="showConfigDialog(scope.row)" type="text">修改配置</el-button>
          <el-button @click="showPullOutPhoneCardForm(scope.row)" type="text">拔卡</el-button>
        </template>
      </el-table-column>
    </PaginationTable>

    <!-- 修改配置 -->
    <change-config-form
      :row.sync="changeConfigForm"
      :visible.sync="changeConfigFormVisible"
      @success="loadData"
    />

    

    <!-- 拔卡 -->
    <pull-out-phone-card-form
      :row.sync="pullOutPhoneCardForm"
      :visible="pullOutPhoneCardFormVisible"
      @success="loadData"
      @close="pullOutPhoneCardFormVisible=false"
    />

    <!-- 更改卡号 -->
    <change-phone-number
      :row.sync="changePhoneNumberForm"
      :visible.sync="changePhoneNumberFormVisible"
      @success="loadData"
    />

    <!-- 快速拨打 -->
    <!-- <call-dialog
      :visible.sync="callVisible"
      :phoneNumberId="phoneNumberId"
    >
    </call-dialog> -->
  </div>
</template>
<script>
import { OptionSearchInput } from 'yiwise-components'
import lineStatus from '../../components/lineStatus'
import PaginationTable from '@/components/PaginationTable'
import { mapGetters } from 'vuex'
import * as constant from '@/utils/constant'
import pullOutPhoneCardForm from './pullOutPhoneCard'
import changePhoneNumber from './changePhoneNumber'
import changeConfigForm from './changeConfigForm'

export default {
  components: {
    pullOutPhoneCardForm,
    changePhoneNumber,
    changeConfigForm,
    PaginationTable,
    OptionSearchInput,
    lineStatus
  },
  computed: {
    ...mapGetters([
      'clientHeight'
    ]),
    constant() {
      return constant
    },
    paginationParams() {
      return {
        deviceId: this.selectedDeviceId || '0'
      }
    },
    selectedDeviceId() {
      return this.$store.state.gateway.selectedDeviceId
    }
  },
  watch: {
    selectedDeviceId: {
      handler: function(val) {
        this.$nextTick(() => this.loadData())
      },
      deep: true
    }
  },
  data() {
    return {

      // 更改卡号的表单
      changePhoneNumberForm: {},
      changePhoneNumberFormVisible: false,

      // 最小时间间隔的表单
      callIntervalVisible: false,
      callIntervalForm: {},

      // 修改配置的表单
      changeConfigForm: {},
      changeConfigFormVisible: false,

      // 快速拨打
      callVisible: false,
      phoneNumberId: undefined,

      // 拔卡表单
      pullOutPhoneCardForm: {},
      pullOutPhoneCardFormVisible: false
    }
  },
  methods: {
    showPullOutPhoneCardForm(row) {
      this.pullOutPhoneCardForm = row
      this.pullOutPhoneCardFormVisible = true
    },
    showConfigDialog(data) {
      // 显示修改配置的表单
      this.changeConfigForm = data
      this.changeConfigFormVisible = true
    },
    showChangeCardDialog(data) {
      // 显示更改卡号的表单
      this.changePhoneNumberFormVisible = true
      const { phoneNumberId, phoneNumber } = data
      this.changePhoneNumberForm = {
        phoneNumberId,
        newPhoneNumber: undefined,
        phoneNumber
      }
    },
    loadData(page = 1, size = 20) {
      // 加载表格数据
      this.$refs.table.loadData(page, size)
    },
    handleCallClick(data) {
      this.callVisible = true
      this.phoneNumberId = data.phoneNumberId
    }
  }
}
</script>
<style lang="scss" scoped>
</style>