<template>
  <div class="page-container relative">
    <div class="diagram-container relative">
      <div class="palette-container relative" :style="{width: paletteShow ? '102px' : '64px'}">
        <div class="slider" :style="{width: paletteShow ? '102px' : '64px'}" @click="paletteShow = !paletteShow">
          <i class="el-icon-d-arrow-left" :class="paletteShow ? '' : 'rotate'"></i>
        </div>
        <!-- <div class="left-spin" v-show="!paletteShow" @click="paletteShow = true">
          <i class="el-icon-d-arrow-right"></i>
        </div> -->
        <div class="title" :style="{width: paletteShow ? '102px' : '64px'}">节点库</div>
        <div id="myPaletteDiv" :style="{width: paletteShow ? '102px' : '64px'}"></div>
      </div>
      <div id="myDiagramDiv"></div>
      <div class="right-drawer relative" :style="{width: rightDrawerShow ? '230px' : '0', 'border-right': rightDrawerShow ? '' : 'none'}">
        <div class="inner-container">
          <component
            ref="formComponent"
            :is="componentType"
            :editData="editData"
            :nodeIndex="newNodeIndex"
            :type="operType"
            :myDiagram="myDiagram"
            @succuss="handleSuccess"
          ></component>
        </div>
        <div class="right-spin" @click="rightDrawerShow = !rightDrawerShow">
          <i :class="rightDrawerShow ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"></i>
        </div>
      </div>
      <recordDialog :defaultData="{ prefixAudioUrl: [curAudio] }" :visible.sync="showAudioDialog"></recordDialog>
    </div>
    <el-button type="primary" @click="save" :disabled="!selectIVRId || !hasAccess('crm_ivr_edit')" :loading="saving">发布</el-button>
    <!-- <myAudio></myAudio> -->
  </div>
</template>

<script>
import go from '@/assets/go'
import ZoomSlider from './ZoomSlider'
import components from './components'
import { initialData, nodeTypes, nodesInitial, parseDataFromAjax, getTtsAudio } from './utils'
import { cloneJSON, debounce } from '@/utils'
import { getNodes, saveNode, saveLink, delNode, publishIvr } from '@/api/ivr'
import { getSmsList } from '@/api/sms'
import recordDialog from './components/recordDialog'
import { parseAudio } from './audio'
import myAudio from './components/myAudio'

