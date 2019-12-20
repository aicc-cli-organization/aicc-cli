<template>
  <yiwise-dialog
    class="edit-dictionary-dialog"
    :visible.sync="innerVisible"
    title="编辑词典"
    @open="onOpen"
    @confirm="onUpdateWordsRange"
  >
    <div class="custome-dic common-dic">
      <div class="title">
        <span>
          <span class="area-title">自定义词典</span>
          <el-tooltip content="自定义词典可独立成词典也可对系统词典进行补充，其优先级高于系统词典。" placement="top">
            <i class="const-icon-question el-icon-question"></i>
          </el-tooltip>
        </span>
        <el-switch v-model="useCustomDictionary"></el-switch>
      </div>
      <div class="content" v-if="useCustomDictionary">
        <div class="add-area">
          <span class="label">添加词语</span>
          <el-input
            v-model="tmpWord"
            @keyup.enter.native="onAddWords"
            class="input-word"
            placeholder="输入关键词，多个输入以逗号间隔，回车添加"
          ></el-input>
        </div>
        <div class="list-area">
          <el-tag
            class="tag-item_word"
            v-for="item in fValueRange"
            :key="item"
            closable
            @close="onDelWord(item)"
          >{{item}}</el-tag>
        </div>
        <div class="batch-btns">
          <el-button type="primary" @click="onBatchCopy" :disabled="!fValueRange.length">一键复制</el-button>
          <el-button type="primary" @click="onEmpty" :disabled="!fValueRange.length">一键清空关键词</el-button>
        </div>
      </div>
    </div>
    <div class="system-dic common-dic">
      <div class="title">
        <span>
          <span class="area-title">系统词典</span>
          <el-tooltip content="系统词典为系统内置词典，选择后将收集词典内相关属性。" placement="top">
            <i class="const-icon-question el-icon-question"></i>
          </el-tooltip>
        </span>
        <el-switch v-model="useSystemDictionary"></el-switch>
      </div>
      <div class="content">
        <el-dropdown placement="bottom-start" trigger="click" :hide-on-click="false" v-if="useSystemDictionary">
          <el-input :value="sysDicStr" placeholder="请选择系统词典" suffix-icon="el-icon-arrow-down"></el-input>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item class="time-dropdown-item">
              <div class="time-row">
                <el-checkbox :indeterminate="isIndeterminate" v-model="checkeds[SYSTEM_TIME]" @change="onToggleChecked(SYSTEM_TIME)">时间</el-checkbox>
                <span
                  v-if="isIndeterminate || checkeds[SYSTEM_TIME]"
                  class="right"
                >
                  <el-checkbox v-model="normalization">归一展示</el-checkbox>
                  <el-tooltip content="归一展示，会将收集到的时间类词智能转化为统一的时间格式。" placement="top">
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </span>
              </div>
              <el-checkbox-group class="ml10" v-model="timeType" @change="handleTimeTypeChange">
                <el-checkbox label="DATE_ONLY">日期（如：2019年5月21日）</el-checkbox><br/>
                <el-checkbox label="TIME_ONLY">时间点（如：3点40）</el-checkbox>
              </el-checkbox-group>
              <el-checkbox
                class="block"
                v-for="(v, k) in systemTypeEnum"
                :key="k"
                v-model="checkeds[k]"
                @change="onToggleChecked(k)"
              >{{v}}</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <input
      :value="fValueRange.join(',')"
      class="hide-input"
      ref="hideInput"
    />
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import { updateCustomerValueRange } from '@/api/customer'
import { systemDictionaryEnum } from '@/utils/enum'

const initUseCustomDictionary = true
const initUseSystemDictionary = false
const SYSTEM_TIME = 'TIME'

const timeTypeEnum = {
  DATE_ONLY: '日期',
  TIME_ONLY: '时间点'
}

const systemTypeEnum = { // 可拓展
  ADDRESS: '地点',
  // ID_CARD: '身份证',
  PHONE: '手机号',
  PERSON: '人名',
  ORGANIZATION: '组织名'
}
const checkeds = Object.keys(systemTypeEnum).reduce((prev, curr) => {
  prev[curr] = false
  return prev
}, { [SYSTEM_TIME]: false })

