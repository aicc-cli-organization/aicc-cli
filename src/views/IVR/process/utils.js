// 时间节点
        // $(
        //   go.Node,
        //   "Auto",
        //   self.nodeStyle(),
        //   $(go.Shape, "Rectangle",
        //     {
        //       strokeWidth: 2,
        //       desiredSize: new go.Size(250, 92),
        //       fill: '#fff',
        //       stroke: timeBorderColor,
        //       alignment: go.Spot.Left
        //     }
        //   ),
        //   // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        //   $(
        //     go.Panel,
        //     "Table",
        //     {
        //       desiredSize: new go.Size(248, 90),
        //       defaultAlignment: go.Spot.Left,
        //       columnSizing: go.RowColumnDefinition.None
        //     },
        //     $(go.RowColumnDefinition, { column: 0, separatorStroke: timeBorderColor, separatorStrokeWidth: 2, stretch: go.GraphObject.Horizontal }),
        //     $(go.RowColumnDefinition, { column: 1, separatorStroke: timeBorderColor, separatorStrokeWidth: 2, stretch: go.GraphObject.Horizontal }),
        //     $(go.RowColumnDefinition, { column: 2, separatorStroke: timeBorderColor, separatorStrokeWidth: 2, stretch: go.GraphObject.Horizontal }),
        //     $(go.RowColumnDefinition, { row: 0, background: "#f4faee", coversSeparators: true, height: 38 }),
        //     $(go.RowColumnDefinition, { row: 1, separatorStroke: timeBorderColor, separatorStrokeWidth: 2 }),

        //     commonHeader('/static/img/time.png', '时间节点', 3),

        //     $(go.Panel, "Vertical",
        //       {
        //         row: 1, column: 0
        //       },
        //       $(go.TextBlock, self.textStyle(),  // the name
        //         {
        //           isMultiline: false
        //         },
        //         new go.Binding("text", '', function(v) {return '工作时间1'})
        //       ),
        //       $(go.TextBlock, self.textStyle(),  // the name
        //         {
        //           isMultiline: false
        //         },
        //         new go.Binding("text", '', function(v) {return '20:00-21:00'})
        //       )
        //     ),

        //     $(go.Panel, "Vertical",
        //       {
        //         row: 1, column: 1
        //       },
        //       $(go.TextBlock, self.textStyle(),  // the name
        //         {
        //           isMultiline: false
        //         },
        //         new go.Binding("text", '', function(v) {return '工作时间2'})
        //       ),
        //       $(go.TextBlock, self.textStyle(),  // the name
        //         {
        //           isMultiline: false
        //         },
        //         new go.Binding("text", '', function(v) {return '20:00-21:00'})
        //       )
        //     ),
        //     $(go.TextBlock,  // earlyFinish
        //       new go.Binding("text", '', function(v) {return '其他时间'}),
        //       { row: 1, column: 2, margin: 5, textAlign: "center" }
        //     )
        //   ),
        //   makePort("T", go.Spot.Top, false, true),
        //   makePort("L", go.Spot.Left, true, false),
        //   makePort("R", go.Spot.Right, true, false),
        //   makePort("B", go.Spot.Bottom, true, false)
        // )

        // $(
        //   go.Node,
        //   "Auto",
        //   self.nodeStyle(),
        //   $(go.Shape, "Rectangle",
        //     {
        //       strokeWidth: 2,
        //       desiredSize: new go.Size(yuyinwidth, yuyinheight),
        //       fill: '#fff',
        //       stroke: yuyinBorderColor
        //     }
        //   ),
        //   // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
        //   $(
        //     go.Panel,
        //     "Table",
        //     {
        //       desiredSize: new go.Size(yuyinwidth - 2, yuyinheight - 2),
        //       defaultAlignment: go.Spot.Left,
        //       columnSizing: go.RowColumnDefinition.None,
        //       defaultColumnSeparatorStroke: yuyinBorderColor,
        //       defaultColumnSeparatorStrokeWidth: 2
        //     },
        //     $(go.RowColumnDefinition, { column: 0, stretch: go.GraphObject.Horizontal }),
        //     $(go.RowColumnDefinition, { row: 0, height: 39, background: '#eef5fa' }),
        //     $(go.RowColumnDefinition, { row: 1, height: 41, separatorStroke: yuyinBorderColor, separatorStrokeWidth: 2}),

        //     commonHeader('/static/img/yuyin.png', '语音节点1', 1),

        //     $(go.Panel, "Horizontal",
        //       {
        //         row: 1, column: 0
        //       },
        //       $(go.TextBlock,  // earlyFinish
        //         new go.Binding("text", '', function(v) {return '语音文件名'}),
        //         { row: 1, column: 0, textAlign: "center", margin: new go.Margin(0, 0, 0, 5) }
        //       ),
        //       $(go.Picture,
        //         {
        //           margin: new go.Margin(-2, 0, 0, 8),
        //           imageStretch: go.GraphObject.Uniform,
        //           desiredSize: new go.Size(18, 18)
        //         },
        //         new go.Binding("source", '', function(v) { return '/static/img/bofang.png' })
        //       )
        //     )
        //   ),
        //   makePort("T", go.Spot.Top, false, true),
        //   makePort("B", go.Spot.Bottom, true, false)
        // )
