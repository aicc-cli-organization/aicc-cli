
<template>
  <span>
    <el-form-item label="意向微信推送" class="wechat-alert-group">
      <el-radio-group v-model="innerWechatAlertSwitch">
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
      <div v-if="innerWechatAlertSwitch">
        <div v-if="dialogFlowId">
          <el-checkbox label="all" v-model="wechatAlertLevelIsCheckAll" :indeterminate="wechatAlertLevelIsIndeterminate">全选</el-checkbox>
          <el-checkbox-group v-model="innerWechatAlertLevelCode">
            <el-checkbox :label="item.code" v-for="(item, index) in intentLevelTagList" :key="index">{{item.name}}</el-checkbox>
          </el-checkbox-group>
          <div class="add-duration-limit" @click="innerDurationLimit = true" v-if="!innerDurationLimit">
            <i class="iconfont icon-tianjiajiahaowubiankuang"></i><span>添加通话时长限制</span>
          </div>
          <div class="duration-limit-area" v-else>
            <div class="tip">注：以下勾选的标签将受通话时长的限制</div>
            <div class="area-content">
              <div class="limit-intent">
                <span class="label">需要检查通话时长的标签: </span>
                <el-checkbox-group v-model="innerWechatConditionAlertLevelCode">
                  <el-checkbox :label="item.code" v-for="(item, index) in wechatDurationLimitList" :key="index">{{item.name}}</el-checkbox>
                </el-checkbox-group>
              </div>
              <div>
                <span class="duration-span">通话时长 > </span>
                <el-input class="threshold-input" type="number" placeholder="30" v-model.number="innerWechatAlertChatDurationThreshold"></el-input>
                <span class="unit">秒</span>
                <i class="iconfont icon-delet const-icon-delete" @click="innerDurationLimit = false"></i>
              </div>
            </div>
          </div>
        </div>
        <span class="empty-dialogFlow-tip" v-else>选择话术模版后，方可选择意向进行微信推送</span>
      </div>
    </el-form-item>
    <el-form-item label="微信推送人" v-if="innerWechatAlertSwitch" prop="robotCallJob.alertUsers">
      <el-select
        multiple
        collapse-tags
        filterable
        @visible-change="loadWechatPushUserList"
        v-model="innerAlertUsers">
        <el-option v-for="(item, index) in alertUsersOption"
          :key="index"
          :label="item.name"
          :value="item.id"
        ></el-option>
      </el-select>
      <default-group-setting
        groupType="WECHAT_PUSH"
        emptyTip="未选择微信推送人"
        v-model="innerAlertUsers"
      ></default-group-setting>
    </el-form-item>
    <el-form-item label="微信推送方式" v-if="innerWechatAlertSwitch" prop="robotCallJob.wechatSendMethod">
      <el-select v-model="innerWechatSendMethod">
        <el-option v-for="item in constant.wechatAlertTypeENUM"
          :key="item.key"
          :label="item.value"
          :value="item.key"
        ></el-option>
      </el-select>
      <el-checkbox
        class="select-right-checkbox"
        v-if="innerWechatSendMethod === 'SENDTOONE'"
        v-model="innerTransferCustomer">同时将该{{customerStr}}分配至对应推送人</el-checkbox>
    </el-form-item>
  </span>
</template>

<script>
import DefaultGroupSetting from '../defaultGroupSetting'
import * as constant from '@/utils/constant'
import * as usersAPI from '@/api/users'
import { mapGetters } from 'vuex'

