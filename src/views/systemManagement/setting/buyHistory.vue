<template>
  <div class="yw-container private-sea" v-show="innerVisible">
    <el-button type="text" class="return-btn" icon="el-icon-arrow-left" @click="innerVisible=false">返回</el-button>
    <div class="header">
      <div class="header-filter">
        <el-select
          v-model="type"
          @change="loadData()"
          placeholder="请选择类型"
          :style="{width: '150px'}"
          :clearable="true"
        >
          <el-option
            v-for="(key, value) in searchEnum"
            :key="value"
            :value="value"
            :label="key"
          >
          </el-option>
        </el-select>
        <div class="form-item">
          <span class="label">购买时间段：</span>
          <el-date-picker
            v-model="timePeriod"
            type="daterange"
            @change="loadData()"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :style="{width: '230px'}"
          >
          </el-date-picker>
        </div>
      </div>
      <div class="right-item">
        <el-button type="primary" @click="handleClearFilterClick">
          清空筛选条件
        </el-button>
      </div>
    </div>
    <pagination-table
      url="/apiEngine/purchaseDetail/getPurchaseDetail"
      :pageZero="true"
      :autoLoad="false"
      ref="table"
      stripe
      :server="'engine'"
      :pageable="false"
      :max-height="clientHeight - 176"
    >
      <el-table-column
        prop="createTime"
        label="时间">
      </el-table-column>
      <el-table-column
        prop="phoneName"
        label="类型">
        <template slot-scope="{ row }">
          {{searchEnum[row.detailType] || emptyPlaceholder}}
        </template>
      </el-table-column>
      <el-table-column
        prop="robotCount"
        label="AI坐席数量">
        </el-table-column>
      <el-table-column
        prop="remark"
        label="服务周期">
        <template slot-scope="{ row }">
          <div>{{row.startDate+ '至' + row.endDate}}</div>
          <div>{{'(还剩'+ row.expirationTime +'天到期)'}}</div>
        </template>
      </el-table-column>
    </pagination-table>
  </div>
</template>

<script>
  import { PaginationTable } from 'yiwise-components'
  import { mapGetters } from 'vuex'
  import { parseDate } from '@/utils/date'
  import { emptyPlaceholder } from '@/utils/constant'
  import { searchEnum } from '@/utils/enum'

  export default {
    name: 'NumberPool',
    components: {
      PaginationTable
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        type: '',
        searchEnum,
        emptyPlaceholder,
        timePeriod: []
      }
    },
    computed: {
      ...mapGetters(['clientHeight']),
      innerVisible: {
        get() {
          return this.visible
        },
        set(newValue) {
          this.$emit('update:visible', newValue)
        }
      },
      generalParams() {
        return {
          type: this.type || undefined,
          startTime: this.timePeriod && this.timePeriod.length ? parseDate(this.timePeriod[0], 'YYYY-MM-DD') : undefined,
          endTime: this.timePeriod && this.timePeriod.length ? parseDate(this.timePeriod[1], 'YYYY-MM-DD') : undefined
        }
      }
    },
    methods: {
      loadData(params = {}) {
        const newParams = {
          ...this.generalParams,
          ...params
        }
        this.$refs.table.loadData(newParams)
      },
      handleClearFilterClick() { // 清空筛选条件
        this.type = undefined
        this.timePeriod = undefined

        this.loadData({
          pageNum: 1
        })
      }
    },
    mounted() {
      this.loadData()
    }
  }
</script>

<style lang="scss" scoped>
  @import '~src/styles/variables.scss';
  @import '~src/styles/extend.scss';

  .private-sea {
    height: 100%;
    position: absolute;
    width: 100%;
    .form-item {
      display: flex;
      align-items: center;
      margin-left: 20px;
      > .label {
        flex-shrink: 0;
        color: $--color-text-regular;
        font-size: $--font-size-small;
      }
    }
    > .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      &.header-sub {
        padding: 0 0 14px 0;
        border-bottom: $--border-base;
      }
      > .header-filter {
        display: flex;
        align-items: center;
      }
    }
  }
</style>
