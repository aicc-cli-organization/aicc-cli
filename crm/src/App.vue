<template>
  <div id="app">
    <router-view></router-view>
    <el-dialog
      :visible.sync="dialogVisible"
      @open="getUrl()"
      width="508px">
      <div class="dialog-wrap">
        <img class="logo" src="/static/img/tanyi_gongzhonghao_logo.png" alt="">
        <img class="qr-code" :src="qrCodeUrl" alt="">
        <div class="desc1">扫一扫</div>
        <div class="desc2">
          <div class="desc-section">
            <div>关注微信公众号</div>
            <div>实时获取意向{{customerStr}}</div>
          </div>
          <div class="desc-section">
            <div>绑定探意机器人</div>
            <div>掌握任务动态</div>
          </div>
        </div>
      </div>
    </el-dialog>
    <audio
      controls
      ref="audio"
      class="audio"
    >
    </audio>
    <arti-contact-history-modal
      ref="modal"
      :visible="artiModalVisible"
      :customerPersonId="artiCustomerData.customerPersonId"
      :defaultData="artiCustomerData"
      @update:visible="handleModalVisibleChange"
    >
    </arti-contact-history-modal>
    <artificial-join-modal></artificial-join-modal>
    <knowledge-modal></knowledge-modal>
    <in-coming-dialog
      :calledPhoneNumber="incomingCustomerInfo.calledPhoneNumber"
      :phoneNumber="incomingCustomerInfo.phoneNumber"
      :name="incomingCustomerInfo.name"
      :province="incomingCustomerInfo.province"
      :city="incomingCustomerInfo.city"
    >
    </in-coming-dialog>
    <artificial-join-dialog
      v-for="(item, index) in artiJoinList"
      :key="item.identifyId"
      :defaultData="item"
      :currentIndex="index"
    >
    </artificial-join-dialog>
    <batch-call-dialog
      :phoneNumber="batchCallCustomerInfo.phoneNumber"
      :name="batchCallCustomerInfo.name"
    >
    </batch-call-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RegisterFreeSwitch from '@/mixins/RegisterFreeSwitch'
import { fetchQrCode } from '@/api/personalInfo'
import ArtiContactHistoryModal from '@/components/ArtiContactHistoryModal'
import InComingDialog from '@/components/InComingDialog'
import ArtificialJoinDialog from '@/components/ArtificialJoinDialog'
import BatchCallDialog from '@/components/BatchCallDialog'
import ArtificialJoinModal from '@/components/ArtificialJoinModal'
import KnowledgeModal from '@/components/KnowledgeModal'

export default{
  name: 'App',
  mixins: [RegisterFreeSwitch],
  components: {
    ArtiContactHistoryModal,
    InComingDialog,
    ArtificialJoinDialog,
    ArtificialJoinModal,
    KnowledgeModal,
    BatchCallDialog
  },
  data() {
    return {
      dialogVisible: false,
      qrCodeUrl: undefined,
      simple: null, // simple实例
      artiJoinModalVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'wxOfficialAccountBinded',
      'artiModalVisible',
      'artiCustomerData',
      'artiJoinList',
      'customerStr'
    ])
  },
  methods: {
    async getUrl() {
      const { data } = await fetchQrCode()
      if (data.data) {
        this.qrCodeUrl = data.data.url
      }
    },
    handleModalVisibleChange(newVisible) {
      this.$store.commit('SET_ARTI_MODAL_VISIBLE', newVisible)
    }
  },
  watch: {
    wxOfficialAccountBinded(newValue) {
      this.dialogVisible = !newValue
    }
  },
  beforeMount() {
    this.$store.commit('SET_CLIENTHEIGHT', document.documentElement.clientHeight)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
/deep/ .el-dialog__header {
  background-color: transparent;
}

.dialog-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

img {
  display: block;
}

.logo {
  width: 85px;
  height: 85px;
}

.qr-code {
  width: 216px;
  height: 216px;
}

.desc1 {
  margin-top: 12px;
  height:28px;
  font-size:20px;
  font-weight:500;
  color:rgba(51,51,51,1);
  line-height:28px;
}

.desc2 {
  display: flex;
  justify-content: space-between;
  width:256px;
  height:48px;
  font-size:16px;
  font-weight:400;
  color:rgba(51,51,51,1);
  line-height:24px;
  margin: 18px 0 55px 0;
}

.audio {
  opacity: 0;
  position: fixed;
  z-index: -1;
}
</style>
