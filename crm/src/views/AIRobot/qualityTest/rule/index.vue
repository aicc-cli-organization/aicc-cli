<template>
  <div class="tab-rule">
    <div class="header-container">
      <search-input
        width="200px"
        v-model="searchName"
        placeholder="搜索规则名、关键词"
        @search="loadData"
      ></search-input>
      <el-select
        v-model="ruleType"
        placeholder="全部规则类型"
        clearable
      >
        <el-option
          v-for="(value, key) in RULE_TYPE"
          :key="key"
          :label="value"
          :value="key"
        ></el-option>
      </el-select>
      <el-select
        v-model="ruleProperty"
        placeholder="全部规则属性"
        clearable
      >
        <el-option
          v-for="(value, key) in RULE_PROPERTY"
          :key="key"
          :label="value"
          :value="key"
        ></el-option>
      </el-select>
      <el-button type="primary" class="clear-filter_btn" @click="onClearFilter">清空筛选条件</el-button>
      <el-button
        v-if="hasAccess('crm_qc_rule_edit')"
        type="primary"
        class="add-rule-btn"
        @click="onOpenRuleFormDialog">
        <span class="inner-span">添加质检规则</span>
      </el-button>
    </div>
    <!-- 表格 -->
    <pagination-table
      ref="table"
      url="/apiEngine/qcRule/ruleList"
      method="get"
      :autoLoad="false"
    >
      <el-table-column label="规则id" prop="qcRuleId" width="75px"></el-table-column>
      <el-table-column label="规则名" prop="ruleName" width="100px" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="描述" width="150px" :show-overflow-tooltip="true">
        <template slot-scope="{ row }">{{row.ruleDescription || '--'}}</template>
      </el-table-column>
      <el-table-column label="规则类型" width="75px">
        <template slot-scope="{ row }">
          <span>{{RULE_TYPE[row.ruleType]}}</span>
        </template>
      </el-table-column>
      <el-table-column label="加/减分要求" width="90px">
        <template slot-scope="{ row }">
          <span>{{RULE_WEIGHT[row.ruleWeight]}}</span>
        </template>
      </el-table-column>
      <el-table-column label="规则属性" width="85px">
        <template slot-scope="{ row }">
          <span>{{RULE_PROPERTY[row.ruleProperty]}}</span>
        </template>
      </el-table-column>
      <el-table-column label="关键词" width="200px" :show-overflow-tooltip="true">
        <template slot-scope="{ row }">
          <span>{{(row.keyWordList && row.keyWordList.length ? row.keyWordList : ['--']).join(',')}}</span>
        </template>
      </el-table-column>
      <el-table-column label="设置条件" :show-overflow-tooltip="true">
        <template slot-scope="{ row }">
          {{formatSettingConditionStr(row.itemMap)}}
        </template>
      </el-table-column>
      <el-table-column label="是否启用" width="75px">
        <template slot-scope="{ row }">
          <span>{{RULE_ENABLE[row.enabledStatus]}}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" prop="updateTime"></el-table-column>
      <el-table-column label="操作" width="100px">
        <template slot-scope="{ row }">
          <div class="operation-list">
            <a
              v-if="hasAccess('crm_qc_rule_edit')"
              class="operation-item"
              @click="onOpenEditForm(row.qcRuleId)"
            >编辑</a>
            <template v-if="hasAccess('crm_qc_rule_status')">
              <template v-if="row.enabledStatus === 'DISABLE'">
                <yiwise-pop-confirm
                  label="确定要启用该规则吗？"
                  @submit="onToggleRuleStatus(row)"
                >
                  <a class="operation-item">启用</a>
                </yiwise-pop-confirm>
                <yiwise-pop-confirm
                  label="确定要删除该规则吗？"
                  @submit="onToggleRuleStatus(row, 'DELETE')"
                >
                  <a class="operation-item">删除</a>
                </yiwise-pop-confirm>
              </template>
              <yiwise-pop-confirm
                v-else
                label="确定要禁用该规则吗？禁用后会在质检任务中立即生效！"
                @submit="onToggleRuleStatus(row)"
              >
                <a class="operation-item">禁用</a>
              </yiwise-pop-confirm>
            </template>
          </div>
        </template>
      </el-table-column>
    </pagination-table>
    <rule-form
      :editRuleId.sync="editRuleId"
      :visible.sync="ruleFormVisible"
      @addSuccess="onAddSuccess"
      @editSuccess="loadData"
    ></rule-form>
  </div>
