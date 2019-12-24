<template>
<div>
  <el-row class="mt10 mb10">
    <el-select
      @change="search()"
      v-model="defectType" placeholder="选择问题类型" class="ml5">
      <el-option
        v-for="item in constant.issueTypeOptions"
        :key="item.key"
        :label="item.value"
        :value="item.key">
      </el-option>
    </el-select>
    <el-select
      @change="search()"
      v-model="trackStatusValue" placeholder="选择反馈状态" class="ml5">
      <el-option
        v-for="item in constant.feedbackStatusOptions"
        :key="item.key"
        :label="item.value"
        :value="item.key">
      </el-option>
    </el-select>
    <el-button class="w150 f12 ml5" type="primary" @click="clearFilter()">清空筛选条件</el-button>
  </el-row>
  <PaginationTable
    url="/apiEngine/feedback/list"
    ref="table"
    :server="'engine'"
    stripe
    :params="paginationParams"
    :max-height="600"
    :pageZero="false"
    >
      <el-table-column
        fixed
        prop="type"
        label="问题类型"
        width="100">
        <template slot-scope="scope">
          {{constant.issueTypeENUM[scope.row.type]}}
        </template>
      </el-table-column>
      <el-table-column
        prop="content"
        label="问题内容"
        width="">
      </el-table-column>
      <el-table-column
        prop="text"
        label="解决方案"
        width="">
      </el-table-column>
      <el-table-column
        prop="followerName"
        label="跟进人"
        width="80">
      </el-table-column>
      <el-table-column
        prop="solveStatus"
        label="反馈状态"
        width="80">
        <template slot-scope="scope">
          {{constant.feedbackStatusENUM[scope.row.solveStatus]}}
        </template>
      </el-table-column>
      <el-table-column
        prop="creationTime"
        label="反馈时间"
        width="160">
      </el-table-column>
      <el-table-column
        label="操作"
        width="100">
        <template slot-scope="scope">
          <div v-if="scope.row.solveStatus=='CHECKING'">
              <yiwise-pop-confirm
              label="确认已解决吗？"
              @submit="() => like(scope.row.id)"
            >
              <img class="operation-img" src="/static/img/feedback/bangzhuzhognxin_icon_yijiejue_p.png" alt="">
            </yiwise-pop-confirm>
            <yiwise-pop-confirm
              label="确认未解决吗？"
              @submit="() => dislike(scope.row.id)"
            >
              <img class="operation-img" src="/static/img/feedback/bangzhuzhognxin_icon_weijiejue_p.png" alt="">
            </yiwise-pop-confirm>
          </div>
          <div v-else>--</div>
        </template>
      </el-table-column>
    </PaginationTable>
</div>
</template>
<script>
import PaginationTable from '@/components/PaginationTable'
import * as constant from '@/utils/constant'
import { YiwisePopConfirm } from 'yiwise-components'
import * as feedbackAPI from '@/api/feedback'

export default {
  components: {
    YiwisePopConfirm,
    PaginationTable
  },
  data() {
    return {
      trackStatusValue: undefined,
      defectType: undefined
    }
  },
  computed: {
    constant() {
      return constant
    },
    paginationParams() {
      return {
        type: this.defectType,
        status: this.trackStatusValue
      }
    }
  },
  watch: {
    paginationParams: {
      handler: function(val) {
      }
    }
  },
  methods: {
    search() {
      this.$nextTick(() => {
        this.loadData()
      })
    },
    clearFilter() {
      this.defectType = undefined
      this.trackStatusValue = undefined
      this.$nextTick(() => {
        this.loadData()
      })
    },
    like(id) {
      feedbackAPI.like({
        id
      }).then(({ data }) => {
        if (data.code === 200) {
          this.$message({
            message: '操作成功！',
            type: 'success'
          })
        } else {
          this.$message({
            message: '操作失败！',
            type: 'error'
          })
        }
        this.loadData()
      })
    },
    loadData(page = 1, size = 20) {
      this.$refs.table.loadData(page, size)
    },
    dislike(id) {
      feedbackAPI.dislike({
        id
      }).then(({ data }) => {
        if (data.code === 200) {
          this.$message({
            message: '操作成功！',
            type: 'success'
          })
        } else {
          this.$message({
            message: '操作失败！',
            type: 'error'
          })
        }
        this.loadData()
      })
    }
  }
}
</script>
<style lang="scss" >
.operation-img {
  margin-top: 5px;
  height: 30px;
  width: 30px;
}
</style>
