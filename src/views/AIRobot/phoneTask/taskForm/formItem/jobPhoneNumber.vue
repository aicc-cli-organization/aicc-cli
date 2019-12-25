<template>
  <el-form-item :label="jobPhoneNumberSelect.label" prop="jobPhoneNumberIdList" class="inline-block">
    <el-select
      v-model="innerValue"
      collapse-tags
      multiple
      :multiple-limit="jobPhoneNumberSelect.multipleLimit"
      :placeholder="jobPhoneNumberSelect.placeholder"
      @visible-change="loadTenantPhoneNumberList"
      :disabled="jumpToHumanServiceExist && jobPhoneNumberSelect.label === '手机坐席'"
    >
      <el-option v-for="(item, index) in jobPhoneNumberSelect.options"
        :key="index"
        :label="item.label"
        :value="item.tenantPhoneNumberId"
        :disabled="!!item.disabled"
      ></el-option>
    </el-select>
    <span v-if="jobPhoneNumberSelect.label === '手机坐席'">剩余AI数量{{AICount.free}}个，AI总量{{AICount.total}}个</span>
  </el-form-item>
</template>

<script>
import * as taskAPI from '@/api/task'
import * as numberpoolAPI from '@/api/numberpool'
import FormItemCommon from '../mixins/formItemCommon'

export default {
  mixins: [FormItemCommon],
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    },
    phoneType: String,
    jumpToHumanServiceExist: Boolean,
    AICount: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      outCallFullInfo: {
        MOBILE: undefined,
        LANDLINE: undefined,
        unFixedCallOptions: undefined
      }
    }
  },
  computed: {
    jobPhoneNumberSelect() {
      const jobPhoneNumberSelectConfig = {
        MOBILE: {
          label: '手机坐席',
          options: [],
          multipleLimit: 100,
          placeholder: '请选择手机坐席'
        },
        LANDLINE: {
          label: '固话坐席',
          options: [],
          multipleLimit: 1,
          placeholder: '请选择固话坐席'
        },
        UNFIXED_CALL: {
          label: '无主叫坐席',
          options: [],
          multipleLimit: 1,
          placeholder: '请选择无主叫坐席'
        }
      }
      for(let key in jobPhoneNumberSelectConfig) {
        if (key === 'MOBILE') {
          jobPhoneNumberSelectConfig[key].multipleLimit = this.total
        }
        jobPhoneNumberSelectConfig[key].options = this.outCallFullInfo[key]
      }
      return jobPhoneNumberSelectConfig[this.phoneType]
    }
  },
  methods: {
    async loadTenantPhoneNumberList(visible) {
      if (!visible) return
      const res = await numberpoolAPI.getActiveTenantPhoneNumberList()
      const { MOBILE, LANDLINE, UNFIXED_CALL } = res.data.data
      const formatMOBILE = MOBILE.map((item) => {
        const backfix = item.concurrency == 0 ? '(空闲)' : '(使用中)'
        item.label = `${item.phoneName ? item.phoneName + '-' : ''}${item.phoneNumber}${backfix}`
        return item
      })
      this.outCallFullInfo = {
        MOBILE: formatMOBILE,
        LANDLINE: LANDLINE.map((item) => {
          item.label = item.phoneName || item.phoneNumber
          if (item.overdue) {
            item.label += '(欠费)'
            item.disabled = true
          }
          return item
        }),
        UNFIXED_CALL: UNFIXED_CALL.map((item) => {
          item.label = item.phoneName || item.phoneNumber
          if (item.overdue) {
            item.label += '(欠费)'
            item.disabled = true
          }
          return item
        })
      }
    },
    initData() {
      this.loadTenantPhoneNumberList(true)
    }
  }
}
</script>
