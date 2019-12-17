import moment from 'moment'
import { emptyPlaceholder } from './constant'

export function parseDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (date) {
    return moment(date).format(format)
  }
  return emptyPlaceholder
}

export function transTimeForCount(time) { // 将时间转换为00:00，用于计时
  const duration = parseInt(time)
  let minute = parseInt(duration / 60)
  let sec = duration % 60 + ''
  const isM0 = ':'
  if (minute === 0) {
    minute = '00'
  } else if (minute < 10) {
    minute = '0' + minute
  }
  if (sec.length === 1) {
    sec = '0' + sec
  }

  if (minute === 'NaN') {
    minute = '00'
  }
  if (sec === 'NaN') {
    sec = '00'
  }

  return (minute || '00') + isM0 + (sec || '00')
}
