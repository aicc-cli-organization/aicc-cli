<!-- 修改配置 -->
<template>
<el-dialog
    v-bind="$attrs"
    width="600px"
    title="修改配置"
    :visible.sync="innerVisible"
    :close-on-click-modal="false"
    @open="handleDialogOpen"
    @close="handleDialogClose"
  >
    <el-form
      :model="form"
      ref="form"
      label-width="130px"
      :rules="formRules">

      <el-form-item label="SIP账号：">
        <span>{{form.sipAccount}}</span>
      </el-form-item>
      <el-form-item class="half-width"
       label="默认外呼前缀" prop="defaultCallPrefix">
        <el-input v-model="form.defaultCallPrefix"></el-input>
      </el-form-item>
      <el-form-item class="half-width"
       label="外地外呼前缀" prop="otherCallPrefix">
        <el-input v-model="form.otherCallPrefix" @change="changeOtherCallPrefix"></el-input>
      </el-form-item>
      <el-form-item class="half-width"
        label="电话号码" prop="phoneNumber">
        <el-input v-model="form.phoneNumber"></el-input>
      </el-form-item>
      <el-form-item class="half-width"
        label="号码名称" prop="phoneName">
        <el-input v-model="form.phoneName"></el-input>
      </el-form-item>
      <el-form-item class="half-width" key="province"
        label="省份" v-if="form.otherCallPrefix" prop="province">
        <el-select filterable v-model="form.province" @change="requestCityList" placeholder="请选择">
          <el-option
            v-for="item in provinceOptions"
            :key="item"
            :value="item"
            :label="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="half-width" key="city"
        label="市" v-if="form.otherCallPrefix" prop="city">
        <el-select filterable v-model="form.city" placeholder="请选择">
          <el-option
            v-for="item in cityOptions"
            :key="item"
            :value="item"
            :label="item"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="本地话费："
        prop="localBillRate">
        <el-input-number v-model="form.localBillRate"
          :precision="1" :step="0.1" auto-complete="off">
        </el-input-number>
        <span class="ml5">分/分钟</span>
      </el-form-item>
      <el-form-item label="外地话费："
        prop="otherBillRate">
        <el-input-number v-model="form.otherBillRate"
          :precision="1" :step="0.1" auto-complete="off">
        </el-input-number>
        <span class="ml5">分/分钟</span>
      </el-form-item>
      <el-form-item label="备注" prop="remark" style="width: 530px;">
        <el-input type="textarea" v-model="form.remark"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" v-if="hasFooter">
      <el-button @click="cancelBtn()">取 消</el-button>
      <el-button type="primary" @click="confirmBtn()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import * as phoneCardAPI from '@/api/phoneCard'
import * as constant from '@/utils/constant'

export default {
  name: 'index',
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(newValue) {
        this.$emit('update:visible', newValue)
      }
    },
    constant() {
      return constant
    }
  },
  data() {
    return {
      form: {
      },
      freeswitchInfoOptions: [],
      formRules: {
        phoneNumber: [{
          required: true, message: '请输入联系电话'
        }],
        freeswitchGroupId: [{ required: true, message: '请选择freeswitch服务器分组', trigger: 'change' }],
        deviceId: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
        accountNum: [{ required: true, message: '请输入端口个数', trigger: 'blur' }],
        defaultCallPrefix: [{ required: true, message: '默认外呼前缀', trigger: 'change' }],
        province: [{ required: true, message: '请选择省份', trigger: 'change' }],
        city: [{ required: true, message: '请选择市', trigger: 'change' }]
      },
      cityOptions: [],
      provinceOptions: []
    }
  },
  props: {
    row: {
      type: Object,
      default() {
        return {}
      }
    },
    visible: {
      type: Boolean,
      default: false
    },
    hasFooter: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    getProvinceList() {
      phoneCardAPI.getProvinceList().then(({ data }) => {
        this.provinceOptions = data.data
      })
    },
    changeOtherCallPrefix() {
      this.form.province = undefined
      this.form.city = undefined
    },
    requestCityList(val) {
      this.form.city = undefined
      phoneCardAPI.getCityList({
        province: val
      }).then(({ data }) => {
        this.cityOptions = data.data
      })
    },
    confirmBtn() {
      this.changeConfig()
    },
    cancelBtn() {
      this.$emit('update:visible', false)
    },
    handleDialogOpen() {
      this.getProvinceList()
      this.$emit('open')
      this.form = {
        ...this.row,
        localBillRate: this.row.bindLocalBillRate,
        otherBillRate: this.row.bindOtherBillRate
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    handleDialogClose() {
      this.$refs.form.resetFields()
      this.$emit('close')
    },
    changeConfig() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          phoneCardAPI.updateConfig({
            ...this.form,
            province: this.form.otherCallPrefix === '' ? '' : this.form.province,
            city: this.form.otherCallPrefix === '' ? '' : this.form.city
          }).then(({ data }) => {
            this.formVisible = false
            if (data.code === 200) {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.$emit('success')
            }
            this.$emit('update:visible', false)
            this.$emit('confirm')
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__body {
  padding: 0 20px 40px 0px!important;
  height: 450px;
}
.half-width {
  width: 260px;
  display: inline-block;
}
</style>