import { parseAudio } from './audio'

export const initialData = {
  // "class": "go.GraphLinksModel",
  // "linkFromPortIdProperty": "fromPort",
  // "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
    // {"key":2, "category":"AUDIO", "loc":"360 240", "text":"Kookie Brittle"},
    {"key":-1, "category":"START", "loc":"0 0", "text":"开始"},
    {"key":1, "category":"TIME", parent: 1, nodeName:'xixi', "loc":"175 100", "text":"In a bowl", intentBranches: [{
      startTime: '9:00',
      endTime: '12:00',
      // text: 'fdsa',
      index: 0
    }, {
      startTime: '9:00',
      endTime: '14:00',
      // text: 'fdsa',
      index: 1
    }]},
    {"key":-3, "category":"RECEPTION", parent: 1, "loc":"175 500", intentBranches: [{
      index: 0,
      text: 'fdsafdsafdsfsdfdsfsda1'
    }, {
      index: 1,
      text: 'fdsafdsafdsfsdfdsfsda2'
    }, {
      index: 2,
      text: 'fdsafdsafdsfsdfdsfsda3'
    }, {
      index: 3,
      text: 'fdsafdsafdsfsdfdsfsda4'
    }, {
      index: 4,
      text: 'fdsafdsafdsfsdfdsfsda5'
    }]},
    {"key":-2, "category":"CHOOSE", parent: 1, "loc":"175 300", "text":"Enjoy!", intentBranches: [{
      index: 0,
      text: 'fdsa'
    }, {
      index: 1,
      text: 'fdda2'
    }, {
      index: 2,
      text: 'fdsaf'
    }, {
      index: 3,
      text: 'fds'
    }, {
      index: 4,
      text: 'fdsafdsafdsfsdfdsfsda5'
    }]},
    // {"key":-4, "category":"HANGUP", "loc":"175 600", "text":"Enjoy!"}
  ]
  // ,
  // "linkDataArray": [
  //   // {"from":-1, "to":1, "fromPort":"B", "toPort":"T"},
  //   // {"from":1, "to":2, "fromPort":"B", "toPort":"T"},
  //   // {"from":-2, "to":-3, "fromPort":"B", "toPort":"T"},
  //   // {"from":2, "to":-2, "fromPort":"B", "toPort":"T"},
  //   // {"from":-3, "to":-4, "fromPort":"B", "toPort":"T"}
  // ]
}

