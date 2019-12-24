<template>
  <div id="seat-info">
    <div class="title f20">坐席数据</div>
    <div class="bg-white">
      <div class="seat-container">
        <div class="seat-count mt30 ml25 right">
          <span class="f14">可用总坐席数：</span>
          <span class="f26">{{stats.freeRobotCount || 0}}</span>
          <span class="f14">个</span>
          <span class="f14 count-left">当前占用坐席数：</span>
          <span class="f26">{{stats.usedRobotCount || 0}}</span>
          <span class="f14">个</span>
        </div>
      </div>
      <el-table
        :data="robotCallJobList"
        stripe
        border
        :height="250"
        :empty-text="emptyText"
      >
        <el-table-column
          label="任务名称"
          prop="name">
        </el-table-column>
        <el-table-column
          label="任务状态"
          prop="status">
          <template slot-scope="scope">
            {{robotCallJobStatus[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column
          label="线路名称"
          prop="stats"
          show-overflow-tooltip>
          <template slot-scope="scope">

            <span v-if="scope.row.phoneType=='MOBILE'" v-for="(item, index) in scope.row.list" :key="index">
              <span v-if="item.phoneName">{{item.phoneName}}-</span><span v-if="item.phoneNumber">{{item.phoneNumber}}</span>
              <span v-if="index+1<scope.row.list.length">；</span>
            </span>
            <span v-if="scope.row.phoneType!='MOBILE'" v-for="(item, index) in scope.row.list" :key="index">
              {{item.phoneName || item.phoneNumber}}
              <span v-if="index+1<scope.row.list.length">；</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="线路类型"
          prop="phoneType">
          <template slot-scope="scope">
            {{phoneTypeENUM[scope.row.phoneType]}}
          </template>
        </el-table-column>
        <el-table-column
          label="占用坐席个数"
          prop="robotCount">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { robotInfo, getJobRobotStatusInfo } from '@/api/stats'
import { robotCallJobStatus, phoneTypeENUM } from '@/utils/constant'
import { hasAccess } from '@/utils/access'

export default {
  name: 'seatStats',
  data() {
    return {
      phoneTypeENUM,
      robotCallJobStatus,
      stats: {},
      robotCallJobList: []
    }
  },
  computed: {
    emptyText() {
      if (this.hasAccess('ADMIN_TASK_DATA_ALL') || this.hasAccess('crm_callTask_company')) {
        return '暂无数据'
      } else {
        return '无权限查看此列表'
      }
    }
  },
  mounted() {
    this.requestSeatInfo()
  },
  methods: {
    hasAccess,
    requestSeatInfo() {
      robotInfo().then(({ data }) => {
        this.stats = data.data
      })
      if (this.hasAccess('ADMIN_TASK_DATA_ALL') || this.hasAccess('crm_callTask_company')) {
        getJobRobotStatusInfo().then(({ data }) => {
          this.robotCallJobList = data.data
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#seat-info {
  .title {
    margin: 40px 0 10px;
    font-weight: 700;
  }
  .bg-white {
    border: 1px solid #f0f0f0;
    background: white;
    padding: 0 25px 40px 25px;
    margin-bottom: 100px;
    .seat-container {
      background: white;
      .seat-count {
        margin-bottom: 10px;
        .count-left {
          margin-left: 90px;
        }
      }
    }
  }
}
</style>