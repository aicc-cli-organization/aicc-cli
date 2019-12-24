export function uniqBy(value, detector) {
  var array = []

  value.forEach(x => {
    array.some(y => y[detector] === x[detector]) ? array : (array.push(x), array)
  })

  return array
}
