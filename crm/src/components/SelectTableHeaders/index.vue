<template>
  <el-dropdown class="select-show-headers" trigger="click" :hide-on-click="false" placement="bottom">
    <el-button type="primary" icon="iconfont icon-loudoushaixuan" circle plain></el-button>
    <el-dropdown-menu class="select-show-headers-menu" slot="dropdown">
      <el-dropdown-item>
        <!-- 当tableHeaders是数组时 -->
        <el-checkbox-group v-model="showTableHeaders" @change="v => $emit('headerChange', v)" v-if="tableHeadersIsArray">
          <el-checkbox v-for="item in tableHeaders" :label="item.key + ''" :key="item.key"
            :disabled="showTableHeaders.length <= 5 && showTableHeaders.includes(item.key)">
            {{item.value}}
          </el-checkbox>
        </el-checkbox-group>
        <!-- 当tableHeaders是MAP对象时 -->
        <el-checkbox-group v-model="showTableHeaders" @change="v => $emit('headerChange', v)" v-else>
          <el-checkbox v-for="(value, key) in tableHeaders" :label="key" :key="key"
            :disabled="showTableHeaders.length <= 5 && showTableHeaders.includes(key)">
            {{value}}
          </el-checkbox>
        </el-checkbox-group>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
  export default {
    name: 'SelectTableHeaders',
    props: {
      tableHeaders: [Object, Array],
      value: {}
    },
    computed: {
      tableHeadersIsArray() {
        return Array.isArray(this.tableHeaders)
      },
      showTableHeaders: {
        get() {
          return this.value
        },
        set(newValue) {
          this.$emit('input', newValue)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .select-show-headers {
    .el-button {
      display: flex;
      padding: 9px !important;
      margin-left: 10px;
      line-height: 18px !important;
      height: 36px !important;
      padding-left: 10px !important;
    }
  }
  .select-show-headers-menu {
    .el-dropdown-menu__item {
      max-height: 500px;
      overflow: auto;
    }
    .el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled):hover {
      background-color: #fff;
      color: inherit;
    }
    .el-checkbox {
      display: block;
      &+.el-checkbox {
        margin: 0;
      }
    }
  }
</style>

