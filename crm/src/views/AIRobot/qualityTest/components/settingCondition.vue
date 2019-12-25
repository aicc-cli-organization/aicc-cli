<template>
  <div class="setting-condition">
    <div 
      class="condition-item"
      v-for="(item, index) in innerValue"
      :key="index"
    >
      <el-select
        class="type-select"
        v-model="item['key']"
      >
        <el-option
          v-for="(conditionValue, key) in conditionTypeMap"
          :key="key"
          :label="conditionValue"
          :value="key"
          :disabled="selectedTypeList.includes(key)"
        ></el-option>
      </el-select>
      <span>介于</span>
      <el-input class="min-input" placeholder="最小值" v-model="item['min']"></el-input>
      <span>{{item.key ? unitMap[item.key] : ''}}至</span>
      <el-input class="max-input" placeholder="最大值" v-model="item['max']"></el-input>
      <span>{{item.key ? unitMap[item.key] : ''}}</span>
      <el-tooltip effect="dark" placement="top-end" v-if="tipMap[item.key]">
        <div slot="content">{{tipMap[item.key]}}</div>
        <i class="el-icon-question"></i>
      </el-tooltip>
      <!-- <a class="operation-icon iconfont icon-tianjiajiahaowubiankuang" v-if="index === 0" @click="onCloneItem"></a>
      <a class="operation-icon iconfont icon-changyonggoupiaorenshanchu" v-else @click="onDelItem(index)"></a> -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export const conditionTypeMap = {
  speed: '语速',
  muteRate: '静音比',
  muteDuration: '静音总时长',
  serviceIntercept: '服务抢断时长',
  serviceResponse: '服务响应时长'
}
export const unitMap = {
  speed: '字/分钟',
  muteRate: '%',
  muteDuration: '秒',
  serviceIntercept: '秒',
  serviceResponse: '秒'
}
const maxConditions = Object.values(conditionTypeMap).length

export default {
  props: {
    value: {
      type: Array,
      default() {
        return [{}]
      }
    }
  },
  data() {
    return {
      conditionTypeMap,
      unitMap
    }
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    innerValue: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    },
    selectedTypeList() {
      const tmpList = []
      this.innerValue.forEach(item => {
        tmpList.push(item.key)
      })
      return tmpList
    },
    tipMap() {
      return {
        speed: '检测坐席说话语速，用以评判对客服务体验。一句话少于5个字则不计算语速。',
        muteRate: `${this.customerStr}等待坐席回答的时间占整个通话时长的比例，用以评判坐席对业务的熟练程度`,
        muteDuration: `整个通话过程中，${this.customerStr}等待坐席回答的时间总长，用以评判坐席对业务的熟练程度`,
        serviceIntercept: `判断坐席与${this.customerStr}说话的重叠范围。原则上坐席不能抢断${this.customerStr}，${this.customerStr}抢断坐席时，坐席需要立马停下来倾听${this.customerStr}需求。`,
        serviceResponse: `判断坐席回答${this.customerStr}提问的时间间隔。原则上坐席响应时间越短，对客体验越好。`
      }
    }
  },
  methods: {
    onCloneItem() {
      if (this.innerValue.length === maxConditions) {
        this.$message({
          message: `最多添加${maxConditions}个`,
          type: 'error'
        })
        return
      }
      this.innerValue.push({})
    },
    onDelItem(index) {
      this.innerValue.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.setting-condition {
  .condition-item {
    margin-bottom: 5px;
    .operation-icon {
      float: right;
    }
  }
  .type-select {
    width: 130px;
  }
  .min-input {
    width: 75px;
  }
  .max-input {
    width: 75px;
  }
}
</style>
