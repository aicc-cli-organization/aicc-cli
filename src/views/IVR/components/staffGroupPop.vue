<template>
  <el-popover
    v-model="visible"
    trigger="hover"
    popper-class="black-popper"
    placement="top"
  >
    <div v-if="popType === 'AI'">
      <div class="item-row">
        <span class="label">应用话术: </span>
        <span class="value">{{groupDetailInfo.dialogFlowName || '--'}}</span>
      </div>
      <div class="item-row" v-if="groupDetailInfo.transferCsStaffGroupId">
        <span class="label">转人工介入坐席组: </span>
        <span class="value">{{groupDetailInfo.transferCsStaffGroupName}}</span>
      </div>
    </div>
    <div class="p-reception" v-else>
      <div class="item-row" v-if="groupDetailInfo.groupType === 'CS' && groupTypeVisible">
        <span class="label">分配方式: </span>
        <span class="value">随机分配</span>
      </div>
      <div class="item-row">
        <span class="label">在线坐席: </span>
        <span class="value">{{onlineGroupNameStr}}</span>
      </div>
      <div class="item-row">
        <span class="label">离线坐席: </span>
        <span class="value">{{offlineGroupNameStr}}</span>
      </div>
    </div>
    <span class="slot-span pointer" :class="{'last': isLastEle}" slot="reference">
      {{groupName}}
    </span>
  </el-popover>
</template>

<script>
import * as IVRAPI from '@/api/ivr'

// groupType CS 纯人工
// onlineCount
// offlineList
// transferCsStaffGroupId
// dialogFlowName
// transferCsStaffGroupName
export default {
  props: {
    popType: {
      validator: function(val) {
        return ['CS', 'AI'].indexOf(val) !== -1
      }
    },
    staffGroupId: [String, Number],
    groupName: String,
    isLastEle: {
      type: Boolean,
      default: false
    },
    groupTypeVisible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false,
      groupDetailInfo: {}
    }
  },
  computed: {
    onlineGroupNameStr() {
      const onlineList = this.groupDetailInfo.onlineList
      if (onlineList && onlineList.length) {
        return onlineList.map(item => item.csName).join('、')
      }
      return '--'
    },
    offlineGroupNameStr() {
      const offlineList = this.groupDetailInfo.offlineList
      if (offlineList && offlineList.length) {
        return offlineList.map(item => item.csName).join('、')
      }
      return '--'
    }
  },
  methods: {
    async loadStaffGroupInfo() {
      const res = await IVRAPI.getStaffGroupInfo({
        staffGroupId: this.staffGroupId
      })
      this.groupDetailInfo = res.data.data
    }
  },
  watch: {
    visible: {
      handler: function(newVal) {
        if (newVal) {
          this.loadStaffGroupInfo()
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/variables.scss";

.item-row {
  display: flex;
  align-items: flex-start;
  // width: 200px;
  .label {
    color: #fff;
  }
  > .value {
    flex: 1;
    margin-left: 5px;
  }
}
.slot-span {
  // color: $--link-color;
  color: $--color-text-primary;
  outline: none;
  &::after {
    content: '、';
  }
  &:hover {
    color: $--link-color;
  }
  &.last {
    &::after {
      content: '';
    }
  }
}
.p-reception {
  height: 57px;
}
</style>
