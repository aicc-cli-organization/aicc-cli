<template>
  <div class="multiple-form-item">
    <el-form-item
      :label="label"
      :rules="rule"
      :prop="prop + '.0'"
    >
      <div class="form-item">
        <el-input
          :placeholder="placeholder"
          :disabled="disabled"
          v-model="innerMainValue"
        >
        </el-input>
        <span
          v-if="showMainAddText"
          class="text"
          :class="mainDisabled ? 'disabled' : ''"
          @click="handleMainAddClick"
        >
          {{addText}}
        </span>
      </div>
    </el-form-item>
    <el-form-item
      v-for="(item, index) in innerOtherValue"
      :key="index"
      :rules="rule"
      :prop="prop + '.' + (index + 1)"
    >
      <div class="form-item">
        <el-input
          :placeholder="placeholder"
          :value="item"
          @input="val => handleInputChange(val, index)"
        >
        </el-input>
        <div class="action">
          <i class="iconfont icon-changyonggoupiaorenshanchu" @click="handleDeleteClick(index)"></i>
          <i
            v-if="index === innerOtherValue.length - 1 && index < 8"
            class="iconfont icon-tianjiajiahaowubiankuang"
            :class="addDisabled ? 'disabled' : ''"
            @click="handleOtherAddClick"
          ></i>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script>
import { phoneNumberregex } from '@/utils/regexp'

export default {
  name: 'MultipleFormItem',
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    },
    label: String,
    placeholder: String,
    addText: {
      type: String,
      default: '添加'
    },
    prop: String,
    rule: Array,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    innerMainValue: {
      get() {
        return this.value[0]
      },
      set(newVal) {
        const tmpVal = [...this.value]
        tmpVal[0] = newVal
        this.$emit('input', tmpVal)
      }
    },
    innerOtherValue: {
      get() {
        return this.value.slice(1)
      },
      set(newVal) {
        this.$emit('input', [
          this.innerMainValue,
          ...newVal
        ])
      }
    },
    showMainAddText() {
      return this.innerOtherValue.length === 0
    }
  },
  data() {
    return {
      addDisabled: true,
      mainDisabled: true,
      parent: null
    }
  },
  methods: {
    handleInputChange(val, index) {
      const tmpArr = [...this.innerOtherValue]
      tmpArr[index] = val
      this.innerOtherValue = tmpArr
    },
    handleAddItem() { // 添加
      this.innerOtherValue = [
        ...this.innerOtherValue,
        undefined
      ]
    },
    handleOtherAddClick() {
      if (this.addDisabled) return
      this.handleAddItem()
    },
    handleMainAddClick() {
      if (this.mainDisabled) return
      this.handleAddItem()
    },
    handleDeleteClick(index) { // 删除
      this.innerOtherValue.splice(index, 1)
      this.innerOtherValue = [...this.innerOtherValue]
    },
    getMainDisabled(value) {
      return !(value && phoneNumberregex.test(value))
    },
    getOtherDisabled(value) {
      const lastVal = value[value.length - 1]
      return !(lastVal && phoneNumberregex.test(lastVal))
    }
  },
  created() {
    // 获取父Form的实例
    let p = this.$parent
    while (p) {
      if (p && p.$options.name !== 'ElForm') {
        p = p.$parent
      } else {
        this.parent = p
        break
      }
    }
    p.$on('validate', (field, valid) => {
      if (field === 'phoneNumberList.0') {
        this.mainDisabled = !valid
      } else if (field === `phoneNumberList.${this.innerOtherValue.length}`) {
        this.addDisabled = !valid
      }
    })
  },
  mounted() {
    this.parent.validateField(`phoneNumberList.${this.innerOtherValue.length}`)
    this.parent.clearValidate()
  },
  updated() {
    this.parent.validateField(`phoneNumberList.${this.innerOtherValue.length}`)
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.multiple-form-item {
  .form-item {
    position: relative;
    > .text {
      position: absolute;
      color: $--color-primary;
      font-size: $--font-size-small;
      right: -80px;
      top: 0;
      cursor: pointer;
    }
    > .action {
      position: absolute;
      color: $--color-primary;
      left: 274px;
      white-space: nowrap;
      top: 0;
      > i {
        cursor: pointer;
        display: inline-block;
      }
    }
  }
}
</style>

