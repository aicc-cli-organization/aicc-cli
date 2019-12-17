<template>
  <yiwise-dialog
    :title="type === 'add' ? `新建${customerStr}` : `编辑${customerStr}`"
    :visible.sync="innerVisible"
    @open="handleDialogOpen"
    @close="handleDialogClose"
    @confirm="handleSubmit"
  >
    <el-form ref="form" label-width="80px" :model="innerDefaultData" :rules="rules">
      <el-form-item label="姓名" prop="name" v-if="showField('姓名')">
        <el-input :placeholder="`输入${customerStr}姓名`" v-model="innerDefaultData.name"></el-input>
      </el-form-item>
      <el-form-item label="性别：" prop="gender" v-if="type === 'edit' && showField('性别')">
        <el-radio-group v-model="innerDefaultData.gender" size="small">
          <el-radio label="MALE">男</el-radio>
          <el-radio label="FEMALE">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <multiple-form-item
        v-model="innerDefaultData.phoneNumberList"
        label="联系电话"
        placeholder="输入联系电话"
        add-text="添加多个号码"
        prop="phoneNumberList"
        :rule="phoneNumberRule"
        :disabled="phoneNumberListDisabled"
      >
      </multiple-form-item>
      <!-- <el-form-item label="联系电话" prop="phoneNumber" v-if="showField('联系电话')">
        <el-input placeholder="输入联系电话" v-model="innerDefaultData.phoneNumber" :disabled="type === 'edit' && !hasAccess('crm_CustomerPersonPhoneNumber_showAll')"></el-input>
      </el-form-item> -->
      <el-form-item :label="`${customerStr}分组`" v-if="showField(`${customerStr}分组`)">
        <group-list-select ref="groupList" v-model="innerDefaultData.customerGroupId" :style="{width: '268px'}"></group-list-select>
      </el-form-item>
      <el-form-item label="微信" v-if="!isLocal && showField('微信')">
        <el-input placeholder="输入微信" v-model="innerDefaultData.wechatNumber"></el-input>
      </el-form-item>

      <!-- 客户自定义字段 -->
      <el-form-item v-for="field in showFields" :key="field.customerPersonExtraFieldId"
        :label="field.name" :prop="'extraInfo' + field.customerPersonExtraFieldId">
        <el-input :placeholder="'输入' + field.name" v-if="field.fieldType === ONE_LINE"
          v-model="innerDefaultData['extraInfo' + field.customerPersonExtraFieldId]"></el-input>
        <el-input type="textarea" :placeholder="'输入' + field.name"
          v-model="innerDefaultData['extraInfo' + field.customerPersonExtraFieldId]" v-else-if="field.fieldType === MULT_ILINE"></el-input>
        <el-select v-model="innerDefaultData['extraInfo' + field.customerPersonExtraFieldId]" :placeholder="'选择' + field.name" clearable
          v-else-if="field.fieldType === DROPDOWN">
          <el-option
            v-for="item in field.valueRange"
            :key="item.index"
            :label="item.value"
            :value="item.value">
          </el-option>
        </el-select>
        <el-radio-group v-model="innerDefaultData['extraInfo' + field.customerPersonExtraFieldId]" v-else-if="field.fieldType === RADIO">
          <el-radio v-for="item in field.valueRange" :key="item.index" :label="item.value" :title="item.value">{{item.value}}</el-radio>
        </el-radio-group>
        <el-checkbox-group v-model="innerDefaultData['extraInfo' + field.customerPersonExtraFieldId]" v-else-if="field.fieldType === CHECKBOX">
          <el-checkbox class="short-checkbox" v-for="item in field.valueRange" :key="item.index" :label="item.value" :title="item.value">{{item.value}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </yiwise-dialog>
</template>

<script>
  import { YiwiseDialog } from 'yiwise-components'
  import GroupListSelect from '@/components/GroupListSelect'
  import { genderEnum, varTypeEnum, SYSTEM, DROPDOWN, RADIO, CHECKBOX, ONE_LINE, MULT_ILINE } from '@/utils/enum'
  import { mapGetters } from 'vuex'
  import { phoneNumberregex } from '@/utils/regexp'
  import { addCustomer, editCustomer, deleteCustomerGroup } from '@/api/customer'
  import MultipleFormItem from '@/components/MultipleFormItem'

  export default {
    name: 'CustomerDialog',
    components: {
      YiwiseDialog,
      GroupListSelect,
      MultipleFormItem
    },
    props: {
      type: {
        validator(value) {
          return ['add', 'edit'].indexOf(value) !== -1
        },
        default: 'add'
      },
      visible: {
        type: Boolean,
        default: false
      },
      defaultData: {
        type: Object,
        default() {
          return {}
        }
      },
      page: {
        type: String,
        default: 'private' // private 我的客户 public 客户公海 call 联系历史 all 所有客户
      }
    },
    computed: {
      ...mapGetters(['isLocal', 'customerFieldsList', 'customerStr']),
      innerVisible: {
        get() {
          return this.visible
        },
        set(newValue) {
          this.$emit('update:visible', newValue)
        }
      },
      // 除系统字段外额外显示的客户自定义变量
      showFields() {
        return this.customerFieldsList.filter(item => {
          return this.initField(item)
        })
      },
      phoneNumberListDisabled() {
        return this.type === 'edit' && this.hasAccess('crm_customerPersonPhoneNumber_desensitization')
      }
    },
    data() {
      const validator = (rule, value, cb) => {
        let time = 0
        this.innerDefaultData.phoneNumberList.forEach(item => {
          if (item === value) time++
        })
        if (time > 1) {
          cb(new Error('联系电话不可重复'))
        } else {
          cb()
        }
      }
      return {
        genderEnum,
        varTypeEnum,
        SYSTEM,
        DROPDOWN,
        RADIO,
        CHECKBOX,
        ONE_LINE,
        MULT_ILINE,
        initialGroupId: undefined,
        innerDefaultData: {
          gender: 'UNKNOWN',
          phoneNumberList: []
        },
        rules: {
          name: [{
            min: 0, max: 10, message: '姓名为0-10个字'
          }]
        },
        phoneNumberRule: [{
          required: true, message: '请输入联系电话'
        }, {
          pattern: phoneNumberregex, message: '请输入正确的联系电话'
        }, {
          validator
        }]
      }
    },
    methods: {
      fieldDisplay(field) {
        switch (this.page) {
          case 'private': return field.privateDisplay
          case 'public': return field.publicDisplay
          case 'call': return field.callRecordDisplay
          case 'all': return field.allDisplay
          default: return true
        }
      },
      showField(fieldName) {
        return this.customerFieldsList.filter(item =>
          item.name === fieldName && (item.required || (this.fieldDisplay(item) && (this.type === 'add' || item.editable)))
        )
      },
      initField(item, initialV) {
        if (item.required) {
          const rule = [{
            required: true, message: `请${[ONE_LINE, MULT_ILINE].includes(item.fieldType) ? '输入' : '选择'}${item.name}`
          }]
          if (item.fieldType === ONE_LINE) {
            rule.push({
              max: 100, message: '最多输入100个字符'
            })
          } else if (item.fieldType === MULT_ILINE) {
            rule.push({
              max: 500, message: '最多输入500个字符'
            })
          }

          if (!this.rules.hasOwnProperty(['extraInfo' + item.customerPersonExtraFieldId])) {
            this.$set(this.rules, 'extraInfo' + item.customerPersonExtraFieldId, rule)
          }
        }

        // 如果不是系统字段，并且该字段为必填,或者该页面显示该字段，并且此次操作为新增或者该字段可编辑
        if (item.type !== 'SYSTEM' && (item.required || (this.fieldDisplay(item) && (this.type === 'add' || item.editable)))) {
          let value
          if (item.fieldType === CHECKBOX) {
            value = item.valueRange ? item.valueRange.filter(v => v.defaultStatus).map(v => v.value) : []
          } else {
            value = item.valueRange ? item.valueRange.find(v => v.defaultStatus) : undefined
            value = value ? value.value : undefined
          }
          if (!this.innerDefaultData.hasOwnProperty(['extraInfo' + item.customerPersonExtraFieldId])) {
            this.$set(this.innerDefaultData, 'extraInfo' + item.customerPersonExtraFieldId, initialV || value)
          }

          return true
        } else {
          return false
        }
      },
      handleDialogOpen() {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
        this.loadGroupList()
        if (this.type === 'edit') {
          this.generateRulesAndDefaultData()
        }
      },
      handleDialogClose() {
        this.innerDefaultData = {
          gender: 'UNKNOWN',
          phoneNumberList: []
        }
      },
      handleSubmit() {
        this.$refs.form.validate(async(valid) => {
          if (valid) {
            const { customerPersonId, name, gender, customerGroupId, wechatNumber, properties, phoneNumberList } = this.innerDefaultData
            const params = {
              name,
              phoneNumber: phoneNumberList[0],
              alternatePhoneNumbers: phoneNumberList.slice(1),
              gender,
              customerGroupId,
              wechatNumber,
              extraInfo: {}
            }

            if (this.type === 'edit' && this.hasAccess('crm_customerPersonPhoneNumber_desensitization')) {
              delete params.phoneNumber
            }

            for (const key in this.innerDefaultData) {
              if (key.includes('extraInfo')) {
                const tempV = this.innerDefaultData[key]
                params.extraInfo[key.split('extraInfo')[1]] = Array.isArray(tempV) ? tempV : (tempV ? [tempV] : undefined)
              }
            }

            if (this.type === 'add') {
              await addCustomer({
                ...params,
                customerSourceEnum: 'INSERT_FROM_PRIVATE'
              })
              this.$message.success('新建成功')
            } else {
              if (this.initialGroupId && !customerGroupId) {
                // 调用删除客户分组接口
                deleteCustomerGroup({
                  customerPersonId: customerPersonId
                })
              }

              params.customerPersonId = customerPersonId
              for (const key in properties) {
                if (properties.hasOwnProperty(key)) {
                  properties[key] = this.innerDefaultData[key]
                }
              }
              params.properties = properties
              await editCustomer({
                ...params
              })
              this.$message.success('编辑成功')
            }
            this.innerVisible = false
            this.$emit('success')
          }
        })
      },
      handlePropertyChange(key, value) { // 自定义变量改变
        this.innerDefaultData[key] = value
      },
      async loadGroupList(query) { // 加载分组列表
        this.$refs.groupList && this.$refs.groupList.refresh()
      },
      generateRulesAndDefaultData() { // 根据properties动态生成rules和innerDefaultData
        const { customerPersonId, name, phoneNumber, gender, customerGroupId, wechatNumber, properties, extraInfo } = this.defaultData
        const alternatePhoneNumbers = this.defaultData.alternatePhoneNumbers || []
        this.innerDefaultData = {
          customerPersonId,
          name,
          customerGroupId,
          wechatNumber,
          gender: gender || 'UNKNOWN',
          properties,
          phoneNumberList: [phoneNumber, ...alternatePhoneNumbers]
        }

        // 初始化客户自定义字段
        for (const key in (extraInfo || {})) {
          const item = this.customerFieldsList.find(v => v.customerPersonExtraFieldId === +key && v.type !== 'SYSTEM')
          if (!item) continue

          const value = item.fieldType === CHECKBOX ? extraInfo[key] : extraInfo[key][0]
          this.initField(item, value)
        }

        this.initialGroupId = customerGroupId
        if (properties) {
          for (const key in properties) {
            if (properties.hasOwnProperty(key)) {
              this.rules[key] = [{
                required: 'true',
                message: `请输入${key}`
              }]
              this.innerDefaultData[key] = properties[key]
            }
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '~src/styles/placeholder.scss';
.el-radio-group {
  .el-radio {
    @extend %ellipsis;
    // max-width: 100px;
    height: 20px;
    margin-right: 30px;
    & + .el-radio {
      margin-left: 0;
    }
  }
}

.el-checkbox-group {
  line-height: 1;
  .el-checkbox {
    @extend %ellipsis;
    // max-width: 100px;
    height: 20px;
    margin-right: 30px;
    & + .el-checkbox {
      margin-left: 0;
    }
  }
}
</style>

