<template>
  <div>
    <div class="pl16 mt5 mb10">
      <el-input class="w300" @keyup.enter.native="search()" placeholder="模板名"  size="small" v-model="filterSearchText">
        <el-button class="w30" slot="append" icon="el-icon-search"  size="small"  @click="search()"></el-button>
      </el-input>

      <el-select v-model="filterCreatedByUserId" placeholder="创建者" class="ml5"  @change="search()">
        <el-option
        v-for="item in filterUserList"
        :key="item.userId"
        :label="item.name"
        :value="item.userId">
        </el-option>
      </el-select>

      <el-select v-model="filterStatus" placeholder="审核状态" class="ml5" @change="search()">
        <el-option
          v-for="item in messageCheckStatus"
          :key="item.key"
          :label="item.name"
          :value="item.key">
        </el-option>
      </el-select>
      <el-button class="w150 f12 ml5" type="primary" @click="clearFilter()">清空筛选条件</el-button>

    </div>
    <div class="clearfix mb10 right pr10">
      <el-button class="w150 f12 mr15" type="primary" v-if="hasAccess('crm_SMSTemplate_addOrEdit')"
        @click="showSmsTemplateForm({ type: 'ADD'})"
      >
        新建短信模板
      </el-button>
    </div>
    <pagination-table
      :url="'/apiEngine/smsTemplate/list'"
      stripe
      :server="'engine'"
      :pageZero="false"
      :params="paginationParams"
      ref="table">
      <el-table-column
        fixed
        prop="name"
        label="模板名"
        width="">
      </el-table-column>
      <el-table-column
        prop="smsChannelName"
        label="短信类型">
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        prop="text"
        label="模板内容"
        width="">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="">
        <template slot-scope="scope">
          {{parseTime(scope.row.createTime)}}
        </template>
      </el-table-column>
      <el-table-column
        prop="approvalStatus"
        label="审核状态"
        width="">
        <template slot-scope="scope">
          {{constant.smsTemplateCheckStatusENUM[scope.row.approvalStatus]}}
        </template>
      </el-table-column>
      <el-table-column
        prop="rejectReason"
        label="审核结果"
        width="">
      </el-table-column>
      <el-table-column
        label="操作"
        fixed="right"
        width="250"
        v-if="hasAccess('crm_SMSTemplate_addOrEdit') || hasAccess('crm_SMSTemplate_del')">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.approvalStatus=='REJECTED'"
            @click="showSmsTemplateForm({ type: 'EDIT', row: scope.row})"
            type="text"
            size="small"
            :disabled="!hasAccess('crm_SMSTemplate_addOrEdit')"
          >
            编辑
          </el-button>
          <yiwise-pop-confirm
            label="确定删除该模板吗？"
            v-if="hasAccess('crm_SMSTemplate_del')"
            @submit="deleteTemplate(scope.row)"
          >
            <el-button type="text" size="mini">删除</el-button>
          </yiwise-pop-confirm>
        </template>
      </el-table-column>
    </pagination-table>

    <!-- 短信模板 -->
    <sms-template-form
      :row.sync="smsTemplateForm"
      :visible.sync="smsTemplateFormVisible"
      @success="loadData"
    />
  </div>
</template>

<script>
import PaginationTable from '@/components/PaginationTable/index'
import * as usersAPI from '@/api/users'
import * as constant from '@/utils/constant'
import * as moment from 'moment'
import smsTemplateForm from './components/smsTemplateForm'
import { deleteTemplate } from '@/api/sms'
import { YiwisePopConfirm } from 'yiwise-components'

export default {
  components: {
    smsTemplateForm,
    YiwisePopConfirm,
    PaginationTable
  },
  data() {
    return {
      filterUserList: [],

      filterCreatedByUserId: null,
      filterSearchText: null,
      filterStatus: null,

      // 短信模板
      smsTemplateForm: {},
      smsTemplateFormVisible: false,

      messageCheckStatus: [{
        key: 'PENDING_APPROVAL',
        name: '等待审核'
      }, {
        key: 'APPROVED',
        name: '审核通过'
      }, {
        key: 'REJECTED',
        name: '拒绝'
      }]
    }
  },
  computed: {
    constant() {
      return constant
    },
    paginationParams() {
      return {
        createUserId: this.filterCreatedByUserId,
        searchWords: this.filterSearchText,
        status: this.filterStatus
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
      this.filterCreatedByUserId = null
      this.filterStatus = null
      this.filterSearchText = null
      this.$nextTick(() => {
        this.loadData()
      })
    },
    deleteTemplate(row) {
      deleteTemplate({
        smsTemplateId: row.smsTemplateId
      }).then(() => {
        this.loadData()
      })
    },
    requestFilterUsers() {
      usersAPI.getSmsTemplateUserList().then(({ data }) => {
        this.filterUserList = data.data
      })
    },
    loadData(page = 1, size = 20) {
      this.$refs.table.loadData(page, size)
    },
    parseTime(time) {
      return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : null
    },
    showSmsTemplateForm(data) {
      this.smsTemplateFormVisible = true
      if (data.type === 'EDIT') {
        this.smsTemplateForm = {
          ...data.row,
          addOrEdit: data.type
        }
      } else {
        this.addOrEdit = 'ADD'
        this.smsTemplateForm = {
          addOrEdit: data.type
        }
      }
    }
  },
  mounted() {
    this.requestFilterUsers()
  }
}
</script>

<style lang="scss" scoped>
  .w100{
    width: 100px;
    vertical-align: top;
    margin-right: -3px;

  }

  .w300{
    width: 300px;
    vertical-align: top;
  }

  .mb5{
    margin-bottom: 5px;
  }
  .w30{
    width: 30px;
  }
  .el-button + .el-button {
    margin-left: 5px;
  }
  .remark-text {
    font-size: 12px;
    color: #666;
    line-height: 12px;
  }
  .count-text {
    position: absolute;
    right: 10px;
    bottom: 10px;
    background: #fff;
  }
  /deep/ .el-dialog__body {
    padding: 0 150px!important;
  }
  /deep/ .el-form-item--small.el-form-item:last-child {
    margin-bottom: 37px;
  }
  /deep/ .el-textarea__inner {
    padding: 5px 15px 25px;
  }
</style>
