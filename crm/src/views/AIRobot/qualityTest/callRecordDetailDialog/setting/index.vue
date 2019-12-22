<template>
  <div class="record-setting">
    <div class="header">
      <div class="header-left">
        <div class="header-left-item">
          <div class="header-left-label">坐席姓名</div>
          <div class="header-left-value">{{csName}}</div>
        </div>
        <div class="header-left-item">
          <div class="header-left-label">{{customerStr}}姓名</div>
          <div class="header-left-value">{{customerPersonName}}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="header-right-item">
          <score-color :score="qcSum.score">
            <div class="header-right-label">AI质检</div>
            <div class="header-right-value">{{qcSum.score}}</div>
          </score-color>
        </div>
        <div class="header-right-item">
          <score-color :score="qcSum.madeScore">
            <div class="header-right-label">人工复核</div>
            <div class="header-right-value">{{qcSum.madeScore || '待打分'}}</div>
          </score-color>
        </div>
      </div>
    </div>
    <div class="scroll-views">
      <div class="sum info-row">
        <div class="title">质检总览</div>
        <div class="sum-item">
          <span class="label">得分:</span>
          {{qcSum.score}}分(总分: {{qcSum.jobFullScore}}分, 基础分: {{qcSum.jobBaseScore}}分)
        </div>
        <div class="sum-item"><span class="label">语速:</span> {{qcSum.speed}}字/分钟</div>
        <el-row class="sum-item" :gutter="24">
          <el-col :span="12">
            <span class="label">静音比: </span>{{qcSum.muteRate}}%
          </el-col>
          <el-col :span="12">
            <span class="label">静音总时长: </span>{{qcSum.muteDuration}}毫秒
          </el-col>
        </el-row>
      </div>
      <div class="keywords info-row">
        <div class="title">质检关键词<total-score :scoreList="keyWordsList"></total-score></div>
        <el-table :data="keyWordsList">
          <el-table-column label="关键词" width="70px" prop="triggerKeyWords"></el-table-column>
          <el-table-column label="触发次数(次)" width="100px" prop="triggerCount"></el-table-column>
          <el-table-column label="规则id" width="60px" prop="qcRuleId"></el-table-column>
          <el-table-column label="规则名" width="60px" prop="ruleName"></el-table-column>
          <el-table-column label="规则类型" width="80px">
            <template slot-scope="{ row }">{{RULE_TYPE[row.ruleType]}}</template>
          </el-table-column>
          <el-table-column label="分值(分)" width="80px">
            <template slot-scope="{ row }">
              {{row.score}}({{row.ruleScore}}分/{{row.ruleRate === 'ONCE' ? '次' : '通'}})
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="concern info-row">
        <div class="title">业务关注点<total-score :scoreList="focusList"></total-score></div>
        <el-table :data="focusList">
          <el-table-column label="条件" width="70px" prop="name"></el-table-column>
          <el-table-column label="数值" width="100px">
            <template slot-scope="{ row }">
              {{row.triggerData}}{{row.unit}}
            </template>
          </el-table-column>
          <el-table-column label="规则id" width="60px" prop="qcRuleId"></el-table-column>
          <el-table-column label="规则名" width="60px" prop="ruleName"></el-table-column>
          <el-table-column label="规则类型" width="80px">
            <template slot-scope="{ row }">{{RULE_TYPE[row.ruleType]}}</template>
          </el-table-column>
          <el-table-column label="分值(分)" width="80px">
            <template slot-scope="{ row }">
              {{row.score}}({{row.ruleScore}}分/通)
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="recheck info-row">
      <div class="title">人工复核</div>
      <div class="recheck-details" v-if="!recheckFormEdit">
        <div class="recheck-detail-item">
          <span class="label">得分:</span>
          <span class="value">{{qcSum.madeScore ? `${qcSum.madeScore}分` : '暂无打分'}}</span>
          <a v-if="hasAccess('crm_qc_job_made')" class="edit-made" @click="onEditRecheckForm">编辑</a>
        </div>
        <div class="recheck-detail-item">
          <span class="label">备注:</span>
          <span class="comment-value">{{qcSum.madeComment || '暂无备注'}}</span>
        </div>
        <div class="recheck-detail-item" v-if="qcSum.madeUserName">
          <span class="label">复核人:</span>
          <span class="value">{{qcSum.madeUserName}}</span>
        </div>
      </div>
      <recheck-form
        @recheckSuccess="onRecheckSuccess"
        :visible.sync="recheckFormEdit"
        :qcJobRecordId="qcJobRecordId"
        v-else
      ></recheck-form>
    </div>
  </div>
</template>

<script>
import { RULE_TYPE } from '../../utils/enum'
import RecheckForm from './recheckForm'
import ScoreColor from './scoreColor'
import TotalScore from './totalScore'
import { mapGetters } from 'vuex'

export default {
  props: {
    csName: String,
    customerPersonName: String,
    qcSum: {
      type: Object,
      default() {
        return {}
      }
    },
    keyWordsList: {
      type: Array,
      default() {
        return []
      }
    },
    focusList: {
      type: Array,
      default() {
        return []
      }
    },
    qcJobRecordId: [String, Number]
  },
  data() {
    return {
      RULE_TYPE,
      recheckFormEdit: false
    }
  },
  components: {
    RecheckForm,
    ScoreColor,
    TotalScore
  },
  computed: {
    ...mapGetters([
      'name', 'customerStr'
    ])
  },
  methods: {
    onEditRecheckForm() {
      this.recheckFormEdit = true
    },
    onRecheckSuccess({ score: madeScore, comment: madeComment }) {
      this.qcSum.madeScore = madeScore
      this.qcSum.madeComment = madeComment
      this.qcSum.madeUserName = this.name
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
.cutwords {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-setting {
  display: flex;
  flex-direction: column;
  > .header {
    padding: 30px 20px;
    &::after {
      content: '';
      clear: both;
      display: block;
    }
    .header-left {
      float: left;
      .header-left-item {
        display: inline-block;
        margin-right: 10px;
        .header-left-label {
          font-size: 12px;
          color: #666666;
        }
        .header-left-value {
          font-size: 14px;
          line-height: 22px;
        }
      }
    }
    .header-right {
      float: right;
      .header-right-item {
        width: 62px;
        height: 45px;
        text-align: center;
        display: inline-block;
        border-radius: 2px;
        margin-left: 10px;
        .header-right-label {
          background-color: white;
          font-size: 12px;
          color: #666666;
          padding: 2px 0;
        }
        .header-right-value {
          font-size: 14px;
          color: white;
          padding: 4px 0;
        }
      }
    }
  }
  .scroll-views {
    overflow-x: hidden;
    overflow-y: auto;
  }
  .info-row {
    padding: 20px 0 10px 20px;
    width: 480px;
    .title {
      position: relative;
      color: #333333;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 10px;
      &::before {
        content: '';
        position: absolute;
        left: -10px;
        top: 0;
        width: 4px;
        height: 100%;
        background-color: #1890ff;
      }
    }
    &.sum {
      .sum-item {
        line-height: 16px;
        > .label {
          color: #666666;
        }
      }
    }
    &.recheck {
      .recheck-details {
        .recheck-detail-item {
          line-height: 16px;
          > .label {
            color: #666666;
            float: left;
            width: 50px;
          }
          > .comment-value {
            display: block;
            margin-left: 50px;
          }
          > .edit-made {
            color: $--link-color;
            &:hover {
              color: $--link-hover-color;
            }
          }
        }
      }
    }
  }
}
</style>
