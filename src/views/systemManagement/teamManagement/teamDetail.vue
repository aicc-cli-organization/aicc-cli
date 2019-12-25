<template>
  <div class="team-detail">
    <div class="header">
      <div class="info">
        <span class="title">{{organizationDetail.name}}</span>
        <span class="extra">负责人：{{organizationDetail.manager}}</span>
        <SelectTableHeaders v-model="showTableHeaders" :tableHeaders="tableHeaders" @headerChange="handleHeaderChange"></SelectTableHeaders>
        <option-search-input
          width="270px"
          ref="optionSearchInput"
          v-model="searchWords"
          @search="loadUsers(organizationId)"
          :option-list="optionList"
          option-width="110px"
        ></option-search-input>
        <el-select
          v-model="roleId"
          placeholder="用户角色"
          :style="{width: '150px', marginLeft: '20px'}"
          :clearable="true"
          @change="loadUsers(organizationId)"
        >
          <el-option v-for="item in roleList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </div>
      <div class="action">
        <el-button
          v-if="hasAccess('crm_teamManage_addOrEditOrEnablePerson')"
          icon="el-icon-plus"
          type="primary"
          @click="handleAddClick"
        >
          新增成员
        </el-button>
        <el-button
          v-if="hasAccess('crm_roleManage_view')"
          type="primary"
          @click="handleRoleClick"
        >
          <i class="iconfont icon-jiaoseshezhi"></i>
          角色管理
        </el-button>
      </div>
    </div>
    <new-pagination-table
      ref="table"
      url="/apiPlatform/user/list"
      :autoLoad="false"
      :headers="{
        'Content-Type': 'application/json'
      }"
      customClass="table-header-change-loading"
      server="engine"
      :max-height="clientHeight - 196"
    >
      <el-table-column
        prop="nickname"
        label="用户名"
        width="100px"
        :show-overflow-tooltip="true"
        v-if="innerShowTableHeaders.includes('nickname')"
      >
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
        :show-overflow-tooltip="true"
        v-if="innerShowTableHeaders.includes('name')"
      >
      </el-table-column>
      <el-table-column
        v-if="innerShowTableHeaders.includes('phoneNumber')"
        prop="phoneNumber"
        label="联系电话"
        width="110px"
      >
      </el-table-column>
      <el-table-column
        label="角色"
        :show-overflow-tooltip="true"
        v-if="innerShowTableHeaders.includes('roleName')"
      >
        <template
          slot-scope="{ row }"
        >
          {{row.roleName || emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="innerShowTableHeaders.includes('customerCountLimit')"
        :label="`可领取${customerStr}数`"
        width="100px"
      >
        <template
          slot-scope="scope"
        >
          {{(scope.row.customerCountLimit || 0) + '个'}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="innerShowTableHeaders.includes('customerDaysLimit')"
        :label="`可拥有${customerStr}天数`"
        width="110px"
      >
        <template
          slot-scope="scope"
        >
          {{(scope.row.customerDaysLimit || 0) + '天'}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="innerShowTableHeaders.includes('robotCountLimit')"
        label="可拥有坐席数"
        width="110px"
      >
        <template
          slot-scope="scope"
        >
          {{(scope.row.robotCountLimit || 0)}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="innerShowTableHeaders.includes('gender')"
        label="性别"
        width="60px"
      >
        <template
          slot-scope="{ row }"
        >
          {{genderEnum[row.gender] || emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        label="职位"
        :show-overflow-tooltip="true"
        v-if="innerShowTableHeaders.includes('job')"
      >
        <template
          slot-scope="{ row }"
        >
          {{row.job || emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        label="工作描述"
        :show-overflow-tooltip="true"
        v-if="innerShowTableHeaders.includes('comment')"
      >
        <template
          slot-scope="scope"
        >
          {{scope.row.comment || emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        v-if="innerShowTableHeaders.includes('status')"
        prop="status"
        label="使用状态"
        width="80px"
      >
        <template slot-scope="scope">
          <span :class="scope.row.status === 'CLOSED' ? 'danger' : 'success'">{{userStatusEnum[scope.row.status]}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150px"
        fixed="right"
      >
        <div
          slot-scope="scope"
          class="operation"
        >
          <span
            @click="() => handleEditClick(scope.row.userId, scope.row.isAdmin, scope.row.organizationId)"
            v-if="hasAccess('crm_teamManage_addOrEditOrEnablePerson')"
          >
            编辑
          </span>
          <yiwise-pop-confirm
            v-if="hasAccess('crm_teamManage_resetPassword')"
            label="确认重置密码吗？"
            @submit="handleResetClick(scope.row)"
          >
            <span>重置密码</span>
          </yiwise-pop-confirm>
          <yiwise-pop-confirm
            label="确认停用该账号吗？"
            @submit="() => handleStop(scope.row.userId)"
            v-if="scope.row.status === 'ENABLED' && scope.row.roleId !== 1 && hasAccess('crm_teamManage_addOrEditOrEnablePerson')"
          >
            <span>停用</span>
          </yiwise-pop-confirm>
          <yiwise-pop-confirm
            label="确认启用该账号吗？"
            @submit="() => handleOpen(scope.row.userId)"
            v-if="scope.row.status === 'CLOSED' && hasAccess('crm_teamManage_addOrEditOrEnablePerson')"
          >
            <span>启用</span>
          </yiwise-pop-confirm>
          <yiwise-pop-confirm
            label="确认删除该账号吗？"
            @submit="() => handleDel(scope.row.userId)"
            v-if="!scope.row.isAdmin && scope.row.status === 'CLOSED' && hasAccess('crm_teamManage_addOrEditOrEnablePerson')"
          >
            <span>删除</span>
          </yiwise-pop-confirm>
          <!-- <yiwise-pop-confirm
            label="是否确认该用户为部门负责人？"
            v-if="!organizationDetail.managerUserId"
            @submit="() => promotion(scope.row.userId)"
          >
            <span>
              设为部门负责人
            </span>
          </yiwise-pop-confirm>
          <yiwise-pop-confirm
            label="确定取消该用户部门负责人职位？"
            v-if="organizationDetail.managerUserId === scope.row.userId"
            @submit="() => demotion(scope.row.userId)"
          >
            <span>
              取消部门负责人职位
            </span>
          </yiwise-pop-confirm> -->
        </div>
      </el-table-column>
    </new-pagination-table>
    <user-dialog
      :visible.sync="userDialogVisible"
      :userId="userId"
      :isAdmin="isAdmin"
      :organizationId="editOrganizationId"
      :type="userDialogType"
      @change="loadUsers(organizationId)"
      @addSuc="handleAddSuc"
    >
    </user-dialog>
    <reset-dialog
      :visible.sync="resetDialogVisible"
      :defaultData="resetDialogData"
      @change="loadUsers(organizationId)"
    >
    </reset-dialog>

    <yiwise-dialog
      :title="pswTitle"
      @confirm="pswDialogVisible = false"
      :visible.sync="pswDialogVisible"
    >
      <div class="pb10">{{tipStr}} <span class="psw">{{psw}}</span>,可以选择文本进行复制哦~</div>
    </yiwise-dialog>
  </div>
</template>

<script>
  import NewPaginationTable from '@/components/NewPaginationTable'
  import { OptionSearchInput, YiwisePopConfirm } from 'yiwise-components'
  import UserDialog from './components/userDialog'
  import ResetDialog from './components/resetDialog'
  import { YiwiseDialog } from 'yiwise-components'
  import SelectTableHeaders from '@/components/SelectTableHeaders'
  import { stopUser, promotion, demotion, enableUser, delUser, resetPassword } from '@/api/users'
  import { fetchRoleList } from '@/api/roles'
  import { getOrganizationDetail } from '@/api/organizations'
  import { userStatusEnum, genderEnum } from '@/utils/enum'
  import { setTableHeader, getTableHeader } from '@/utils'
  import { emptyPlaceholder } from '@/utils/constant'
  import { tableHeaders, optionList } from './enum'
  import { mapGetters } from 'vuex'

  export default {
    name: 'TeamDetail',
    components: {
      NewPaginationTable,
      YiwisePopConfirm,
      UserDialog,
      ResetDialog,
      OptionSearchInput,
      YiwiseDialog,
      SelectTableHeaders
    },
    props: {
      organizationId: [String, Number]
    },
    computed: {
      ...mapGetters(['clientHeight', 'customerStr']),
      paginationParams() {
        for (const key in this.searchWords) {
          if (this.searchWords[key] === '') {
            this.searchWords[key] = undefined
          }
        }

        return {
          ...this.searchWords,
          roleId: this.roleId || undefined
        }
      }
    },
    data() {
      return {
        userDialogVisible: false,
        userDialogType: 'add',
        userId: '',
        isAdmin: false,
        resetDialogVisible: false,
        roleId: undefined,
        searchWords: undefined,
        roleList: [],
        resetDialogData: {},
        organizationDetail: {},
        userStatusEnum,
        genderEnum,
        optionList,
        emptyPlaceholder,
        showTableHeaders: getTableHeader('teamManage') || Object.keys(tableHeaders),
        innerShowTableHeaders: [],
        tableHeaders,
        pswDialogVisible: false,
        psw: '',
        pswTitle: '',
        tipStr: '',
        editOrganizationId: ''
      }
    },
    watch: {
      organizationId(newId) {
        this.loadOrganizationDetail(newId)
        this.loadUsers({
          organizationId: newId
        })
      },
      showTableHeaders(v) {
        setTimeout(() => {
          this.innerShowTableHeaders = v
        }, 100)
      }
    },
    methods: {
      loadUsers(params) { // 加载成员列表
        const newParams = {
          ...this.paginationParams,
          ...params
        }
        this.$refs.table.loadData(newParams)
      },
      async loadOrganizationDetail(id) { // 加载组织架构详情
        try {
          if (id) {
            const { data } = await getOrganizationDetail({
              id
            })
            this.organizationDetail = data.data || {}
          } else {
            this.organizationDetail = {
              name: emptyPlaceholder,
              manager: emptyPlaceholder
            }
          }
        } catch (error) {
          return
        }
      },
      handleAddSuc(psw) {
        if (psw) {
          this.psw = psw
          this.pswTitle = '提示'
          this.pswDialogVisible = true
          this.tipStr = '新增成功！密码是'
        }

        this.loadData()
      },
      handleHeaderChange(v) {
        setTableHeader('teamManage', v)
      },
      handleRoleClick() { // 跳转到角色管理
        this.$router.push('/systemManagement/role')
      },
      handleAddClick() { // 新增成员
        this.userDialogVisible = true
        this.userDialogType = 'add'
        this.isAdmin = false
        this.editOrganizationId = this.organizationId
      },
      async handleResetClick(item) { // 重置密码
        // this.resetDialogVisible = true
        // this.resetDialogData = data
        const { data } = await resetPassword({
          userId: item.userId
        })

        this.pswTitle = '重置成功'
        this.tipStr = '重置成功！密码是'
        this.psw = data.data
        this.pswDialogVisible = true
      },
      handleEditClick(userId, isAdmin, organizationId) { // 编辑成员
        this.userDialogVisible = true
        this.userDialogType = 'edit'
        this.userId = userId
        this.isAdmin = isAdmin
        this.editOrganizationId = organizationId
      },
      async fetchRoleList() {
        const { data } = await fetchRoleList()
        if (data && data.data) {
          this.roleList = data.data
        }
      },
      async promotion(id) {
        await promotion({
          userId: id,
          organizationId: this.organizationId
        })
        this.$message.success('设置成功')
        this.loadOrganizationDetail(this.organizationId)
        this.loadUsers({
          organizationId: this.organizationId
        })
      },
      async demotion(id) {
        await demotion({
          userId: id,
          organizationId: this.organizationId
        })
        this.$message.success('取消成功')
        this.loadOrganizationDetail(this.organizationId)
        this.loadUsers({
          organizationId: this.organizationId
        })
      },
      async handleStop(id) { // 停用
        try {
          await stopUser({
            userId: id
          })
          this.$message.success('已停用')
          this.loadUsers({
            organizationId: this.organizationId
          })
        } catch (error) {
          return
        }
      },
      async handleOpen(id) { // 启用
        try {
          await enableUser({
            userId: id
          })
          this.$message.success('已启用')
          this.loadUsers({
            organizationId: this.organizationId
          })
        } catch (error) {
          return
        }
      },
      async handleDel(id) { // 删除
        try {
          await delUser({
            userId: id
          })
          this.$message.success('已删除')
          this.loadUsers({
            organizationId: this.organizationId
          })
        } catch (error) {
          return
        }
      }
    },
    mounted() {
      this.innerShowTableHeaders = this.showTableHeaders
      this.fetchRoleList()
    }
  }
</script>


<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import 'src/styles/placeholder.scss';

  .team-detail {
    > .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      > .info {
        > .title {
          font-weight: $--font-weight-primary;
          font-size: $--font-size-base;
          display: inline-block;
          margin-right: 10px;
        }
        > .extra {
          color: $--color-text-regular;
        }
      }
      > .action {
        white-space: nowrap;
        .iconfont {
          font-size: $--font-size-small;
          display: inline-block;
          margin-right: 5px;
        }
      }
    }
    .success {
      color: $--color-success;
    }
    .danger {
      color: $--color-danger;
    }
  }
  .operation {
    > span {
      @extend %tableAction;
    }
  }
  .el-button + .el-button {
    margin-left: 5px;
  }
  .psw {
    color: $--color-primary;
  }
</style>
