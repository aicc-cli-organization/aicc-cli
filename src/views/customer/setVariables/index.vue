<template>
  <div class="yw-container">
    <div class="table-top-action">
      <div class="action-left">
        可拖动表格栏调整顺序（用于控制在相应页面上的显示顺序）
      </div>
      <div class="action-right" v-if="auth_add_edit">
        <!-- 添加超过30个按钮置灰并tooltip提示 -->
        <el-tooltip placement='top' ref='tooltip' content="最多支持添加30个新字段" v-if="!canAdd">
          <el-button type="primary" class="right-item is-disabled" v-if="!canAdd">添加新字段</el-button>
        </el-tooltip>
        <el-button type="primary" class="right-item" v-if="canAdd" @click="handleAddVariable">添加新字段</el-button>
      </div>
    </div>

    <pagination-table
      class="table"
      ref="table"
      :data="tableData"
      :autoLoad="false"
      :draggable="auth_add_edit && !togglingPrivateShow && !togglingPublicShow && !togglingCallShow && !togglingAllShow"
      :dragIgnoreReason="'被替换项不能调整顺序！'"
      :onDragEnd="handleDragEnd"
      :isPagination="false"
      :headers="{
        'Content-Type': 'application/json'
      }"
      :max-height="clientHeight - 200"
    >
      <yiwise-table-column label="优先级" width="100px" prop="orderCode"></yiwise-table-column>
      <yiwise-table-column label="字段名称" prop="name"></yiwise-table-column>
      <yiwise-table-column label="类型">
        <template slot-scope="{ row }">
          {{row.type === 'CUSTOM' ? '自定义字段' : '系统字段'}}
        </template>
      </yiwise-table-column>
      <yiwise-table-column label="字段类型" width="115px">
        <template slot-scope="{ row }">
          {{(varTypeEnum[row.fieldType] || {}).label}}
        </template>
      </yiwise-table-column>
      <yiwise-table-column label="描述" prop="description"></yiwise-table-column>
      <yiwise-table-column label="权限">
        <template slot-scope="{ row }">
          {{getAuthStr(row)}}
        </template>
      </yiwise-table-column>
      <yiwise-table-column :label="`我的${customerStr}`">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.privateDisplay"
            :disabled="['姓名', '联系电话'].includes(row.name) || togglingPrivateShow || !auth_add_edit"
            @change="handleChangeUse(PRIVATE, row.privateDisplay, row)"
            active-color="#1890ff">
          </el-switch>
        </template>
      </yiwise-table-column>
      <yiwise-table-column :label="`${customerStr}公海`">
        <template slot-scope="{ row }">
          <el-switch 
            v-model="row.publicDisplay"
            :disabled="['姓名', '联系电话'].includes(row.name) || togglingPublicShow || !auth_add_edit"
            @change="handleChangeUse(PUBLIC, row.publicDisplay, row)"
            active-color="#1890ff">
          </el-switch>
        </template>
      </yiwise-table-column>
      <yiwise-table-column label="联系历史(AI外呼/快速拨打/话术训练)">
        <template slot-scope="{ row }">
          <el-switch 
            v-model="row.callRecordDisplay"
            :disabled="['姓名', '联系电话'].includes(row.name) || togglingCallShow || !auth_add_edit || row.collection"
            @change="handleChangeUse(CONTACT_HISTORY, row.callRecordDisplay, row)"
            active-color="#1890ff">
          </el-switch>
        </template>
      </yiwise-table-column>
      <!-- <yiwise-table-column :label="`所有${customerStr}`">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.allDisplay"
            :disabled="['姓名', '联系电话'].includes(row.name) || togglingAllShow || !auth_add_edit"
            @change="handleChangeUse(ALL_CUSTOMER, row.allDisplay, row)"
            active-color="#1890ff">
          </el-switch>
        </template>
      </yiwise-table-column> -->
      <yiwise-table-column label="操作" width="140px" fixed="right">
        <div slot-scope="{ row }" v-if="row.type === 'CUSTOM'">
          <span class="operation" @click="handleEdit(row)" v-if="auth_add_edit">编辑</span>
          <YiwisePopConfirm width="300" label="确认删除该字段吗？删除后各模块中相应字段的数据将被删除且无法恢复，请谨慎操作!" @submit="handleDelVar(row)">
            <span class="operation">删除</span>
          </YiwisePopConfirm>
          <a class="operation" v-if="row.collection" @click="onOpenDictionary(row)">词典</a>
        </div>
      </yiwise-table-column>
    </pagination-table>

    <add-dialog
      :visible.sync="addDialogVisible"
      :defaultData="editData"
      :operType="operType"
      @success="handleEditSuccess">
    </add-dialog>
    <dictionary-dialog
      :defaultData="editData"
      :visible.sync="dictionaryDialogVisible"
      @update="loadData"
    ></dictionary-dialog>
  </div>
