<template>
  <div class="filter-bar">
    <el-select
      v-model="filter.operationType"
      placeholder="请选择操作类型"
      @change="search"
      clearable
    >
      <el-option
        v-for="(v, k) in FILTER_LOG_TYPE_ENUM"
        :key="v"
        :label="v"
        :value="k"
      >
      </el-option>
    </el-select>
    <el-select
      v-model="filter.createUserId"
      placeholder="请选择执行者"
      @change="search"
      clearable
      @visible-change="loadUserOptions"
    >
      <el-option
        v-for="(item, index) in userOptions"
        :key="index"
        :label="item.name"
        :value="item.userId"
      >
      </el-option>
    </el-select>
    <el-date-picker
      @change="search"
      value-format="yyyy-MM-dd"
      v-model="filter.createDate"
      type="date"
      placeholder="执行日期">
    </el-date-picker>
    <el-button class="clear-filter-btn" type="primary" @click="clearFilter">清空筛选条件</el-button>
  </div>
</template>

<script>
import * as usersAPI from '@/api/users'
import { FILTER_LOG_TYPE_ENUM } from '../config/enum'

export default {
  data() {
    return {
      filter: {
        operationType: undefined,
        createDate: undefined,
        createUserId: undefined
      },
      userOptions: [],
      FILTER_LOG_TYPE_ENUM
    }
  },
  methods: {
    async loadUserOptions(visible) {
      if (!visible) return
      const userOptions = (await usersAPI.getAllUserList()).data.data
      this.userOptions = userOptions
    },
    search() {
      this.$emit('update:pagingParams', this.filter)
    },
    getInitialFilter() {
      const filterKeys = Object.keys(this.filter)
      const result = {}
      filterKeys.forEach(item => {
        result[item] = undefined
      })
      return result
    },
    clearFilter() {
      const initialFilter = this.getInitialFilter()
      this.filter = initialFilter
      this.$emit('update:pagingParams', initialFilter)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-bar {
  margin-bottom: 10px;
  .clear-filter-btn {
    float: right;
  }
}
</style>

