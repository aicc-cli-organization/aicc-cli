<template>
  <card-list
    class="ch-card-list"
    :dataSource="recordList"
    :isPagination="false"
    :body-style="{padding: '20px 10px 14px'}"
    :activeId="callRecordId"
    uniqueKey="callRecordId"
    @select="data => $emit('select', data)"
  >
    <template slot-scope="{data}">
      <card-item
        :tag="tag"
        :recordJobData="data"
      >
      </card-item>
    </template>
  </card-list>
</template>

<script>
import { CardList } from 'yiwise-components'
import CardItem from './CardItem'

export default {
  name: 'ContactHistoryCardList',
  components: {
    CardList,
    CardItem
  },
  props: {
    recordList: {
      type: Array,
      default() {
        return []
      }
    },
    callRecordId: {
      type: [Number, String],
      default: ''
    },
    tag: {}
  }
}
</script>

<style lang="scss" scoped>
  @import 'src/styles/variables.scss';

  .ch-card-list {
    /deep/ .card-list {
      padding: 20px 20px 8px;
      .el-card {
        border: none;
        background-color: $bodyBg;
      }
      .active {
        border: $--border-width-base solid $--color-primary;
        background: #F4FAFF; // TODO: primary lighten
      }
    }
  }
</style>

