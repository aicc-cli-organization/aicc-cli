<template>
  <div class="multiple-filter">
    <div class="filter-item">
      <div class="label text-label">最近{{customerStr}}意向：</div>
      <el-select
        v-model="_intentLevelTagId"
        size="mini"
        :disabled="intentLevelDisabled"
        class="intent-level-tag">
        <el-option
          v-for="item in intentLevelTagOptions"
          :key="item.intentLevelTagId"
          :value="item.intentLevelTagId"
          :label="item.name"
        ></el-option>
      </el-select>
      <el-checkbox
        :indeterminate="isIndeterminate"
        v-model="checkAll"
        @change="handleCheckAllChange">全部</el-checkbox>
      <el-checkbox-group v-model="_intentLevelCodes">
        <el-checkbox
          v-for="item in intentLevelTagDetailOptions"
          :label="item.code"
          :title="item.name"
          :key="item.name">
          {{item.name}}
        </el-checkbox>
      </el-checkbox-group>
      
    </div>
  </div>
</template>

<script>
  import { getSimpleIntentLevelTagList, getIntentLevelTag } from '@/api/intentLevel'
  import { mapGetters } from 'vuex'

  export default {
    name: 'intentLevelFilter',
    props: {
      intentLevelDisabled: {
        type: Boolean,
        default: false
      },
      intentLevelCodes: {
        type: Array,
        default() {
          return []
        }
      },
      intentLevelTagId: {
        type: Number,
        default: undefined
      }
    },
    computed: {
      ...mapGetters(['customerStr']),
      _intentLevelTagId: {
        get: function() {
          return this.intentLevelTagId
        },
        set: function(newValue) {
          this.$emit('update:intentLevelTagId', newValue)
        }
      },
      _intentLevelCodes: {
        get: function() {
          return this.intentLevelCodes
        },
        set: function(newValue) {
          this.$emit('update:intentLevelCodes', newValue)
          this.$emit('changeIntentLevelCodes', newValue)
        }
      },
      isIndeterminate() {
        const checkedCount = (this._intentLevelCodes || []).length
        return checkedCount > 0 && checkedCount < this.intentLevelTagDetailOptions.length
      }
    },
    data() {
      return {
        checkAll: false,
        intentLevelTagOptions: [],
        intentLevelTagDetailOptions: []
      }
    },
    watch: {
      async _intentLevelTagId(newValue) {
        await this.getIntentLevelTag()
        this._intentLevelCodes = []
        this.checkAll = false
      },
      _intentLevelCodes(newValue) {
        const checkedCount = (newValue || []).length
        this.checkAll = checkedCount === this.intentLevelTagDetailOptions.length
      }
    },
    methods: {
      async getSimpleIntentLevelTagList() {
        // 获取标签分组 列表
        const { data } = await getSimpleIntentLevelTagList()
        this.intentLevelTagOptions = data.data
        this._intentLevelTagId = this.defaultIntentLevelTagId()
      },
      defaultIntentLevelTagId() {
        if (!this.intentLevelTagOptions || !this.intentLevelTagOptions.length) {
          return undefined
        }

        let temp = this.intentLevelTagOptions.find(item => item.defaultStatus === true)
        return (temp || this.intentLevelTagOptions[0]).intentLevelTagId
      },
      async getIntentLevelTag() {
        // 获取一个组的 标签列表
        if (this._intentLevelTagId !== undefined) {
          const { data } = await getIntentLevelTag({
            intentLevelTagId: this._intentLevelTagId
          })

          this.intentLevelTagDetailOptions = data.data.details
        }
      },
      handleCheckAllChange(val) {
        this._intentLevelCodes = val ? this.intentLevelTagDetailOptions.map(item => item.code) : []
      }
    },
    mounted() {
      this.getSimpleIntentLevelTagList()
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '../filter.scss';
  .multiple-filter {
    padding: 8px 0px;
    margin: 0 14px 8px;
    background: #f7f7f7
  }
</style>


