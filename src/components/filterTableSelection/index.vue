<template>
  <div class="header-slot">
    <slot name="title"></slot>
    <el-popover
      placement="bottom-end"
      v-bind="$attrs"
      popper-class="popper-header-slot"
      trigger="hover"
      >
        <div class="filter-panel">
          <el-checkbox-group v-model="checkList">
            <el-checkbox v-for="item in filters" :key="item.value" :label="item.value">{{item.text}}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="botton-wrap">
          <el-button type="text" :disabled="!checkList.length" @click="confirm">确定</el-button>
          <el-button type="text" @click="reset">重置</el-button>
        </div>
        <span slot="reference" class="filter-icon-wrap">  
          <i class="iconfont icon-shaixuanx" :class="checkList.length ? 'checked' : '' "></i>
        </span>
    </el-popover>
  </div>
</template>

<script>
import { debounce } from "@/utils";
export default {
  props: {
   name: {
     type: String,
     default: ''
   },
   width: {
     type: Boolean,
     default: 120
   },
   filters: {
     type: Object,
     default () {
       return {}
     }
   },
   multiple: {
     type: Boolean,
     default: true
   },
  },
  watch: {
    checkList: {
      handler(newVal,oldVal) {
        if(newVal.length > 1 && oldVal.length > 0 && !this.multiple) { //去掉之前的选择
          const index = newVal.findIndex(item => item === oldVal[0])
          newVal.splice(index,1)
          this.checkList = newVal
        }
      }
    }
  },
  data() {
    return {
      checkList: [],
      left: 0,
      right: 0
      
    }
  },
  computed: {
  },
  methods: {
    confirm() {
      if(this.multiple) {
        this.$emit('filter-success',this.checkList)
      }else {
        this.$emit('filter-success',this.checkList[0])
      }
    },
    reset() {
      this.checkList = []
      this.$emit('filter-success',this.checkList)
    }
  },
  mounted() {
    
  }
}
</script>
<style lang="scss">
.popper-header-slot {
  margin-top: 0 !important;
  border-top: none;
  padding: 0;
  .popper__arrow {
    display: none;
  }
  .el-checkbox {
    display: block;
    margin-right: 0;
    padding: 5px 0;
    .el-checkbox__input {
      margin-left: 20px
    }
    .el-checkbox__label {
      font-size: 12px;
    }
  }
  .el-checkbox:hover {
    background: #e8f2fb
  }
  .el-button {
    padding: 0 5px !important;
  }
  .el-button + .el-button {
    margin-left: 15px
  }
  
  .botton-wrap {
    text-align: center;
    border-top: 1px solid #E4E4E4;
  }
}
</style>
<style lang="scss" scoped>
.header-slot {
  .filter-icon-wrap {
    position: absolute;
    top: -2px;
    right: 0;
    width: 40px;
    height: 50px;
    line-height: 44px;
    text-align: center;
    cursor: pointer;
  }
  .icon-shaixuanx {
    font-size: 12px;
    color: #8992A5;
  }
  .icon-shaixuanx.checked {
    color: #1890ff
  }
  .filter-icon-wrap:hover {
    background: #dee3eb;
    .icon-shaixuanx {
      color: #1890ff
    }
  }
}
</style>
