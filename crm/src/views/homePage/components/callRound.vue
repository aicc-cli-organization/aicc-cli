<template>
  <el-row class="status-container" :style="{height:height}">
    <el-col class="card-panel-col">
      <div class="statistics-container">
        <div class="content-container">
          <div class="left-container">
            <div class="img" style="background: #F9C9C9"></div>
          </div>
          <div class="middle-container">
            <div class="status">
              <span>0-3轮</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.LESS_3}}</span>
            </div>
          </div>
        </div>
        <div class="content-container">
          <div class="left-container">
            <div class="img" style="background: #FBA2A2"></div>
          </div>
          <div class="middle-container">
            <div class="status">
              <span>3-5轮</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.F3_T6}}</span>
            </div>
          </div>
        </div>

        <div class="content-container">
          <div class="left-container">
            <div class="img" style="background: #FB5656"></div>
          </div>
          <div class="middle-container">
            <div class="status">
              <span>6-10轮</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.F6_T10}}</span>
            </div>
          </div>
        </div>

        <div class="content-container">
          <div class="left-container">
            <div class="img" style="background: #CE3E3E"></div>
          </div>
          <div class="middle-container">
            <div class="status">
              <span>10轮以上</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.F10_MORE}}</span>
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
