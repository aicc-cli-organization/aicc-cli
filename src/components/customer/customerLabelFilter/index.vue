<template>
  <div class="customer-label-filter">
    <div class="filter-item">
      <div class="label text-label">{{customerStr}}标签：</div>
      <div class="label-wrap">
        <div v-for="(item) in labelList" :key="item.name" class="label-innerWrap">
          <span class="label-title" :title="item.name">{{item.name.length > 6 ? item.name.substring(0,6)+ '...' : item.name}}</span>
          <div class="label">
            <el-checkbox
            v-for="(item) in item.details"
            v-model="item.choose"
            :label="item.name"
            :key="item.name"
            :title="item.name"
            @change="labelChange"
            >
            {{item.name.length > 6 ? item.name.substring(0,6)+ '...' : item.name}}
            </el-checkbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryCustomerLevelTag } from '@/api/customer'
import { mapGetters } from 'vuex'
export default {
    name: 'customerLabelFilter',
    props: {
        value: {}
    },
    data() {
      return {
        labelList:[]
      }
    },
    computed: {
      ...mapGetters(['customerStr']),
      customerLevelTags: {
        get() {
          return this.value
        },
        set(newValue) {
          this.$emit('input', newValue)  
          this.$emit('change')
        }
      }
    },
    watch: {
        
    },
    methods: {
      labelChange() {
        const list = []
        this.labelList.map(item => {
          item.details.map(item => {
            if(item.choose === true) {
              list.push(item.customerLevelTagDetailId)
            }
          })
        })
        this.customerLevelTags = list
      },
      reset() {
        for (const item of this.labelList) {
          for (const labelItem of item.details) {
            labelItem.choose = false
          }
        }
      },
      async queryCustomerLevelTag(){
        const { data } = (await queryCustomerLevelTag({
          
        })).data
        if(data && data.content){
          this.labelList = data.content.filter(item => item.details.length !== 0)
        }
      }
        
    },
    mounted(){
      this.queryCustomerLevelTag()
    }
}
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';
  @import '../filter.scss';
  .customer-label-filter {
    width: 100%;
    font-size: 12px;
    border-top: $--border-base;
    padding: 8px 0px;
    margin: 0 14px 8px;
    background: #f7f7f7
  }
  .filter-item {
      display: flex;
  }
  .label-wrap {
    flex:1;
    .label-title {
        width:80px;
        display: inline-block;
        margin-right:10px;
        text-align: right;
    }
    .label-innerWrap {
      display: flex;
      margin-bottom: 5px
    }
    .label {
      flex:1;
    }
  }
  /deep/ .el-checkbox__label {
    width: 65px;
    font-size: 12px;
  }
  /deep/ .el-checkbox-group {
      display:inline-block
  }
</style>


