<template>
  <el-input class="input-with-select" :disabled="disabled"
    :style="{width}"
    :placeholder="inputPlaceholder"
    v-model="inputValue"
    @keyup.enter.native="handleSearch"
    >
      <el-select :disabled="disabled"
        v-model="selectValue"
        slot="prepend"
        :placeholder="defaultOptionPlaceholder"
        @change="handleChange"
        :style="{width:optionWidth}"
      >
        <el-option v-for="(searchTypeItem, index) in optionList"
          :label="searchTypeItem.label"
          :value="searchTypeItem.searchKey"
          :key="index">
        </el-option>
      </el-select>
      <i
        slot="suffix"
        class="el-input__icon el-icon-search"
        @click="handleSearch"
      >
      </i>
  </el-input>
</template>

<script>
/**
 * optionList: 可选模糊搜索 [{ label, searchKey, placeholder }]
 * optionWidth: 可选模糊搜索宽度
 * width: 组件宽度
 * defaultOptionPlaceholder: 可选模糊搜索占位字符串
 * eg: 具体配置参考例子 examples/base/index.vue
 */
export default {
  name: 'optionSearchInput',
  props: {
    optionList: Array,
    optionWidth: {
      type: String,
      default: '70px'
    },
    width: String,
    defaultOptionIndex: {
      type: [String, Number],
      default: 0
    },
    defaultOptionPlaceholder: {
      type: [String],
      default: '请选择'
    },
    value: {
      type: Object
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputPlaceholder: undefined,
      selectValue: undefined
    }
  },
  computed: {
    inputValue: {
      get() {
        console.log(this.selectValue, this.value, 'fdsafadsfadsfadsfads')
        return this.value ? this.value[this.selectValue] || '' : ''
      },
      set(newValue) {
        const { emptyObj } = this.getEmptySearchObjAndPlaceholderObj()
        this.$emit('input', { ...emptyObj, [this.selectValue]: newValue })
      }
    }
  },
  methods: {
    getEmptySearchObjAndPlaceholderObj() {
      const emptyObj = {}
      const placeholderObj = {}
      this.optionList.forEach(({ searchKey, placeholder }) => {
        emptyObj[searchKey] = undefined
        placeholderObj[searchKey] = placeholder
      })
      return { emptyObj, placeholderObj }
    },
    handleChange(searchKey) {
      const { emptyObj, placeholderObj } = this.getEmptySearchObjAndPlaceholderObj()
      this.selectValue = searchKey
      // 无需清空筛选项
      // let noEmptyValue = ''
      // for (const key in this.value) {
      //   if (this.value[key]) {
      //     noEmptyValue = this.value[key]
      //     this.value[key] = undefined
      //   }
      // }
      // if (this.value) {
      //   this.value[searchKey] = noEmptyValue
      // }
      // this.$emit('input', { ...emptyObj, ...this.value })
      this.inputPlaceholder = placeholderObj[searchKey]
      this.$emit('input', { ...emptyObj })
    },
    handleSearch() {
      this.$emit('search')
    },
    reset(callback) {
      this.syncInitUI()
      const { emptyObj } = this.getEmptySearchObjAndPlaceholderObj()
      callback && callback(emptyObj)
    },
    syncInitUI() {
      this.inputPlaceholder = this.optionList[this.defaultOptionIndex].placeholder
      this.selectValue = this.optionList[this.defaultOptionIndex].searchKey
    }
  },
  mounted() {
    this.syncInitUI()
  }
}
</script>
