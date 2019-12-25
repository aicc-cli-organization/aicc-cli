<template>
  <yiwise-dialog
    class="finance-sms-job_dialog"
    title="提示"
    :visible.sync="innerVisible"
    @close="onClose"
    @confirm="onConfirm"
    confirmWord="继续发送"
    width="611px"
  >
    <div class="unmeet-wrap">
      <div class="title">当前存在不满足数量要求的被叫类型，是否放弃发送该部分短信，继续发送？</div>
      <div class="below-content">
        <div class="title">
          <span class="label">当前短信任务发送量：</span>
          <a class="value-a">
            <span class="left" @click="onExport">
              <i class="iconfont icon-xiazaix const-icon-download"></i>
              点击下载分类数据
            </span>
            <el-tooltip :content="configText" placement="top-end">
              <i class="el-icon-question const-icon-question"></i>
            </el-tooltip>
          </a>
        </div>
        <div class="count-list">
          <div class="count-item" :class="{red: smsStatsResult.cmcc > 0 && smsStatsResult.cmcc < meetCountObj.yd_send_count}">
            <span class="job-count">移动: {{smsStatsResult.cmcc}}条</span>
            <span class="min-count">{{meetCountObj.yd_send_count}}条起</span>
          </div>
          <div class="count-item" :class="{red: smsStatsResult.cucc > 0 && smsStatsResult.cmcc < meetCountObj.lt_send_count}">
            <span class="job-count">联通: {{smsStatsResult.cucc}}条</span>
            <span class="min-count">{{meetCountObj.lt_send_count}}条起</span>
          </div>
          <div class="count-item" :class="{red: smsStatsResult.cnc > 0 && smsStatsResult.cmcc < meetCountObj.dx_send_count}">
            <span class="job-count">电信: {{smsStatsResult.cnc}}条</span>
            <span class="min-count">{{meetCountObj.dx_send_count}}条起</span>
          </div>
        </div>
      </div>
    </div>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import * as taskAPI from '@/api/task'
import * as smsAPI from '@/api/sms'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    meetCountObj: {
      type: Object,
      default() {
        return {}
      }
    },
    realCountObj: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components: {
    YiwiseDialog
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newVal) {
        this.$emit('update:visible', newVal)
      }
    },
    selectTaskId() {
      return this.$store.state.smsTask.selectSmsTaskId
    },
    smsStatsResult() {
      const tmp = {}
      for(let key in this.realCountObj) {
        tmp[key] = this.realCountObj[key] || 0
      }
      return tmp
    },
    configText() {
      const { yd_send_count, lt_send_count, dx_send_count } = this.meetCountObj
      return `金融短信发送数量必须达到要求：移动${yd_send_count}条起，联通${lt_send_count}条起，电信${dx_send_count}条起！`
    }
  },
  methods: {
    onClose() {
      this.innerVisible = false
    },
    async onConfirm() {
      this.$emit('confirm')
      this.onClose()
    },
    onExport() {
      smsAPI.exportSmsMsg({ smsJobId: this.selectTaskId, sendStatus: 'SEND_WAIT' })
        .then(({ data }) => {
          if (data.code === 200) {
            this.$store.commit('SHOW_DOWNLOAD_AND_UPLOAD_DOT')
            this.$message({
              message: '操作成功！详细结果请在导入导出列表查看',
              type: 'success'
            })
          } else {
            this.$message({
              message: '导出失败',
              type: 'error'
            })
          }
        })
    }
  },
}
</script>

<style lang="scss" scoped>
@import "src/styles/variables.scss";
.finance-sms-job_dialog {
  /deep/ .el-dialog__header {
    margin-bottom: 0;
    line-height: initial;
  }
  /deep/ .el-dialog__body {
    padding: 0 !important;
  }
  .unmeet-wrap {
    padding: 67px 29px 71px 38px;
    > .title {
      color: #333333;
      line-height: 22px;
      font-weight: 700;
      font-size: 16px;
    }
    > .below-content {
      margin-top: 34px;
      background-color: #f7f7f7;
      padding: 19px 41px 16px 28px;
      > .title {
        line-height: 17px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        > .label {
          color: #4A4A4A;
        }
        > .value-a {
          color: $--link-color;
          > .left {
            > .const-icon-download {
              font-size: 12px;
              margin-right: 8px;
              font-weight: 700;
            }
          }
          > .const-icon-question {
            font-size: 12px;
            color: #666666;
            margin-left: 12px;
          }
        }
      }
      .count-list {
        display: flex;
        justify-content: space-between;
        margin-top: 22px;
        .count-item {
          width: 127px;
          text-align: center;
          color: #333333;
          &.red {
            color: #EE1730;
            .job-count {
              border-color: #EE1730;
            }
          }
          .job-count {
            display: block;
            line-height: 42px;
            border: 1px solid #333333;
            font-size: 12px;
          }
          .min-count {
            margin-top: 6px;
            display: block;
            font-size: 10px;
            line-height: 14px;
          }
        }
      }
    }
  }
}
</style>