export default {
  components: {
    ...components,
    recordDialog,
    myAudio
  },
  data() {
    return {
      paletteShow: true,
      rightDrawerShow: false,
      fontFamily: `'PingFangSC-Regular', 'SF Pro SC', 'SF Pro Display',
      'SF Pro Icons', 'PingFang SC', 'Helvetica Neue', 'Helvetica', 'Arial',
      sans-serif`,
      strokeColor: '#333333',
      myDiagram: undefined,
      myPalette: undefined,
      componentType: '',
      editData: {},
      newNodeIndex: 0,
      operType: 'add',
      showAudioDialog: false,
      curAudio: '',
      saving: false,
      smsList: []
    }
  },
  computed: {
    selectIVRId() {
      return this.$store.state.ivr.selectIVRId
    },
    access() {
      return this.$store.state.user.access
    }
  },
  watch: {
    access() {
      this.myDiagram.allowDrop = !!this.selectIVRId && this.hasAccess('crm_ivr_edit') // !!v
    },
    selectIVRId(v) {
      this.myDiagram.allowDrop = !!v && this.hasAccess('crm_ivr_edit') // !!v
      this.initModelData()
      this.editData = {}
      this.rightDrawerShow = false
      this.componentType = ''
      this.editData = {}
    },
    paletteShow(v) {
      this.myPalette.model.nodeDataArray.forEach(node => {
        node.expand = !!v
        this.myPalette.model.updateTargetBindings(node)
      })

      setTimeout(() => {
        this.myPalette.requestUpdate()
      }, 100)
    },
    rightDrawerShow(v) {
      // if (!v) {
      //   this.componentType = ''
      //   this.editData = {}
      // }
      setTimeout(() => {
        this.myDiagram.requestUpdate()
      }, 200)
    }
  },
  methods: {
    async getSmsTemplateList() {
      const { data } = await getSmsList({
        status: 'APPROVED',
        pageSize: 999
      })
      this.smsList = data.data.content || []
    },
    async save() {
      this.saving = true
      try {
        const { data } = await publishIvr({
          ivrNavigationInfoId: this.selectIVRId
        })
        this.saving = false

        this.myDiagram.model.nodeDataArray.forEach(nodeData => {
          nodeData.isError = false
          this.myDiagram.model.updateTargetBindings(nodeData)
        })

        if (data.data.status === 'FAIL') {
          const node = this.myDiagram.findNodeForKey(data.data.id)
          node.data.isError = true
          this.myDiagram.model.updateTargetBindings(node.data)
          this.$message.error(data.data.msg || '节点流程未完整，请补充完整后再保存！')
        } else {
          this.$emit('refreshLeftList')
          this.$message.success('保存成功')
        }
      } catch(e) {
        this.saving = false
      }
    },
    getModalData() {
      return JSON.parse(this.myDiagram.model.toJson())
    },
    async handleSuccess(data) {
      this.rightDrawerShow = false
      const nodeData = this.myDiagram.model.findNodeDataForKey(data.preKey)
      Object.keys(data).forEach(key => key !== 'key' && (nodeData[key] = data[key]))
      nodeData.isError = false
      nodeData.isHovered = false
      this.myDiagram.model.updateTargetBindings(nodeData)
      this.myDiagram.model.setKeyForNodeData(nodeData, data.id)
      this.operType = 'edit'
      this.editData = {
        ...this.editData,
        ...data,
        key: data.id
      }

      const model = this.myDiagram.model
      if(data.type === 'TIME') {
        // 如果是时间节点，如果没有勾选其他时间，并且还存在从其他时间连出去的线，应该删除此线
        // 还要考虑时间数组增删的情况
        // 上述考虑比较复杂，所以直接删除所有从此节点出发的连线，然后根据节点当前数据重新创建连线

        // 第一步，删除所有从此节点出发的连线
        let i = 0
        while (i < model.linkDataArray.length) {
          if(model.linkDataArray[i].from === data.id) {
            model.removeLinkData(model.linkDataArray[i])
          } else {
            i++
          }
        }

        // 第二步，根据节点数据重新创建连线，如果inactiveNodeId有数据但没勾选其他时间，则应删除此数据
        if (data.inactiveNodeId && data.otherTime) {
          model.addLinkData({"from": data.id, "frompid": data.timeBranchList.length + '', "to": data.inactiveNodeId})
        } else if (data.inactiveNodeId && !data.otherTime) {
          await saveLink({
            sourceId: data.id,
            targetId: '',
            branchType: 'inactiveNodeId',
            index: undefined
          })
        }
        
        data.timeBranchList.forEach((item, index) => {
          if (item.nextNodeId) {
            model.addLinkData({"from": data.id, "frompid": index + '', "to": item.nextNodeId})
          }
        })
      } else if (data.type === 'CHOOSE') {
        // 如果是选择节点，修改了所选按键后，此节点按键连线应该重置
        // 新增的项不管，被移除的项应该同步删掉连线
        const prekeys = []
        for (const key in data.nodeMap) {
          prekeys.push(key)
        }

        const nowKeys = []
        for (const key in data.dtmfmap) {
          const _data = data.dtmfmap[key]
          if (_data.enabledStatus) {
            nowKeys.push(_data.code)
          }
        }

        prekeys.forEach(async key => {
          if (!nowKeys.includes(key)) {
            await saveLink({
              sourceId: data.id,
              targetId: '',
              branchType: key,
              index: undefined
            })

            const index3 = model.linkDataArray.findIndex(item => {
              return item.from === data.id && item.frompid === key
            })

            model.removeLinkData(model.linkDataArray[index3])
          }
        })
      } else if (data.type === 'RECEPTION') {
        // 如果是接待节点，
        const { receptionType, isReturn } = data
        if (receptionType === 'AI' && isReturn) {

        } else {
          // 这种情况不允许连线，所以如果之前有连线，则应删除
          if (data.nextNodeId) {
            await saveLink({
              sourceId: data.id,
              targetId: '',
              branchType: 'nextNodeId',
              index: undefined
            })

            const index3 = model.linkDataArray.findIndex(item => {
              return item.from === data.id
            })

            model.removeLinkData(model.linkDataArray[index3])
          }
        }
      }

      this.$emit('refreshLeftList')
    },
    showModal(data, type) {
      const showNewModel = () => {
        const componentType = {
          TIME: 'timeForm',
          AUDIO: 'yuyinForm',
          CHOOSE: 'selectForm',
          RECEPTION: 'jieDaiForm',
          SMS: 'smsForm'
        }[data.category]

        if (componentType) {
          this.operType = type
          this.editData = cloneJSON(data)
          this.componentType = componentType
          this.newNodeIndex = this.getModalData().nodeDataArray.filter(node => node.category === data.category).length
          this.rightDrawerShow = true
        } else {
          console.error('找不到对应组件：' + data.category)
        }
      }

      if (this.$refs.formComponent && this.$refs.formComponent.hasWrongData) {
        this.$refs.formComponent.hasWrongData(() => {
          this.$confirm('当前节点未完成，确定要离开吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 如果当前弹框是新增节点，则直接删除该节点然后显示新弹框，如果是编辑，则直接显示新节点弹框
            if (this.$refs.formComponent.type === 'add') {
              const model = this.myDiagram.model
              const index = model.nodeDataArray.findIndex(item => item.key === this.$refs.formComponent.editData.key)

              model.removeNodeData(model.nodeDataArray[index])
            }
            showNewModel()
          }).catch(() => {
            // 如果最新操作是新增节点，则直接删除新增的节点
            if (!data.id) {
              const model = this.myDiagram.model
              const index = model.nodeDataArray.findIndex(item => item.key === data.key)

              model.removeNodeData(model.nodeDataArray[index])
            }
          })
        }, showNewModel)

        return
      }

      showNewModel()
    },
    async playAudio(e, obj) {
      const node = obj.part
      const data = node.data
      const audioObj = data.audio

      this.showAudioDialog = true
      if (audioObj.audioType === 'MAN_MADE') {
        this.curAudio = audioObj.audioUrls[0]
      } else {
        this.curAudio = 'loading'
        this.curAudio = await getTtsAudio(audioObj)
      }
    },
    handleClickOnNode(e, obj) {
      if (!this.hasAccess('crm_ivr_edit')) {
        return
      }

      var part = obj.part
      if (part instanceof go.Node && ['TIME', 'AUDIO', 'CHOOSE', 'RECEPTION', 'SMS'].includes(part.data.category)) {
        // 编辑时点击自身时，只是将抽屉显示出来
        if (this.editData.key === part.data.key || this.editData.id === part.data.id) {
          this.rightDrawerShow = true
          return
        }
        this.showModal(part.data, 'edit')
      }
    },
    async initModelData() {
      if (!this.selectIVRId) return
      let { data } = await getNodes({
        ivrNavigationInfoId: this.selectIVRId
      })

      // 如果当前没有节点，先给强行增加一个开始节点
      if (!data.data || !data.data.length) {
        await saveNode({
          ivrNavigationInfoId: this.selectIVRId,
          data: {
            name: '开始',
            type: 'START', // 节点类型 START 开始节点 TIME 时间节点 AUDIO 语音节点 CHOOSE 选择节点 RECEPTION 接待节点 HANGUP 挂断节点
            webData: '0 0'
          }
        })

        data = (await getNodes({
          ivrNavigationInfoId: this.selectIVRId
        })).data
      }

      const graphData = []
      data.data.forEach(node => {
        if (node.type === 'START' && node.nextNodeId) {
          graphData.push({
            from: node.id,
            to: node.nextNodeId
          })
        } else if (node.type === 'TIME') {
          if (node.inactiveNodeId && node.otherTime) {
            graphData.push({"from": node.id, "frompid": node.timeBranchList.length + '', "to": node.inactiveNodeId})
          }

          node.timeBranchList.forEach((item, index) => {
            if (item.nextNodeId) {
              graphData.push({"from": node.id, "frompid": index + '', "to": item.nextNodeId})
            }
          })
        } else if (node.type === 'AUDIO') {
          if (node.defaultNodeId) {
            graphData.push({
              from: node.id,
              "frompid": 'B',
              to: node.defaultNodeId
            })
          }
        } else if (node.type === 'CHOOSE') {
          if (node.errorNodeId) {
            graphData.push({"from": node.id, "frompid": 'ancuo', "to": node.errorNodeId})
          }
          if (node.timeoutNodeId) {
            graphData.push({"from": node.id, "frompid": 'chaoshi', "to": node.timeoutNodeId})
          }

          for (const key in node.nodeMap) {
            graphData.push({"from": node.id, "frompid": key, "to": node.nodeMap[key]})
          }
        } else if (node.type === 'RECEPTION') {
          if (node.nextNodeId) {
            graphData.push({"from": node.id, "frompid": '0', "to": node.nextNodeId})
          }
        } else if (node.type === 'SMS') {
          if (node.nextNodeId) {
            graphData.push({"from": node.id, "frompid": 'B', "to": node.nextNodeId})
          }
        }
      })

      this.myDiagram.model = 
        new go.GraphLinksModel(
          parseDataFromAjax(data.data),
          graphData
          // .concat([
          //   {"from": '5c98c871fe14383a8ecc8149', "frompid":"0", "to": '5c98c871fe14383a8ecc8149'},
          //   {"from": '5c98c871fe14383a8ecc8149', "frompid":"1", "to": '5c98c871fe14383a8ecc8149'}
          // ])
        )
      this.myDiagram.model.linkFromPortIdProperty = 'frompid'
      this.myDiagram.model.linkToPortIdProperty = 'topid'

      // 删除所有废连线 start
      const model = this.myDiagram.model
      const linksToBeDel = []
      model.linkDataArray.forEach(link => {
        // 如果该连线的首尾某段不存在，就删除该连线
        const { from, to } = link
        const fromData = model.findNodeDataForKey(from)
        const toData = model.findNodeDataForKey(to)
        
        if (!fromData || !toData) {
          linksToBeDel.push(link)
        }
      })

      linksToBeDel.forEach(link => {
        const index = model.linkDataArray.findIndex(item => {
          return item.__gohashid === link.__gohashid
        })

        model.removeLinkData(model.linkDataArray[index])
      })
      // 删除所有废连线 end
    },
    nodeStyle(isExpandNode) {
      const self = this

      function onSelectionChanged(node, name) {
        // 选择后添加边框和背景色
        // if (name === 'paletteBg') {
        //   return
        // }
        // const bg = node.findObject(name)
        // if (bg !== null) {
        //   if (node.isSelected) {
        //     bg.fill = '#fdf3f3'
        //     bg.stroke = '#ff7289'
        //   } else {
        //     bg.fill = '#fff'
        //     bg.stroke = '#fff'
        //   }
        // }
      }

      return [
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
          go.Point.stringify
        ), // 获得当前node的坐标，makeTwoWay即双向绑定，坐标改变即改变path的值
        {
          // stretch:
          //   name === 'paletteBg'
          //     ? go.GraphObject.Horizontal
          //     : go.GraphObject.Fill,
          // // doubleClick: editItem,
          // selectionAdorned: false,
          // // selectionChanged: function(node) {
          // //   onSelectionChanged(node, name)
          // // },
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
          locationSpot: go.Spot.Center,
          isShadowed: true,
          shadowVisible: false,
          toLinkableSelfNode: true,
          fromLinkableSelfNode: true,
          shadowBlur: 4,
          shadowColor: '#BABABA',
          shadowOffset: new go.Point(2, 2),
          selectionAdorned: false,
          selectionChanged: function(node) {
            onSelectionChanged(node, name)
          },
          cursor: "pointer",
          click: isExpandNode ? self.handleClickOnNode : () => {},
          mouseEnter: function(e, node) {
            node.shadowVisible = true

            if (self.myDiagram.model.linkDataArray.find(link => link.from === node.key)) {
              node.data.btnVisible = true
            }

            node.data.isHovered = true
            self.myDiagram.model.updateTargetBindings(node.data)
          },
          mouseLeave: function(e, node) {
            node.shadowVisible = false
            node.data.btnVisible = false
            node.data.isHovered = false
            self.myDiagram.model.updateTargetBindings(node.data)
          }
        }
      ]
    },
    getBranchTypeAndIndex(nodeData, linkData) {
      let branchType = ''
      let index

      if (nodeData.type === 'START') {
        branchType = 'nextNodeId'
      } else if (nodeData.type === 'TIME') {
        const timeItem = nodeData.intentBranches[linkData.frompid]
        if (timeItem.type === 'otherTime') {
          branchType = 'inactiveNodeId'
        } else {
          index = nodeData.intentBranches
            .filter(item => item.startTime && item.endTime)
            .findIndex(item => timeItem.startTime === item.startTime && timeItem.endTime === item.endTime)
          branchType = 'timeBranchList'
        }
      } else if (nodeData.type === 'AUDIO') {
        branchType = 'defaultNodeId'
      } else if (nodeData.type === 'CHOOSE') {
        const _data = nodeData.dtmfmap[linkData.frompid]
        if (linkData.frompid === 'ancuo') {
          branchType = 'errorNodeId'
        } else if (linkData.frompid === 'chaoshi') {
          branchType = 'timeoutNodeId'
        } else {
          branchType = linkData.frompid
        }
      } else if (nodeData.type === 'RECEPTION' || nodeData.type === 'SMS') {
        branchType = 'nextNodeId'
      }

      return { branchType, index }
    },
    textStyle() {
      return {
        font: `700 12px ${this.fontFamily}`,
        stroke: this.strokeColor
      }
    }
  },
  mounted() {
    let myDiagram
    const self = this

    function init() {
      var $ = go.GraphObject.make // for conciseness in defining templates

      self.myDiagram = myDiagram = $(
        go.Diagram,
        "myDiagramDiv", // must name or refer to the DIV HTML element
        {
          initialContentAlignment: go.Spot.TopCenter,
          allowDrop: !!self.selectIVRId && self.hasAccess('crm_ivr_edit'), // 允许拖拽
          layout: $(go.LayeredDigraphLayout, {
            direction: 90,
            isOngoing: false
            // portSpot: go.Spot.BottomCenter
          }),
          "undoManager.isEnabled": true // enable undo & redo
        }
      )

      const zoomSlider = new ZoomSlider(myDiagram);

      // when the document is modified, enable the "Save" button
      myDiagram.addDiagramListener("Modified", function(e) {
        var button = document.getElementById("SaveButton")
        if (button) button.disabled = !myDiagram.isModified
      })

      // 将palette拖拽到diagram上时改变category
      myDiagram.addDiagramListener('ExternalObjectsDropped', function() {
        myDiagram.selection.each(async function(part) {
          if (part instanceof go.Node) {
            // myDiagram.model.setDataProperty(part.data, 'id', +new Date())
            const nodeType = (nodeTypes.find(nt => nt.text === part.data.text) || {}).maincategory || 'TIME'
            myDiagram.model.setCategoryForNodeData(
              part.data,
              nodeType
            )
            myDiagram.commitTransaction('changeCategory')

            if (nodeType === 'HANGUP') {
              // 挂断节点直接保存
              let { data } = await saveNode({
                ivrNavigationInfoId: self.selectIVRId,
                data: {
                  name: '挂断节点',
                  type: 'HANGUP', // 节点类型 START 开始节点 TIME 时间节点 AUDIO 语音节点 CHOOSE 选择节点 RECEPTION 接待节点 HANGUP 挂断节点
                  webData: part.data.loc
                }
              })

              part.data.id = data.data.id
              part.data.nodeName = data.data.name
              self.myDiagram.model.updateTargetBindings(part.data)
              self.myDiagram.model.setKeyForNodeData(part.data, data.data.id)

              self.$message.success('保存成功')
            } else {
              self.showModal(part.data, 'add')
            }
          }
        })
      })

      // 创建连线回调
      myDiagram.addDiagramListener("LinkDrawn", async function(e) {
        const linkData = e.subject.data
        const { to, from } = linkData

        // 如果给一个正在新增的节点创建连线，直接删除此连线
        if ((to === self.editData.key || from === self.editData.key) && !self.editData.id) {
          self.myDiagram.model.removeLinkData(linkData)
          self.$message.error('请先完成当前节点')
        } else {
          const nodeData = self.myDiagram.model.findNodeDataForKey(from)
          
          const { branchType, index } = self.getBranchTypeAndIndex(nodeData, linkData)
          try {
            await saveLink({
              sourceId: from,
              targetId: to,
              branchType,
              index
            })
            self.$message.success('创建连接成功')
            if (nodeData.type === 'SMS' && (to === self.editData.key || from === self.editData.key)) {
              nodeData.nextNodeId = to
              self.editData.nextNodeId = to
              self.myDiagram.model.updateTargetBindings(nodeData)
            }
          } catch(e) {
            // 如果接口调用失败就删除连线
            const model = self.myDiagram.model
            const index3 = model.linkDataArray.findIndex(item => {
              return item.__gohashid === linkData.__gohashid
            })

            model.removeLinkData(model.linkDataArray[index3])
          }
        }

        self.$emit('refreshLeftList')
      })

      //监听节点或线的删除事件
      myDiagram.addDiagramListener("SelectionDeleting", function(e) {
        e.subject.each(async function(n) {
          //n为删除节点或线的对象
          console.log(n.data)
          if (n.data.key === self.editData.key) {
            self.editData = {}
            self.operType = 'add'
            self.rightDrawerShow = false
            self.componentType = ''
            self.editData = {}
          }

          const model = self.myDiagram.model
          const delNodeByData = (nodeData) => {
            // 等接口调用成功手动删除节点
            const index2 = model.nodeDataArray.findIndex(item => item.key === nodeData.key)

            model.removeNodeData(model.nodeDataArray[index2])
            // 删除从此节点出发的连线，和连到此节点的连线
            function delLinks() {
              const index = model.linkDataArray.findIndex(link => link.from === nodeData.key || link.to === nodeData.key)
              if (index !== -1) {
                model.removeLinkData(model.linkDataArray[index])
                delLinks()
              }
            }
            delLinks()
          }

          // 如果是未保存过的节点, 不做处理，直接按默认逻辑删除
          if (n.data.category && !n.data.id) {
            // delNodeByData(n.data)
          }

          // 如果是已经保存过的节点
          if (n.data.id) {
            // 强制不删除
            e.cancel = true

            if (n.data.category === 'START') {
              self.$message.error('开始节点不允许删除')
              return
            }

            await delNode({
              id: n.data.id
            })

            // 等接口调用成功手动删除节点
            delNodeByData(n.data)
          }

          // 如果是连线
          if (n.data.to && n.data.from) {
            // 强制不删除
            e.cancel = true

            // 等接口调用成功手动删除节点
            const index1 = model.nodeDataArray.findIndex(item => item.key === n.data.from)

            const nodeData = model.nodeDataArray[index1]
            const linkData = n.data
            const { branchType, index } = self.getBranchTypeAndIndex(nodeData, linkData)

            await saveLink({
              sourceId: n.data.from,
              targetId: '',
              branchType,
              index
            })

            const index3 = model.linkDataArray.findIndex(item => {
              return item.__gohashid === n.data.__gohashid
            })

            model.removeLinkData(model.linkDataArray[index3])
          }

          self.$message.success('删除成功')
          self.$emit('refreshLeftList')
        })
      })

      function normalNode(type, ports = [], src, text) {
        const maxSize = type === 'Rectangle' ? 68 : 60
        const picSize = type === 'Rectangle' ? 28 : 20

        return $(go.Node, "Auto",
          self.nodeStyle(),
          // the outer shape for the node, surrounding the Table
          type === 'Rectangle' ? $(go.Shape, "RoundedRectangle",
            {
              strokeWidth: 1
            },
            /* reddish if highlighted, blue otherwise */
            new go.Binding("fill", "bg"),
            new go.Binding("stroke", "borderColor"),
            new go.Binding("desiredSize", '', ({ expand }) => {
              return expand ? new go.Size(70, 64) : new go.Size(41, 41)
            }),
            new go.Binding("parameter1", '', ({ expand }) => {
              return expand ? 2 : 5
            }),
            new go.Binding("parameter2", '', ({ expand }) => {
              return expand ? 2 : 5
            }),
            new go.Binding("margin", '', ({ expand }) => {
              return expand ? new go.Margin(0, 0, 10, 0) : new go.Margin(0, 0, 8, 0)
            })
          ) : $(go.Shape, "Circle",
            {
              strokeWidth: 2,
              desiredSize: new go.Size(60, 60),
              fill: '#fff',
              stroke: '#333333'
            }
          ),
          // a table to contain the different parts of the node
          $(go.Panel, "Table",
            { margin: 1, desiredSize: new go.Size(maxSize, NaN) },
            // the two TextBlocks in column 0 both stretch in width
            // but align on the left side
            $(go.RowColumnDefinition,
              {
                column: 0,
                stretch: go.GraphObject.Horizontal,
                alignment: go.Spot.Center
              }
            ),
            // the country flag
            $(go.Picture,
              {
                row: 0, column: 0,
                // margin: new go.Margin(13, 5, 7, 5),
                imageStretch: go.GraphObject.Uniform,
                // desiredSize: new go.Size(picSize, picSize)
              },
              new go.Binding("source", type === 'Rectangle' ? 'src' : '', v => src || v),
              new go.Binding("desiredSize", '', ({ expand }) => {
                return type === 'Rectangle' ? (expand ? new go.Size(picSize, picSize) : new go.Size(24, 24)) : new go.Size(picSize, picSize)
              }),
              new go.Binding("margin", '', ({ expand }) => {
                return type === 'Rectangle' ? (expand ? new go.Margin(13, 5, 7, 5) : 0) : new go.Margin(13, 5, 7, 5)
              })
            ),
            // the additional textual information
            $(go.TextBlock,
              {
                row: 1, column: 0,
                font: `700 12px ${self.fontFamily}`,
                textAlign: 'center',
                margin: new go.Margin(0, 0, 5, 0),
                wrap: go.TextBlock.None,
                desiredSize: new go.Size(maxSize, 20)
              },
              new go.Binding("text", "nodeName", v => v || '--'),
              new go.Binding("visible", "", ({ expand }) => !!expand)
            )
          ), ...ports  // end Table Panel
        )
      }

      function expandableNode(borderColor, bgColor, pic, text, columnSpan, itemTemplate, secondColumn, needBottomPort) {
        itemTemplate = itemTemplate || $(
          go.Panel,
          'Auto',
          {
            // height: 52,
            fromSpot: go.Spot.Bottom,
            toSpot: go.Spot.Bottom,
            fromLinkable: true,
            toLinkableSelfNode: true,
            fromLinkableSelfNode: true,
            // toLinkable: false,
            toMaxLinks: 1,
            fromMaxLinks: 1,
            cursor: 'pointer',
            alignment: go.Spot.Center,
            row: 0,
            mouseEnter: function(e, port) {  // the PORT argument will be this Shape
              // if (!self.myDiagram.model.linkDataArray.find(link => link.frompid && link.frompid === port.data.id)) {
              port.background = "rgba(255,0,255,0.5)"
              // }
            },
            mouseLeave: function(e, port) {
              port.background = "transparent"
            }
          },
          new go.Binding('column', 'index', v => v),
          new go.Binding('portId', 'id', v => v.toString()),
          $(go.TextBlock,  // earlyFinish
            new go.Binding("text", 'text', v => v),
            { row: 1, column: 0, textAlign: "center", height: 52 },
            new go.Binding("verticalAlignment", '', ({ index, type }) => {
              return go.Spot.Center
            })
          )
        )
        return $(
          go.Node,
          "Vertical",
          self.nodeStyle(true),
          new go.Binding('shadowVisible', '', ({ isError, isHovered }) => !!isError || !!isHovered),
          new go.Binding('shadowBlur', '', ({ isError, isHovered }) => !!isError ? 10 : 4),
          new go.Binding('shadowColor', '', ({ isError, isHovered }) => !!isError ? 'rgba(255, 0, 0, 0.5)' : '#BABABA'),
          new go.Binding('shadowOffset', '', ({ isError, isHovered }) => !!isError ? new go.Point(0, 0) : new go.Point(2, 2)),
          $(
            go.Panel,
            "Auto",
            $(go.Shape, "Rectangle",
              {
                strokeWidth: 2,
                height: 92,
                fill: '#fff',
                stroke: borderColor,
                alignment: go.Spot.Left
              },
            ),
            $(
              go.Panel,
              "Table",
              {
                height: 90,
                margin: 1,
                defaultAlignment: go.Spot.Left,
                defaultColumnSeparatorStroke: borderColor,
                defaultColumnSeparatorStrokeWidth: 0,
                defaultStretch: go.GraphObject.Horizontal
              },
              $(go.RowColumnDefinition, { row: 0, background: bgColor, height: 38, }),
              $(go.RowColumnDefinition, { row: 1, separatorStroke: borderColor, separatorStrokeWidth: 2 }),

              commonHeader(pic, text, columnSpan),

              secondColumn || $(
                go.Panel,
                'Table',
                { 
                  height: 52,
                  alignment: go.Spot.BottomCenter,// 定义用户响应类型port
                  defaultAlignment: go.Spot.Left,
                  defaultColumnSeparatorStroke: borderColor,
                  defaultColumnSeparatorStrokeWidth: 2,
                  defaultStretch: go.GraphObject.Horizontal,
                  defaultSeparatorPadding: new go.Margin(0, 10)
                },
                new go.Binding('itemArray', 'intentBranches'),
                {
                  row: 1,
                  column: 0,
                  itemTemplate: itemTemplate
                }
              )
            ),
            makePort("T", go.Spot.Top, false, true),
            needBottomPort ? makePort("B", go.Spot.Bottom, true, false) : [],
            $("TreeExpanderButton",
              {
                margin: new go.Margin(80, 0, 0, 0),
                alignment: go.Spot.Bottom,
                'ButtonBorder.fill': 'transparent',
                'ButtonBorder.stroke': '#000',
                _buttonFillOver: 'transparent',
                _buttonStrokeOver: '#000',
                mouseEnter: function(e, button) {
                  // console.log(button)
                  // console.log(button['ButtonBorder.stroke'])
                  // button.visible = true
                  // button.shadowVisible = true
                },
                mouseLeave: function(e, button) {
                  // button.shadowVisible = false
                }
              },
              new go.Binding('visible', '', function({ btnVisible }) {
                return !!btnVisible
              })
            )
          )
        )
      }

      function commonHeader(src, text, columnSpan, ml) {
        return $(go.Panel, "Horizontal",
          {
            row: 0, column: 0 , columnSpan,
            minSize: new go.Size(100, NaN)
          },
          $(go.Picture,
            {
              margin: new go.Margin(0, 0, 0, ml || 8),
              imageStretch: go.GraphObject.Uniform,
              desiredSize: new go.Size(22, 22)
            },
            new go.Binding("source", '', function(v) { return src })
          ),
          $(go.TextBlock, self.textStyle(),  // the name
            {
              margin: new go.Margin(0, 6, 0, 6),
              isMultiline: false
              // ,
              // desiredSize: new go.Size(80, 16)
            },
            new go.Binding("text", 'nodeName', function(v) {return v})
          )
        )
      }

      // helper用来创建port，即节点上可接收连线的端口
      function makePort(name, spot, output, input, height) {
        var horizontal = spot.equals(go.Spot.Top) || spot.equals(go.Spot.Bottom);
        // the port is basically just a transparent rectangle that stretches along the side of the node,
        // and becomes colored when the mouse passes over it
        return $(go.Shape,
          {
            fill: "transparent",  // changed to a color in the mouseEnter event handler
            strokeWidth: 0,  // no stroke
            width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
            height: typeof height === 'undefined' ? (!horizontal ? NaN : 8) : height,  // if not stretching vertically, just 8 tall
            alignment: spot,  // align the port on the main Shape
            stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
            portId: name,  // declare this object to be a "port"
            fromSpot: spot,  // declare where links may connect at this port
            fromLinkable: output,  // declare whether the user may draw links from here
            toSpot: spot,  // declare where links may connect at this port
            toLinkable: input,  // declare whether the user may draw links to here
            toLinkableSelfNode: true,
            fromLinkableSelfNode: true,
            fromMaxLinks: 1,
            cursor: "pointer",  // show a different cursor to indicate potential link point
            mouseEnter: function(e, port) {  // the PORT argument will be this Shape
              if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)";
            },
            mouseLeave: function(e, port) {
              port.fill = "transparent";
            }
          });
      }

      // 时间节点模板
      const timeBorderColor = '#A1D7A9'
      myDiagram.nodeTemplateMap.add(
        "TIME",
        expandableNode('#A1D7A9', '#f4faee', '/static/img/time.png', '时间节点', 100, $(
          go.Panel,
          'Vertical',
          {
            fromSpot: go.Spot.Bottom,
            toSpot: go.Spot.Bottom,
            fromLinkable: true,
            toLinkable: false,
            toMaxLinks: 1,
            fromMaxLinks: 1,
            cursor: 'pointer',
            alignment: go.Spot.Center,
            row: 0,
            mouseEnter: function(e, port) {  // the PORT argument will be this Shape
              port.background = "rgba(255,0,255,0.5)"
            },
            mouseLeave: function(e, port) {
              port.background = "transparent"
            }
          },
          new go.Binding('column', '', ({ index }) => index),

          new go.Binding('portId', 'index', v => v.toString()),
          $(go.TextBlock, self.textStyle(),  // the name
            {
              isMultiline: false
            },
            new go.Binding("text", '', ({ index, type }) => {
              return type === 'otherTime' ? '其他时间' : '工作时间' + (index + 1)
            }),
            new go.Binding("height", '', ({ index, type }) => {
              return type !== 'otherTime' ? 26 : 52
            }),
            new go.Binding("verticalAlignment", '', ({ index, type }) => {
              return type !== 'otherTime' ? go.Spot.BottomCenter : go.Spot.Center
            })
          ),
          $(go.TextBlock, self.textStyle(),  // the name
            {
              isMultiline: false,
              height: 26
            },
            new go.Binding("text", '', ({ startTime, endTime }) => {
              if (endTime === '23:59') {
                endTime = '24:00'
              }
              return startTime + '-' + endTime
            }),
            new go.Binding('visible', '', function({ index, type }) {
              return type !== 'otherTime'
            })
          )
        ))
      )

      // 选择节点模板
      myDiagram.nodeTemplateMap.add(
        "CHOOSE",
        expandableNode('#B6A2E0', '#eeeffa', '/static/img/select.png', '选择节点1', 100)
      )

      // 接待节点模板
      myDiagram.nodeTemplateMap.add(
        "RECEPTION",
        expandableNode('#C67FD6', '#f3eefa', '/static/img/jiedai.png', '接待节点1', 100, $(
          go.Panel,
          'Vertical',
          {
            fromSpot: go.Spot.Bottom,
            toSpot: go.Spot.Bottom,
            fromLinkable: true,
            toLinkable: false,
            toMaxLinks: 1,
            fromMaxLinks: 1,
            cursor: 'pointer',
            alignment: go.Spot.Center,
            row: 0,
            mouseEnter: function(e, port) {  // the PORT argument will be this Shape
              const { id, isReturn, receptionType } = port.data
              if (receptionType === 'AI' && isReturn) {
                port.background = "rgba(255,0,255,0.5)"
              }
            },
            mouseLeave: function(e, port) {
              port.background = "transparent"
            }
          },
          new go.Binding('column', '', ({ index }) => index),
          new go.Binding('fromMaxLinks', '', ({ id, isReturn, receptionType }) => {
            if (receptionType === 'AI' && isReturn) {
              return 1
            } else {
              return 0
            }
          }),
          new go.Binding('portId', '', ({ id, isReturn, receptionType }) => {
            return id.toString()
          }),
          $(go.TextBlock, self.textStyle(),  // the name
            {
              isMultiline: false,
              margin: new go.Margin(0, 0, 3, 0)
            },
            new go.Binding("text", '', ({ texts }) => {
              return texts[0]
            }),
            new go.Binding("height", '', ({ texts }) => {
              return texts[1] ? 26 : 52
            }),
            new go.Binding("verticalAlignment", '', ({ texts }) => {
              return texts[1] ? go.Spot.BottomCenter : go.Spot.Center
            })
          ),
          $(go.TextBlock, self.textStyle(),  // the name
            {
              isMultiline: false,
              height: 26
            },
            new go.Binding("text", '', ({ texts }) => texts[1]),
            new go.Binding('visible', '', function({ texts }) {
              return !!texts[1]
            })
          )
        ))
      )

      // 挂断节点模板
      const HangupBorderColor = '#EECDCF'
      myDiagram.nodeTemplateMap.add(
        "HANGUP",
        $(
          go.Node,
          "Auto",
          self.nodeStyle(),
          $(go.Shape, "Rectangle",
            {
              strokeWidth: 2,
              desiredSize: new go.Size(123, 40),
              fill: '#fff',
              stroke: HangupBorderColor,
              alignment: go.Spot.Left
            }
          ),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(
            go.Panel,
            "Table",
            {
              desiredSize: new go.Size(121, 38),
              defaultAlignment: go.Spot.Left,
              defaultColumnSeparatorStroke: HangupBorderColor,
              defaultColumnSeparatorStrokeWidth: 2,
              defaultStretch: go.GraphObject.Horizontal
            },
            $(go.RowColumnDefinition, { row: 0, background: "#faf3f3", coversSeparators: true, height: 38 }),

            commonHeader('/static/img/hungup.png', '挂断节点', 100, 12)
          ),
          makePort("T", go.Spot.Top, go.Spot.Top, true, false)
        )
      )

      // 语音节点模板
      myDiagram.nodeTemplateMap.add(
        "AUDIO",
        expandableNode('#C1D9F8', '#eef5fa', '/static/img/yuyin.png', '语音节点1', 1, undefined, $(
          go.Panel, "Horizontal",
          {
            row: 1, column: 0, height: 52
          },
          $(go.TextBlock,
            new go.Binding("text", '', function({ audio }) {
              if (audio.audioType === 'MAN_MADE') {
                return audio.audioName || '--'
              } else {
                return !!audio.audioText ? audio.audioName || '--' : ''
              }
            }),
            { textAlign: "center",  margin: new go.Margin(0, 0, 0, 5) }
          ),
          $(
            'Button', // 播放录音
            {
              // row: 0,
              // column: 6,
              cursor: 'pointer',
              // margin: new go.Margin(10, 0, 0, 2),
              // alignment: go.Spot.TopRight,
              'ButtonBorder.fill': 'transparent',
              'ButtonBorder.stroke': 'transparent',
              _buttonFillOver: 'transparent',
              _buttonStrokeOver: 'transparent'
            },
            $(go.Picture,
              {
                margin: new go.Margin(-2, 0, 0, 8),
                imageStretch: go.GraphObject.Uniform,
                desiredSize: new go.Size(18, 18)
              },
              new go.Binding("source", 'audio', function(v) {
                if (v.audioType === 'MAN_MADE') {
                  return !!v.audioUrls.length ? '/static/img/bofang.png' : ''
                } else {
                  return !!v.audioText ? '/static/img/bofang.png' : ''
                }
              })
            ),
            { click: self.playAudio },
            new go.Binding('visible', 'audio', function(v) {
              if (v.audioType === 'MAN_MADE') {
                return !!v.audioUrls.length
              } else {
                return !!v.audioText
              }
            })
          )
        ), true)
      )

      // 短信节点模板
      myDiagram.nodeTemplateMap.add(
        "SMS",
        expandableNode('#78CBC7', '#f0fbfc', '/static/img/yuyin.png', '短信节点1', 1, undefined, $(
          go.Panel, "Horizontal",
          {
            row: 1, column: 0, height: 52
          },
          $(go.TextBlock,
            new go.Binding("text", '', function({ smsTemplateId }) {
              const item = self.smsList.find(zz => zz.smsTemplateId === smsTemplateId)
              if (item) {
                return item.name || '--'
              } else {
                return '--'
              }
            }),
            { textAlign: "center",  margin: new go.Margin(0, 0, 0, 5) }
          )
        ), true)
      )

      // 添加开始节点模板
      myDiagram.nodeTemplateMap.add(
        "START",
        normalNode('Circle', [
          makePort("B", go.Spot.Bottom, true, false)
        ], '/static/img/start.png', '开始')
      )

      // 左栏palette使用的node template
      myDiagram.nodeTemplateMap.add(
        'nodePalette',
        normalNode('Rectangle')
      )

      // replace the default Link template in the linkTemplateMap
      myDiagram.linkTemplate = 
      $(
        go.Link, // the whole link panel
        {
          // adjusting: go.Link.Stretch,
          routing: go.Link.AvoidsNodes,
          // curve: go.Link.JumpOver,
          corner: 5,
          toShortLength: 4,
          relinkableFrom: false,
          relinkableTo: false,
          reshapable: true,
          resegmentable: true,
          // mouse-overs subtly highlight links:
          mouseEnter: function(e, link) {
            link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"
          },
          mouseLeave: function(e, link) {
            link.findObject("HIGHLIGHT").stroke = "transparent"
          },
          selectionAdorned: false
        },
        new go.Binding("points").makeTwoWay(),
        $(
          go.Shape, // the highlight shape, normally transparent
          {
            isPanelMain: true,
            strokeWidth: 8,
            stroke: "transparent",
            name: "HIGHLIGHT"
          }
        ),
        $(
          go.Shape, // the link path shape
          {isPanelMain: true, stroke: "#333", strokeWidth: 2},
          new go.Binding("stroke", "isSelected", function(sel) {
            return sel ? "dodgerblue" : "#333"
          }).ofObject()
        ),
        $(
          go.Shape, // the arrowhead
          {toArrow: "standard", strokeWidth: 0, fill: "#333"}
        ),
        $(
          go.Panel,
          "Auto", // the link label, normally not visible
          {
            visible: false,
            name: "LABEL",
            segmentIndex: 2,
            segmentFraction: 0.5
          },
          new go.Binding("visible", "visible").makeTwoWay(),
          $(
            go.Shape,
            "RoundedRectangle", // the label shape
            {fill: "#F8F8F8", strokeWidth: 0}
          ),
          $(
            go.TextBlock,
            "Yes", // the label
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "#333333",
              editable: true
            },
            new go.Binding("text").makeTwoWay()
          )
        )
      )

      // Make link labels visible if coming out of a "conditional" node.
      // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
      function showLinkLabel(e) {
        var label = e.subject.findObject("LABEL")
        if (label !== null)
          label.visible = e.subject.fromNode.data.category === "Conditional"
      }

      // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
      myDiagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal
      myDiagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal

      // 初始化左侧节点库栏
      self.myPalette = $(
        go.Palette,
        "myPaletteDiv", // must name or refer to the DIV HTML element
        {
          nodeTemplateMap: myDiagram.nodeTemplateMap, // share the templates used by myDiagram
          model: new go.GraphLinksModel(nodeTypes)
        }
      )
    } // end init

    this.getSmsTemplateList()
    init()
    // 初始化画布数据
    self.initModelData()
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/variables.scss';
@import './components/form.scss';
$--color-borer: #d8d9de;
$-bg: #fbfbfb;

