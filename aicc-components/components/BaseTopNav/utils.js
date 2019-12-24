export const flatMenuList = [
  {
    menuTypeName: 'AI中心',
    subMenuList: [
      {
        url: '/callout',
        text: '智能外呼'
      },
      {
        url: '/callin',
        text: '智能接待'
      },
      {
        url: '/callout',
        text: '智能客服'
      }
    ]
  },
  {
    menuTypeName: '智能服务',
    subMenuList: [
      {
        url: '/callout',
        text: '智能质检'
      },
      {
        url: '/callin',
        text: '智能工单'
      },
      {
        url: '/callout',
        text: 'Y-Brain'
      },
      {
        url: '/callout',
        text: '智能培训'
      }
    ]
  },
  {
    menuTypeName: '客服工作台',
    subMenuList: [
      {
        url: '/callout',
        text: '在线语音客服'
      },
      {
        url: '/callin',
        text: '在线文本客服'
      },
      {
        url: '/callout',
        text: '智能坐席辅助'
      }
    ]
  }
]

// 导入导出任务 状态列表
export const springBatchJobENUM = {
  EXECUTING: '正在运行',
  COMPLETED: '已经完成',
  COMPLETED_WITH_SKIPS: '已经完成，由于运行过程中出现错误，有些记录被跳过，点击下载查看具体原因',
  STOPPING: '正在停止',
  STOPPED: '已经停止',
  FAILED: '运行失败',
  QUEUEING: '排队中',
  _isVue: true
}
