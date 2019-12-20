<template>
  <div>
    <drag-dialog
      :visible.sync="visible"
      :showCloseIcon="false"
      width="288px"
      class="artificial-join-dialog"
    >
      <div slot="title" class="title">
        <div class="main">人工介入请求</div>
        <div class="extra">{{defaultData.notifyTime || emptyPlaceholder}}</div>
      </div>
      <div slot="body" class="content">
        <div class="content-item">
          <div class="item">
            <span class="label">任务名称：</span>
            <span>{{defaultData.robotCallJobName || emptyPlaceholder}}</span>
          </div>
          <div class="item">
            <span class="label">话术名：</span>
            <span>{{defaultData.dialogFlowName || emptyPlaceholder}}</span>
          </div>
          <div class="item">
            <span class="label">联系电话：</span>
            <span>{{defaultData.customerPersonPhoneNumber || emptyPlaceholder}}</span>
          </div>
          <div
            class="item"
            :class="hasConcern ? 'concern' : ''"
          >
            <span class="label">关注点：</span>
            <div>
              <span v-if="!hasConcern">暂无关注点</span>
              <el-tag
                v-else
                v-for="(concern, index) in defaultData.customerConcern"
                :key="index"
                type="info"
              >
                {{concern}}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="content-item">
          <div class="item">
            <span class="label">通话时长：</span>
            <span>{{duration || 0}}s</span>
          </div>
          <div class="item">
            <span class="label">创建者：</span>
            <span>{{defaultData.jobCreateUserName || emptyPlaceholder}}</span>
          </div>
        </div>
        <div class="action-group">
          <el-button
            class="refuse-btn"
            type="danger"
            round
            plain
            @click="handleRefuse"
          >
            拒绝
          </el-button>
          <el-button
            type="success"
            round
            @click="handleListen"
          >
            确认监听
          </el-button>
        </div>
      </div>
    </drag-dialog>
    <audio
      controls
      src="/static/audio/artificial_join.mp3"
      ref="join"
      class="audio"
      loop
    >
    </audio>
  </div>
</template>

<script>
import DragDialog from '@/components/DragDialog'
import { emptyPlaceholder } from '@/utils/constant'
import { updateRobotJobCallCsTransferMonitorFlagWithIdentifyId } from '@/api/cs'
import { fetchDialogFlowConfig } from '@/api/talk'
import { mapGetters } from 'vuex'

export default {
  name: 'ArtificialJoinDialog',
  components: {
    DragDialog
  },
  props: {
    defaultData: {
      type: Object,
      default() {
        return {}
      }
    },
    currentIndex: { // 当前数据所在列表的索引
      type: Number,
      default: -1
    }
  },
  computed: {
    ...mapGetters(['fsUserAgent', 'fsStatus', 'artiJoinModalVisible']),
    hasConcern() { // 是否有关注点
      const { customerConcern } = this.defaultData
      return customerConcern && customerConcern.length > 0
    }
  },
  data() {
    return {
      visible: false,
      emptyPlaceholder,
      timer: null,
      duration: Math.floor(this.defaultData.chatDuration / 1000)
    }
  },
  watch: {
    'defaultData.callStatus': {
      handler(newStatus) {
        if (newStatus === 'HANGUP') {
          clearInterval(this.timer)
          this.timer = null
        }
      }
    },
    visible: {
      handler(newVisible) {
        const { join } = this.$refs
        if (!newVisible) {
          if (join) {
            join.pause()
          }
        }
      }
    }
  },
  methods: {
    handleRefuse() { // 拒绝则删除当前这通记录
      this.$store.commit('DELETE_ARTI_JOIN_LIST', this.currentIndex)
    },
    handleListen() { // 监听发送invite请求
      const { robotCallJobId, identifyId } = this.defaultData
      if (this.fsStatus !== 0 && this.fsStatus !== 4) {
        this.$message.error('请先结束当前会话')
        this.visible = true
        return
      }
      if (!this.artiJoinModalVisible) { // 若当前页有modal打开，先关闭
        this.$store.commit('SET_MODAL_VISIBLE_SWITCH', false)
        this.$nextTick(() => {
          this.$store.commit('SET_MODAL_VISIBLE_SWITCH', true)
        })
      }
      setTimeout(() => {
        this.$store.commit('SET_ARTI_JOIN_MODAL_VISIBLE', true)
      }, 300)
      this.$store.commit('SET_CALLTYPE', 'join') // 更新通话类型为人工介入
      this.$store.commit('SET_ARTI_JOIN_MODAL_DATA', this.defaultData)
      this.$store.commit('SET_ARTI_JOIN_MODAL_TYPE', 'listen')
      this.visible = false
      if (this.fsUserAgent) {
        this.fsUserAgent.call(this.defaultData.monitorDialCode)
      }
      updateRobotJobCallCsTransferMonitorFlagWithIdentifyId({ // 更新介入状态
        robotCallJobId,
        identifyId
      })
    },
    countDuration() { // 计算通话时长
      this.timer = setInterval(() => {
        this.duration++
      }, 1000)
    }
  },
  async mounted() {
    const { data } = await fetchDialogFlowConfig(
      {
        dialogFlowId: this.defaultData.dialogFlowId
      }
    )

    let { dialogFlowHumanIntervention } = data.data
    dialogFlowHumanIntervention = dialogFlowHumanIntervention || {}

    this.$set(this.defaultData, 'dialogFlowHumanIntervention', dialogFlowHumanIntervention)
    if (dialogFlowHumanIntervention.answerMode === 'AUTO') {
      // 如果该话术的模式是自动接听
      this.handleListen()
    } else {
      // 手动接听
      this.visible = true

      const { join } = this.$refs
      this.countDuration()
      if (join) {
        join.currentTime = 0
        join.play()
      }
    }
  },
  destroyed() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

.artificial-join-dialog {
  .title {
    padding: 2px 6px;
    > .main {
      font-size: $--font-size-base;
      margin-bottom: 8px;
    }
    > .extra {
      font-size: $--font-size-small;
      font-weight: $--font-weight-primary;
    }
  }
  .content {
    > .content-item {
      padding: 18px 26px;
      border-bottom: 1px solid #f2f2f2;
      > .item {
        display: flex;
        &:nth-of-type(n + 2) {
          margin-top: 14px;
        }
        > .label {
          flex-shrink: 0;
          display: inline-block;
          color: $--color-text-regular;
          width: 66px;
        }
      }
      > .concern {
        > .label {
          margin-top: 5px;
        }
        .el-tag {
          margin: 0 4px 4px 0;
        }
      }
    }
    > .action-group {
      padding: 18px 26px;
      display: flex;
      justify-content: space-between;
      .el-button {
        width: 104px;
      }
    }
  }
}
.audio {
  opacity: 0;
  position: fixed;
  z-index: -1;
}
</style>

