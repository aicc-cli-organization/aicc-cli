<template>
  <el-row class="status-container" :style="{height:height}">
    <el-col class="card-panel-col">
      <div class="statistics-container">
        <div class="content-container">

          <div class="left-container">
            <div class="img" style="background: #FBE5D6"></div>
          </div>
          <div class="middle-container">
            <div class="status">
              <span><10s</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.LESS_10S}}</span>
            </div>
          </div>
        </div>
        <div class="content-container">

          <div class="left-container">
            <div class="img" style="background: #F8CBAD"></div>
          </div>
          <div class="middle-container">
            <div class="status">
              <span>10s-1min</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.F10S_T1MIN}}</span>
            </div>
          </div>
        </div>

        <div class="content-container">

          <div class="left-container">
            <div class="img" style="background: #F4B183"></div>
          </div>
          <div class="middle-container">
            <div class="status">
              <span>1min-2min</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.F1MIN_T2MIN}}</span>
            </div>
          </div>
        </div>

        <div class="content-container">

          <div class="left-container">
            <div class="img" style="background: #C55A11"></div>
          </div>
          <div class="middle-container">
            <div class="status">
              <span>2min-3min</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.F2MIN_T3MIN}}</span>
            </div>
          </div>
        </div>

        <div class="content-container">

          <div class="left-container">
            <div class="img" style="background: #843C0B"></div>
          </div>
          <div class="middle-container">
            <div class="status">
              <span>>3min</span>
            </div>
          </div>
          <div class="right-container">
            <div class="amount">
              <span>{{stats.F3MIN_TMORE}}</span>
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
            margin-right: 50px;
            min-width: 100px;
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
