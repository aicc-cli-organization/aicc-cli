<template>
  <div>
    <el-popover
      trigger="manual"
      v-model="multiDelPopConfirmVisible"
      :width="'620px'"
      @show="show"
    >
      <div v-if="selecting">
        <div class="radio-title">请选择加入白名单原因：</div>
        <el-radio-group v-model="type">
            <el-radio v-for="(value, key) in addTypeEnum" :key="key" :label="key">{{value}}</el-radio>
        </el-radio-group>
      </div>
      <div v-else>{{label}}</div>
      <div class="button-wrap">
        <el-button size="mini" type="text" @click="multiDelPopConfirmVisible = false">取消</el-button>
        <el-button type="primary" size="mini" @click="handleSubmit">确定</el-button>
      </div>
      <el-button type="primary" class="right-item" @click="handleAddWhiteList" slot="reference">批量加入白名单</el-button>
    </el-popover>
  </div>
</template>

<script>
import { YiwisePopConfirm } from 'yiwise-components'
import { addToWhiteList, batchAddAndExport } from '@/api/customer'
import { addTypeEnum } from '@/utils/enum'
import { mapGetters } from 'vuex'
export default {
  components: { YiwisePopConfirm },
  props: {
    multipleSelection: {
      type: Array,
      default: () => []
    },
    onSubmit: {
      type: Function,
      default: async () => {}
    },
    allChecked: {
      type: Boolean,
      default: false
    },
    searchContition: Object,
    customerPersonListType: String
  },
  data() {
    return {
      selecting:true,
      multiDelPopConfirmVisible: false,
      addTypeEnum,
      type: Object.keys(addTypeEnum)[0]
    }
  },
  computed:{
    ...mapGetters(['customerStr']),
    label:function(){
        if (this.allChecked) {
          return `已选全部${this.customerStr}，确认加入白名单？`
        } else {
          return `已选${this.customerStr}${this.multipleSelection.length}人，确认加入白名单？`
        }
    }
  },
  methods: {
    show(){
      this.selecting = true
      this.type = Object.keys(this.addTypeEnum)[0]
    },
    handleAddWhiteList() {
      if (!this.multipleSelection || !this.multipleSelection.length) {
        this.$message.error(`请先选择${this.customerStr}`)
      } else {
        this.multiDelPopConfirmVisible = true
      }
    },
    async handleSubmit() {
      if(this.selecting == true){
        this.selecting = !this.selecting
        return
      }

      if(this.allChecked) { //选择了全选
        await batchAddAndExport({
          addType : this.type,
          customerPersonListType: this.customerPersonListType,
          ...this.searchContition
        })
        this.$message.success('加入成功，请在导入导出列表查看结果。')
        this.multiDelPopConfirmVisible = false
        this.$emit('refresh')
        return
      }


      const customerPersonIdList = []
      this.multipleSelection.map( item => { if(!item.inWhiteList) customerPersonIdList.push(item.customerPersonId)} )
      if(customerPersonIdList.length == 0){
        this.$message.success('加入成功')
        this.multiDelPopConfirmVisible = false
        this.$emit('refresh')

      }else{
        try {
          await addToWhiteList({
            customerPersonIdList,
            addType : this.type
          })
          this.$message.success('加入成功')
          this.multiDelPopConfirmVisible = false
          this.$emit('refresh')
        } catch (error) {
          return
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.radio-title {
  font-size: 14px;
  margin-bottom: 10px
} 
.button-wrap {
  text-align: right; 
  margin-top:10px;
}
</style>

