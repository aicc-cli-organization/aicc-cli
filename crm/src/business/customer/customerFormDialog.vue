<template>
  <yiwise-dialog
    :title="customTitle"
    :visible.sync="innerVisible"
    @open="handleDialogOpen"
    @close="handleDialogClose"
    @confirm="handleSubmit"
  >
    <el-form
      ref="form"
      label-width="85px"
      :model="innerDefaultData"
      :rules="rules"
    >

      <!-- <el-form-item label="联系电话" prop="phoneNumber" v-if="showField('联系电话')">
        <el-input placeholder="输入联系电话" v-model="innerDefaultData.phoneNumber" :disabled="type === 'edit' && !hasAccess('crm_CustomerPersonPhoneNumber_showAll')"></el-input>
      </el-form-item> -->

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

      <el-form-item label="姓名" prop="name" v-if="showField('姓名')">
        <el-input :placeholder="`输入${customerStr}姓名`" v-model="innerDefaultData.name"></el-input>
      </el-form-item>

      <el-form-item label="性别：" prop="gender" v-if="(type === 'edit' && showField('性别')) || innerDefaultData.properties.hasOwnProperty('性别')">
        <el-radio-group v-model="innerDefaultData.gender" size="small">
          <el-radio label="MALE">男</el-radio>
          <el-radio label="FEMALE">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item :label="`${customerStr}分组`" v-if="showField(`${customerStr}分组`)">
        <group-list-select v-model="innerDefaultData.customerGroupId" :style="{width: '268px'}"></group-list-select>
      </el-form-item>
      <el-form-item v-if="title!='单个导入' && !isLocal && showField('微信')" label="微信">
        <el-input placeholder="输入微信" v-model="innerDefaultData.wechatNumber"></el-input>
      </el-form-item>
      <el-form-item v-for="(value, key) in propertiesNotIncludeSex" :key="key" :label="key" :prop="key">
        <el-input :value="innerDefaultData[key]" @input="(value) => handlePropertyChange(key, value)"></el-input>
      </el-form-item>

      <el-form-item prop="transferPhoneNumber" label="转人工号码" v-if="transferPhoneChooseType === 'ASSIGN'">
        <el-select
          :style="{width: '268px'}"
          @visible-change="onTransferSelectVisibleChange"
          v-model="innerDefaultData.transferPhoneNumber"
          allow-create
          filterable>
           <el-option
            v-for="item in transferPhoneNumberList"
            :key="item.phoneNumber"
            :label="item.name + '-' +item.phoneNumber"
            :value="item.phoneNumber">
          </el-option>
        </el-select>
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
  import MultipleFormItem from '@/components/MultipleFormItem'
  import { genderEnum, varTypeEnum, SYSTEM, DROPDOWN, RADIO, CHECKBOX, ONE_LINE, MULT_ILINE } from '@/utils/enum'
  import { mapGetters } from 'vuex'
  import { phoneNumberregex } from '@/utils/regexp'
  import { addCustomer, editCustomer, addAndImportToRobotCallJob, deleteCustomerGroup } from '@/api/customer'
  import { fetchProperties, listAllBrief } from '@/api/task'

  const defaultGender = null

  export default {
    name: 'CustomerDialog',
    components: {
      YiwiseDialog,
      GroupListSelect,
      MultipleFormItem
    },
    props: {
      title: {
        type: String,
        default: undefined
      },
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
      customerSourceEnum: {
        type: String,
        default: 'INSERT_FROM_PRIVATE'
      },
      robotCallJobId: {
        type: Number,
        default: undefined
      },
      singleImportTip: {
        type: Boolean,
        default: false
      },
      transferPhoneChooseType: {
        type: String,
        default: 'POLLING'
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
      propertiesNotIncludeSex() {
        const rs = {}
        const properties = this.innerDefaultData.properties
        Object.keys(properties).forEach(key => key !== '性别' && (rs[key] = properties[key]))
        return rs
      },
      phoneNumberListDisabled() {
        return this.type === 'edit' && this.hasAccess('crm_customerPersonPhoneNumber_desensitization')
      },
      customTitle() {
        return this.title || (this.type === 'add' ? `新建${this.customerStr}` : `编辑${this.customerStr}`)
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
        nameRequired: false,
        genderEnum,
        varTypeEnum,
        SYSTEM,
        DROPDOWN,
        RADIO,
        CHECKBOX,
        ONE_LINE,
        MULT_ILINE,
        propertiesList: [],
        initialGroupId: undefined,
        innerDefaultData: {
          gender: defaultGender,
          properties: {},
          phoneNumberList: []
        },
        requireNameRules: [{
          required: true, message: '请输入姓名'
        }, {
          min: 0, max: 10, message: '姓名为0-10个字'
        }],
        rules: {
          name: this.requireNameRules
        },
        transferPhoneNumberList: [],
        phoneNumberRule: [{
          required: true, message: '请输入联系电话'
        }, {
          pattern: phoneNumberregex, message: '请输入正确的联系电话'
        }, {
          validator
        }]
      }
    },
    mounted() {
      this.initRules()
      this.loadRobotCallJobProperties()
    },
    methods: {
      fieldDisplay(field) {
        switch (this.page) {
          case 'private': return field.privateDisplay
          case 'public': return field.publicDisplay
          case 'call': return field.callRecordDisplay
          case 'all': return field.allDisplay
          case 'callTask': return field.type === 'SYSTEM'
          default: return false
        }
      },
      showField(fieldName) {
        return this.customerFieldsList.find(item =>
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

        // 如果不是系统字段，并且该字段为必填,或者该页面显示该字段并且该字段可编辑
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
      async onTransferSelectVisibleChange(visible) {
        if (visible) {
          const res = await listAllBrief()
          this.transferPhoneNumberList = res.data.data
        }
      },
      initRules() {
        if (this.title === '单个导入') {
          this.$set(this.rules, 'name', [{
            required: false, message: `请输入${this.customerStr}姓名`
          }, {
            min: 2, max: 10, message: '姓名为2-10个字'
          }])
          if (this.transferPhoneChooseType === 'ASSIGN') {
            this.$set(this.rules, 'transferPhoneNumber', [{
              required: true, message: '请选择转人工号码'
            }])
          }
        }
      },
      async handleDialogOpen() {
        if (this.type === 'edit') {
          this.rules.phoneNumber = []
        } else {
          this.rules.phoneNumber = [{
            required: true, message: '请输入联系电话'
          }, {
            pattern: phoneNumberregex, message: '请输入正确的联系电话'
          }]
        }

        if (this.type === 'edit') {
          this.generateRulesAndDefaultData()
        }
        if (this.robotCallJobId) {
          await this.loadRobotCallJobProperties()
        }
      },
      handleDialogClose() {
        this.innerDefaultData = {
          gender: defaultGender,
          properties: {},
          phoneNumberList: []
        }
        this.$refs.form.resetFields()
      },
      handleSubmit() {
        this.$refs.form.validate(async(valid) => {
          if (valid) {
            const { customerPersonId, name, gender, customerGroupId, wechatNumber, properties, transferPhoneNumber, phoneNumberList } = this.innerDefaultData
            const params = {
              name,
              phoneNumber: phoneNumberList[0],
              alternatePhoneNumbers: phoneNumberList.slice(1),
              gender,
              customerGroupId,
              wechatNumber,
              extraInfo: {}
            }
            const transferPhoneNumberParams = this.transferPhoneChooseType === 'ASSIGN' ? { transferPhoneNumber } : {}

            if (this.type === 'edit' && this.hasAccess('crm_customerPersonPhoneNumber_desensitization')) {
              delete params.phoneNumber
            }

            // 设置客户自定义字段属性
            for (const key in this.innerDefaultData) {
              if (key.includes('extraInfo')) {
                const tempV = this.innerDefaultData[key]
                params.extraInfo[key.split('extraInfo')[1]] = Array.isArray(tempV) ? tempV : (tempV ? [tempV] : undefined)
              }
            }

            try {
              if (this.robotCallJobId) {
                // 直接到入到任务
                await addAndImportToRobotCallJob({
                  ...params,
                  robotCallJobId: this.robotCallJobId,
                  properties: this.innerDefaultData.properties,
                  ...transferPhoneNumberParams
                })
                if (!this.singleImportTip) {
                  this.$message.success('操作成功！详细结果请在导入导出列表查看')
                } else {
                  this.$message.success('操作成功！')
                }
              } else if (this.type === 'add') {
                // 添加
                await addCustomer({
                  ...params,
                  customerSourceEnum: this.customerSourceEnum
                })
                this.$message.success('新建成功')
              } else {
                // 编辑

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
            } catch (error) {
              console.log(error)
            }
          }
        })
      },
      handlePropertyChange(key, value) { // 自定义变量改变]
        this.$set(this.innerDefaultData, key, value)
        this.$set(this.innerDefaultData.properties, key, value)
      },
      async loadRobotCallJobProperties() { // 获取当前任务所有自定义变量
        if (!this.robotCallJobId) {
          return
        }
        try {
          this.loading = true
          const { data } = await fetchProperties(this.robotCallJobId)
          if (data.data) {
            this.propertiesList = data.data
            for (var index in this.propertiesList) {
              if (this.propertiesList[index] === '姓名') {
                this.nameRequired = true
                this.$set(this.rules, 'name', this.requireNameRules)
                continue
              } else if (this.propertiesList[index] === '联系电话' || this.propertiesList[index] === '姓名_总') {
                // 这里刚刚释放出来的 姓名_总
                // 秦越说让我隐藏掉  姓名_总  下次谁让我加我要打人了
                continue
              }
              this.$set(this.innerDefaultData.properties, this.propertiesList[index], undefined)
            }
          }

          if (this.innerDefaultData.properties) {
            for (const key in this.innerDefaultData.properties) {
              if (this.innerDefaultData.properties.hasOwnProperty(key)) {
                let required = true
                if (key === '姓名_总') {
                  required = false
                }
                this.rules[key] = [{
                  required: required,
                  message: `请输入  ${key}`
                }]
                this.$set(this.innerDefaultData, key, this.innerDefaultData.properties[key])
              }
            }
          }

          if (this.innerDefaultData.properties.hasOwnProperty('性别')) {
            if (this.rules.gender) {
              !this.rules.gender.length && this.rules.gender.push({
                required: true, message: `请选择性别`
              })
            } else {
              this.$set(this.rules, 'gender', [{
                required: true, message: `请选择性别`
              }])
            }
          }
          this.$nextTick(() => {
            this.$refs.form.clearValidate()
          })

          this.loading = false
        } catch (error) {
          this.loading = false
        }
      },
      async generateRulesAndDefaultData() { // 根据properties动态生成rules和innerDefaultData
        const { customerPersonId, name, phoneNumber, gender, customerGroupId, wechatNumber, properties, extraInfo, alternatePhoneNumbers } = this.defaultData
        this.innerDefaultData = {
          customerPersonId,
          name,
          customerGroupId,
          wechatNumber,
          gender: gender || defaultGender,
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
@import 'src/styles/placeholder.scss';
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