</template>

<script>
  import { PaginationTable, YiwiseTableColumn, YiwisePopConfirm } from 'yiwise-components'
  import addDialog from './components/addDialog'
  import DictionaryDialog from './components/dictionaryDialog'
  import { getCustomerVarList, setDisplay, sort, deleteField } from '@/api/customer'
  import { PRIVATE, PUBLIC, CONTACT_HISTORY, ALL_CUSTOMER } from './sv_enum'
  import { varTypeEnum } from '@/utils/enum'
  import { mapGetters, mapActions, mapMutations } from 'vuex'

  export default {
    components: {
      PaginationTable,
      YiwiseTableColumn,
      YiwisePopConfirm,
      addDialog,
      DictionaryDialog
    },
    data() {
      return {
        editData: {},
        operType: 'add',
        PRIVATE,
        PUBLIC,
        CONTACT_HISTORY,
        ALL_CUSTOMER,
        varTypeEnum,
        addDialogVisible: false,
        dictionaryDialogVisible: false,
        tableData: [],
        togglingPrivateShow: false,
        togglingPublicShow: false,
        togglingCallShow: false,
        togglingAllShow: false
      }
    },
    computed: {
      ...mapGetters(['clientHeight', 'customerStr']),
      auth_add_edit() {
        return this.hasAccess('crm_customerAttribute_addAndEdit')
      },
      canAdd() {
        return this.tableData.length < 30
      }
    },
    methods: {
      ...mapMutations(['ADD_PRIVATE_CHECKED_FIELD', 'ADD_PUBLIC_CHECKED_FIELD', 'ADD_CALL_CHECKED_FIELD',
        'DEL_PRIVATE_CHECKED_FIELD', 'DEL_PUBLIC_CHECKED_FIELD', 'DEL_CALL_CHECKED_FIELD']),
      ...mapActions(['loadCustomerFields']),
      getAuthStr({ editable, required, collection }) {
        const editStr = !editable ? '不可编辑' : '可编辑'
        const collectionStr = collection ? '属性收集' : ''
        const requireStr = required ? '必填' : '非必填'
        return [collectionStr, editStr, requireStr].filter(item => !!item).join('，')
        // return editStr + '，' + requireStr
      },
      async loadData() {
        const { data } = await getCustomerVarList()
        this.tableData = (data.data || []).map(item => ({
          ...item,
          name: item.name.replace('客户', this.customerStr),
          description: item.description.replace('客户', this.customerStr)
        }))
      },
      handleAddVariable() {
        this.operType = 'add'
        this.addDialogVisible = true
      },
      getAccountFare(accountFare) {
        const r = parseFloat(accountFare) || 0
        return (r / 1000).toFixed(3)
      },
      getUsedFor(row) {
        const { supportCallIn, supportCallOut } = row
        return supportCallIn && supportCallOut ? '支持外呼和呼入'
          : supportCallIn && !supportCallOut ? '仅支持呼入'
            : supportCallOut && !supportCallIn ? '仅支持外呼'
              : '--'
      },
      handleEdit(row) {
        this.editData = row
        this.operType = 'edit'
        this.addDialogVisible = true
      },
      async handleChangeUse(type, display, { customerPersonExtraFieldId }) {
        if (this[`toggling${key}Show`]) {
          this.$message.warning('请勿重复操作')
          return
        }
        const key = {
          PRIVATE: 'Private',
          PUBLIC: 'Public',
          CONTACT_HISTORY: 'Call',
          ALL_CUSTOMER: 'All'
        }[type]
        this[`toggling${key}Show`] = true

        await setDisplay({
          type,
          display,
          customerPersonExtraFieldId
        })

        this.$message.success('修改成功')
        this.loadData()

        if (display) {
          if (type === PRIVATE) {
            this.ADD_PRIVATE_CHECKED_FIELD(customerPersonExtraFieldId + '')
          } else if (type === PUBLIC) {
            this.ADD_PUBLIC_CHECKED_FIELD(customerPersonExtraFieldId + '')
          } else if (type === CONTACT_HISTORY) {
            this.ADD_CALL_CHECKED_FIELD(customerPersonExtraFieldId + '')
          }
        } else {
          if (type === PRIVATE) {
            this.DEL_PRIVATE_CHECKED_FIELD(customerPersonExtraFieldId + '')
          } else if (type === PUBLIC) {
            this.DEL_PUBLIC_CHECKED_FIELD(customerPersonExtraFieldId + '')
          } else if (type === CONTACT_HISTORY) {
            this.DEL_CALL_CHECKED_FIELD(customerPersonExtraFieldId + '')
          }
        }
        this[`toggling${key}Show`] = false
      },
      async handleDragEnd(td) {
        await sort(td.map(({ customerPersonExtraFieldId }, index) => ({
          customerPersonExtraFieldId,
          orderCode: index + 1
        })))

        this.$message.success('拖拽成功')
        this.loadCustomerFields()
        this.loadData()
      },
      async handleDelVar({ customerPersonExtraFieldId }) {
        await deleteField({
          customerPersonExtraFieldId
        })

        this.$message.success('删除成功')
        this.loadData()

        await this.loadCustomerFields()
        this.DEL_PRIVATE_CHECKED_FIELD(customerPersonExtraFieldId + '')
        this.DEL_PUBLIC_CHECKED_FIELD(customerPersonExtraFieldId + '')
        this.DEL_CALL_CHECKED_FIELD(customerPersonExtraFieldId + '')
      },
      async handleEditSuccess({ addList, delList, customerPersonExtraFieldId }) {
        this.loadData()

        await this.loadCustomerFields()
        addList.forEach(type => {
          if (type === PRIVATE) {
            this.ADD_PRIVATE_CHECKED_FIELD(customerPersonExtraFieldId + '')
          } else if (type === PUBLIC) {
            this.ADD_PUBLIC_CHECKED_FIELD(customerPersonExtraFieldId + '')
          } else if (type === CONTACT_HISTORY) {
            this.ADD_CALL_CHECKED_FIELD(customerPersonExtraFieldId + '')
          }
        })
        delList.forEach(type => {
          if (type === PRIVATE) {
            this.DEL_PRIVATE_CHECKED_FIELD(customerPersonExtraFieldId + '')
          } else if (type === PUBLIC) {
            this.DEL_PUBLIC_CHECKED_FIELD(customerPersonExtraFieldId + '')
          } else if (type === CONTACT_HISTORY) {
            this.DEL_CALL_CHECKED_FIELD(customerPersonExtraFieldId + '')
          }
        })
      },
      onOpenDictionary(row) {
        this.editData = row
        this.dictionaryDialogVisible = true
      }
    },
    mounted() {
      this.loadData()
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';

  .yw-container {
    height: 100%;
  }

  .table {
    .operation {
      @extend %tableAction;
    }
  }
</style>

