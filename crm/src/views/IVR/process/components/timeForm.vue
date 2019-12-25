<template>
  <commonForm
    ref="form"
    firstLabel="时间节点名称"
    :form="form"
    :rules="rules"
    :editData="editData"
    @cancel="cancel"
    @submit="submitTime"
  >
    <div class="title">时间条件</div>
    <div class="time-container">
      <span class="title-main">工作时间</span>
      <span class="title-sub title">请按时间顺序依次设置</span>
      <div>
        <div class="time-item" v-for="(item, index) in intentBranches" :key="'s' + index">
          <span class="index">{{index + 1}}、</span>
          <el-time-select
            placeholder="起始"
            v-model="item.startTime"
            class="time-select"
            prefix-icon="zz"
            @change="handleStartTimeChange(index)"
            :picker-options="{
              start: '00:00',
              step: '00:15',
              end: '23:45',
              minTime: getMinTime(index)
            }">
          </el-time-select>
          <span class="sep">-</span>
          <el-time-select
            placeholder="结束"
            v-model="item.endTime"
            class="time-select"
            prefix-icon="zz"
            @change="handleEndTimeChange(index)"
            :picker-options="{
              start: '00:00',
              step: '00:15',
              end: '24:00',
              minTime: item.startTime
            }">
          </el-time-select>
          <i
            class="iconfont icon-tianjiajiahaowubiankuang pointer oper"
            @click="intentBranches.length >= 3 ? () => {} : addTime()"
            :class="intentBranches.length >= 3 ? 'disabled' : ''"
            v-if="index === 0"
          ></i>
          <i class="iconfont icon-close pointer oper" @click="delTime(index)" v-else></i>
        </div>
      </div>
    </div>
    <div>
      <el-checkbox v-model="form.otherTime">其他时间</el-checkbox>
    </div>
  </commonForm>
</template>

<script>
import { cloneJSON } from '@/utils'
import { saveNode, updateNode } from '@/api/ivr'
import { dateCrossed, parseTimeForEnd, parseTimeForStart } from '../utils'
import commonForm from './commonForm'
export default {
  components: { commonForm },
  props: {
    editData: [Object],
    nodeIndex: [Number],
    type: [String],
    myDiagram: [Object, undefined]
  },
  data() {
    return {
      form: {
        nodeName: '',
        otherTime: true
      },
      rules: {
        nodeName: [
          { required: true, message: '请输入节点名称' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ]
      },
      intentBranches: [{
        startTime: '',
        endTime: ''
      }],
      savedOrSaving: false
    }
  },
  computed: {
    selectIVRId() {
      return this.$store.state.ivr.selectIVRId
    }
  },
  watch: {
    editData() {
      this.initData()
    }
  },
  methods: {
    getMinTime(index) {
      if (index === 0) {
        return 0
      }

      let minTime = this.intentBranches[0].endTime
      for (let i = 1; i < index; i++) {
        if (this.intentBranches[i].endTime > minTime) {
          minTime = this.intentBranches[i].endTime
        }
      }

      const times = minTime.split(':')
      const initialMinutes = parseInt(times[1]) - 15
      const minutes = initialMinutes < 0 ? initialMinutes + 60 : initialMinutes
      const hours = initialMinutes < 0 ? parseInt(times[0]) - 1 : times[0]
      return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
    },
    handleStartTimeChange(index) {
      this.intentBranches[index].endTime = parseTimeForEnd(this.intentBranches[index])
    },
    handleEndTimeChange(index) {
      this.intentBranches[index].startTime = parseTimeForStart(this.intentBranches[index])
    },
    addTime() {
      this.intentBranches.push({
        startTime: '',
        endTime: ''
      })
    },
    delTime(index) {
      this.intentBranches.splice(index, 1)
    },
    submitTime() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.savedOrSaving = true

          const timeBranchList = cloneJSON(this.intentBranches).filter(item => item.startTime && item.endTime).map(item => {
            if (item.endTime === '24:00') {
              item.endTime = '23:59'
            }

            return item
          })
          if (!timeBranchList.length) {
            this.$message.error('请选择工作时间段')
            return
          }

          if (dateCrossed(this.intentBranches)) {
            this.$message.error('时间段存在交叉，请调整')
            return
          }

          let { data } = await (this.editData.id ? updateNode : saveNode)({
            ivrNavigationInfoId: this.selectIVRId,
            data: {
              id: this.editData.id || undefined,
              name: this.form.nodeName,
              type: 'TIME', // 节点类型 START 开始节点 TIME 时间节点 AUDIO 语音节点 CHOOSE 选择节点 RECEPTION 接待节点 HANGUP 挂断节点
              otherTime: this.form.otherTime,
              timeBranchList,
              inactiveNodeId: this.editData.inactiveNodeId,
              webData: this.myDiagram.model.findNodeDataForKey(this.editData.key).loc
            }
          })
          data = data.data

          this.$message.success('保存成功')

          let intentBranches = data.timeBranchList.map((time, index) => ({index, ...time }))
          intentBranches = data.otherTime ? intentBranches.concat([{index: intentBranches.length, type: 'otherTime'}]) : intentBranches
          this.$emit('succuss', {
            ...data,
            loc: data.webData,
            intentBranches,
            id: data.id,
            nodeName: data.name,
            preKey: this.editData.key
          })
        }
      })
    },
    cancel() {
      this.initData()
    },
    hasWrongData(hasWrongcb, noWrongcb) {
      if (this.type === 'add') {
        hasWrongcb()
      } else {
        const initialTimes = (cloneJSON(this.editData.intentBranches) || []).filter(item => item.startTime && item.endTime)
        const intentBranchesChanged = this.intentBranches.length !== initialTimes.length || !!this.intentBranches.find((item, index) => {
          const t = this.intentBranches[index]
          const it = initialTimes[index]
          return t.startTime !== it.startTime || t.endTime !== it.endTime
        }) || this.form.otherTime !== this.editData.otherTime

        if(Object.keys(this.form).find(key => this.form[key] !== this.editData[key])
          || intentBranchesChanged) {
          hasWrongcb()
        } else {
          noWrongcb()
        }
      }
    },
    initData() {
      this.savedOrSaving = false
      this.$refs.form.resetFields()

      if (this.type === 'add') {
        this.form.nodeName = '时间节点' + this.nodeIndex
        this.form.otherTime = true
        this.intentBranches = [{
          startTime: '',
          endTime: ''
        }]
      } else {
        Object.keys(this.form).forEach(key => this.form[key] = this.editData[key])
        this.intentBranches = (cloneJSON(this.editData.intentBranches) || []).filter(item => item.startTime && item.endTime).map(item => {
          if (item.endTime === '23:59') {
            item.endTime = '24:00'
          }
          return item
        })
      }
    }
  },
  mounted() {
    this.initData()
  }
}
</script>