</template>

<script>
import { SearchInput, PaginationTable, YiwisePopConfirm } from 'yiwise-components'
import RuleForm from '../ruleForm/index'
import { RULE_TYPE, RULE_PROPERTY, RULE_WEIGHT, RULE_ENABLE } from '../utils/enum'
import * as qcAPI from '@/api/qualityTest'

export default {
  data() {
    return {
      RULE_TYPE,
      RULE_PROPERTY,
      RULE_WEIGHT,
      RULE_ENABLE,
      searchName: undefined,
      ruleType: undefined,
      ruleProperty: undefined,
      ruleFormVisible: false,
      editRuleId: undefined
    }
  },
  components: {
    SearchInput,
    PaginationTable,
    RuleForm,
    YiwisePopConfirm
  },
  methods: {
    loadData(params) {
      this.$refs.table.loadData({
        ...this.pagingParams,
        searchName: this.searchName || undefined,
        ...params
      })
    },
    onClearFilter() {
      this.reload1stPageAndEmptyFilter()
    },
    onOpenRuleFormDialog() {
      this.ruleFormVisible = true
    },
    async onToggleRuleStatus({ enabledStatus, qcRuleId }, deleteEnum) {
      const message = {
        ENABLE: '启用',
        DISABLE: '禁用',
        DELETE: '删除'
      }
      const resultEnabledStatus = deleteEnum || (enabledStatus === 'DISABLE' ? 'ENABLE' : 'DISABLE')
      await qcAPI.updateRuleStatus({
        qcRuleId,
        enabledStatus: resultEnabledStatus
      })
      this.$message({
        message: `${message[resultEnabledStatus]}成功`,
        type: 'success'
      })
      this.loadData()
    },
    onOpenEditForm(qcRuleId) {
      this.editRuleId = qcRuleId
      this.ruleFormVisible = true
    },
    onAddSuccess() {
      this.reload1stPageAndEmptyFilter()
    },
    reload1stPageAndEmptyFilter() {
      this.searchName = undefined
      this.ruleType = undefined
      this.ruleProperty = undefined
      this.loadData({
        pageNum: 1
      })
    },
    formatSettingConditionStr(itemMap) {
      const itemList = []
      for (const key in itemMap) {
        const item = itemMap[key]
        itemList.push(`【${item.name}】介于${item.min}${item.unit}至${item.max}${item.unit}`)
      }
      return itemList.length ? itemList.join(' 并且') : '--'
    }
  },
  computed: {
    pagingParams() {
      return {
        ruleType: this.ruleType || undefined,
        ruleProperty: this.ruleProperty || undefined
      }
    }
  },
  mounted() {
    this.loadData()
  },
  watch: {
    pagingParams: {
      handler: function() {
        this.loadData()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.tab-rule {
  .header-container {
    padding-bottom: 10px;
    .clear-filter_btn {
      margin-left: 10px;
    }
    .add-rule-btn {
      float: right;
      .inner-span {
        &::before {
          content: '+';
          display: inline-block;
          font-size: 20px;
          line-height: 16px;
          margin-right: 10px;
        }
      }
    }
  }
  
  .operation-list {
    width: 95px;
    .operation-item {
      width: 33%;
      color: $--link-color;
      text-align: center;
      &:hover {
        color: $--link-hover-color;
      }
    }
  }
}
</style>
