<!--
  首页5栏
-->
<template>
<div>
  <el-row class="panel-group" :gutter="1">
    <div class="panel-item-container">
      <div class="panel-item">
        <img src="/static/img/homepage/home_icon_waihuzongliang.png" alt="">
        <div class="right-container">
          <div class="panel-num">
            <count-to class="f26"  :startVal="0" :endVal="completedTask" :duration="2600"></count-to>位
          </div>
          <span class="title">外呼{{customerStr}}总量</span>
        </div>
      </div>
    </div>
    <div class="panel-item-container">
      <div class="panel-item">
        <img src="/static/img/homepage/home_icon_jietingzongliang.png" alt="">
        <div class="right-container">
          <div class="panel-num">
            <count-to class="f26" :startVal="0" :endVal="answeredTask" :duration="2600"></count-to>位
          </div>
          <span class="title">接通{{customerStr}}总量</span>
        </div>
      </div>
    </div>
    <div class="panel-item-container">
      <div class="panel-item">
        <img src="/static/img/homepage/home_icon_jietinglv.png" alt="">
        <div class="right-container">
          <div class="panel-num">
            <count-to class="f26" :startVal="0" :endVal="answeredRate" :decimals="2" :duration="2600"></count-to>%
          </div>
          <span class="title">接听率</span>
        </div>
      </div>
    </div>
    <div class="panel-item-container">
      <div class="panel-item">
        <img src="/static/img/homepage/home_icon_pingjuntonghuashichang.png" alt="">
        <div class="right-container">
          <div class="panel-num">
            <count-to class="f26" :startVal="0" :endVal="averageDuration" :decimals="1" :duration="2600"></count-to>秒
          </div>
          <span class="title">平均通话时长</span>
        </div>
      </div>
    </div>
    <div class="panel-item-container panel-item-container-1-5">
      <div class="panel-item">
        <img src="/static/img/homepage/home_icon_abzhanbi.png" alt="">
        <div class="right-container">
          <div class="panel-num">
            <count-to class="f26" :startVal="0" :endVal="vipAccount" :duration="2600"></count-to>位
            (<count-to class="f16" :startVal="0" :endVal="vipRatio" :decimals="2" :duration="2600"></count-to>%)
          </div>
          <span class="title">重点关注{{customerStr}}占接通电话比
            <el-tooltip class="item" effect="dark" :content="intentCustomer" placement="top-start">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          
        </div>
      </div>
    </div>
  </el-row>
</div>
</template>

<script>
import CountTo from 'vue-count-to'
import { mapGetters } from 'vuex'

export default {
  components: {
    CountTo
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    },
    isEmptyIntentLevel() {
      for (var key in this.intentLevel) {
        if (this.intentLevel[key] !== 0) {
          return false
        }
      }
      return true
    }
  },
  props: {
    completedTask: {
      type: Number,
      default: 0
    },
    answeredTask: {
      type: Number,
      default: 0
    },
    answeredRate: {
      type: Number,
      default: 0
    },
    averageDuration: {
      type: Number,
      default: 0
    },
    ABRatio: {
      type: Number,
      default: 0
    },
    intentLevel: {
      type: Object,
      default() {
        return {}
      }
    },
    intentLevelTagDetailList: {
      type: Array,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters(['customerStr']),
    intentCustomer() {
      return `重点关注${this.customerStr}意向为“${this.intentCustomerA}”，“${this.intentCustomerB}”`
    },
    intentCustomerA() {
      return this.intentLevelNameList[0]
    },
    intentCustomerB() {
      return this.intentLevelNameList[1]
    },
    intentLevelLength() {
      return Object.keys(this.intentLevel).length
    },
    intentLevelNameList() {
      return this.intentLevelTagDetailList.map(item => item.name)
    },
    vipAccount() {
      let account = 0
      if (this.intentLevelLength === 0) {
        account = 0
      } else if (this.intentLevelLength === 1) {
        account = this.intentLevel[Object.keys(this.intentLevel)[0]] || 0
      } else if (this.intentLevelLength >= 2) {
        account = (this.intentLevel[Object.keys(this.intentLevel)[0]] || 0) + (this.intentLevel[Object.keys(this.intentLevel)[1]] || 0)
      }
      return account
    },
    vipRatio() {
      let account = 0
      if (this.answeredTask === null || this.answeredTask === 0) {
        account = 0
      } else if (this.intentLevelLength === 0) {
        account = 0
      } else if (this.intentLevelLength === 1) {
        if (this.intentLevel[Object.keys(this.intentLevel)[0]] === 0) {
          account = 0
        } else {
          account = 100
        }
      } else if (this.intentLevelLength === 2) {
        if (this.intentLevel[Object.keys(this.intentLevel)[0]] +
          this.intentLevel[Object.keys(this.intentLevel)[1]] === 0) {
          account = 0
        } else {
          account = 100
        }
      } else {
        account = this.vipAccount / this.answeredTask * 100
      }
      return account
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.group-title {
  height: 40px;
  font-size: 16px;
  line-height: 40px;
  font-weight: 700;
}
.panel-group {
  background: #fff;
  width: 100%;
  height: 76px;
  display: flex;
  border: 1px solid #f0f0f0;
  .panel-item-container-1-5{
    flex: 1.4 !important;
  }
  .panel-item-container {
    flex: 1;
    .panel-item {
      display: flex;
      font-size: 12px;
      color: #101010;
      margin: 10px 0 0 0;
      img {
        display: inline-block;
        height: 56px;
        width: 56px;
        margin: 0 13px 0 48px;
      }
      .right-container {
        padding: 8px 0;
        flex: 1;
        .title {
          margin-bottom: 8px;
          display: -webkit-box;
        }
        .panel-num {
          display: -webkit-box;
        }
      }
    }

  }
  .panel-item-container:not(:first-child)>.panel-item {
    border-left: 1px solid #eee;
  }
}
.c666 {
  color: #666;
}
</style>
