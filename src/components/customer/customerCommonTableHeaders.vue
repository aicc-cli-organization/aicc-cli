<template>
  <span v-if="header.name === '姓名'">
    <YiwiseUserName
      :name="page === 'call' ? rowData.customerPersonName : rowData.name"
      :inWhiteList="rowData.inWhiteList"
      :inShareWhiteList="rowData.inShareWhiteList"
    ></YiwiseUserName>
  </span>
  <span v-else-if="header.name === '性别'">
    <template v-if="page === 'call'">
      {{getGender(rowData)}}
    </template>
    <span v-else>
      {{genderEnum[rowData.customerPersonInfo ? rowData.customerPersonInfo.gender : rowData.gender] || emptyPlaceholder}}
    </span>
  </span>
  <span v-else-if="header.name === '联系电话'">
    <template v-if="page === 'public'">
      {{ hasAccess('crm_publicSea_viewCompletePhone') ?
          (rowData.phoneNumber || emptyPlaceholder) : (hidePhoneNumber(rowData.phoneNumber) || emptyPlaceholder) }}
      <el-popover
        v-if="rowData.alternatePhoneNumbers && rowData.alternatePhoneNumbers.length > 0"
        trigger="hover"
        placement="top-start"
      >
        <div
          v-for="(item, index) in rowData.alternatePhoneNumbers"
          :key="index"
        >
          {{ hasAccess('crm_publicSea_viewCompletePhone') ?
            item : hidePhoneNumber(item) }}
        </div>
        <span slot="reference" class="more-phone">更多号码</span>
      </el-popover>
    </template>
    <template v-else-if="page === 'call'">
      {{rowData.calledPhoneNumber || emptyPlaceholder}}
    </template>
    <template v-else>
      {{rowData.phoneNumber || emptyPlaceholder}}
      <el-popover
        v-if="rowData.alternatePhoneNumbers && rowData.alternatePhoneNumbers.length > 0"
        trigger="hover"
        placement="top-start"
      >
        <div
          v-for="(item, index) in rowData.alternatePhoneNumbers"
          :key="index"
        >
          {{item}}
        </div>
        <span slot="reference" class="more-phone">更多号码</span>
      </el-popover>
    </template>
  </span>
  <span v-else-if="header.name === `${customerStr}来源`">
    {{customerSourceEnum[rowData.source]}}
  </span>
  <span v-else-if="header.name === `${customerStr}分组`">
    <template v-if="page === 'call'">{{rowData.customerGroupName || emptyPlaceholder}}</template>
    <template v-else>
      {{rowData.customerGroup ? rowData.customerGroup.name || rowData.customerGroup.customerGroupId || emptyPlaceholder : emptyPlaceholder}}
    </template>
  </span>
  <span v-else-if="header.name === '微信'">
    {{rowData.wechatNumber || emptyPlaceholder}}
  </span>
  <span v-else-if="header.name === '创建时间'">
    {{parseDate(rowData.createTime)}}
  </span>
  <span v-else>
    {{rowData.extraInfo ? (rowData.extraInfo[header.customerPersonExtraFieldId] || emptyPlaceholder) + '' : emptyPlaceholder}}
  </span>
</template>

<script>
  import YiwiseUserName from '@/components/YiwiseUserName'
  import { genderEnum, customerSourceEnum } from '@/utils/enum'
  import { emptyPlaceholder } from '@/utils/constant'
  import { parseDate } from '@/utils/date'
  import { hidePhoneNumber } from '@/utils/index'
  import { mapGetters } from 'vuex'

  export default {
    components: { YiwiseUserName },
    props: {
      rowData: {
        type: Object,
        default: () => {}
      },
      header: {
        type: Object,
        default: () => {}
      },
      page: {
        type: String,
        default: 'private' // private 我的客户 public 客户公海 call 联系历史 all 所有客户
      }
    },
    data() {
      return {
        genderEnum,
        emptyPlaceholder,
        customerSourceEnum
      }
    },
    computed: {
      ...mapGetters(['customerStr'])
    },
    methods: {
      parseDate,
      hidePhoneNumber,
      getGender(rowData) {
        const fg = genderEnum[rowData.customerPersonGender]
        const lg = genderEnum[rowData.recognizeGender]

        return !fg && !lg ? '--' :
          (fg && !lg) || (!fg && lg) ? fg || lg :
          fg + (fg === lg ? '' : '--' + lg)
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '~src/styles/variables.scss';
@import '~src/styles/placeholder.scss';

.recognize {
  color: $--color-danger;
}
.more-phone {
  @extend %tableAction;
}
</style>

