<template>
  <div class="select-form">
    <el-form
      ref="form"
      :model="disInfo"
      :rules="disRules"
    > 
      <el-form-item
        prop="province"
      >
        <el-select 
          v-model="disInfo.province" 
          :disabled="disabled"
          placeholder="省"
          style="width:105px"
          @change="provinceChange"
        >
          <el-option
            v-for="item in provinceOptions"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        prop="city"
      >
        <el-select 
          v-model="disInfo.city" 
          :disabled="disabled"
          placeholder="市"
          style="width:105px"
          @change="cityChange"
        >
          <el-option
            v-for="item in cityOptions"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        prop="district"
      >
        <el-select 
          v-model="disInfo.district" 
          :disabled="disabled"
          placeholder="区"
          style="width:115px"
          @change="districtChange"
        >
          <el-option
            v-for="item in districtOptions"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { province } from './province'
export default {
  props: {
   filters: {
     type: Object,
     default () {
       return {}
     }
   },
   value: {
    type: Array,
      default() {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      disRules: {
        'province': [
          { required: true, message: '请选择省份', trigger: 'blur' }
        ],
        'city': [
          { required: true, message: '请选择城市', trigger: 'blur' }
        ],
        'district': [
          { required: true, message: '请选择行政区', trigger: 'blur' }
        ]
      },
      provinceIndex: null,
      cityOptions: [],
      districtOptions: []
    }
  },
  computed: {
    disInfo: {
      get () {
        return  this.value 
      },
    },
    provinceOptions() {
      const list = []
      for(const item of province) {
        list.push(item.name)
      }
      return list
    }
  },
  watch: {
    disInfo: {
      handler(val){
        const provinceVal = val.province
        const cityVal = val.city
        this.cityOptions = []
        this.districtOptions = []
        if(provinceVal) {
          const prov = province.filter(item => item.name === provinceVal)
          this.provinceIndex = province.findIndex(item => item.name === provinceVal)
          if(prov.length) {
            const list = []
            const city = prov && prov[0].city
            for(const item of city) {
              list.push(item.name)
            }
            this.cityOptions = list
          }
        }

        if(cityVal) {
          const city = province[this.provinceIndex].city.filter(item => item.name === cityVal)
          if(city.length){
            const list = []
            const district = city && city[0].districtAndCounty
            for(const item of district) {
              list.push(item)
            }
            this.districtOptions = list
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    provinceChange(val) {
      const disInfo = {
        ...this.disInfo,
        city: '',
        district: ''
      }
      this.$emit('input',disInfo)
      this.$emit('change',disInfo)
    },
    cityChange(val) {
      const disInfo = {
        ...this.disInfo,
        district: ''
      }
      this.$emit('input',disInfo)
      this.$emit('change',disInfo)
    },
    districtChange(val) {
      this.$emit('change',disInfo)
    },
    validate() {
      let v = true
      this.$refs.form.validate(valid => {
        if(!valid) {
          v = false
        }
      })
      return v
    },
    clearValidate() {
      this.$refs.form.clearValidate()
    }
  },
  mounted() {
    
  }
}
</script>
<style lang="scss" scoped>
.select-form /deep/ .el-form-item {
    display: inline-block;
    margin-bottom: 0
  }
</style>
