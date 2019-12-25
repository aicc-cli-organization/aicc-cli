<template>
  <yiwise-dialog
    :visible.sync="innerVisible"
    title="批量导入"
    :hasFooter="false"
    @open="dialogOpen"
  >
    <div>
     <div class="radio-title">请选择加入白名单原因：</div>
     <el-radio-group v-model="type">
        <el-radio v-for="(value, key) in addTypeEnum" :key="key" :label="key">{{value}}</el-radio>
      </el-radio-group>
    </div>
    <div class="textarea-wrap" @click="$refs.input.focus()">
      <el-tag
        v-for="(item, index) in phoneList"
        :key="index"
        closable
        @close="onRemovePhone(item)"
      >{{item}}</el-tag>
      <el-input
        ref="input"
        class="phone-input"
        placeholder="可从Excel或TXT文本复制，多个号码以空格分开，敲回车确认"
        v-model="tmpValue"
        :rows="4"
        @keyup.enter.native="onEnter">
      </el-input>
      <div class="placeholder">单次导入数量限制为5000个号码</div>
    </div>
    <div slot="footer">
      <el-button @click="cancelBtn()">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="loading" :disabled="phoneList.length == 0">
        确定
      </el-button>
    </div>
  </yiwise-dialog>
</template>

<script>
import { YiwiseDialog } from 'yiwise-components'
import * as customerAPI from '@/api/customer' 
import { mapGetters } from 'vuex'
import { addTypeEnum } from '@/utils/enum'
import { phoneNumberregex } from '@/utils/regexp'
export default {
  props: {
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
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tmpValue: '',
      phoneList: [],
      addTypeEnum,
      type: Object.keys(addTypeEnum)[0]
    }
  },
  components: {
    YiwiseDialog
  },
  computed: {
    ...mapGetters([
      'appType'
    ]),
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    }
  },
  methods: {
    dialogOpen(){
      this.type = Object.keys(this.addTypeEnum)[0]
      this.tmpValue = ''
      this.phoneList = []
    },
    onEnter(event) {
      const phoneNumber = event.target.value.split(" ")
      const phoneNumberList = []

      for (const item of phoneNumber){
        if(item == ''){
          continue
        }
        if (!phoneNumberregex.test(item) || item.includes('-')) {
          // this.$message.error('请输入正确的号码格式')
          continue
        } else {
          phoneNumberList.push(item)
        }
      }

      const newPhoneNumberList = [...this.phoneList,...phoneNumberList]
      this.phoneList = Array.from(new Set(newPhoneNumberList))
      this.tmpValue = ''
      return false
    
    },
    onRemovePhone(phone) {
      const phoneIndex = this.phoneList.indexOf(phone)
      const copyList = this.phoneList.slice()
      copyList.splice(phoneIndex, 1)
      this.phoneList = copyList
    },
    async onSubmit() {
      if (this.phoneList.length > 5000) {
        this.$message.error('单次导入数量限制为5000个号码')
        return
      }

      this.loading = true
      try {
          const res = await customerAPI.batchimportToWhiteList({
            customerPhoneList:[...this.phoneList],
            addType : this.type}
          )
          const successMessage = res.data.data || '导入成功'
          
          this.innerVisible = false
          this.phoneList = []
          this.tmpValue = ''

          //去重及号码校验后，成功导入有效手机号x个
          this.$message({
            message: successMessage,
            type: 'success'
          })
          this.$emit('refresh')
      } catch (error) {
        
      }
      this.loading = false
     
    },
    cancelBtn() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.radio-title {
  font-size: 14px;
  margin-bottom: 10px
}
.textarea-wrap {
  position: relative;
  height: 200px;
  border: 1px solid rgb(220, 223, 230);
  border-radius: 3px;
  margin: 10px 0px 20px;
  overflow-y: auto;
  .phone-input {
    display: inline-block;
    /deep/ .el-input__inner {
      border: 0;
    }
  }
}
/deep/ .el-dialog__body {
  padding: 0 18%!important;
}
.placeholder {
  color: #d3d4de;
  font-size: 13px;
  padding-left: 15px;
  font-family: sans-serif;
}
</style>
