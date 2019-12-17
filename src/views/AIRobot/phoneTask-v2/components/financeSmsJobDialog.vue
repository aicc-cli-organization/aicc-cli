<template>
  <yiwise-dialog
    class="finance-sms-job_dialog"
    title="提示"
    :visible.sync="innerVisible"
    @close="onClose"
    @open="onOpen"
    @confirm="onConfirm"
    :confirmWord="confirmWord"
    width="611px"
  >
    <template v-if="isMeet">
      <div class="meet-wrap">
        <i class="el-icon-warning const-icon-warning"></i>
        <div class="right-desc">
          <div class="title">确定开始该任务？</div>
          <div class="content">
            由于任务中设置了短信发送规则，当前{{customerStr}}数满足金融类短信发送要求，不代表任务运行后所有{{customerStr}}都满足发送短信规则
            <span class="config-text">({{configText}})</span>
            ，届时可能会因为数量不足而发送失败，请知晓！
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="unmeet-wrap">
        <div class="title">当前存在不满足数量要求的被叫类型，是否放弃发送该部分短信，继续外呼？</div>
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
            <div class="count-item" :class="{red: smsStatsResult.cmcc > 0 && smsStatsResult.cmcc < configCount.yd_send_count}">
              <span class="job-count">移动: {{smsStatsResult.cmcc}}条</span>
              <span class="min-count">{{configCount.yd_send_count}}条起</span>
            </div>
            <div class="count-item" :class="{red: smsStatsResult.cucc > 0 && smsStatsResult.cmcc < configCount.lt_send_count}">
              <span class="job-count">联通: {{smsStatsResult.cucc}}条</span>
              <span class="min-count">{{configCount.lt_send_count}}条起</span>
            </div>
            <div class="count-item" :class="{red: smsStatsResult.cnc > 0 && smsStatsResult.cmcc < configCount.dx_send_count}">
              <span class="job-count">电信: {{smsStatsResult.cnc}}条</span>
              <span class="min-count">{{configCount.dx_send_count}}条起</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import * as taskAPI from '@/api/task'
import { mapGetters } from 'vuex'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    smsStats: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components: {
    YiwiseDialog
  },
  data() {
    return {
      configText: '',
      isMeet: false,
      configCount: {}
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    innerVisible: {
      get() {
        return this.visible
      },
      set(newVal) {
        this.$emit('update:visible', newVal)
      }
    },
    selectTaskId() {
      return this.$store.state.taskV2.selectTaskId
    },
    smsStatsResult() {
      const tmp = {}
      for(let key in this.smsStats) {
        tmp[key] = this.smsStats[key] || 0
      }
      return tmp
    },
    confirmWord() {
      return this.isMeet ? '确定开始' : '继续外呼'
    }
  },
  methods: {
    async loadSmsConfig() {
      const res = await taskAPI.getSmsConfig()
      const resMap = {}
      res.data.data.forEach(item => {
        resMap[item.configKey] = item.configValue
      })
      const { yd_send_count, lt_send_count, dx_send_count } = resMap
      this.configCount = resMap
      const { cmcc, cucc, cnc } = this.smsStats
      const isMeet = (cmcc || yd_send_count) >= yd_send_count && (cucc || lt_send_count) >= lt_send_count && (cnc || dx_send_count) >= dx_send_count
      const noLimit = +yd_send_count === 0 && +lt_send_count === 0 && +dx_send_count === 0
      this.isMeet = isMeet || noLimit
      this.configText = `金融短信发送数量必须达到要求：移动${yd_send_count}条起，联通${lt_send_count}条起，电信${dx_send_count}条起！`
    },
    onClose() {
      this.innerVisible = false
    },
    async onConfirm() {
      const conditionCancelSend = this.isMeet ? 'NOT_LIMIT' : 'LIMIT'
      await taskAPI.updateJobCancelSend({
        robotCallJobId: this.selectTaskId,
        conditionCancelSend
      })
      this.$emit('confirm')
      this.onClose()
    },
    onOpen() {
      this.loadSmsConfig()
    },
    onExport() {
      taskAPI.exportCustomerPerson({ robotCallJobId: this.selectTaskId }, 'UNCALLED_LIST')
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
  }
  /deep/ .el-dialog__body {
    padding: 0 !important;
  }
  .meet-wrap {
    padding: 79px 90px 79px 103px;
    > .const-icon-warning {
      float: left;
      color: $--color-warning;
      font-size: 34px;
    }
    > .right-desc {
      margin-left: 58px;
      > .title {
        color: #333333;
        font-size: 16px;
        line-height: 28px;
        font-weight: 700;
      }
      > .content {
        font-size: 12px;
        line-height: 24px;
        color: #333333;
        text-align: justify;
        > .config-text {
          color: $--color-warning;
        }
      }
    }
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
