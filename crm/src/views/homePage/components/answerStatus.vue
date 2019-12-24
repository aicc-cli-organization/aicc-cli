<template>
  <el-row class="status-container" :style="{height:height}">
    <el-col class="card-panel-col">
      <div class="statistics-container">
        <div class="content-container">
          <div class="left-container">
            <img src="/static/img/call-amount.png" alt="">
          </div>
          <div class="middle-container">
            <div class="status">
              <span>已接通</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.ANSWERED}}</span>
            </div>
          </div>
        </div>

        <div class="content-container border-top">
          <div class="left-container">
            <img src="/static/img/call-amount.png" alt="">
          </div>
          <div class="middle-container">
            <div class="status">
              <span>未接</span>
              <span>占线</span>
              <span>关机</span>
              <span>停机</span>
              <span>拒接</span>
              <span>空号</span>
              <span>无法接通</span>
            </div>

          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.NO_ANSWER}}</span>
              <span>{{stats.BUSY}}</span>
              <span>{{stats.POWER_OFF}}</span>
              <span>{{stats.OUT_OF_SERVICE}}</span>
              <span>{{stats.REFUSED}}</span>
              <span>{{stats.VACANT_NUMBER}}</span>
              <span>{{stats.CAN_NOT_CONNECT}}</span>
            </div>
          </div>
        </div>

        <div class="content-container  border-top">

          <div class="left-container">
            <img src="/static/img/call-amount.png" alt="">
          </div>
          <div class="middle-container">
            <div class="status">
              <span>主叫欠费</span>
              <span>外呼失败</span>
            </div>

          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.FROM_PHONE_ERROR}}</span>
              <span>{{stats.SYSTEM_ERROR}}</span>
            </div>
          </div>
        </div>

      </div>
    </el-col>
  </el-row>
</template>

<script>
  import CountTo from 'vue-count-to'

  export default {
    components: {
      CountTo
    },
    methods: {
      handleSetLineChartData(type) {
        this.$emit('handleSetLineChartData', type)
      }
    },
    props: {
      height: {
        type: String,
        default: '320px'
      },
      stats: {
        type: Object,
        default() {
          return {}
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .status-container {
    display: flex;
    .card-panel-col:last-child{
      margin-right: 0px;
    }

    .card-panel-col{
      background: transparent;
      flex: 1;
      display: flex;
      margin-right: 13px;

      .statistics-container {
        flex: 1;
        background: transparent;
        border-radius: 4px;
        border: 1px solid transparent;

        .title-container {
          height: 38px;
          font-size: 12px;
          background: #f0f3f8;
          border-bottom: 1px solid #c7cedb;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;

          .text {
            display: inline-block;
            margin: 14px;
          }
        }
        .content-container + .content-container {
          padding-top: 6px;
        }
        .border-top {
          border-top: 1px solid #eee;
        }
        .content-container {
          padding: 10px;
          margin: 0 20px;
          font-size: 14px;
          line-height: 22px;
          display: flex;
          .left-container {
            position: relative;
            flex: 1;
            display: flex;
            text-align: center;
            justify-content: center;
            align-items: center;
            flex-direction: row;
            img,.img {
              height: 20px;
              width: 20px;
            }
          }
          .middle-container{
            flex: 2;
            min-width: 100px;
            margin-right: 50px;
            text-align: right;
            span {
              display: block;
            }
          }
          .right-container {
            flex: 2;
            span {
              display: block;
            }
          }
        }
      }
    }
  }
</style>
