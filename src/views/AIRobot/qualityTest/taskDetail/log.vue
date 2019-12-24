<template>
  <div class="sub-page-operation-log">
    <div class="filter-bar">
      <el-select v-model="filter.operationType" placeholder="请选择操作类型" @change="loadData({
        pageNum: 1,
        operationType: filter.operationType
      })">
        <el-option v-for="(value, key) in LOG_TYPE_MAP" :key="key"
        :label="value" :value="key">
        </el-option>
      </el-select>
      <el-select
        v-model="filter.createByUserId"
        placeholder="请选择执行者"
        @change="loadData({
          pageNum: 1,
          createByUserId: filter.createByUserId
        })"
        @visible-change="loadUserListOptions">
        <el-option v-for="(item, index) in userList" :key="index"
        :label="item.name" :value="item.userId">
        </el-option>
      </el-select>
      <el-date-picker @change="loadData({
        pageNum: 1,
        createDate: filter.createDate
      })"
        value-format="yyyy-MM-dd"
        v-model="filter.createDate"
        type="date"
        placeholder="执行日期">
      </el-date-picker>
      <el-button class="clear-filter-btn" type="primary" @click="clearFilter">清空筛选条件</el-button>
      <el-button type="primary" @click="onRefresh">刷新</el-button>
    </div>
    <pagination-table
      class="table"
      ref="table"
      url="/apiEngine/qcJob/jobLogList"
      :autoLoad="false"
      method="post"
      :headers="{
        'Content-Type': 'application/json'
      }"
      :max-height="clientHeight - 255"
    >
      <el-table-column
        prop="operationType"
        label="操作类型"
        width="">
        <template slot-scope="scope">
          {{LOG_TYPE_MAP[scope.row.operationType]}}
        </template>
      </el-table-column>
      <el-table-column
        prop="createdByUserName"
        label="执行者"
        width="">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="执行时间"
        width="">
      </el-table-column>
    </pagination-table>
  </div>
</template>

<script>
import { PaginationTable } from 'yiwise-components'
import { mapGetters } from 'vuex'
import { LOG_TYPE_MAP } from '../utils/enum'
import * as usersAPI from '@/api/users'

export default {
  data() {
    return {
      LOG_TYPE_MAP,
      filter: {
        operationType: undefined,
        createDate: undefined,
        createByUserId: undefined
      },
      userList: undefined
    }
  },
  components: {
    PaginationTable
  },
  computed: {
    ...mapGetters([
      'clientHeight'
    ]),
    selectedTaskId() {
      return this.$store.state.qcTask.selectedTaskId
    }
  },
  methods: {
    async loadUserListOptions(visible) {
      if (!visible) return
      const userListOptions = (await usersAPI.getAllUserList()).data.data
      this.userList = userListOptions
    },
    loadData(params) {
      this.$refs.table.loadData({
        refId: this.selectedTaskId,
        ...params
      })
    },
    clearFilter() {
      this.filter = {
        pageNum: 1,
        operationType: undefined,
        createDate: undefined,
        createByUserId: undefined
      }
      this.loadData(this.filter)
    },
    onRefresh() {
      this.loadData()
    }
  },
  watch: {
    selectedTaskId: {
      handler: function(newVal) {
        this.clearFilter()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sub-page-operation-log {
  height: 100%;
  background-color: white;
  .filter-bar {
    margin-bottom: 10px;
  }
}
</style>

