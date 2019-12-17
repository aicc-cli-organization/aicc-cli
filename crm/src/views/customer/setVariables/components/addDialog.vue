<template>
  <yiwise-dialog width="800px" class="add-dailog"
    :hasFooter="false"
    :visible.sync="innerVisible"
    :title="operType === 'add' ? '添加新字段' : '编辑字段'"
    @close="handleDialogClose"
    @open="handleDialogOpen"
  >
    <el-steps :space="200" :active="activeStep" finish-status="success">
      <el-step title="选择字段类型">fdsafds</el-step>
      <el-step title="字段设置">fdsafdsaf</el-step>
      <el-step title="完成">fdsafdsfasdf</el-step>
    </el-steps>

    <div class="step-container step1-container" v-show="activeStep === 1" key="step1">
      <pagination-table
        class="table"
        ref="table"
        :autoLoad="false"
        :isPagination="false"
        :data="tableData"
        :max-height="500"
      >
        <yiwise-table-column label="字段类型" prop="label" width="100"></yiwise-table-column>
        <yiwise-table-column label="类型模板" :show-overflow-tooltip="false" width="180">
          <template slot-scope="{ row }">
            <el-input disabled :placeholder="row.placeholder" v-if="row.type === 'input'"></el-input>
            <el-input disabled type="textarea" :placeholder="row.placeholder" v-else-if="row.type === 'textarea'"></el-input>
            <el-select disabled v-model="tempSelectValue" :placeholder="row.placeholder" clearable v-else-if="row.type === 'select'">
              <el-option
                v-for="item in row.options"
                :key="item.key"
                :label="item.value"
                :value="item.key">
              </el-option>
            </el-select>
            <el-radio-group disabled v-model="tempRadioValue" v-else-if="row.type === 'radio'">
              <el-radio class="short-check" v-for="item in row.options" :key="item.key" :label="item.key">{{item.value}}</el-radio>
            </el-radio-group>
            <el-checkbox-group disabled v-model="tempCheckboxValue" v-else-if="row.type === 'checkbox'">
              <el-checkbox class="short-checkbox short-check" v-for="item in row.options" :key="item.key" :label="item.key">{{item.value}}</el-checkbox>
            </el-checkbox-group>
          </template>
        </yiwise-table-column>
        <yiwise-table-column label="类型描述" prop="memo"></yiwise-table-column>
        <yiwise-table-column label="选择" width="100">
          <template slot-scope="{ row }">
            <span class="operation" @click="checkedType = row.key" v-if="checkedType !== row.key">选择</span>
            <span v-else>当前选中项</span>
          </template>
        </yiwise-table-column>
      </pagination-table>
    </div>

    <div class="step-container step2-container" v-show="activeStep === 2" key="step2">
      <el-form ref="upperForm" label-width="100px" :model="formData" :rules="rules">
        <el-form-item label="字段类型">
          <span class="font14">{{(varTypeEnum[checkedType] || {}).label}}</span>
        </el-form-item>

        <el-form-item label="字段名称" prop="name">
          <el-input placeholder="请输入字段名称" v-model="formData.name"></el-input>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input type="textarea" placeholder="请输入描述" v-model="formData.description"></el-input>
        </el-form-item>

        <el-form-item label="权限" style="white-space:nowrap;">
          <el-checkbox v-model="formData.editable">可编辑</el-checkbox>
          <el-checkbox
            v-if="[ONE_LINE, MULT_ILINE].includes(checkedType)"
            v-model="formData.collection"
          >属性收集</el-checkbox>
          <el-checkbox v-model="formData.required" :disabled="formData.collection">必填</el-checkbox>
          <span class="empty-dialogFlow-tip"><i class="el-icon-warning mr5"></i>是否可编辑的权限设置不影响新增{{customerStr}}时对字段的录入</span>
        </el-form-item>

        <el-form-item label="应用模块" prop="modules">
          <el-checkbox v-model="formData.privateDisplay">我的{{customerStr}}</el-checkbox>
          <el-checkbox v-model="formData.publicDisplay">{{customerStr}}公海</el-checkbox>
          <el-checkbox v-model="formData.callRecordDisplay" :disabled="formData.collection">联系历史</el-checkbox>
          <!-- <el-checkbox v-model="formData.allDisplay">所有{{customerStr}}</el-checkbox> -->
        </el-form-item>

        <el-form-item label="选项设置" prop="valueRange" v-if="[DROPDOWN, RADIO, CHECKBOX].includes(checkedType)">
          <pagination-table
            class="table"
            ref="table"
            :autoLoad="false"
            :isPagination="false"
            :data="formData.valueRange"
            :max-height="500"
          >
            <yiwise-table-column label="顺序" prop="index"></yiwise-table-column>
            <yiwise-table-column label="选项名称">
              <template slot-scope="{ row }">
                <el-input v-model="row.value" placeholder="请输入选项名称"></el-input>
              </template>
            </yiwise-table-column>
            <yiwise-table-column label="默认值">
              <template slot-scope="{ row }">
                <span class="operation" @click="handleSetDefault(row)" v-if="!row.defaultStatus">设为默认</span>
                <template v-else>
                  <span>默认值</span>
                  <span class="operation ml5" @click="handleUnSetDefault(row)">取消默认</span>
                </template>
              </template>
            </yiwise-table-column>
            <yiwise-table-column width="70px">
              <template slot="header">
                <i class="el-icon-circle-plus-outline add-option-icon" @click="handleAddOption"></i>
              </template>
              <template slot-scope="{ row }">
                <i class="el-icon-remove-outline del-option-icon" :class="formData.valueRange.length <= 1 ? 'disabled' : ''" @click="handleDel(row.index)"></i>
              </template>
            </yiwise-table-column>
          </pagination-table>
        </el-form-item>
      </el-form>
    </div>

    <div class="step-container step3-container" v-show="activeStep === 3" key="step3">
      step3
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{activeStep >= 2 && operType === 'add' ? '上一步' : '取消'}}</el-button>
      <el-button
        type="primary"
        @click="handleSubmit()"
        :loading="loading"
        :disabled="confirmDisabled"
      >
        {{activeStep >= 2 ? '保存' : '下一步'}}
      </el-button>
    </div>
  </yiwise-dialog>
