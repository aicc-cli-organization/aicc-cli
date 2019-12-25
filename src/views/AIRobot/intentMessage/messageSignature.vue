<template>
  <div>
    <div class="pl16 mt5 mb10">
      <el-input class="w300" @keyup.enter.native="search()" placeholder="签名"  size="small" v-model="filterSearchText">
        <el-button class="w30" slot="append" icon="el-icon-search"  size="small"  @click="search()"></el-button>
      </el-input>

      <el-select v-model="smsChannelId" placeholder="全部短信类型" class="ml5" @change="search()">
        <el-option
          v-for="item in SmsTemplateType"
          :key="item.smsChannelId"
          :label="item.smsChannelName"
          :value="item.smsChannelId">
        </el-option>
      </el-select>

      <el-select v-model="filterStatus" placeholder="全部审核状态" class="ml5" @change="search()">
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
      <el-button class="w150 f12  mr15" type="primary"
        v-if="hasAccess('crm_SMSSign_add')"
        @click="showSmsSignatureForm({ type: 'ADD' })">
        新建短信签名
      </el-button>
    </div>
    <pagination-table
      :url="'/apiEngine/smsSignature/list'"
      stripe
      :server="'engine'"
      :maxHeight="clientHeight - 280"
      :pageZero="false"
      :params="paginationParams"
      ref="table">
      <yiwise-table-column
        fixed
        prop="name"
        label="短信签名"
        width="">
      </yiwise-table-column>
      <yiwise-table-column
        fixed
        prop="smsChannelName"
        label="短信类型">
      </yiwise-table-column>
      <yiwise-table-column
        prop="updateUserName"
        label="更新人"
        width="">
      </yiwise-table-column>
      <yiwise-table-column
        :show-overflow-tooltip="true"
        prop="updateTime"
        label="更新时间"
        width="">
      </yiwise-table-column>
      <yiwise-table-column
        prop="approvalStatus"
        label="审核状态"
        width="">
        <template slot-scope="scope">
          {{constant.smsTemplateCheckStatusENUM[scope.row.approvalStatus]}}
        </template>
      </yiwise-table-column>
      <yiwise-table-column
        prop="rejectReason"
        label="审核结果"
        width="">
      </yiwise-table-column>
      <yiwise-table-column
        label="操作"
        fixed="right"
        width="250">
        <template slot-scope="scope">
          <el-button
            @click="showSmsSignatureForm({ type: 'EDIT', row: scope.row})"
            type="text"
            size="small"
            v-if="scope.row.approvalStatus=='REJECTED'"
          >
            编辑
          </el-button>
          <yiwise-pop-confirm
            label="确定删除该签名吗？"
            @submit="deleteSignature(scope.row)"
          >
            <el-button type="text" size="mini">删除</el-button>
          </yiwise-pop-confirm>
        </template>
      </yiwise-table-column>
    </pagination-table>

    <!-- 短信模板 -->
    <sms-template-form
      :row.sync="smsTemplateForm"
      :visible.sync="smsTemplateFormVisible"
      @success="loadData"
    />

    <!-- 短信签名 -->
    <sms-signature-form
      :row.sync="smsSignatureForm"
      :visible.sync="smsSignatureFormVisible"
      @success="loadData"
    />
  </div>
</template>

<script>
import { YiwiseTableColumn } from 'yiwise-components'
import PaginationTable from '@/components/PaginationTable/index'
import * as constant from '@/utils/constant'
import * as moment from 'moment'
import smsTemplateForm from './components/smsTemplateForm'
import smsSignatureForm from './components/smsSignatureForm'
import { deleteSmsSignature, getSmsTemplateType } from '@/api/sms'
import { YiwisePopConfirm } from 'yiwise-components'
import { mapGetters } from 'vuex'

export default {
  components: {
    smsTemplateForm,
    smsSignatureForm,
    YiwisePopConfirm,
    PaginationTable,
    YiwiseTableColumn
  },
  data() {
    return {
      filterSearchText: null,
      filterStatus: null,
      smsChannelId: null,

      // 短信模板
      smsTemplateForm: {},
      smsTemplateFormVisible: false,

      // 短信签名
      smsSignatureForm: {},
      smsSignatureFormVisible: false,

      messageCheckStatus: [{
        key: 'PENDING_APPROVAL',
        name: '等待审核'
      }, {
        key: 'APPROVED',
        name: '审核通过'
      }, {
        key: 'REJECTED',
        name: '拒绝'
      }],
      SmsTemplateType: []
    }
  },
  computed: {
    ...mapGetters(['clientHeight']),
    constant() {
      return constant
    },
    paginationParams() {
      return {
        searchWords: this.filterSearchText,
        status: this.filterStatus,
        smsChannelId: this.smsChannelId
      }
    }
  },
  methods: {
    async getSmsTemplateType() {
      const { data } = await getSmsTemplateType()
      this.SmsTemplateType  = data.data || []
    },
    search() {
      this.$nextTick(() => {
        this.loadData()
      })
    },
    clearFilter() {
      this.filterStatus = null
      this.smsChannelId = null
      this.filterSearchText = null
      this.$nextTick(() => {
        this.loadData()
      })
    },
    deleteSignature(row) {
      deleteSmsSignature({
        smsSignatureId: row.smsSignatureId
      }).then(() => {
        this.loadData()
      })
    },
    loadData(page = 1, size = 20) {
      this.$refs.table.loadData(page, size)
    },
    parseTime(time) {
      return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : null
    },
    showSmsSignatureForm(data) {
      if (data.type === 'EDIT') {
        this.smsSignatureForm = {
          ...data.row,
          addOrEdit: data.type
        }
      } else {
        this.smsSignatureForm = {
          addOrEdit: data.type
        }
      }
      this.smsSignatureFormVisible = true
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
    this.getSmsTemplateType()
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
  /deep/ .el-form-item--small.el-form-item:last-child {
    margin-bottom: 37px;
  }
  /deep/ .el-textarea__inner {
    padding: 5px 15px 25px;
  }
</style>
