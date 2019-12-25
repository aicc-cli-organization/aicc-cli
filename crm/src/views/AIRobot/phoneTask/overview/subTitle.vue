<template>
  <ul class="subtitle">
    <li>{{robotCallJobDetail.createdByUserName}}创建于: {{robotCallJobDetail.robotCallJob.createTime}}</li>
    <li>任务最近更新于: {{robotCallJobDetail.robotCallJob.updateTime}}</li>
    <el-tooltip effect="dark" placement="top-start" :content="dailyTime">
      <li>可拨打时段: {{dailyTime}}</li>
    </el-tooltip>
  </ul>
</template>

<script>
export default {
  props: {
    robotCallJobDetail: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    dailyTime() {
      const { startTime, dailyStartTime = '', dailyEndTime = '', inactiveStartTime = '', inactiveEndTime = '', inactiveTimeList } = this.robotCallJobDetail.robotCallJob
      let timeRange = ''
      let arr = [dailyStartTime]
      inactiveTimeList && inactiveTimeList.forEach((item, index) => {
        if (item.startTime) {
          arr.push(item.startTime)
        }
        if (item.endTime) {
          arr.push(item.endTime)
        }
      })
      arr.push(dailyEndTime)
      const concatArr = []
      for (let i = 0; i < arr.length - 1; i++) {
        if (!(i % 2)) {
          concatArr.push(`${arr[i]}~${arr[i + 1]}`)
        }
      }
      timeRange = concatArr.join(',')
      if (!startTime) {
        return timeRange
      }
      return `${startTime.replace(/\s.*/, '')}起${timeRange}`
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;
  li {
    list-style-type: none;
  }
}

.subtitle {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  li {
    display: inline-block;
    list-style: none;
    padding: 0 20px;
    font-size: 12px;
    line-height: 16px;
    color: #666666;
    border-right: 1px solid #D8D8D8;
    &:first-child {
      padding-left: 0;
    }
    &:last-child {
      border-right: 0;
    }
  }
}
</style>
