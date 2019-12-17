<template>
  <div class="form-item">
    <span class="label text-label">跟进状态： </span>
    <el-select v-model="checkList" :placeholder="`请选择${customerStr}跟进状态(多选)`" :style="{width: '409px', marginLeft: '5px'}" multiple  :collapse-tags="checkList.length>3" :clearable="true" @change="loadData({ pageNum: 1 })">
      <el-option v-for="(value, key) in followStatusENUM" :key="key" :value="key" :label="value"></el-option>
    </el-select> 
  </div>
</template>

<script>
  import { followStatusENUM } from '@/utils/constant'
  import { mapGetters } from 'vuex'

  export default {
    name: 'followStatusFilter',
    props: {
      value: []
    },
    data() {
      return {
        followStatusENUM
      }
    },
    computed: {
      ...mapGetters(['customerStr']),
      checkList: {
        get: function() {
          return this.value
        },
        set: function(val) {
          this.$emit('input', val)
          this.$emit('change', val)
        }
      }
    },
    watch: {
     
    },
    methods: {
     
    }
  }
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import '../filter.scss'
</style>


