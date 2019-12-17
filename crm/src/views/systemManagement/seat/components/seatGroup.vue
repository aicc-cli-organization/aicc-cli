<template>
  <div>
    <div class="button-group clearfix">
      <el-button type="primary" class="button right mr15" @click="loadData({ pageNum: 1 })">刷新</el-button>
      <el-button type="primary" class="button right mr15" v-if="hasAccess('crm_seatGroup_addOrEdit')"
        @click="showSeatGroupForm({ type: 'ADD' })">新增</el-button>
    </div>
    <new-pagination-table
      ref="table"
      :url="'/apiEngine/csRobot/staffGroupList'"
      stripe
      :pageZero="false"
      :server="'engine'"
      :max-height="clientHeight - 176"
    >
      <el-table-column
        prop="groupName"
        label="坐席组名">
      </el-table-column>
      <el-table-column
        prop="groupType"
        width="120px"
        label="坐席类型">
        <template slot-scope="scope">
          {{groupType[scope.row.groupType]}}
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        label="应用话术">
        <template slot-scope="scope">
          <span>{{scope.row.dialogFlowName || emptyPlaceholder}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="groupCapacity"
        width="100px"
        label="坐席数量">
        <template slot-scope="scope">
          <span>{{scope.row.groupType === 'THIRD_PARTY' ? emptyPlaceholder : seatAccount(scope.row)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        label="在线坐席"
      >
        <template slot-scope="{ row }">
          <div v-if="row.groupType !== 'TEL'">
            <span v-if="!row.onlineList || row.onlineList.length === 0">{{emptyPlaceholder}}</span>
            <span
              v-for="(item, index) in row.onlineList"
              :key="item.csStaffId"
            >
              {{item.csName + (index === row.onlineList.length - 1 ? '' : '，')}}
            </span>
          </div>
          <div v-else>
            <span v-if="!row.transferList || row.transferList.length === 0">{{emptyPlaceholder}}</span>
            <span
              v-for="(item, index) in row.transferList"
              :key="item.userId"
            >
              {{(item.userName ? item.userName + '-' : '') + item.phoneNumber + (index === row.transferList.length - 1 ? '' : '，')}}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        label="离线坐席"
      >
        <template slot-scope="{ row }">
          <span v-if="!row.offlineList || row.offlineList.length === 0">{{emptyPlaceholder}}</span>
          <span
            v-for="(item, index) in row.offlineList"
            :key="item.csStaffId"
          >
            {{item.csName + (index === row.offlineList.length - 1 ? '' : '，')}}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        label="人工介入坐席组"
      >
        <template slot-scope="{ row }">
          {{row.transferCsStaffGroupName || emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        prop=""
        label="是否启用">
        <template slot-scope="scope">
          {{scope.row.enabledStatus == 'ENABLE' ? '是':'否'}}
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="phoneNumberList"
        label="转人工号码">
      </el-table-column>
      <el-table-column
        prop="phoneNumberList"
        label="人工介入坐席组">
      </el-table-column> -->
      <el-table-column
        width="140px"
        fixed="right"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="showSeatGroupForm({ type: 'EDIT', row: scope.row })" v-if="hasAccess('crm_seatGroup_addOrEdit')">编辑</el-button>
          <el-button v-if="scope.row.enabledStatus=='DISABLE' && hasAccess('crm_seatGroup_stopStart')" type="text" @click="updateGroupStatus(scope.row, 'ENABLE')">启用</el-button>
          <el-button v-if="scope.row.enabledStatus=='ENABLE' && hasAccess('crm_seatGroup_stopStart')" type="text" @click="updateGroupStatus(scope.row, 'DISABLE')">停用</el-button>
          <yiwise-pop-confirm
            class="delete-btn"
            label="确认删除该坐席组吗？"
            @submit="updateGroupStatus(scope.row, 'DELETE')"
          >
            <el-button v-if="scope.row.enabledStatus=='DISABLE'" type="text">删除</el-button>
          </yiwise-pop-confirm>
        </template>
      </el-table-column>
    </new-pagination-table>

    <seat-group-form-dialog
      :row="seatGroupForm"
      :visible.sync="seatGroupFormVisible"
      @success="loadData"
    />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import NewPaginationTable from '@/components/NewPaginationTable'
  import moment from 'moment'
  import seatGroupFormDialog from './components/seatGroupFormDialog'
  import { updateGroupStatus } from '@/api/numberpool'
  import { emptyPlaceholder } from '@/utils/constant'
  import { YiwisePopConfirm } from 'yiwise-components'

  export default {
    components: {
      NewPaginationTable,
      seatGroupFormDialog,
      YiwisePopConfirm
    },
    data() {
      return {
        groupType: {
          CS: '人工',
          AI: 'AI',
          TEL: '话机端',
          THIRD_PARTY: '第三方呼叫中心'
        },
        seatGroupForm: {},
        seatGroupFormVisible: false,
        emptyPlaceholder
      }
    },
    computed: {
      ...mapGetters(['clientHeight'])
    },
    methods: {
      parseTime(time) {
        return moment(time).format('YYYY-MM-DD HH:mm:ss')
      },
      seatAccount(row) {
        if (row.groupType === 'CS') {
          const length = (row.csStaffList || []).length
          return length + '个'
        } else {
          return row.groupCapacity + '个'
        }
      },
      updateGroupStatus(row, status) {
        updateGroupStatus({
          staffGroupId: row.csStaffGroupId,
          enabledStatus: status
        }).then(({ data }) => {
          this.loadData()
        })
      },
      loadData(page = 1, size = 20) {
        this.$refs.table.loadData(page, size)
      },
      showSeatGroupForm(data) {
        if (data.type === 'ADD') {
          this.seatGroupForm = {
            addOrEdit: 'ADD'
          }
        } else {
          this.seatGroupForm = {
            ...data.row,
            phoneNumberIdList: (data.row.phoneNumberList || []).map(item => item.phoneNumberId),
            addOrEdit: 'EDIT'
          }
        }
        this.seatGroupFormVisible = true
      }
    }
  }
</script>

<style scoped lang="scss">
.button-group {
  margin-bottom: 10px;
  clear: both;
  .button {
    margin-right: 10px !important;
  }
}
.delete-btn {
  margin-left: 10px;
}
</style>
