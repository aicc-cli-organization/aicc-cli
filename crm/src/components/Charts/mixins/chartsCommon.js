const _toString = Object.prototype.toString
const getType = obj => _toString.call(obj).slice(8, -1)

export const commonOptions = {
  textStyle: {
    fontFamily: '"PingFangSC-Regular", "SF Pro SC","SF Pro Display","SF Pro Icons","PingFang SC","Helvetica Neue","Helvetica","Arial",sans-serif'
  }
}

export const extendOptions = (options, source) => {
  source = source || {}

  for (const key in source) {
    const cOption = source[key]
    const cOptionType = getType(cOption)

    if (getType(options[key]) !== cOptionType || cOptionType !== 'Object') {
      options[key] = cOption
    } else {
      extendOptions(options[key], cOption)
    }
  }

  return options
}

/*
* 用于给echarts继承公共属性的
*/
export const extendCommonOptions = options => extendOptions(options, commonOptions)