export const nodesInitial = [
  // {"key":2, "category":"AUDIO", "loc":"360 240", "text":"Kookie Brittle"},
  {"key":-1, "category":"START", "loc":"0 0", "text":"开始"},
  // {"key":1, "category":"TIME", parent: 1, nodeName:'xixi', "loc":"175 100", "text":"In a bowl", intentBranches: [{
  //   startTime: '9:00',
  //   endTime: '12:00',
  //   // text: 'fdsa',
  //   index: 0
  // }, {
  //   startTime: '9:00',
  //   endTime: '14:00',
  //   // text: 'fdsa',
  //   index: 1
  // }]},
  // {"key":-3, "category":"RECEPTION", parent: 1, "loc":"175 500", intentBranches: [{
  //   index: 0,
  //   text: 'fdsafdsafdsfsdfdsfsda1'
  // }, {
  //   index: 1,
  //   text: 'fdsafdsafdsfsdfdsfsda2'
  // }, {
  //   index: 2,
  //   text: 'fdsafdsafdsfsdfdsfsda3'
  // }, {
  //   index: 3,
  //   text: 'fdsafdsafdsfsdfdsfsda4'
  // }, {
  //   index: 4,
  //   text: 'fdsafdsafdsfsdfdsfsda5'
  // }]},
  // {"key":-2, "category":"CHOOSE", parent: 1, "loc":"175 300", "text":"Enjoy!", intentBranches: [{
  //   index: 0,
  //   text: 'fdsa'
  // }, {
  //   index: 1,
  //   text: 'fdda2'
  // }, {
  //   index: 2,
  //   text: 'fdsaf'
  // }, {
  //   index: 3,
  //   text: 'fds'
  // }, {
  //   index: 4,
  //   text: 'fdsafdsafdsfsdfdsfsda5'
  // }]}
  // {"key":-4, "category":"HANGUP", "loc":"175 600", "text":"Enjoy!"}
]

export const graphData = [
  // {"from":-1, "to":1},
  // {"from":1, "to":-3},
  // {"from":-3, "to":-2},
  // {"from":-2, "to":1}
]

export const nodeTypes = [
  // specify the contents of the Palette
  {category: "nodePalette", maincategory: 'TIME', expand: true, text: "时间节点", nodeName: '时间节点', bg: '#f4faee', borderColor: '#BDE0C2', src: '/static/img/time.png'},
  {category: "nodePalette", maincategory: 'AUDIO', expand: true, text: "语音节点", nodeName: '语音节点', bg: '#eef5fa', borderColor: '#C1D9F8', src: '/static/img/yuyin.png'},
  {category: "nodePalette", maincategory: 'SMS', expand: true, text: "短信节点", nodeName: '短信节点', bg: '#f0fbfc', borderColor: '#a3dedb', src: '/static/img/msg.png'},
  {category: "nodePalette", maincategory: 'CHOOSE', expand: true, text: "选择节点", nodeName: '选择节点', bg: '#eeeffa', borderColor: '#CFC5E4', src: '/static/img/select.png'},
  {category: "nodePalette", maincategory: 'RECEPTION', expand: true, text: "接待节点", nodeName: '接待节点', bg: '#f3eefa', borderColor: '#E3CCE7', src: '/static/img/jiedai.png'},
  {category: "nodePalette", maincategory: 'HANGUP', expand: true, text: "挂断节点", nodeName: '挂断节点', bg: '#faf3f3', borderColor: '#EECDCF', src: '/static/img/hungup.png'}
]

export const getChooseIntentBranches = (item) => {
  const rs = []
  let index = 0
  for (const key in item.dtmfmap) {
    const _data = item.dtmfmap[key]
    if (_data.enabledStatus) {
      rs.push({
        text: _data.code + _data.name,
        index: index++,
        id: _data.code
      })
    }
  }

  return rs.concat([{
    text: '按错',
    index: index++,
    id: 'ancuo'
  }, {
    text: '超时',
    index: index++,
    id: 'chaoshi'
  }])
}

export const getRECEPTIONIntentBranches = (item) => {
  const texts = []
  if (item.receptionType === 'AI') {
    texts.push(item.aiCsStaffGroupName)
    item.humanCsStaffGroupName && texts.push(item.humanCsStaffGroupName)
  } else {
    texts.push(item.humanCsStaffGroupName)
  }
  return [{
    texts, // : item.receptionType === 'AI' ? item.aiCsStaffGroupName + (item.humanCsStaffGroupName ? ',' + item.humanCsStaffGroupName : '') : item.humanCsStaffGroupName,
    index: 0,
    id: '0',
    receptionType: item.receptionType,
    isReturn: item.isReturn
  }]
}