</template>

<script>
  import { PaginationTable, YiwiseDialog, YiwiseTableColumn } from 'yiwise-components'
  import { addCustomerVar, updateCustomerVar } from '@/api/customer'
  import { modules, PRIVATE, PUBLIC, CONTACT_HISTORY, ALL_CUSTOMER } from '../sv_enum'
  import { mapMutations, mapGetters } from 'vuex'
  import { varTypeEnum, SYSTEM, ONE_LINE, MULT_ILINE, DROPDOWN, RADIO, CHECKBOX } from '@/utils/enum'

  const makeInitialFormData = () => ({
    name: '',
    description: '',
    editable: false,
    required: false,
    collection: false,
    privateDisplay: false,
    publicDisplay: false,
    allDisplay: false,
    callRecordDisplay: false,
    valueRange: [{
      index: 1,
      value: '',
      defaultStatus: false
    }]
  })

  export default {
    components: {
      YiwiseDialog,
      PaginationTable,
      YiwiseTableColumn
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      operType: {
        type: String,
        default: 'add'
      },
      defaultData: {}
    },
    computed: {
      ...mapGetters(['customerStr']),
      innerVisible: {
        get() {
          return this.visible
        },
        set(newValue) {
          this.$emit('update:visible', newValue)
        }
      },
      tableData() {
        const data = []
        const cloneData = JSON.parse(JSON.stringify(varTypeEnum))
        for (const key in cloneData) {
          key !== SYSTEM && data.push({
            ...cloneData[key],
            checked: false,
            key
          })
        }

        return data
      },
      confirmDisabled() {
        if (this.activeStep === 1) {
          return !this.checkedType
        } else {
          return false
        }
      }
    },
    data() {
      return {
        modules,
        varTypeEnum,
        ONE_LINE,
        MULT_ILINE,
        DROPDOWN,
        RADIO,
        CHECKBOX,
        PRIVATE,
        PUBLIC,
        CONTACT_HISTORY,
        ALL_CUSTOMER,
        loading: false,
        activeStep: 1,
        checkedType: undefined,
        tempSelectValue: undefined,
        tempRadioValue: 'v1',
        tempCheckboxValue: ['v1'],
        formData: makeInitialFormData(),
        initialAuth: {},
        rules: {
          name: [
            { required: true, message: '请输入字段名称' },
            { max: 20, message: '最大长度不能超过20' },
            { pattern: /^[a-zA-Z0-9\u4E00-\u9FBF]*$/, message: '只能包含中文、字母或数字' }
          ],
          description: [
            { max: 100, message: '最大长度不能超过100' }
          ]
        }
      }
    },
    methods: {
      ...mapMutations(['ADD_PRIVATE_CHECKED_FIELD', 'ADD_PUBLIC_CHECKED_FIELD', 'ADD_CALL_CHECKED_FIELD']),
      async handleDialogOpen() {
        if (this.operType === 'edit') {
          this.activeStep = 2
          this.checkedType = this.defaultData.fieldType
          Object.keys(this.formData).forEach(key => (this.formData[key] = this.defaultData[key] || this.formData[key]))

          this.initialAuth = {
            [PRIVATE]: this.defaultData.privateDisplay,
            [PUBLIC]: this.defaultData.publicDisplay,
            [CONTACT_HISTORY]: this.defaultData.callRecordDisplay,
            [ALL_CUSTOMER]: this.defaultData.allDisplay
          }
        } else {
          this.formData.editable = true
        }
      },
      handleDialogClose() {
        this.$refs.upperForm.resetFields()
        this.formData = makeInitialFormData()
        this.activeStep = 1
        this.checkedType = undefined
        this.initialAuth = {
          [PRIVATE]: false,
          [PUBLIC]: false,
          [CONTACT_HISTORY]: false,
          [ALL_CUSTOMER]: false
        }
      },
      handleCancel() {
        if (this.activeStep >= 2 && this.operType === 'add') {
          this.activeStep--
        } else {
          this.innerVisible = false
        }
      },
      handleSubmit() {
        if (this.activeStep < 2) {
          this.activeStep++
          return
        }

        this.$refs.upperForm.validate(async(valid) => {
          if (valid) {
            try {
              const params = JSON.parse(JSON.stringify(this.formData))
              let customerPersonExtraFieldId
              params.fieldType = this.checkedType
              if (![DROPDOWN, RADIO, CHECKBOX].includes(this.checkedType)) {
                delete params.valueRange
              } else {
                for (let i = 0; i < params.valueRange.length; i++) {
                  if (!params.valueRange[i].value) {
                    this.$message.error('请填写所有选项名称')
                    return
                  }
                }
              }

              if (this.operType === 'edit') {
                customerPersonExtraFieldId = params.customerPersonExtraFieldId = this.defaultData.customerPersonExtraFieldId
                await updateCustomerVar(params)
              } else {
                const { data } = await addCustomerVar(params)
                customerPersonExtraFieldId = data.data.customerPersonExtraFieldId
              }

              this.$message.success('保存成功')
              this.innerVisible = false

              // 冒泡success事件时，告诉父组件该字段的显示模块增加了哪些，删除了哪些
              const curAuth = {
                [PRIVATE]: params.privateDisplay,
                [PUBLIC]: params.publicDisplay,
                [CONTACT_HISTORY]: params.callRecordDisplay,
                [ALL_CUSTOMER]: params.allDisplay
              }
              const addList = []
              const delList = []
              for (const key in curAuth) {
                if (curAuth[key] && !this.initialAuth[key]) {
                  addList.push(key)
                } else if (!curAuth[key] && this.initialAuth[key]) {
                  delList.push(key)
                }
              }
              this.$emit('success', {
                addList,
                delList,
                customerPersonExtraFieldId
              })
            } catch (error) {
              return
            }
          }
        })
      },
      handleSetDefault(row) {
        if (this.checkedType !== CHECKBOX) {
          this.formData.valueRange.forEach(item => (item.defaultStatus = false))
        }

        row.defaultStatus = true
      },
      handleUnSetDefault(row) {
        row.defaultStatus = false
      },
      handleAddOption() {
        this.formData.valueRange.push({
          index: this.formData.valueRange.length + 1,
          value: '',
          defaultStatus: false
        })
      },
      handleDel(index) {
        if (this.formData.valueRange.length <= 1) return
        this.formData.valueRange.splice(index - 1, 1)
        this.formData.valueRange.forEach((item, index) => {
          item.index = index + 1
        })
      }
    },
    watch: {
      'formData.collection': {
        handler: function(newVal) {
          if (newVal) {
            this.formData.required = false
            this.formData.callRecordDisplay = false
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/placeholder.scss';
  
  .step-container {
    margin: 15px 0;
  }

  .table {
    .operation {
      @extend %tableAction;
    }
    /deep/ th.is-leaf {
      border: none;
      border-right-color: #e5e7ea !important;
    }
    .add-option-icon {
      font-size: 20px;
      color: $--color-success;
    }
    .del-option-icon {
      font-size: 20px;
      color: $--color-danger;
    }
  }

  .add-dailog {
    /deep/ .el-dialog__body {
      padding: 0 50px !important;
    }
    /deep/ .out-dialog-type {
      display: block;
    }
    .el-form-item {
      /deep/ .el-form-item__content {
        font-size: 0;
      }
      .font14 {
        font-size: 14px;
      }
    }
    .el-checkbox {
      width: 80px;
      &.short-checkbox {
        width: auto;
      }
    }
    .short-check + .short-check {
      margin-left: 15px;
    }
    .el-steps {
      .el-step {
        flex-basis: 50% !important;
        /deep/ .el-step__main {
          margin-left: -20px;
        }
        &:last-child, &:first-child {
          /deep/ .el-step__main {
            margin-left: 0;
          }
        }
        &:last-child {
          flex-basis: auto !important;
          flex-shrink: 0;
          flex-grow: 0;
          text-align: right;
          /deep/ .el-step__line {
            left: 0;
            right: 50%;
            display: block;
            .el-step__line-inner {
              border-width: 0;
            }
          }
        }
      }
    }
  }
  .down-form {
    border-top: $--border-base;
  }
  .el-form-item--small.el-form-item.mb0 {
    margin-bottom: 0;
  }
  .label-line-height17 {
    /deep/ label.el-form-item__label {
      line-height: 17px;
    }
  }
  .empty-dialogFlow-tip {
    color: #E99209;
    font-size: 12px;
  }
</style>

