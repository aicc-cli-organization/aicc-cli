<template>
  <el-select
    v-model="innerValue"
    :placeholder="`选择${customerStr}分组`"
    clearable
    filterable
    remote
    :remote-method="loadGroupList"
    v-bind="$attrs"
    @change="v => handleChange(v)"
    @visible-change="v => handleVisibleChange(v)"
    @remove-tag="v => $emit('remove-tag', v)"
    @blur="$emit('blur', e)"
    @focus="e => $emit('focus', e)"
    @clear="$emit('clear');refresh()"
  >
    <el-option
      v-for="group in groupList"
      :key="group.customerGroupId"
      :value="group.customerGroupId"
      :label="group.name || '--'"
    >
    </el-option>
  </el-select>
</template>

<script>
  import { getCustomerGroupListLimit } from '@/api/customer'
  import { mapGetters } from 'vuex'

  export default {
    props: {
      value: {},
      autoLoad: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        groupList: []
      }
    },
    computed: {
      ...mapGetters(['customerStr']),
      innerValue: {
        get() {
          return this.value
        },
        set(newVal) {
          this.$emit('input', newVal)
        }
      }
    },
    methods: {
      async loadGroupList(name) { // 加载分组列表
        const { data } = await getCustomerGroupListLimit({ name })
        if (data.data) {
          this.groupList = data.data
        }
      },
      handleVisibleChange(v) {
        if (!v) {
          this.refresh()
        }
        this.$emit('visible-change', v)
      },
      handleChange(v) {
        if (!v) {
          this.refresh()
        }
        this.$emit('change', v)
      },
      refresh() {
        this.loadGroupList()
      }
    },
    mounted() {
      this.autoLoad && this.refresh()
    }
  }
</script>


<style scoped>

</style>
