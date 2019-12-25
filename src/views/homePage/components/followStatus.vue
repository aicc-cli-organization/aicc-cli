<template>
  <div id="seat-info">
    <div class="title f20">
      <span>{{customerStr}}跟进状态分布图</span>
      <span class="f14 c666">(截至今日上午5:00)</span>
    </div>
    <follow-status-chart class="bgwihte"></follow-status-chart>
  </div>
</template>
<script>
import { hasAccess } from '@/utils/access'
import followStatusChart from './followStatusChart'
import { mapGetters } from 'vuex'

export default {
  name: 'seatStats',
  components: {
    followStatusChart
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['customerStr'])
  },
  mounted() {
  },
  methods: {
    hasAccess
  }
}
</script>
<style lang="scss" scoped>
#seat-info {
  .title {
    .c666 {
      color: #666666;
    }
    margin: 40px 0 10px;
    font-weight: 700;
  }
  .bgwihte {
    background: white;
  }
}
</style>
