<template>
  <div class="keyword-input">
    <el-input
      placeholder="输入关键词，回车"
      v-model="tmpValue"
      @keyup.enter.native="onAddKeyword"
    ></el-input>
    <div class="btns">
      <el-button type="primary" :disabled="!innerValue.length" @click="onCopyValue">一键复制</el-button>
      <el-button :disabled="!innerValue.length" @click="onResetValue">一键清空</el-button>
    </div>
    <div class="tag-list">
      <el-tag
        class="tag-item"
        v-for="(item, index) in innerValue"
        :key="index"
        type="info"
        :closable="true"
        @close="onCloseTag(item)"
      >
        {{item}}
      </el-tag>
    </div>
    <input
      :value="innerValue.join(',')"
      class="hide-input"
      ref="hideInput"
    />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      tmpValue: undefined
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
    onAddKeyword(event) {
      if (!event.target.value) {
        return
      }
      const valueArr = this.tmpValue.split(',')
      const needAddValueArr = []
      const repeatValueArr = []
      valueArr.forEach(item => {
        this.innerValue.includes(item) ? repeatValueArr.push(item) : needAddValueArr.push(item)
      })
      if (needAddValueArr.length > 0) {
        this.innerValue = [
          ...this.innerValue,
          ...needAddValueArr
        ]
        this.tmpValue = ''
      }
      if (repeatValueArr.length > 0) {
        this.$message({
          type: 'info',
          message: `[${repeatValueArr.join('、')}]关键词已存在`
        })
      }
    },
    onCloseTag(tag) {
      const tagIndex = this.innerValue.indexOf(tag)
      this.innerValue.splice(tagIndex, 1)
    },
    onCopyValue() {
      // 一键复制
      const dom = this.$refs.hideInput
      if (dom) {
        dom.select()
        document.execCommand('copy', true)
        this.$message.success('复制成功')
      }
    },
    onResetValue() {
      this.innerValue = []
    }
  }
}
</script>

<style lang="scss" scoped>
.keyword-input {
  .btns {
    margin-top: 10px;
  }
  .tag-list {
    margin-top: 10px;
    .tag-item {
      cursor: pointer;
      margin-right: 10px;
      margin-bottom: 5px;
      &.active {
        background-color: #a8d4fc;
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
}
</style>
