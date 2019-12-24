export const chartDurationManager = v => {
  if ([undefined, null, ''].includes(v) || isNaN(parseInt(v, 10))) {
    return undefined
  } else {
    return '' + Math.min(10000, Math.max(0, parseInt(v, 10)))
  }
}
