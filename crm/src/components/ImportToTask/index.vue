<template>
  <div class="import-task">
    <el-tooltip popper-class="is-dark" content="请确保自定义变量相同，否则会导入失败" placement="top">
      <el-select
        placeholder="请选择任务"
        :style="{width: selectWidth + 'px'}"
        v-model="innerValue"
        filterable
        remote
        clearable
        :remote-method="loadRobotCallJobOptions"
        @change="v => $emit('change', v)"
        @visible-change="v => $emit('visible-change', v)"
        @remove-tag="v => $emit('remove-tag', v)"
        @blur="e => $emit('blur', e)"
        @focus="e => $emit('focus', e)"
        @clear="$emit('clear');refresh()"
        value-key="robotCallJobId"
      >
        <el-option
          v-for="task in taskList"
          :key="task.robotCallJobId"
          :value="task"
          :label="task.name"
          :disabled="(robotCallJobId && task.robotCallJobId == robotCallJobId) || task.transferPhoneChooseType === 'ASSIGN'"
        >
        </el-option>
      </el-select>
    </el-tooltip>
    <el-button type="primary" @click="$emit('import')">导入到任务</el-button>
  </div>
</template>

<script>
  import { getSimpleList } from '@/api/task'

  export default {
    props: {
      value: {},
      selectWidth: {
        type: Number,
        default: 150
      },
      robotCallJobId: {
        type: Number,
        default: null
      },
      autoLoad: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        taskList: []
      }
    },
    computed: {
      innerValue: {
        get() {
          return this.value
        },
        set(newVal) {
          this.$emit('input', newVal)
        }
      }
    },
    methods: {
      async loadRobotCallJobOptions(val) { // 加载任务列表
        const { data } = await getSimpleList({
          checkDialogFlow: true,
          searchWords: val,
          callJobStatusSet: ['NOT_STARTED', 'IN_PROCESS', 'COMPLETED', 'RUNNABLE', 'USER_PAUSE', 'SYSTEM_SUSPENDED', 'IN_QUEUE']
        })
        if (data.data) {
          this.taskList = data.data || []
        }
      },
      refresh() {
        this.loadRobotCallJobOptions()
      }
    },
    mounted() {
      this.autoLoad && this.refresh()
    }
  }
</script>


<style lang="scss" scoped>
@import 'src/styles/extend.scss';

.import-task {
  @extend .sel-button;
  display: inline-flex;
}
</style>
