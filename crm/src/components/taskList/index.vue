<template>
  <!-- 适用于类似 呼叫任务 ，短信群发任务等左侧列表类似组件 -->
  <div class="task-list-wrap">
    <div class="empty-list" v-if="totalElements === 0">{{emptyText}}</div>
    <div class="task-list" v-if="totalElements > 0">
      <slot></slot>
    </div>
    <el-pagination
      small
      layout="prev, pager, next"
      :current-page="pageNum"
      :page-size="20"
      :total="totalElements"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  props: {
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    totalElements: undefined
  },
  data() {
    return {
      pageNum: 1
    }
  },
  methods: {
    handleCurrentChange(pageNum) {
      this.pageNum = pageNum
      this.$emit('change', pageNum)
    }
  }
}
</script>


<style lang="scss" scoped>
@import "src/styles/mixin.scss";

ul {
  margin: 0;
  padding: 0;
  li {
    list-style-type: none;
  }
}

.task-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  .task-list {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    @include transparentScrollBar();

    /deep/ .task-item {
      width: 244px;
      position: relative;
      padding: 12px 9px;
      background-color: white;
      margin-top: 12px;
      border-radius: 4px;

      &:first-child {
        margin-top: 0;
      }

      &:hover {
        .title .right-area {
          &.hover-effect {
            .status {
              display: none;
            }
            .icons {
              display: block;
              text-align: right;

              i {
                color: #1890FF;
              }

              span {
                margin-left: 5px;
              }
            }
          }
        }
      }

      &.active {
        border: 2px solid #1890FF;
        .arrow {
          display: block;
        }
      }

      .arrow {
        display: none;
        position: absolute;
        width: 0;
        height: 0;
        border-width: 8px;
        border-style: solid;
        border-color: transparent transparent transparent #1890FF;
        top: 50%;
        right: -16px;
        margin-top: -8px;
      }

      .title {
        font-size: 16px;
        display: flex;
        color: #4A4A4A;
        justify-content: space-between;

        .left {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 600;
          line-height: 24px;
        }

        .right-area {
          width: 60px;
          margin-left: 7px;
          font-size: 12px;

          .status {
            float: right;
            padding: 0 6px;
            height: 24px;
            text-align: center;
            line-height: 24px;
            font-size: 12px;
          }

          .icons {
            display: none;
            width: 60px;
            height: 24px;
            line-height: 24px;
            font-size: 16px;
            text-align: center;
            &.disabled {
              color: #999999 !important;
            }
          }
        }
      }

      .progress {
        margin-top: 16px;
        font-size: 13px;
        display: flex;

        .progress-wrap {
          flex: 1;
          margin-left: 8px;

          /deep/ .el-progress-bar__innerText {
            display: none !important;
          }
        }
      }

      .creation {
        margin-top: 16px;
        font-size: 13px;
        color: #666666;

        .name {
          margin-bottom: 2px;
        }
      }
    }
  }

  .empty-list {
    width: 244px;
    height: 100%;
    background-color: white;
    color: #333333;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    font-size: 18px;
  }

  .el-pagination {
    background-color: white;
    text-align: center;
    width: 244px;
  }
}
</style>
