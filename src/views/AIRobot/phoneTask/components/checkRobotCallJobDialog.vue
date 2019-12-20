<template>
  <yiwise-dialog
    :visible.sync="innerVisible"
    @confirm="handleSubmit"
    @cancel="handleClose"
    :confirm-word="dialogConfig.confirmWord"
    :title="dialogConfig.title"
  >
    <div class="executable-wrap" v-if="executableList.length">
      <el-checkbox class="check-all" v-model="isAllCheck" :indeterminate="isIndeterminate">全选</el-checkbox>
      <el-checkbox-group class="checkbox-group" v-model="checkIds">
        <el-checkbox v-for="(executable, index) in executableList" :key="index" :label="executable.robotCallJobId">
          <div class="checkbox-item">
            <span>{{executable.robotCallJobName}}</span>
            <span class="right-info">
              <span>{{executable.createUserName}}创建于{{executable.createTime}}</span>
              <span class="status" :style="{'background-color':switchStatusColor(executable.status).bgColor,color:switchStatusColor(executable.status).color}">{{constant.robotCallJobStatus[executable.status]}}</span>
            </span>
          </div>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="empty-text" v-else>暂无{{operation === 'START' ? '可开始' : '可暂停'}}的任务</div>
    <div class="tip">
      <i class="el-icon-warning"></i>
      <span>{{dialogConfig.tipText}}</span>
    </div>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import * as taskAPI from '@/api/task'
import { switchStatusColor } from '../utils/enum'
import * as constant from '@/utils/constant'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    operation: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      executableList: [],
      checkIds: [],
      constant,
      switchStatusColor
    }
  },
  components: {
    YiwiseDialog
  },
  methods: {
    getCheckedRobotCallJobList() {
      const checkedList = []
      this.executableList.forEach((item) => {
        if (this.checkIds.includes(item.robotCallJobId)) {
          checkedList.push(item)
        }
      })
      return checkedList
    },
    async handleSubmit() {
      const executable = this.getCheckedRobotCallJobList()
      if (executable.length === 0) {
        this.$message.error('请至少选择一项')
        return
      }
      const { code, data } = (await taskAPI.executeAllRobotCallJobList({
        operation: this.operation,
        executable,
      })).data
      this.innerVisible = false
      if (code === 200) {
        this.$message.success('操作成功')
        this.$emit('executeCallback', data)
      }
    },
    handleClose() {
      this.executableList = []
      this.checkIds = []
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    },
    isAllCheck: {
      get() {
        return this.checkIds.length > 0 && this.checkIds.length === this.executableList.length
      },
      set(value) {
        this.checkIds = value ? this.executableList.map((item) => item.robotCallJobId) : []
      }
    },
    isIndeterminate() {
      return this.checkIds.length > 0 && this.checkIds.length < this.executableList.length
    },
    dialogConfig() {
      let tipText = ''
      let title = ''
      let confirmWord = ''
      if (this.operation === 'START') {
        tipText = '状态为“未开始”“用户暂停”“系统挂起”的任务可以开始，请知悉！'
        title = '以下任务将被开始'
        confirmWord = '确定开始'
      } else if (this.operation === 'PAUSE') {
        tipText = '状态为“排队中”“进行中”“系统暂停”的任务可以暂停，请知悉！'
        title = '以下任务将被暂停'
        confirmWord = '确定暂停'
      }
      return { tipText, title, confirmWord }
    }
  },
  watch: {
    async innerVisible(value) {
      if (value && this.operation) {
        this.executableList = (await taskAPI.checkAllRobotCallJobList({
          operation: this.operation
        })).data.data.executable
        // 默认全选
        this.checkIds = this.executableList.map(item => item.robotCallJobId)
      } else {
        this.checkIds = []
        this.isAllCheck = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~src/styles/mixin.scss";

ul {
  padding: 0;
  margin: 0;
  li {
    list-style-type: none;
  }
}

/deep/ .el-dialog__header {
  margin-bottom: 0;
  border-bottom: 1px solid #d8d8d8;
}

/deep/ .el-dialog__body {
  padding: 12px 20px !important;

}

.executable-wrap {
  background-color: #F7F7F7;

  /deep/ .el-checkbox {
    display: flex !important;
    align-items: center;
    .el-checkbox__label {
      flex: 1;
    }
  }

  .check-all {
    border-bottom: 1px solid #cccccc;
  }

  .el-checkbox {
    width: 100%;
    height: 40px;
    line-height: 40px;
    padding: 0 14px;
    display: block;
    & + .el-checkbox {
      margin-left: 0;
    }
  }

  /deep/ .el-checkbox__label {
    color: #333333;
  }

  .checkbox-group {
    max-height: 280px;
    overflow: auto;
    @include transparentScrollBar();
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .right-info {
      .status {
        display: inline-block;
        width: 64px;
        line-height: 24px;
        text-align: center;
      }
    }
  }
}
.empty-text {
  color: #E99209;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 10px;
  text-align: center;
}
.tip {
  color: #666666;
  white-space: pre-wrap;
  margin-top: 4px;
  font-size: 12px;
  i {
    margin-right: 8px;
    color: #8A99BE;
  }
}
</style>

