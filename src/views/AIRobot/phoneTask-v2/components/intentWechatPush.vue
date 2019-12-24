<template>
  <div class="intent-wechat-push">
    <div
      class="row"
      v-for="(item, index) in innerValue"
      :key="index"
    >
      <el-select
        v-model="item['intentLevelCodes']"
        class="tag-select"
        :class="{'no-error': !!item['intentLevelCodes'].length}"
        placeholder="选择意向标签"
        multiple
        collapse-tags
        clearable
      >
        <el-option
          v-for="(tagItem, tagIndex) in intentLevelTags"
          :key="tagIndex"
          :label="tagItem.name"
          :value="tagItem.code"
          :disabled="disabledCodes(item['intentLevelCodes']).includes(tagItem.code)"
        ></el-option>
      </el-select>
      <span class="duration-span"><span class="mr10">且</span>通话时长 >
        <el-input
          v-model.number="item['durationThreshold']"
          class="duration-input"
          :class="{'no-error': item['durationThreshold']}"
          placeholder="30"
          type="number"
        ></el-input>秒
      </span>
      <span style="font-size: 12px">推送给: </span>
      <el-select
        v-model="item['userIds']"
        class="user-select"
        :class="{'no-error': !!item['userIds'].length}"
        placeholder="微信推送人"
        filterable
        multiple
        collapse-tags
      >
        <el-option
          v-for="(userItem, userIndex) in alertUsers"
          :key="userIndex"
          :label="userItem.name"
          :value="userItem.id"
        ></el-option>
      </el-select>
      <el-select
        v-model="item['wechatSendMethod']"
        class="method-select"
        :class="{'no-error': !!item['wechatSendMethod']}"
        placeholder="推送方式"
        @change="(val)=>{wechatSendMethodChange(val, index)}"
      >
        <el-option
          v-for="typeItem in weChatSendMethodList"
          :key="typeItem.key"
          :label="typeItem.value"
          :value="typeItem.key"
        ></el-option>
      </el-select>
      <el-checkbox
        v-if="item['wechatSendMethod'] === 'SENDTOONE' || item['wechatSendMethod'] === 'SENDTOTRANSFER'"
        v-model="item['transferCustomer']"
        class="distribute-customer-checkbox"
      >同时分配{{customerStr}}</el-checkbox>
      <i
        v-if="index > 0"
        class="iconfont icon-shanchux const-icon-del"
        @click="onDelRow(index)"
      ></i>
    </div>
    <a class="add-btn" @click="onAddRow" :class="{ disabled: allSelectedCodes.length === intentLevelTags.length}">
      <i class="el-icon-plus"></i>新增
    </a>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserListByWechat } from '@/api/users'
import { wechatAlertTypeENUM } from '@/utils/constant'
import { getWechatPushConditionItem } from '../config/addTask'

export default {
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    },
    intentLevelTags: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      wechatAlertTypeENUM,
      alertUsers: []
    }
  },
  computed: {
     ...mapGetters([
      'customerStr',
      'enableCsTransfer',
      'enableCsTransferTel'
    ]),
    innerValue: {
      get() {
        return this.value
      },
      set(newVal) {
        this.$emit('input', newVal)
      }
    },
    allSelectedCodes() {
      return this.innerValue.map(item => item.intentLevelCodes).reduce((prev, curr) => [...prev, ...curr])
    },
    weChatSendMethodList() {  //未开通人工介入的客户不显示优先推送给介入人选项-ml
      if (this.enableCsTransfer || this.enableCsTransferTel)  return wechatAlertTypeENUM
      else {
        return wechatAlertTypeENUM.filter((value,index) => {
          return value.key != 'SENDTOTRANSFER'
        })
      }    
    }
  },
  methods: {
    canAdd() {
      return this.allSelectedCodes.length < this.intentLevelTags.length
    },
    onAddRow() {
      if (!this.canAdd()) return

      this.innerValue.push(getWechatPushConditionItem())
    },
    onDelRow(index) {
      this.innerValue.splice(index, 1)
    },
    async loadWechatPushUserList() {
      this.alertUsers = (await getUserListByWechat()).data.data
    },
    disabledCodes(currCodes) {
      return this.allSelectedCodes.filter(item => !currCodes.includes(item))
    },
    fileterWechatMethod(arr) {  //未开通人工介入的客户若已经选中优先推送给介入人选项则显示为依次推送-ml
      arr.forEach(item => {
        if (!this.enableCsTransfer && !this.enableCsTransferTel && item.wechatSendMethod === 'SENDTOTRANSFER') {
          item.wechatSendMethod = 'SENDTOONE'
        }
      });
    },
    wechatSendMethodChange(val,index) {
      this.innerValue[index].transferCustomer = false
    }
  },
  mounted() {
    this.fileterWechatMethod(this.value)
    this.loadWechatPushUserList()
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.intent-wechat-push {
  width: 824px;
  padding: 12px;
  background-color: #f7f7f7;
  > .row {
    margin-bottom: 10px;
    .tag-select {
      width: 176px;
    }
    .duration-span {
      margin-left: 10px;
      font-size: 12px;
      color: #000000;
      line-height: 32px;
      .duration-input {
        width: 50px;
        margin: 0 10px;
        /deep/ .el-input__inner {
          padding: 0 8px;
        }
      }
    }
    .user-select {
      width: 124px;
      /deep/ .el-select__tags {
        height: 32px;
        line-height: 32px;
        white-space: nowrap;
        > span {
          display: inline-block;
          white-space: nowrap;
        }
        .el-select__tags-text {
          display: inline-block;
          vertical-align: middle;
          max-width: 50px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .method-select {
      width: 122px;
    }
    .distribute-customer-checkbox {
      margin-left: 12px;
      color: #757575;
      /deep/ .el-checkbox__label {
        font-size: 12px;
      }
    }
    .const-icon-del {
      float: right;
      margin-right: 3px;
      color: #666666;
      cursor: pointer;
    }
  }
  > .add-btn {
    line-height: 20px;
    font-size: 12px;
    color: $--color-primary;
    i {
      margin-right: 8px;
    }
  }
}
</style>
