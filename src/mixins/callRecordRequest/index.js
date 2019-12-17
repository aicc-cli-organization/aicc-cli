import * as callRecordAPI from '@/api/callRecord'

export default {
  name: 'CallRecordWrap',
  data() {
    return {
      dialogInfo: {},
      dialogMessage: []
    }
  },
  methods: {
    requestDialogDetail(callRecordId) { // 请求通话详情
      callRecordAPI.fetchCallRecordDetail({
        callRecordId: callRecordId
      }).then(({ data }) => {
        this.dialogInfo = data.data
        this.dialogMessage = data.data.callDetailList
      })
    }
  }
}
