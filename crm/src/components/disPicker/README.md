#  省/市/区三级选择

# 参数
参数       说明           类型      可选值      默认值
disabled   选项的禁用     boolean    --         false

# 事件
事件名称    说明               回调参数
change     条件变化触发       省/市/区选择值(中文)

# 方法
方法名     说明                                  参数
validate   对省/市/区下拉框校验,返回true/false     -- 

demo:
<disPicker 
  ref="disPicker"
  v-model="disInfo"
  :disabled="disabled"
  @change="distChange"
/>
<script>
  export default {
    data() {
      return {
        disInfo: {
          province: '',
          city: '',
          district: ''
        }
      }
    },
    methods: {
      distChange(disInfo) {
        
      }
    }
</script>