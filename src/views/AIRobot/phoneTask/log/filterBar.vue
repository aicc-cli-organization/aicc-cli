<template>
  <div class="filter-bar">
    <el-select v-model="filter.operationType" placeholder="请选择操作类型" @change="search">
      <el-option v-for="(item, index) in config.OPERATION_TYPE_LIST" :key="index"
      :label="item.value" :value="item.key">
      </el-option>
    </el-select>
    <el-select v-model="filter.createByUserId" placeholder="请选择执行者" @change="search">
      <el-option v-for="(item, index) in optionData.userList" :key="index"
      :label="item.name" :value="item.userId">
      </el-option>
    </el-select>
    <el-date-picker @change="search"
      value-format="yyyy-MM-dd"
      v-model="filter.createDate"
      type="date"
      placeholder="执行日期">
    </el-date-picker>
    <el-button class="clear-filter-btn" type="primary" @click="clearFilter">清空筛选条件</el-button>
  </div>
</template>

<script>
import {
  OPERATION_TYPE_LIST
} from './config'
import * as usersAPI from '@/api/users'

export default {
  data() {
    return {
      filter: {
        operationType: undefined,
        createDate: undefined,
        createByUserId: undefined
      },
      optionData: {
        userList: undefined
      },
      config: {
        OPERATION_TYPE_LIST
      }
    }
  },
  methods: {
    async loadUserListOptions() {
      const userListOptions = (await usersAPI.getAllUserList()).data.data
      this.optionData.userList = userListOptions
    },
    search() {
      this.$emit("update:pagingParams", this.filter)
    },
    clearFilter() {
      this.filter = {
        operationType: undefined,
        createDate: undefined,
        createByUserId: undefined,
      }
      this.$emit("update:pagingParams", this.filter)
    }
  },
  mounted() {
    this.loadUserListOptions()
  }
}
</script>

<style lang="scss" scoped>
.filter-bar {
  margin-bottom: 10px;
  .clear-filter-btn {
    width: 150px;
  }
}
</style>

