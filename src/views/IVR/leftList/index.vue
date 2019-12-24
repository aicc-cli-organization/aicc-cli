<template>
  <task-list
    :totalElements="totalElements"
    @change="onPageChange"
  >
    <div
      class="card-item"
      v-for="(item, index) in listData"
      :key="index"
      :class="{'active': selectIVRId === item.ivrNavigationInfoId}"
      @click="onSelectItem(item)"
    >
      <status-tag class="comp-status" :status="item.status"></status-tag>
      <div class="operation-icons">
        <a class="operation-icon iconfont icon-edited" @click="onEditOrCopyItem(item, 'edit')"></a>
        <a v-if="item.status === 'FINISHED'" class="operation-icon iconfont icon-fuzhi1" @click="onEditOrCopyItem(item, 'copy')"></a>
        <yiwise-pop-confirm
          label="确认要删除该导航吗？"
          @submit="onDeletItem(item)"
        >
          <a class="operation-icon iconfont icon-delet"></a>
        </yiwise-pop-confirm>
      </div>
      <div class="name">{{item.name}}</div>
      <div class="row">
        <span class="label">导航id:</span>
        <span class="value">{{item.ivrNavigationInfoId}}</span>
      </div>
      <div class="row desc-row">
        <span class="label">导航描述:</span>
        <span class="value">{{item.description || '--'}}</span>
      </div>
      <div class="row">
        <span class="label">AI接待坐席组:</span>
        <span class="value">
          <span v-if="item.aiCsStaffGroupInfos && item.aiCsStaffGroupInfos.length">
            <staff-group-pop
              v-for="(innerItem, innerIndex) in item.aiCsStaffGroupInfos"
              :key="innerIndex"
              popType="AI"
              :isLastEle="innerIndex === item.aiCsStaffGroupInfos.length - 1"
              :groupName="innerItem.groupName"
              :staffGroupId="innerItem.csStaffGroupId">
            </staff-group-pop>
          </span>
          <span v-else>--</span>
        </span>
      </div>
      <div class="row">
        <span class="label">人工接待坐席组:</span>
        <span class="value">
          <span v-if="item.humanCsStaffGroupInfos && item.humanCsStaffGroupInfos.length">
            <staff-group-pop
              v-for="(innerItem, innerIndex) in item.humanCsStaffGroupInfos"
              :key="innerIndex"
              popType="CS"
              :isLastEle="innerIndex === item.humanCsStaffGroupInfos.length - 1"
              :groupName="innerItem.groupName"
              :staffGroupId="innerItem.csStaffGroupId">
            </staff-group-pop>
          </span>
          <span v-else>--</span>
        </span>
      </div>
      <div class="row">
        <span class="label">修改日期:</span>
        <span class="value">{{item.updateTime}}</span>
      </div>
    </div>
    <edit-or-copy-ivr-dialog
      :visible.sync="editOrCopyIvrDialogVisible"
      :type="ivrDialogType"
      :initFormFields="selectItem"
      @copySuccess="onCopySuccess"
      @editSuccess="onEditSuccess"
    ></edit-or-copy-ivr-dialog>
  </task-list>
</template>

<script>
import { YiwisePopConfirm } from 'yiwise-components'
import * as IVRAPI from '@/api/ivr'
import TaskList from '@/components/taskList'
import { IVR_STATUS } from '../utils/enum'
import EditOrCopyIvrDialog from '../components/copyOrAddOrEditIVR'
import StaffGroupPop from '../components/staffGroupPop'
import StatusTag from '../components/statusTag'

export default {
  components: {
    TaskList,
    EditOrCopyIvrDialog,
    StaffGroupPop,
    YiwisePopConfirm,
    StatusTag
  },
  data() {
    return {
      listData: undefined,
      pageNum: 1,
      totalElements: undefined,
      IVR_STATUS,
      editOrCopyIvrDialogVisible: false,
      selectItem: undefined,
      ivrDialogType: undefined
    }
  },
  computed: {
    selectIVRId() {
      return this.$store.state.ivr.selectIVRId
    }
  },
  methods: {
    async loadData(params, needInitFirstItem = true) {
      const resultPagingParams = {
        pageNum: 1,
        pageSize: 20,
        ...params
      }
      const res = await IVRAPI.pagingIVRInfo(resultPagingParams)
      const { totalElements, content } = res.data.data
      this.totalElements = totalElements
      this.listData = content
      if (content[0] && needInitFirstItem) {
        this.onSelectItem(content[0])
      }
    },
    onSelectItem({ ivrNavigationInfoId }) {
      if (!ivrNavigationInfoId) return
      this.$store.commit('IVR_SELECT_ID', ivrNavigationInfoId)
    },
    onEditOrCopyItem(item, ivrDialogType) {
      this.selectItem = {
        ivrNavigationInfoId: item.ivrNavigationInfoId,
        name: item.name,
        description: item.description
      }
      this.ivrDialogType = ivrDialogType
      this.editOrCopyIvrDialogVisible = true
    },
    async onDeletItem({ ivrNavigationInfoId }) {
      await IVRAPI.delIVRInfo({
        ivrNavigationInfoId
      })
      this.$message({
        message: '删除成功',
        type: 'success'
      })
      this.loadData({
        pageNum: Math.min(Math.ceil((this.totalElements - 1) / 20), this.pageNum) || 1
      })
    },
    onPageChange(pageNum) {
      this.loadData({
        pageNum
      })
    },
    onCopySuccess() {
      this.loadData({
        pageNum: 1,
        searchWords: undefined
      })
      this.$emit('emptyFilterBar')
    },
    onEditSuccess() {
      this.loadData({
        pageNum: this.pageNum
      }, false)
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';

.card-item {
  position: relative;
  margin-bottom: 12px;
  width: 244px;
  overflow: visible;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  background-color: white;
  padding: 12px 9px;
  &:hover {
    .comp-status {
      display: none;
    }
    .operation-icons {
      display: block;
    }
  }
  &.active {
    border-color: $--color-primary;
    border-width: 2px;
    &::after {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 5px 0 5px 8px;
      border-color: transparent transparent transparent $--color-primary;
      right: -8px;
      top: 50%;
      margin-top: -5px;
    }
  }
  .name {
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
    margin-bottom: 18px;
    padding-right: 50px;
    text-align: justify;
    word-break: break-all;
  }
  .row {
    line-height: 24px;
    display: flex;
    align-items: flex-start;
    word-break: break-all;
    &.desc-row {
      .value {
        max-width: 125px;
      }
    }
    .label {
      color: #666666;
      line-height: 20px;
    }
    .value {
      flex: 1;
      margin-left: 5px;
      line-height: 20px;
    }
  }
  .status-tag {
    position: absolute;
    right: 8px;
    top: 10px;
  }
  .operation-icons {
    display: none;
    position: absolute;
    right: 8px;
    top: 10px;
    .operation-icon {
      display: block;
      color: $--color-primary;
      margin-bottom: 10px;
    }
  }
}
</style>
