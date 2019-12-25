<template>
  <yiwise-dialog
    class="dialog"
    :title="title"
    :visible.sync="innerVisible"
    @confirm="onSubmitRule"
    @close="onClose"
    width="770px"
  >
    <el-form
      ref="form"
      label-width="90px"
      :model="formFields"
      :rules="formRules"
    >
      <el-form-item label="规则id" v-if="editRuleId">
        <span>{{editRuleId}}</span>
      </el-form-item>
      <el-form-item label="规则名" prop="ruleName">
        <el-input placeholder="请输入规则名" v-model="formFields.ruleName"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="ruleDescription">
        <el-input type="textarea" resize="none" placeholder="请输入描述" v-model="formFields.ruleDescription"></el-input>
      </el-form-item>
      <el-form-item label="规则类型" prop="ruleType">
        <el-select placeholder="请选择规则类型" v-model="formFields.ruleType">
          <el-option v-for="(value, key) in RULE_TYPE" :key="key" :label="value" :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="加/减分要求" prop="ruleWeight">
        <el-radio-group v-model="formFields.ruleWeight">
          <el-radio :key="1" :label="1">加分项</el-radio>
          <el-radio :key="-1" :label="-1">减分项</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="规则属性" prop="ruleProperty">
        <el-radio-group v-model="formFields.ruleProperty">
          <el-radio v-for="(value, key) in RULE_PROPERTY" :key="key" :label="key">{{value}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="关键词" prop="keyWordList" v-if="formFields.ruleProperty === 'KEY_WORDS'">
        <keyword-input v-model="formFields.keyWordList"></keyword-input>
      </el-form-item>
      <template v-else>
        <!-- <el-form-item label="设置条件（可多选，需同时满足）" class="nowrap-formitem">
        </el-form-item> -->
        <el-form-item prop="itemList" label="设置条件">
          <setting-condition v-model="formFields.itemList"></setting-condition>
        </el-form-item>
      </template> 
    </el-form>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import KeywordInput from '../components/keywordInput'
import SettingCondition, { conditionTypeMap, unitMap } from '../components/settingCondition'
import { RULE_TYPE, RULE_WEIGHT, RULE_PROPERTY } from '../utils/enum'
import * as qcAPI from '@/api/qualityTest'

const validateItemList = (rule, value, callback) => {
  const formatItemList = value.filter(item => item.key && item.min && item.max)
  if (formatItemList.length === 0 || value.length > formatItemList.length) {
    callback(new Error('请输入完整的设置条件'))
    return
  }
  let message = undefined
  for (let item of formatItemList) {
    const { key, min, max } = item
    if (!(+min >= 0 && +max >= 0)) {
      message = '请输入大于或等于0的数值'
      break
    }
    if (['speed', 'serviceIntercept', 'serviceResponse'].includes(key) && 
    !(Number.isInteger(+min) && Number.isInteger(+max))) {
      message = '秒数或者字/分钟数必须为整数'
      break
    }
    if (key === 'speed' && (+min > 1000000 || +max > 1000000)) {
      message = '语速不超过1000000'
      break
    }
    if (key === 'muteRate' && (+min > 100 || +max > 100)) {
      message = '静音比不超过100'
      break
    }
    if (key === 'muteDuration' && (+min > 5000 || +max > 5000)) {
      message = '静音总时长不超过5000'
      break
    }
    if (key === 'serviceIntercept' && (+min > 5000 || +max > 5000)) {
      message = '服务抢断时长不超过5000'
      break
    }
    if (key === 'serviceResponse' && (+min > 5000 || +max > 5000)) {
      message = '服务响应时长不超过5000'
    }
    if (+min > +max) {
      message = '请正确设置区间'
      break
    }
  }
  if (message) {
    return callback(message)
  }
  return callback()
}

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    editRuleId: [String, Number]
  },
  components: {
    YiwiseDialog,
    KeywordInput,
    SettingCondition
  },
  data() {
    return {
      RULE_TYPE,
      RULE_WEIGHT,
      RULE_PROPERTY,
      formFields: {
        ruleName: undefined,
        ruleDescription: undefined,
        ruleWeight: 1,
        ruleType: undefined,
        ruleProperty: 'KEY_WORDS',
        keyWordList: [],
        itemList: [{}]
      },
      formRules: {
        ruleName: [
          { required: true, trigger: 'blur', message: '请输入规则名' },
          { min: 1, max: 20, message: '请输入1到20个字符' }
        ],
        ruleDescription: [
          { min: 1, max: 200, message: '请输入1到200个字符' }
        ],
        ruleType: [
          { required: true, trigger: 'blur', message: '请选择规则类型' }
        ],
        ruleWeight: [
          { required: true, trigger: 'change' }
        ],
        ruleProperty: [
          { required: true, trigger: 'change' }
        ],
        keyWordList: [
          { required: true, type: 'array', trigger: 'blur', message: '请输入关键词' }
        ],
        itemList: [
          { validator: validateItemList, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onSubmitRule() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        const itemMap = {}
        this.formFields.itemList && this.formFields.itemList.forEach(item => {
          const itemKey = item.key
          itemMap[itemKey] = {
            ...item,
            name: conditionTypeMap[itemKey],
            unit: unitMap[itemKey]
          }
        })
        delete this.formFields.itemList
        const formFields = {
          ...this.formFields,
          itemMap,
          ...this.formFields.ruleProperty === 'KEY_WORDS'
            ? { itemMap: {}}
            : { keyWordList: [] }
        }
        await qcAPI.addOrUpdateQualityTestRule(formFields)
        let message = '添加成功'
        if (this.editRuleId) {
          message = '更新成功'
          this.$emit('editSuccess')
        } else {
          this.$emit('addSuccess')
        }
        this.$message({
          message,
          type: 'success'
        })
        this.onClose()
      })
    },
    onClose() {
      this.formFields = {
        ruleName: undefined,
        ruleDescription: undefined,
        ruleWeight: 1,
        ruleType: undefined,
        ruleProperty: 'KEY_WORDS',
        keyWordList: [],
        itemList: [{}]
      }
      this.$refs.form.clearValidate()
      this.$emit('update:editRuleId', undefined)
      this.innerVisible = false
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newVal) {
        this.$emit('update:visible', newVal)
      }
    },
    title() {
      return this.editRuleId ? '编辑质检规则（编辑后会在质检任务中立即生效）' : '添加质检规则'
    }
  },
  watch: {
    innerVisible: {
      handler: async function(newVal) {
        if (newVal && this.editRuleId) {
          const res = await qcAPI.getQCRuleDetail({
            qcRuleId: this.editRuleId
          })
          const { itemMap, keyWordList } = res.data.data
          this.formFields = {
            ...res.data.data,
            itemList: itemMap ? Object.values(itemMap) : [{}],
            keyWordList: keyWordList || []
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  /deep/ .el-dialog__body {
    padding: 0 100px !important;
    .nowrap-formitem {
      margin-bottom: 0;
      .el-form-item__label {
        white-space: nowrap;
        &::before {
          content: '*';
          color: #f56c6c;
          margin-right: 4px;
        }
      }
    }
  }
}
</style>