export default {
  props: {
    dialogFlowId: Number,
    intentLevelTagList: {
      type: Array,
      default() {
        return []
      }
    },
    wechatAlertSwitch: Boolean,
    durationLimit: Boolean,
    wechatAlertLevelCode: {
      type: Array,
      default() {
        return []
      }
    },
    wechatConditionAlertLevelCode: {
      type: Array,
      default() {
        return []
      }
    },
    wechatAlertChatDurationThreshold: Number,
    alertUsers: {
      type: Array,
      default() {
        return []
      }
    },
    wechatSendMethod: String,
    transferCustomer: Boolean
  },
  data() {
    return {
      // durationLimit: false,
      wechatDurationLimitList: [],
      alertUsersOption: [],
      constant
    }
  },
  components: {
    DefaultGroupSetting
  },
  computed: {
    ...mapGetters([
      'customerStr'
    ]),
    innerWechatAlertSwitch: {
      get() {
        return this.wechatAlertSwitch
      },
      set(newVal) {
        this.$emit('update:wechatAlertSwitch', newVal)
      }
    },
    innerDurationLimit: {
      get() {
        return this.durationLimit
      },
      set(newVal) {
        this.$emit('update:durationLimit', newVal)
      }
    },
    innerWechatAlertLevelCode: {
      get() {
        return this.wechatAlertLevelCode
      },
      set(newVal) {
        this.$emit('update:wechatAlertLevelCode', newVal)
      }
    },
    innerWechatConditionAlertLevelCode: {
      get() {
        return this.wechatConditionAlertLevelCode
      },
      set(newVal) {
        this.$emit('update:wechatConditionAlertLevelCode', newVal)
      }
    },
    innerWechatAlertChatDurationThreshold: {
      get() {
        return this.wechatAlertChatDurationThreshold
      },
      set(newVal) {
        this.$emit('update:wechatAlertChatDurationThreshold', newVal)
      }
    },
    innerAlertUsers: {
      get() {
        return this.alertUsers
      },
      set(newVal) {
        this.$emit('update:alertUsers', newVal)
      }
    },
    innerWechatSendMethod: {
      get() {
        return this.wechatSendMethod
      },
      set(newVal) {
        this.$emit('update:wechatSendMethod', newVal)
      }
    },
    innerTransferCustomer: {
      get() {
        return this.transferCustomer
      },
      set(newVal) {
        this.$emit('update:transferCustomer', newVal)
      }
    },
    wechatAlertLevelIsCheckAll: {
      get() {
        const intentLevelTagList = this.intentLevelTagList
        return intentLevelTagList.length > 0 && this.wechatAlertLevelCode.length === intentLevelTagList.length
      },
      set(value) {
        const wechatAlertLevelCode = value ? this.intentLevelTagList.map(item => item.code) : []
        this.innerWechatAlertLevelCode = wechatAlertLevelCode
      }
    },
    wechatAlertLevelIsIndeterminate() {
      const intentLevelTagList = this.intentLevelTagList
      const wechatAlertLevelCode = this.wechatAlertLevelCode
      return intentLevelTagList.length > 0 && wechatAlertLevelCode.length > 0 && wechatAlertLevelCode.length < intentLevelTagList.length
    }
  },
  methods: {
    async loadWechatPushUserList(visible) {
      if (!visible) {
        return
      }
      this.alertUsersOption = (await usersAPI.getUserListByWechat()).data.data
    },
    initData() {
      this.loadWechatPushUserList(true)
    }
  },
  watch: {
    wechatAlertLevelCode: {
      handler: function(val) {
        const intentLevelTagList = this.intentLevelTagList
        const wechatConditionAlertLevelCode = this.wechatConditionAlertLevelCode.filter(item => !val.includes(item))
        const wechatDurationLimitList = intentLevelTagList.filter(item => !val.includes(item.code))
        this.wechatDurationLimitList = wechatDurationLimitList
        this.innerWechatConditionAlertLevelCode = wechatConditionAlertLevelCode
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .wechat-alert-group {
  white-space: normal;
  .el-checkbox {
    margin-left: 0;
    margin-right: 30px;
  }
  .add-duration-limit {
    width: 164px;
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    color: #000000;
    border-radius: 2px;
    background-color: #f0f0f0;
    text-align: center;
    cursor: pointer;
    i {
      margin-right: 4px;
    }
  }
  .duration-limit-area {
    .tip {
      font-size: 12px;
      color: #E99209;
      line-height: 17px;
    }
    .area-content {
      margin-top: 3px;
      padding: 10px 18px 17px 10px;
      background-color: #f7f7f7;
      .limit-intent {
        overflow: hidden;
        .label {
          float: left;
          margin-right: 10px;
          color: #000000;
        }
      }
    }
    .duration-span {
      display: inline-block;
      font-size: 14px;
      color: #000000;
    }
    .threshold-input {
      width: 70px;
      input {
        width: 70px;
        height: 26px;
        text-align: right;
        padding-right: 0;
        padding-left: 0;
      }
    }
    .const-icon-delete {
      float: right;
      cursor: pointer;
    }
  }
}
.unit {
  display: inline-block;
  margin-left: 10px;
  font-size: 12px;
  color: #000000;
}
</style>