export const parseDataFromAjax = data => {
  data.forEach(item => {
    item.loc = item.webData
    item.category = item.type
    item.key = item.id
    item.nodeName = item.name
    item.btnVisible = false
    item.isSaved = true
    item.isError = false
    item.isHovered = false
    item.expand = true

    if (item.type === 'TIME') {
      let intentBranches = item.timeBranchList.map((time, index) => ({ index, ...time }))
      intentBranches = item.otherTime ? intentBranches.concat([{ index: intentBranches.length, type: 'otherTime' }]) : intentBranches
      item.intentBranches = intentBranches
    } else if (item.type === 'AUDIO') {
      item.audio.lastAudioText = item.audio.audioText
      item.audio.ttsAudio = ''
    } else if (item.type === 'CHOOSE') {
      item.intentBranches = getChooseIntentBranches(item)

      item.chatAudio.lastAudioText = item.chatAudio.audioText
      item.chatAudio.ttsAudio = ''

      item.unRecognizeAudio.lastAudioText = item.unRecognizeAudio.audioText
      item.unRecognizeAudio.ttsAudio = ''

      item.noResponseAudio.lastAudioText = item.noResponseAudio.audioText
      item.noResponseAudio.ttsAudio = ''
    } else if (item.type === 'RECEPTION') {
      item.intentBranches = getRECEPTIONIntentBranches(item)
    }
  })

  return data
}

export const getTtsAudio = async(audioObj) => {
  console.log(JSON.parse(JSON.stringify(audioObj)))
  if (audioObj.lastAudioText === audioObj.audioText && audioObj.ttsAudio) {
    return audioObj.ttsAudio
  } else {
    audioObj.lastAudioText = audioObj.audioText
    audioObj.ttsAudio = await parseAudio(`/apiEngine/upload/ttsListening?text=${audioObj.audioText}`)
    return audioObj.ttsAudio
  }
}

export function parseTimeForEnd(time) {
  const { startTime, endTime } = time
  if (startTime >= endTime) {
    const times = startTime.split(':')
    const initialMinutes = parseInt(times[1]) + 15
    const minutes = initialMinutes >= 60 ? initialMinutes - 60 : initialMinutes
    const hours = initialMinutes >= 60 ? parseInt(times[0]) + 1 : times[0]
    return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
  } else {
    return endTime
  }
}

export function parseTimeForStart(time) {
  const { startTime, endTime } = time
  if (startTime >= endTime) {
    const times = endTime.split(':')
    const initialMinutes = parseInt(times[1]) - 15
    const minutes = initialMinutes < 0 ? initialMinutes + 60 : initialMinutes
    const hours = initialMinutes < 0 ? parseInt(times[0]) - 1 : times[0]
    return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
  } else {
    return startTime
  }
}

export function dateCrossed(times) {
  let begin = []
  let over = []

  times.forEach(({ startTime, endTime }) => {
    begin.push(startTime)
    over.push(endTime)
  })

  begin = begin.sort()
  over = over.sort()

  for (let i = 1; i < begin.length; i++) {
    if (begin[i] < over[i - 1]) {
      return true
    }
  }

  return false
}

// resetData() {
//   this.innerParams.audio = this.initialAudio
//   this.realAudioName = this.audio

//   if (this.initialAudioType === 'COMPOSE') {
//     this.ttsAudio = this.initialAudioText ? await parseAudio(`/apiEngine/upload/ttsListening?text=${this.initialAudioText}`) : ''
//     this.ttsAudioName = this.initialTtsName || ''
//   } else {
//     this.ttsAudio = ''
//     this.ttsAudioName = ''
//   }

//   this.innerParams.audioType = this.initialAudioType
//   this.innerParams.audioName = this.initialTtsName
//   this.innerParams.audioText = this.initialAudioText
// },