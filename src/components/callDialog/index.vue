<template>
  <yiwise-dialog
    title="拨打"
    width="960px"
    :visible.sync="innerVisible"
    :hasFooter="false"
    vertical-align="middle"
    class="call-wrap"
    @open="handleDialogOpen"
    @close="handleDialogClose"
  >
    <div class="call">
      <div class="record">
        <div class="header">
          <div class="call-action">
            <div class="select-dialog">
               <el-select
                placeholder="请选择话术"
                v-model="dialogFlowId"
                :style="{width: '150px'}"
                :filterable="true"
              >
                <el-option
                  v-for="flow in dialogFlowList"
                  :key="flow.id"
                  :value="flow.id"
                  :label="flow.name"
                >
                </el-option>
              </el-select>
              <el-button
                type="success"
                class="call-btn"
                :disabled="callBtnLoading"
                @click="handleCallClick"
              >
                <i class="iconfont icon-yijianhujiao" v-if="!callBtnLoading"></i>
                <i class="el-icon-loading" v-else></i>
              </el-button>
            </div>
            <el-select
              placeholder="选择线路"
              v-model="tenantPhoneNumberId"
              :style="{width: '150px'}"
              :filterable="true"
              remote
              :remote-method="loadLineList"
            >
              <el-option
                v-for="line in lineList"
                :key="line.tenantPhoneNumberId"
                :value="line.tenantPhoneNumberId"
                :label="line.phoneName || line.phoneNumber"
              >
                <div class="line-item">
                  <span class="phone-name">{{line.phoneName || line.phoneNumber}}</span>
                  <span v-if="line.phoneType === 'MOBILE' && line.concurrency !== 0">线路正忙</span>
                </div>
              </el-option>
            </el-select>
          </div>
          <div class="call-info">
            <div class="info-item">
              <div class="text-label">呼叫时间：</div>
              <div class="f12">{{customerInfo.startTime ? parseDate(customerInfo.startTime) : emptyPlaceholder}}</div>
            </div>
            <div class="info-item">
              <div class="text-label">通话轮次：</div>
              <div>{{(customerInfo.chatRound || 0) + '次'}}</div>
            </div>
          </div>
        </div>
        <call-record-list
          :dataSource="dialogDataList"
          :canListen="false"
          class="list"
          :keepScrollIntoView="true"
        >
        </call-record-list>
      </div>

      <call-record-detail-customer
        ref="aaa"
        type="single"
        class="customer"
        :callRecordId="dialogDataInfo.callRecordId"
        :defaultData="customerData"
        :customerInfo="customerInfo"
        :followList="followList"
        :visible="visible"
        appType="crm"
        :robotType="0"
        @addFollow="loadFollowList(customerData.customerPersonId)"
      >
      </call-record-detail-customer>
    </div>
    <property-dialog
      :visible.sync="propertyDialogVisible"
      :propertyList="propertyList"
      @submit="handlePropertySubmit"
    >
    </property-dialog>
  </yiwise-dialog>
</template>

