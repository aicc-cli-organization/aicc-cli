<template>
  <div class="policy-group">
    <div class="header">
      <el-button type="primary" @click="handleAddClick">添加策略组</el-button>
    </div>
    <el-table
      class="list"
      stripe
      :span-method="objectSpanMethod"
      :data="policyGroupList"
      :border="true"
      :max-height="clientHeight - 176"
    >
      <el-table-column
        prop="name"
        label="策略组名">
      </el-table-column>
      <el-table-column
        prop="phoneType"
        label="线路类型">
        <template slot-scope="scope">
          {{scope.row.phoneType === 'NOT_MOBILE' ? '非手机号' : '手机号'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneType"
        label="调度策略">
        <template slot-scope="scope">
          {{scope.row.dispatchType === 'LOCATION_MATCH_FIRST' ? '归属地相同优先' : scope.row.dispatchType === 'SORT_FIRST' ? '只以调度优先级为准' : '--'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="remark"
        label="号码备注"
        width="">
      </el-table-column>
      <el-table-column
        prop="sort"
        label="调度优先级">
        <template slot-scope="scope">
          <span>{{scope.row.sort}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneNumber"
        label="电话号码"
        width="150">
        <template slot-scope="scope">
          {{scope.row.phoneNumberInfo ? scope.row.phoneNumberInfo.phoneNumber : '--'}}
          <lineStatus :row="scope.row"></lineStatus>
        </template>
      </el-table-column>
      <el-table-column
        label="电话类型">
        <template slot-scope="scope">
          {{scope.row.phoneNumberInfo ? phoneTypeENUM[scope.row.phoneNumberInfo.phoneType] : '--'}}
        </template>
      </el-table-column>
      <el-table-column
        prop="province"
        label="归属省市">
        <template slot-scope="scope">
          <div v-if="scope.row.phoneNumberInfo">
            <span v-if="scope.row.phoneNumberInfo.locationDisplayType=='RANDOM'">全国随机显示</span>
            <span v-else-if="scope.row.phoneNumberInfo.locationDisplayType=='NO_DISPLAY'">不显示</span>
            <span v-else>{{(scope.row.phoneNumberInfo.province || '') + '--' + (scope.row.phoneNumberInfo.city || '')}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneNumberInfo.accountFare"
        label="账户余额（元）"
        width="145">
        <template slot-scope="scope">
          {{scope.row.phoneNumberInfo ? ((scope.row.phoneNumberInfo.accountFare || 0) / 1000).toFixed(3) : 0}}
          <el-button
            v-if="scope.row.phoneNumberInfo && scope.row.phoneNumberInfo.phoneType !=='MOBILE' && scope.row.phoneNumberInfo.enabledStatus===1
            && (scope.row.phoneNumberInfo.phoneType === 'MESSAGE' || scope.row.phoneNumberInfo.phoneSource === 'YIWISE')"
            @click="openEnCharge(scope.row)" type="text" size="small">在线充值</el-button>
        </template>
      </el-table-column>
      <el-table-column
        prop="phoneNumberInfo.localBillRate"
        label="话费单价">
        <template slot-scope="scope">
          <span v-if="scope.row.phoneNumberInfo">{{((scope.row.phoneNumberInfo.localBillRate || 0) / 10).toFixed(3)}}</span>分/分钟<br>
          <span v-if="scope.row.phoneNumberInfo">{{((scope.row.phoneNumberInfo.otherBillRate || 0) / 10).toFixed(3)}}</span>分/分钟
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="phoneType">
        <template slot-scope="{ row }">
          <span @click="handleEditClick(row)" class="action">编辑</span>
          <yiwise-pop-confirm
            label="确定删除该策略组吗？"
            @submit="handleDeleteClick(row)"
          >
            <span class="action">删除</span>
          </yiwise-pop-confirm>
        </template>
      </el-table-column>
    </el-table>
    <stradegy-dialog
      :visible.sync="policyVisible"
      :type="policyType"
      :tenantId="tenantId"
      :defaultData="policyData"
      appType="crm"
      @change="requestPolicyGroup"
    >
    </stradegy-dialog>
    <encharge :visible.sync="enchargeFormVisible" :subject="'策略组'" :chargeData="chargeData" :chargeName="chargeName"></encharge>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import lineStatus from '../components/lineStatus'
import { deletePolicy } from '@/api/policy'
import { getPolicyGroupList } from '@/api/numberpool'
import { phoneTypeENUM } from '@/utils/constant'
import encharge from '../components/encharge'
import { StradegyDialog, YiwisePopConfirm } from 'yiwise-components'

export default {
  name: 'policyGroup',
  components: {
    StradegyDialog,
    YiwisePopConfirm,
    lineStatus,
    encharge
  },
  computed: {
    ...mapGetters(['clientHeight', 'tenantId'])
  },
  data() {
    return {
      phoneTypeENUM,
      policyGroupList: [],
      policyVisible: false,
      policyType: 'add',
      policyData: {},
      chargeData: {},
      enchargeFormVisible: false,
      chargeName: ''
    }
  },
  mounted() {
    this.requestPolicyGroup()
  },
  methods: {
    requestPolicyGroup() {
      this.policyGroupList = []
      getPolicyGroupList().then(({ data }) => {
        const initList = data.data
        for (const i in initList) {
          for (const j in initList[i].detailList) {
            const rowSpan = j === '0' ? initList[i].detailList.length : 0
            this.policyGroupList.push({
              rowSpan,
              ...initList[i],
              ...initList[i].detailList[j]
            })
          }
        }
      })
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) { // 处理表格合并项
      if (/\bname\b|\bphoneType\b|\bremark\b/.test(column.property)) {
        return {
          rowspan: this.policyGroupList[rowIndex].rowSpan,
          colspan: 1
        }
      } else {
        return {
          rowspan: 1,
          colspan: 1
        }
      }
    },
    openEnCharge(row) {
      this.chargeData = row
      this.chargeName = row.name
      this.enchargeFormVisible = true
    },
    handleAddClick() {
      this.policyVisible = true
      this.policyType = 'add'
    },
    handleEditClick(row) {
      this.policyVisible = true
      this.policyType = 'edit'
      this.policyData = row
    },
    async handleDeleteClick(row) {
      await deletePolicy({
        callPolicyGroupId: row.callPolicyGroupId
      })
      this.requestPolicyGroup()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/placeholder.scss';

.policy-group {
  height: 100%;
  display: flex;
  flex-direction: column;
  > .header {
    margin-bottom: 10px;
    text-align: right;
  }
  > .list {
    flex-grow: 1;
    .action {
      @extend %tableAction;
    }
  }
}
</style>

