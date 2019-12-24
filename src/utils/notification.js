// import Store from '../store'
// const Store = window.$nuxt.$store

const customerStr = '客户' // Store.getters.customerStr

const notifications = []
let curNum = 0
const newNotification = (title, body, icon) => {
  return new Notification(title, {
    body: body,
    icon: icon,
    tag: (curNum++) % 3
  })
}
const addNotification = (notification) => {
  notifications.push(notification)

  // while (notifications.length > 3) {
  //   notifications[0].close()
  //   notifications.splice(0, 1)
  // }

  // console.log(notifications)
  // if (notifications.length > 3) {
  //   for (let i = 0; i < notifications.length - 3; i++) {
  //     notifications[i].close()
  //   }
  // }

  // notifications = notifications.slice(-3)
}

// 推送桌面通知
export function globalNotify(title, body, icon) {
  // 先检查浏览器是否支持
  if (!('Notification' in window)) return

  else if (Notification.permission === 'granted') {
    // 检查用户是否同意接受通知
    addNotification(newNotification(title, body, icon))
  } else {
    // 否则我们需要向用户获取权限
    Notification.requestPermission(permission => {
      // 如果用户同意，就可以向他们发送通知
      if (permission === 'granted') {
        addNotification(newNotification(title, body, icon))
      }
    })
  }
}

/**
 * 推送呼入的桌面通知
 * @param {String} phoneNumber 呼入客户的号码或客户名
 */
export function globalNotifyForCallIn(phoneNumber) {
  globalNotify(
    '呼入接待请求',
    `${customerStr}${phoneNumber}来电中，正在等待服务`,
    'https://crm.tanyibot.com/static/img/zhagnhu_morentouxiang@2x.png'
  )
}

/**
 * 推送人工介入的桌面通知
 * @param {String} name 客户手机号
 * @param {String} phoneNumber 客户手机号
 */

export function globalNotifyForArtiJoin(phoneNumber) {
  globalNotify(
    '人工介入请求',
    `${customerStr}${phoneNumber}请求人工介入`,
    'https://crm.tanyibot.com/static/img/zhagnhu_morentouxiang@2x.png'
  )
}
