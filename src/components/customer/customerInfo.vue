<template>
  <div class="customer-info">
    <div class="info-item">
      <div class="title">基本信息</div>
      <div class="base-info-wrap">
        <div class="base-info">
          <span class="label text-label">联系电话：</span>
          <span class="content">{{customerInfo.phoneNumber || emptyPlaceholder}}</span>
        </div>
        <div class="base-info" v-if="!isLocal">
          <span class="label text-label">微信：</span>
          <span class="content">{{customerInfo.wechatNumber || emptyPlaceholder}}</span>
        </div>
        <div class="base-info">
          <span class="label text-label">{{customerStr}}来源：</span>
          <span class="content">{{customerSourceEnum[customerInfo.source]}}</span>
        </div>
        <div class="base-info">
          <span class="label text-label">{{customerStr}}分组：</span>
          <span class="content">{{customerInfo.customerGroupName || emptyPlaceholder}}</span>
        </div>
      </div>
    </div>
    <customer-focus
      class="info-item"
      v-if="type === 'single'"
      :customerFocus="customerInfo.customerConcern"
    >
    </customer-focus>
    <customer-focus-multiple
      class="info-item"
      v-else-if="type === 'multiple'"
      :customerFocusSum="customerInfo.customerConcernSum"
    >
    </customer-focus-multiple>
    <customer-property
      class="info-item"
      :customerProperty="customerInfo.attributes"
    >
    </customer-property>
    <customer-itent-single
      class="info-item"
      v-if="type === 'single'"
      :callRecordId="callRecordId"
      :aiIntent="customerInfo.intentLevel"
      :analysisBasis="customerInfo.analysisBasis"
      :realIntentLevel.sync="customerInfo.realIntentLevel"
    >
    </customer-itent-single>
    <customer-intent-multiple
      class="info-item"
      v-else-if="type === 'multiple'"
      :customerPersonId="customerPersonId"
      :aiIntent="customerInfo.intentLevelSum"
      :realIntentLevel.sync="customerInfo.customerLevel"
    >
    </customer-intent-multiple>
  </div>
</template>

<script>
  import { CustomerFocus, CustomerFocusMultiple, CustomerProperty, CustomerItentSingle, CustomerIntentMultiple } from '@/components/customerInfo/index'
  import { customerSourceEnum } from '@/utils/enum'
  import { emptyPlaceholder } from '@/utils/constant'
  import { mapGetters } from 'vuex'

  export default {
    name: 'CustomerInfo',
    components: {
      CustomerFocus,
      CustomerFocusMultiple,
      CustomerProperty,
      CustomerItentSingle,
      CustomerIntentMultiple
    },
    props: {
      type: { // 区分客户信息为单一记录还是统计信息
        validator(value) {
          return ['single', 'multiple'].indexOf(value) !== -1
        },
        default: 'single'
      },
      callRecordId: Number,
      customerPersonId: Number,
      customerInfo: { // 客户信息
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      return {
        intent: 'A',
        customerSourceEnum,
        emptyPlaceholder
      }
    },
    computed: {
      ...mapGetters(['isLocal', 'customerStr'])
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/placeholder.scss';
  @import '~src/styles/variables.scss';

  .customer-info {
    overflow: auto;
    > .info-item {
      padding: 20px 10px 10px 16px;
      > .title {
        @extend %borderTitle;
      }
      > .base-info-wrap {
        display: flex;
        flex-wrap: wrap;
        margin-top: 8px;
        > .base-info {
          width: 50%;
          margin-top: 6px;
          display: flex;
          > .label {
            flex-shrink: 0;
            display: inline-block;
            width: 60px;
            text-align: right;
          }
        }
      }
    }
    /deep/ .el-tag--small {
      height: 26px;
      line-height: 24px;
    } 
  }
</style>

