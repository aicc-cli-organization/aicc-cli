<template>
  <div class="counts">
    <div class="count-item">
      <div class="title">通话时长</div>
      <ul>
        <li v-for="(duration, index) in durationList" :key="index" :style="{'flex-basis': duration['flex-basis']}">
          <div class="box" :class="{'empty': duration.isEmpty}" :style="{'background-color': duration['background-color'] }">{{duration.boxText}}</div>
          <span class="num" v-if="!duration.isEmpty">{{duration.num || 0}}通</span>
        </li>
      </ul>
    </div>
    <div class="count-item">
      <div class="title">对话轮次</div>
      <ul>
        <li v-for="(chatRound, index) in chatRoundList" :key="index" :style="{'flex-basis': chatRound['flex-basis']}">
          <div class="box" :class="{'empty': chatRound.isEmpty}" :style="{'background-color': chatRound['background-color']}">{{chatRound.boxText}}</div>
          <span class="num" v-if="!chatRound.isEmpty">{{chatRound.num || 0}}通</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
const initDuration = () => ([
  {
    backKey: 'LESS_10S',
    boxText: '<10s',
    'background-color': 'rgba(24, 144, 255, .6)',
    num: 0
  },
  {
    backKey: 'F10S_T1MIN',
    boxText: '10s～1min',
    'background-color': 'rgba(24, 144, 255, .5)',
    num: 0
  },
  {
    backKey: 'F1MIN_T2MIN',
    boxText: '1~2min',
    'background-color': 'rgba(24, 144, 255, .4)',
    num: 0
  },
  {
    backKey: 'F2MIN_T3MIN',
    boxText: '2~3min',
    'background-color': 'rgba(24, 144, 255, .3)',
    num: 0
  },
  {
    backKey: 'F3MIN_TMORE',
    boxText: '>3min',
    'background-color': 'rgba(24, 144, 255, .2)',
    num: 0
  }
])

const initRound = () => ([
  {
    backKey: 'LESS_3',
    boxText: '0~3轮',
    'background-color': 'rgba(184, 145, 221, .5)',
    num: 0
  },
  {
    backKey: 'F3_T6',
    boxText: '4～6轮',
    'background-color': 'rgba(184, 145, 221, .4)',
    num: 0
  },
  {
    backKey: 'F6_T10',
    boxText: '7～9轮',
    'background-color': 'rgba(184, 145, 221, .3)',
    num: 0
  },
  {
    backKey: 'F10_MORE',
    boxText: '10轮以上',
    'background-color': 'rgba(184, 145, 221, .2)',
    num: 0
  }
])

export default {
  props: {
    fullStatsInfo: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    durationList() {
      const { chatDuration = {}} = this.fullStatsInfo
      return this.getChatPercents(chatDuration, initDuration())
    },
    chatRoundList() {
      const { chatRound = {}} = this.fullStatsInfo
      return this.getChatPercents(chatRound, initRound())
    }
  },
  methods: {
    getChatPercents(duration, configData) {
      let durationTotal = 0
      for (const key in duration) {
        durationTotal += (duration[key] || 0)
      }
      const list = []
      for (const item of configData) {
        const num = duration ? (duration[item.backKey] || 0) : 0
        if (num && durationTotal) {
          item.num = num
          item['flex-basis'] = `${(num / durationTotal) * 100}%`
          list.push(item)
        }
      }
      if (!list.length) {
        const item = configData[0]
        item.isEmpty = true
        item.boxText = '暂无数据'
        list.push(item)
      }
      return list
    }
  }
}
</script>

<style lang="scss" scoped>
.counts {
  background-color: white;
  padding: 20px;
  margin-top: 20px;
  display: flex;
  .count-item {
    flex: 1;
    & + .count-item {
      margin-left: 60px;
    }
    .title {
      font-size: 18px;
    }
    ul {
      display: flex;
      margin-top: 10px;
      li {
        flex: 1;
        .box {
          height: 52px;
          margin-bottom: 5px;
          padding: 5px;
          &.empty {
            text-align: center;
            line-height: 42px;
            background-color: #f3f3f3 !important;
            color: #999999;
          }
        }
        .num {
          font-size: 14px;
        }
      }
    }
  }
}
</style>

