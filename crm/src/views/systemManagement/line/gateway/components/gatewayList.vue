<template>
  <div class="left-list">
    <div class="flex-container">
      <div class="gateway-list yw-container">
        <div class="title-container">
          <el-input
            size="small"
            @keyup.enter.native="search()"
            placeholder="搜索网关名称"
            class="filter-input mt10"
            v-model="deviceName"
          >
            <el-button
              size="mini"
              slot="append"
              icon="el-icon-search"
              @click="search()"
            ></el-button>
          </el-input>
        </div>
        <div class="gateway-item-container">
          <div
            v-for="item in gatewayList"
            :key="item.deviceId"
            @click="changeGateway(item)"
            class="gateway-item"
            :class="{selected: item.deviceId == selectedDeviceId}"
          >
            <i
              class="el-icon-edit right icon f16 mr10"
              @click="showEditGateway(item)"
            ></i>
            
            <span class="inlineBlock mr5 f14">{{item.name || "--"}}</span>
            <el-tag>自有线路</el-tag>
            <span class="inlineBlock mr5 mt10 f14">品牌：{{item.brand}}</span>
            <br>
            <span class="inlineBlock mr5 mt10 f14">端口：{{item.usedPorts + "/" + item.totalPorts}}</span>
          </div>
        </div>
        <div class="list-pagination">
          <el-pagination
            small
            layout="prev, pager, next"
            :current-page="currentPage"
            :page-size="20"
            :total="totalElements"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </div>
    <edit-gateway
      :row.sync="editGatewayForm"
      :visible.sync="editGatewayFormVisible"
      @success="addSuccess"
    />
  </div>
</template>
<script>
import { hasAccess } from '@/utils/access'
import { gatewayGetList } from '@/api/gateway'
import editGateway from './editGateway'

export default {
  components: {
    editGateway
  },
  data() {
    return {
      searchWords: undefined,
      deviceName: undefined,
      selectedDeviceId: undefined,
      gatewayList: [],
      currentPage: 1,
      totalElements: 0,
      editGatewayForm: {},
      editGatewayFormVisible: false
    }
  },
  mounted() {
    this.requestList()
  },
  destroyed() {
    this.$store.commit('CLEAR_SELECTED_DEVICE_ID')
  },
  methods: {
    hasAccess,
    search() {
      this.currentPage = 1
      this.requestList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.requestList()
    },
    addSuccess() {
      this.requestList()
    },
    requestList(deviceName) {
      gatewayGetList({
        deviceName: this.deviceName,
        pageNum: this.currentPage,
        pageSize: 20
      }).then(({ data }) => {
        this.gatewayList = data.data.content
        this.totalElements = data.data.totalElements
        if (this.gatewayList && this.gatewayList.length > 0) {
          this.selectedDeviceId = this.gatewayList[0].deviceId
          this.$store.commit('UPDATE_SELECTED_DEVICE_ID', this.selectedDeviceId)
        }
      })
    },
    showEditGateway(item) {
      this.editGatewayForm = {
        ...item
      }
      this.editGatewayFormVisible = true
    },
    changeGateway(item) {
      if (this.selectedDeviceId === item.deviceId) {
        return
      }
      this.selectedDeviceId = item.deviceId
      this.$store.commit('UPDATE_SELECTED_DEVICE_ID', item.deviceId)
    }
  }
}
</script>
<style lang="scss" scoped>
// @import '@/styles/variables.scss';
.c666{
  color: #666;
}
.flex-container {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  background: #f9f9f9;
}
.left-list {
  height: calc(100vh - 188px);
  position: relative;
  width: 300px;
  margin: 0 13px 0 0;
}
/*左侧任务列表*/
  .title-container .el-input{
    width: 180px;
    height: 30px;
  }
  .title-container{
    padding: 15px 10px 0 10px;
    margin-bottom: 5px;
    width: 300px;
    span{
      line-height: 30px;
    }
    .gateway-item i {
      height: 15px;
      width: 15px;
    }
    .filter-input {
      width: 100%;
    }
    .add-btn {
      margin-top: 10px;
      width: 100%;
    }
  }
  /deep/ .el-pagination {
    text-align: center;
  }
  .gateway-item-container::-webkit-scrollbar {
    display: none;
  }
  .gateway-item-container{
    height: calc(100vh - 320px);
    overflow: scroll;
  }
  .gateway-item.selected{
    border: 2px solid #1890ff;
  }
  .gateway-item:last-child{
    margin-bottom: 50px;
  }
  .gateway-item{
    border: 1px solid #ccc;
    width: 280px;
    height: 110px;
    border-radius: 4px;
    margin: 10px 10px;
    padding: 10px 12px 0 12px;
    cursor: pointer;
  }
  
</style>