.page-container {
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  > .el-button {
    width: 64px;
    border-radius: 2px;
    margin: 10px 0;
    align-self: flex-end;
  }
}

.diagram-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  font-family: 'PingFangSC-Regular', 'SF Pro SC', 'SF Pro Display',
      'SF Pro Icons', 'PingFang SC', 'Helvetica Neue', 'Helvetica', 'Arial',
      sans-serif !important;
  * {
    font-weight: 700;
  }
  /deep/ canvas {
    outline: none;
  }
  /deep/ .zoomSlider {
    display: flex;
    align-items: center;
    top: auto !important;
    left: auto !important;
    bottom: 18px;
    right: 26px;
    width: 352px !important;
    height: 42px !important;
    background: #fff;
    border-radius: 2px;
    box-shadow:0px 2px 4px 0px rgba(213,206,206,0.5);
    .zoomRangeContainer, button {
      display: inline-block;
    }
    .zoomRangeContainer {
      flex: 1;
      display: flex;
      align-items: center;
      input {
        width: 100% !important;
      }
      /*清除原有样式*/
      input[type=range] {
        -webkit-appearance: none;
        // width: 16vw;
      }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
      }
      /*设置滑动条的样式*/
      input[type=range]::-webkit-slider-runnable-track {
        height: 2px;
        background: $--border-color-base;
      }
      input[type=range]::-moz-range-track {
        height: 2px;
        background: $--border-color-base;
      }
      /*去除获取焦点时的边框*/ 
      input[type=range]:focus {
        outline: none;
      }
      /*设置滑块样式*/
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 14px;
        width: 14px;
        border-radius: 50%;
        background: $--color-primary;
        margin-top: -6px; 
      } 
      input[type=range]::-moz-range-thumb  {
        -webkit-appearance: none;
        height: 14px;
        width: 14px;
        border-radius: 50%;
        background: $--color-primary;
        margin-top: -6px; 
      }
    }
    button {
      background: transparent;
      border: none;
      cursor: pointer;
      outline: none;
      i {
        font-weight: bold;
        font-size: 16px;
      }
      .icon-tianjiajiahaowubiankuang {
        position: relative;
        top: 1px;
      }
    }
    #zoomSliderIn {
      margin: 0 8px 0 10px;
    }
    #zoomSliderOut {
      margin: 0 14px 0 12px;
    }
    #zoomSliderNumber {
      width: 40px;
      margin-right: 18px;
      font-size: 14px;
      color: $--color-text-primary;
    }
  }
  .left-spin, .right-spin {
    position: absolute;
    width: 13px;
    height: 102px;
    line-height: 102px;
    background: $-bg;
    border-radius: 0 16px 16px 0;
    border: 1px solid $--color-borer;
    cursor: pointer;
    z-index: 1000;
    top: 327px;
    color: $--color-text-regular;
    &:hover {
      color: $--color-primary;
    }
  }
  .left-spin {
    border-left: none;
    right: -13px;
  }
  .right-spin {
    left: -13px;
    border-radius: 16px 0px 0px 16px;
  }
  .palette-container {
    display: flex;
    flex-direction: column;
    background-color: $-bg;
    border: solid 1px $--color-borer;
    text-align: center;
    transition: width .7s;
    .slider {
      width: 102px;
      line-height: 23px;
      border-bottom: solid 1px $--color-borer;
      cursor: pointer;
      color: $--color-text-regular;
      &:hover {
        color: $--color-primary;
      }
    }
    i {
      transition: all .7s;
      transform: rotate(0);
    }
    .rotate {
      transform: rotate(180deg);
    }
    .title {
      width: 102px;
      font-size: 14px;
      color: $--color-text-primary;
      line-height: 20px;
      margin-top: 18px;
      margin-bottom: 15px;
    }
    #myPaletteDiv {
      flex: 1;
      width: 102px;
    }
  }
  #myDiagramDiv  {
    position: relative;
    z-index: 200;
    flex: 1;
    background: $bodyBg;
    border: solid 1px $--color-borer;
    border-left: none;
  }
}
</style>

