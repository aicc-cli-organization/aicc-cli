<template>
  <div class="rule-form-item">
    <el-form-item
      label="质检规则"
    >
      <el-select
        class="rule-select"
        multiple
        filterable
        placeholder="请选择质检规则，支持规则名搜索"
        @visible-change="loadRuleList"
        v-model="ruleIdList">
        <el-option
          v-for="(item, index) in optionRuleList"
          :key="index"
          :label="`id:${item.qcRuleId} ${item.ruleName}`"
          :value="item.qcRuleId"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="ruleList" class="rule-table">
      <el-table
        stripe
        :data="innerValue"
      >
        <el-table-column prop="qcRuleId" width="60px" label="规则id"></el-table-column>
        <el-table-column prop="ruleName" label="规则名" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="规则类型">
          <template slot-scope="{ row }">{{RULE_TYPE[row.ruleType]}}</template>
        </el-table-column>
        <el-table-column width="90px" label="加/减分要求">
          <template slot-scope="{ row }">{{RULE_WEIGHT[row.ruleWeight]}}</template>
        </el-table-column>
        <el-table-column width="120px" label="加/减分频率">
          <template slot-scope="{ row }">
            <el-select v-model="row['ruleRate']">
              <el-option
                v-for="(v, k) in RULE_RATE"
                :key="k"
                :label="v"
                :value="k"
                :disabled="row.ruleProperty === 'FOCUS' && k === 'ONCE'"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="分值(分)">
          <template slot-scope="{ row }">
            <el-input v-model="row['ruleScore']" placeholder="分值"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="50px">
          <template slot-scope="{ row }">
            <a @click="onDelItem(row.qcRuleId)">删除</a>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
  </div>
</template>

<script>
import * as qcAPI from '@/api/qualityTest'
import { RULE_TYPE, RULE_WEIGHT, RULE_RATE } from '../../utils/enum'

export default {
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    },
    isEdit: Boolean
  },
  data() {
    return {
      optionRuleList: [],
      ruleIdList: [],
      RULE_RATE,
      RULE_TYPE,
      RULE_WEIGHT
    }
  },
  computed: {
    innerValue: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    },
    tableData() {
      return this.optionRuleList.filter(item => this.ruleIdList.includes(item.qcRuleId))
    }
  },
  methods: {
    async loadRuleList(visible, callback) {
      if (!visible) return
      const res = await qcAPI.pagingRuleEngineList({
        pageNum: 1,
        pageSize: 999
      })
      const ruleList = res.data.data.content.filter(item => item.enabledStatus === 'ENABLE')
      if (callback) {
        callback && callback(ruleList)
      } else {
        this.optionRuleList = ruleList.map(item => {
          const index = this.ruleIdList.indexOf(item.qcRuleId)
          if (index > -1) {
            item.ruleRate = this.value[index].ruleRate
            item.ruleScore = this.value[index].ruleScore
          }
          return item
        })
      }
    },
    onDelItem(qcRuleId) {
      const index = this.ruleIdList.indexOf(qcRuleId)
      this.ruleIdList.splice(index, 1)
    },
    resetData() {
      Object.assign(this.$data, this.$options.data())
    }
  },
  mounted() {
    // if (!this.isEdit) return
    const initRuleIdList = this.value.map(item => item.qcRuleId) // 初始化
    this.loadRuleList(true, (optionList) => {
      optionList.forEach(item => {
        const index = initRuleIdList.indexOf(item.qcRuleId)
        if (index > -1) {
          item.ruleRate = this.value[index].ruleRate
          item.ruleScore = this.value[index].ruleScore
        }
      })
      this.optionRuleList = optionList
      this.ruleIdList = initRuleIdList
    })
  },
  watch: {
    ruleIdList: {
      handler: function(newVal) {
        if (this.optionRuleList && this.optionRuleList.length) {
          this.innerValue = this.optionRuleList.filter(item => newVal.includes(item.qcRuleId))
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.rule-form-item {
  margin-bottom: 10px;
  .rule-select {
    width: 100%;
  }
  /deep/ .el-form-item__label {
    &::before {
      content: '*';
      color: #f56c6c;
      margin-right: 4px;
    }
  }
}
</style>
