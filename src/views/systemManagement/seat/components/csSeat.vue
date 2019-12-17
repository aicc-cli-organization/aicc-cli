<template>
  <div>
    <div class="button-group clearfix">
      <el-button type="primary" class="button right mr15" @click="loadData">刷新</el-button>
      <el-button type="primary" class="button right mr15" v-if="hasAccess('crm_cusSeat_addOrEdit')"
        @click="showCsSeatForm({ type: 'ADD' })">新增</el-button>
    </div>
    <new-pagination-table
      ref="table"
      :url="'/apiEngine/csRobot/csAccountList'"
      stripe
      :pageZero="false"
      :autoLoad="false"
      :server="'engine'"
      :max-height="clientHeight - 176"
    >
      <el-table-column
        prop="csName"
        label="姓名">
      </el-table-column>
      <el-table-column
        prop="csMobile"
        label="手机号">
      </el-table-column>
      <el-table-column
        prop="phoneNumberList"
        label="呼出线路">
        <template slot-scope="scope">
          {{(scope.row.phoneNumberList || []).map(item => (item.phoneName ? (item.phoneName + '-') : '') + (item.phoneNumber || '')).toString()}}
        </template>
      </el-table-column>
      <el-table-column
        label="坐席状态"
      >
        <template slot-scope="{ row }">
          {{row.onlineCount && row.onlineCount > 0 ? '在线' : '离线'}}
        </template>
      </el-table-column>
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="showCsSeatForm({ type: 'EDIT', row: scope.row })" v-if="hasAccess('crm_cusSeat_addOrEdit')">编辑</el-button>
          <el-button v-if="scope.row.enabledStatus=='DISABLE' && hasAccess('crm_cusSeat_stopStart')" type="text" @click="updateCsStaffStatus(scope.row, 'ENABLE')">启用</el-button>
          <el-button v-if="scope.row.enabledStatus=='ENABLE' && hasAccess('crm_cusSeat_stopStart')" type="text" @click="updateCsStaffStatus(scope.row, 'DISABLE')">停用</el-button>
          <yiwise-pop-confirm
            v-if="scope.row.enabledStatus=='DISABLE'"
            label="确认删除该坐席吗？"
            @submit="updateCsStaffStatus(scope.row, 'DELETE')"
            >
            <el-button type="text" class="ml10">删除</el-button>
          </yiwise-pop-confirm>
        </template>
      </el-table-column>
    </new-pagination-table>

    <cs-seat-form-dialog
      :row="csSeatForm"
      :visible.sync="csSeatFormDialogVisible"
      @success="handleAddSuccess"
    ></cs-seat-form-dialog>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import { YiwisePopConfirm } from 'yiwise-components'
  import NewPaginationTable from '@/components/NewPaginationTable'
  import moment from 'moment'
  import csSeatFormDialog from './components/csSeatFormDialog'
  import { updateCsStaffStatus } from '@/api/numberpool'

  export default {
    components: {
      NewPaginationTable,
      csSeatFormDialog,
      YiwisePopConfirm
    },
    data() {
      return {
        csSeatForm: {},
        csSeatFormDialogVisible: false
      }
    },
    computed: {
      ...mapGetters(['clientHeight', 'userEnableCsSeat'])
    },
    methods: {
      ...mapActions(['getUserInfo']),
      parseTime(time) {
        return moment(time).format('YYYY-MM-DD HH:mm:ss')
      },
      handleAddSuccess() {
        // 如果之前不存在启用状态的人工坐席，新增后需要刷新人工坐席启用情况
        if (!this.userEnableCsSeat) {
          this.getUserInfo()
        }
        this.loadData()
      },
      updateCsStaffStatus(row, status) {
        updateCsStaffStatus({
          csStaffId: row.csStaffId,
          enabledStatus: status
        }).then(({ data }) => {
          if (status === 'DELETE') {
            this.$message.success('删除成功')
          } else if (status === 'ENABLE' && !this.userEnableCsSeat) {
            // 如果是启用，并且之前没有启用的人工坐席，则需要刷新人工坐席启用情况
            this.getUserInfo()
          } else if (status === 'DISABLE') {
            // 如果是禁用，需要刷新人工坐席启用情况
            this.getUserInfo()
          }

          this.loadData()
        })
      },
      loadData() {
        this.$refs.table.loadData({}, data => {
          if (data && data.number === 1) {
            this.$store.commit('SET_CS', !!data.content.length)
          }
        })
      },
      showCsSeatForm(data) {
        if (data.type === 'ADD') {
          this.csSeatForm = {
            addOrEdit: 'ADD'
          }
        } else {
          this.csSeatForm = {
            ...data.row,
            phoneNumberIdList: (data.row.phoneNumberList || []).map(item => item.phoneNumberId),
            addOrEdit: 'EDIT'
          }
        }
        this.csSeatFormDialogVisible = true
      },
      handleRefresh() {
        this.$refs.table.loadData()
      }
    },
    mounted() {
      this.loadData()
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
</style>