<script>
  import { CallRecordDetailCustomer, YiwiseDialog, CallRecordList } from 'yiwise-components'
  import PropertyDialog from '@/components/propertyDialog'
  import CallWebSocket from '@/mixins/callWebSocket'
  import { getFollowedByUserList } from '@/api/customer'
  import { fetchFlowList } from '@/api/talk'
  import { getActiveTenantPhoneNumberList } from '@/api/numberpool'
  import { emptyPlaceholder } from '@/utils/constant'
  import { parseDate } from '@/utils/date'

  export default {
    name: 'CallDialog',
    mixins: [CallWebSocket],
    components: {
      YiwiseDialog,
      CallRecordList,
      CallRecordDetailCustomer,
      PropertyDialog
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      customerData: { // 客户信息
        type: Object,
        default() {
          return {}
        }
      }
    },
    computed: {
      innerVisible: {
        get() {
          return this.visible
        },
        set(newValue) {
          this.$emit('update:visible', newValue)
        }
      },
      customerPersonId() {
        return this.customerData.customerPersonId
      },
      customerPersonName() {
        return this.customerData.name
      }
    },
    data() {
      return {
        dialogFlowId: '',
        dialogFlowList: [],
        followList: [],
        customerInfo: {},
        emptyPlaceholder,
        tenantPhoneNumberId: undefined,
        lineList: []
      }
    },
    watch: {
      dialogDataInfo(newValue) {
        const { attributes = [] } = this.customerInfo
        this.customerInfo = {
          ...this.customerInfo,
          ...newValue,
          attributes: newValue.attributes ? attributes.concat(newValue.attributes) : attributes
        }
      }
    },
    methods: {
      handleDialogOpen() {
        this.loadFollowList()
        this.loadDialogFlowList()
        this.loadLineList()
        this.customerInfo = this.customerData
      },
      handleDialogClose() {
        this.disconnect()
        this.dialogFlowId = ''
        this.followList = []
        this.customerInfo = {}
        this.tenantPhoneNumberId = undefined
      },
      handleCallClick() { // 拨打
        this.customerInfo = this.customerData
        if (this.disconnect) {
          this.disconnect()
        }
        if (!this.dialogFlowId) {
          this.$message.error('请先选择话术')
          return
        }
        if (!this.tenantPhoneNumberId) {
          this.$message.error('请选择线路')
          return
        }
        if (this.connect) {
          this.loading = true
          this.connect({ // ws连接
            sendUrl: '/app/directlyCallCustomerPerson',
            flowId: this.dialogFlowId,
            customerPersonId: this.customerPersonId,
            tenantPhoneNumberId: this.tenantPhoneNumberId
          })
        }
      },
      async loadDialogFlowList() {
        try {
          const { data } = await fetchFlowList({
            pageNum: 1,
            pageSize: 999,
            published: true
          })
          if (data.data) {
            const { content } = data.data
            this.dialogFlowList = content || []
          }
        } catch (error) {
          return
        }
      },
      async loadFollowList() { // 加载跟进列表
        if (this.customerPersonId) {
          try {
            const { data } = await getFollowedByUserList({
              customerPersonId: this.customerPersonId
            })
            if (data.data) {
              this.followList = data.data
            }
          } catch (error) {
            return
          }
        }
      },
      parseDate,
      handlePropertySubmit(propertyData) {
        // 如果所选话术中有姓名变量，但属性弹框中未填写此变量，直接给该变量赋值为列表中的姓名
        if (this.hasNameProperty && !propertyData.hasOwnProperty('姓名')) {
          propertyData['姓名'] = this.customerPersonName
        }

        this.buildWebsocket({
          sendUrl: '/app/directlyCallCustomerPerson',
          flowId: this.dialogFlowId,
          customerPersonId: this.customerPersonId,
          tenantPhoneNumberId: this.tenantPhoneNumberId,
          propertyData
        })
      },
      loadLineList(val) { // 加载线路列表
        getActiveTenantPhoneNumberList({
          searchWords: val
        }).then(({ data }) => {
          this.lineList = [].concat(...Object.values(data.data))
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/extend.scss';

  .call-wrap {
    .call {
      height: 590px;
      display: flex;
      > .record {
        background: $bodyBg;
        width: 657px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        > .header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 22px;
          border-bottom: $--border-base;
          > .call-action {
            display: flex;
            align-items: center;
            margin-right: 6px;
            > .select-dialog {
              @extend .sel-button;
              margin-right: 10px;
              > .call-btn {
                width: 32px;
                padding: 0!important;
                .iconfont {
                  font-size: $--font-size-large;
                }
              }
            }
          }
          > .call-info {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            > .info-item {
              display: flex;
              align-items: center;
              .f12 {
                font-size: 12px;
              }
              &:last-child {
                margin-left: 12px;
              }
            }
          }
        }
        > .list {
          flex-grow: 1;
        }
      }
      > .customer {
        flex-grow: 1;
      }
    }
    /deep/ .el-dialog__header {
      margin-bottom: 0;
    }
    /deep/ .el-dialog__body {
      padding: 0!important;
    }
  }
  .line-item {
    display: flex;
    justify-content: space-between;
    > .phone-name {
      margin-right: 10px;
    }
  }
</style>