export default {
  props: {
    defaultData: {},
    visible: Boolean
  },
  data() {
    return {
      fValueRange: [], // 前端维护的一个字段，传给后端的话还要再format下： 为了跟后端的数据结构保持一致
      useCustomDictionary: initUseCustomDictionary,
      useSystemDictionary: initUseSystemDictionary,
      tmpWord: '',
      systemDictionaryEnum,
      systemDictionary: undefined,
      timeType: [],
      isIndeterminate: false,
      systemTypeEnum,
      checkeds,
      SYSTEM_TIME,
      normalization: true
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
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    },
    sysDicStr() {
      if (this.isIndeterminate) {
        return this.generateTimeTypeStr()
      }

      let tmpStr = ''
      for (const key in this.checkeds) {
        if (this.checkeds[key]) {
          tmpStr = key === SYSTEM_TIME
            ? this.generateTimeTypeStr()
            : systemTypeEnum[key]
          break
        }
      }
      return tmpStr
    }
  },
  methods: {
    generateTimeTypeStr() {
      if (!Array.isArray(this.timeType)) return ''

      return this.timeType.map(item => timeTypeEnum[item]).join(',')
    },
    handleTimeTypeChange(v) {
      this.checkeds[SYSTEM_TIME] = v.length === 2
      this.isIndeterminate = v.length === 1
      if (!v.length) return

      Object.keys(this.checkeds).forEach(item => {
        if (item !== SYSTEM_TIME) {
          this.checkeds[item] = false
        }
      })
    },
    onToggleChecked(systemTypeKey) {
      if (systemTypeKey === SYSTEM_TIME) {
        const timeChecked = this.checkeds[SYSTEM_TIME]
        this.timeType = timeChecked ? ['DATE_ONLY', 'TIME_ONLY'] : []
        this.isIndeterminate = false
      } else {
        this.timeType = []
        this.isIndeterminate = false
      }
      if (!this.checkeds[systemTypeKey]) return

      Object.keys(this.checkeds).forEach(item => {
        if (item !== systemTypeKey) {
          this.checkeds[item] = false
        }
      })
    },
    onAddWords() {
      const oldList = [...this.fValueRange]
      const repeatList = []
      const willAddWordList = this.tmpWord.split(',')
      willAddWordList.forEach(item => {
        if (oldList.includes(item)) {
          repeatList.push(item)
        } else {
          oldList.push(item)
        }
      })
      if (repeatList.length) {
        this.$message.error(`【${repeatList.join('、')}】已存在，不再添加进词典`)
      }
      this.fValueRange = oldList
      this.tmpWord = ''
    },
    onDelWord(word) {
      const index = this.fValueRange.indexOf(word)
      this.fValueRange.splice(index, 1)
    },
    getSystemDictionary() {
      if (this.timeType.length) {
        return SYSTEM_TIME
      }
      let tmpKey = ''
      for (const key in this.checkeds) {
        if (this.checkeds[key]) {
          tmpKey = key
          break
        }
      }
      return tmpKey
    },
    onOpen() {
      const {
        useCustomDictionary,
        useSystemDictionary,
        valueRange,
        systemDictionary,
        timeType,
        normalization
      } = this.defaultData
      this.useCustomDictionary = (!useCustomDictionary && !useSystemDictionary) ? true : useCustomDictionary // 两个都不为true表示没有首次编辑
      this.useSystemDictionary = useSystemDictionary
      this.fValueRange = (valueRange || []).map(item => item.value)
      Object.keys(this.checkeds).forEach(item => {
        if (systemDictionary === item) {
          this.checkeds[systemDictionary] = !!(useSystemDictionary && systemDictionary)
        } else {
          this.checkeds[item] = false
        }
      })

      this.timeType = timeType === 'ALL' ? ['DATE_ONLY', 'TIME_ONLY']
        : timeType ? [timeType] : []
      this.isIndeterminate = this.timeType.length === 1
      this.normalization = !(normalization === false)
    },
    async onUpdateWordsRange() {
      if (!this.useCustomDictionary && !this.useSystemDictionary) {
        this.$message.error('自定义词典、系统词典至少开启一项')
        return
      }
      if (this.useCustomDictionary && this.fValueRange.length === 0) {
        this.$message.error('请添加词语')
        return
      }

      this.systemDictionary = this.getSystemDictionary()
      this.timeType = !this.timeType.length ? undefined
        : this.timeType.length === 2 ? 'ALL' : this.timeType[0]

      if (this.useSystemDictionary && !this.systemDictionary) {
        this.$message.error('请选择系统词典')
        return
      }
      const valueRange = this.fValueRange.map((item, index) => ({
        value: item,
        index: index + 1,
        defaultStatus: false
      }))
      const formData = {
        customerPersonExtraFieldId: this.defaultData.customerPersonExtraFieldId,
        valueRange: this.useCustomDictionary ? valueRange : [],
        useCustomDictionary: this.useCustomDictionary,
        useSystemDictionary: this.useSystemDictionary,
        systemDictionary: this.useSystemDictionary ? this.systemDictionary : undefined,
        timeType: this.useSystemDictionary ? this.timeType : undefined,
        normalization: false
      }
      if (formData.systemDictionary === SYSTEM_TIME) {
        formData.normalization = this.normalization
      }
      await updateCustomerValueRange(formData)
      this.$message.success('编辑成功')
      this.innerVisible = false
      this.$emit('update')
    },
    onBatchCopy() {
      const dom = this.$refs.hideInput
      if (dom) {
        dom.select()
        document.execCommand('copy', true)
        this.$message.success('复制成功')
      }
    },
    onEmpty() {
      this.fValueRange = []
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';

.edit-dictionary-dialog {
  .const-icon-question {
    color: $--color-warning;
    font-size: $--font-size-middle;
  }  
}

.block {
  display: block;
  &.el-checkbox + .el-checkbox {
    margin-left: 0;
  }
}

.common-dic {
  margin-bottom: 10px;
  > .title {
    height: 50px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f2f2f2;
    .area-title {
      font-size: 16px;
      font-weight: 700;
    }
  }
  > .content {
    margin-top: 10px; 
  }
  &.custome-dic {
    > .content {
      > .list-area {
        max-height: 200px;
        overflow: hidden auto;
        .tag-item_word {
          margin-right: 5px;
          margin-bottom: 5px;
        }
      }
      > .add-area {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        > .label {
          color: #666666;
          margin-right: 6px;
        }
        > .input-word {
          flex: 1;
        }
      }
      > .batch-btns {
        
      }
    }
  }
}
.hide-input {
  position: absolute;
  height: 0;
  width: 10px;
  opacity: 0;
  cursor: default;
}
.time-dropdown-item:not(.is-disabled):hover, .time-dropdown-item:focus {
    background-color: #fff;
    color: #666;
}
.time-dropdown-item {
  .time-row {
    display: flex;
    justify-content: space-between;
    > .right {
      /deep/ .el-checkbox__label {
        font-size: 12px;
      }
    }
  }
}
</style>
