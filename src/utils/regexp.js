// 联系电话码校验
export const phoneNumberregex = /^(([0-9]{3,4}-{0,1})?[0-9-]{7,8}$)|(^1[3456789]\d{9}$)|(^\\d{7,8}$)/

// 数字、字母、下划线
export const usernameExp = /^\w+$/

// 整数
export const integerExp = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/

// 联系电话码校验规则
export const phoneRules = [
  { required: true, message: '请输入电话号码', trigger: 'blur' },
  { validator: (rule, value, callback) => {
    if (!phoneNumberregex.test(value) && value !== '') {
      callback(new Error('请输入正确的电话号码'))
    }
    callback()
  }, trigger: 'blur' }
]
