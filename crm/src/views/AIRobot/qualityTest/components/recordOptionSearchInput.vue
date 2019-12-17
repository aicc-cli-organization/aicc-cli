<template>
  <option-search-input
    width="300px"
    optionWidth="115px"
    v-model="innerValue"
    :option-list="optionList"
    @search="$emit('search')"
  ></option-search-input>
</template>

<script>
import { OptionSearchInput } from 'yiwise-components'
import { mapGetters } from 'vuex'

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  components: {
    OptionSearchInput
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    innerValue: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    },
    optionList() {
      return [
        {
          label: `${this.customerStr}电话`,
          searchKey: 'customerPersonPhoneNumber',
          placeholder: `请输入${this.customerStr}电话`
        },
        {
          label: '通话记录ID',
          searchKey: 'callRecordId',
          placeholder: '请输入通话记录ID'
        },
        {
          label: `${this.customerStr}姓名`,
          searchKey: 'customerPersonName',
          placeholder: `请输入${this.customerStr}姓名`
        }
      ]
    }
  }
}
</script>
