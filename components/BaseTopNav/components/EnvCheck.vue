<template>
     <el-popover
        @show="open"
        @after-leave="close"
        placement="bottom"
        :value="visible"
        height="580"
        width="660">
        <div class="env-content">
            <div class="title-container">
                <span class="title ml15">{{checking?"环境检测":"环境检测结果"}}</span>
                <i class="el-icon-close" @click="close">&nbsp;</i>
            </div>
            <div class="outer-container">
                <!-- <div v-show="checking" class="checking">
                    <img style="height:55px;width:55px;" src="/static/img/env_checking.png" alt="">
                    <p class="">正在检测设备</p>
                </div> -->
                <div v-loading="checking" class="result">
                    <div class="item">
                        <div class="title">
                            <p>浏览器检测</p>
                        </div>
                        <div class="detail flex">
                            <p v-if="browser.isChrome && browser.version >= 70">
                                <i class="el-icon-success"></i>浏览器符合要求
                            </p>
                            <template v-else>
                                <i class="el-icon-error"></i>
                                <div class="inline">
                                    <p>浏览器不符合要求，请使用70版本以上的谷歌浏览器</p>
                                    <a href="https://www.google.cn/chrome/index.html" about="_blank" class="download-browser">下载谷歌浏览器</a>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="item">
                        <div class="title">
                            <p>网络检测</p>
                        </div>
                        <div class="detail flex">
                            <template v-if="network.isConnected && network.speed >= 200">
                                <i class="el-icon-success"></i>
                                <div class="inline">
                                    <p>网络正常</p>
                                    <p>当前网速：{{network.speed}}kb/s</p>
                                </div>
                            </template>
                            <template v-else-if="network.isConnected && network.speed < 200">
                                <i class="el-icon-warning"></i>
                                <div class="inline">
                                    <p>网速过慢，低于标准值200kb/s</p>
                                    <p>当前网速：{{network.speed}}kb/s</p>
                                </div>
                            </template>
                            <template v-else>
                                <i class="el-icon-error"></i>
                                <div class="inline">
                                    <p>网络异常，请检查网络连接情况</p>
                                    <p class="">当前网速：0kb/s</p>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="item">
                        <div class="title">
                            <p>语音设备检测</p>
                        </div>
                        <div class="detail">
                            <!-- <el-alert
                                title="若您对着麦克风讲话时，可以听到自己声音的同时也能听到音乐播放声，则设备正常；如果听不到，请检查您的语音设备。"
                                type="warning"
                                class="alert"
                                :closable="false"
                                show-icon>
                            </el-alert> -->
                            <div class="tips">
                                <i class="el-icon-warning"></i>
                                <span>若您对着麦克风讲话时，可以听到自己声音的同时也能听到音乐播放声，则设备正常；如果听不到，请检查您的语音设备。</span>
                            </div>
                            <el-form>
                                <el-form-item label="扬声器">
                                    <el-select
                                    class="select"
                                    placeholder="请选择扬声器"
                                    @change="setMusicSkin(speaker.selectedID)"
                                    filterable
                                    v-model="speaker.selectedID"
                                    >
                                    <el-option
                                        v-for="(item, index) in speaker.tracks"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.id"

                                    ></el-option>
                                    </el-select>
                                </el-form-item>
                                <div class="errMsg" v-if="speaker.errMsg!==undefined" style="">
                                    <span  v-if="speaker.errMsg=='NotFoundError'">未检测到扬声器，请检查您的设备</span>
                                    <template v-else>
                                        检测到扬声器权限未开启。
                                        <el-popover
                                            trigger="hover"
                                            placement="top">
                                            <img src="/static/img/env_tip.png" alt="">
                                            <span class="open" slot="reference">如何开启</span>
                                        </el-popover>
                                    </template>
                                </div>
                                <el-form-item label="麦克风">
                                    <el-select
                                    class="select"
                                    placeholder="请选择麦克风"
                                    filterable
                                    v-model="microphone.selectedID"
                                    @change="setMircophoneTrack(mircophone.selectedID)"
                                    >
                                    <el-option
                                        v-for="(item, index) in microphone.tracks"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.id"
                                    ></el-option>
                                    </el-select>
                                </el-form-item>
                                <div class="errMsg" v-if="microphone.errMsg!==undefined" style="">
                                    <span v-if="microphone.errMsg=='NotFoundError'">未检测到麦克风，请检查您的设备</span>
                                    <template v-else>
                                        检测到麦克风权限未开启。
                                        <el-popover
                                            trigger="hover"
                                            placement="bottom">
                                            <img src="/static/img/env_tip.png" alt="">
                                            <span class="open" slot="reference">如何开启</span>
                                        </el-popover>
                                    </template>

                                </div>
                            </el-form>
                            <div class="music">
                                <span>音乐播放</span>
                                <YiwiseAudio
                                    style="flex:1;"
                                    :loop="true"
                                    :download="false"
                                    src="http://ai-call-platform.oss-cn-hangzhou.aliyuncs.com/common/audio/ponce-preludio-in-e-major.wav"
                                    :controls="true"
                                    ref="music"
                                >
                                </YiwiseAudio>
                                <!-- <audio ref="music" loop="" controls=""  src="http://ai-call-platform.oss-cn-hangzhou.aliyuncs.com/common/audio/ponce-preludio-in-e-major.wav"></audio> -->
                            </div>
                        </div>
                    </div>
                </div>
                <div v-show="!checking" class="footer">
                    <el-button type="primary" @click="recheck">重新检测</el-button>
                    <el-button type="primary" @click="close" plain>确定</el-button>
                </div>
            </div>
            <audio ref="voice"></audio>
        </div>
        <i slot="reference" class="iconfont icon-huanjingjiancex1 cp iconcont-popover"></i>
      </el-popover>
</template>
<script>
import YiwiseAudio from '../../YiwiseAudio'
const imageSrc = "https://www.baidu.com/img/bd_logo1.png?id="
export default {
    name:'EnvCheck',
    components: {
        YiwiseAudio
    },
    props:{
        visible: {
            type: Boolean,
            default: false
        }
    },
    data(){
        return {
            mediaDevices: {
                getUserMedia:()=>{}
            },
            // visible:false,
            browser:{
                isChecking:false,
                isChrome:undefined,
                version:undefined
            },
            network:{
                isChecking:false,
                isConnected:undefined,
                // fileSrc: "",
                speed: 0
            },
            speaker:{
                isChecking:false,
                isOk:undefined,
                errMsg:undefined,
                tracks:[],
                selectedID:undefined
            },
            microphone:{
                isChecking:false,
                isOk:undefined,
                errMsg:undefined,
                tracks:[],
                selectedID:undefined,
                audioTracks:undefined
            },
            voice: ''
        }
    },
    methods:{
       checkNetwork(){
            this.network.isChecking = true
            if (this.network.isConnected = navigator.onLine){
                let startTime
                this.network.fileSrc = imageSrc +  Math.random()
                let img = new Image()
                img.src = imageSrc +  Math.random()
                this.$nextTick(() => {
                    startTime = Date.now()
                    img.onload = ()=>{
                        const endTime = Date.now(), fileSize = 8.0  //KB
                        // console.log(endTime-startTime)
                        this.network.speed = Math.floor((fileSize * 1000) / ( endTime - startTime))
                        this.network.isChecking = false
                    }
                })
                // this.network.speed = navigator.connection.downlink * 1024 /8
                // this.network.isChecking = false
            }
            this.network.isChecking = false
        },
        checkBrowser(){
            this.browser.isChecking = true
            const reChorme = new RegExp("Chrome/(\\d+\\.\\d+(?:\\.\\d+\\.\\d+))?")
            this.browser.isChrome = reChorme.test(window.navigator.userAgent)
            if (this.browser.isChrome){
                this.browser.version = parseFloat(RegExp['$1'])
            }
            this.browser.isChecking = false
        },
        checkSpeaker(){
            this.speaker.isChecking = true
            this.mediaDevices.getUserMedia({
                audio:true,
                video:false
            },(stream)=>{
                navigator.mediaDevices.enumerateDevices().then((devices)=> {
                    for (const device of devices){
                        if (device.kind == 'audiooutput')
                            this.speaker.tracks.push({
                                id:device.deviceId,
                                label:device.label
                            })
                    };
                    this.$nextTick(() => {
                        if (this.$refs.music.$refs.audioTag.sinkId === "") this.setMusicSkin("default")
                        else this.speaker.selectedID = this.$refs.music.$refs.audioTag.sinkId
                    })
                })
                .catch((err)=> {
                    console.log(err.name + ": " + err.message);
                })
                .finally(()=>this.speaker.isChecking = false)
            },(err)=>{
                this.speaker.isOk = false
                this.speaker.errMsg = err.name
                this.speaker.isChecking = false
            })
        },
        setMusicSkin(skinId){
            this.$refs.music.$refs.audioTag.setSinkId(skinId).then(()=>this.speaker.selectedID = this.$refs.music.$refs.audioTag.sinkId)
            .catch((err)=> {
                    console.log(err.name + ": " + err.message);
                })
        },
        checkMicrophone(){
            this.microphone.isChecking = true
            this.mediaDevices.getUserMedia({
                audio:true,
                video:false
            },(stream)=>{
                this.$refs.voice.srcObject = stream
                this.$refs.voice.play()
                this.microphone.isOk = true
                let tracks = stream.getAudioTracks()
                this.microphone.audioTracks = tracks
                tracks.forEach(item=>this.microphone.tracks.push({
                    label:item.label,
                    enabled:item.enabled,
                    muted:item.muted,
                    readyState:item.readyState,
                    id:item.id
                    }
                ))
                if ( tracks.length > 0 ) this.microphone.selectedID = tracks[0].id
                this.microphone.isChecking = false
            },(err)=>{
                this.microphone.isOk = false
                this.microphone.errMsg = err.name
                this.microphone.isChecking = false
            })
        },
        setMircophoneTrack(trackID){
            this.mediaDevices.getUserMedia({
                audio:{
                    deviceId:{
                        exact:trackID
                    }
                },
                video:false
            },(stream)=>{
                this.$refs.voice.srcObject = stream
                this.$refs.voice.play()
                this.microphone.selectedID = trackID
            },(err)=>{
                this.microphone.isOk = false
                this.microphone.errMsg = err.name
            })
        },
        checkAll(){
            if (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia){
                    this.mediaDevices = navigator
                }
            else if (navigator.mediaDevices.getUserMedia)
                this.mediaDevices = navigator.mediaDevices
            this.checkNetwork()
            this.checkBrowser()
            this.checkMicrophone()
            this.checkSpeaker()
            this.$refs.music.play()
        },
        recheck(){
            this.clearAll()
            this.checkAll()
        },
        close(){
            // this.visible = false
            this.clearAll()
            this.$emit('closeEnv')
        },
        open(){
            console.log('open')
            this.checkAll()
            this.$emit('openEnv')
        },
        clearAll(){
            // this.checking = false
            this.browser =  {
                isChecking:false,
                isChrome:undefined,
                version:undefined
            }
            this.network = {
                isChecking:false,
                isConnected:undefined,
                speed: 0
            }
            this.speaker = {
                isChecking:false,
                isOk:undefined,
                errMsg:undefined,
                tracks:[],
                selectedID:undefined
            },
            this.microphone={
                isChecking:false,
                isOk:undefined,
                errMsg:undefined,
                tracks:[],
                selectedID:undefined
            }

            this.$refs.music.pause()
            this.$refs.voice.pause()
        }
    },
    computed:{
        checking(){
            return this.browser.isChecking || this.network.isChecking || this.microphone.isChecking || this.speaker.isChecking
        }
    },
    created:()=>{
      if (process.client) {
        window.AudioContext = window.AudioContext ||
                              window.webkitAudioContext;
      }
    }
}
</script>
<style lang='scss' scoped>
@import '~@aicc/styles/variables.scss';
@import '~@aicc/styles/mixin.scss';
.env-content{
    margin-bottom: -10px;
    min-height: 400px;
    background: #fff;
    bottom: 0;
    right: 0;
    font-size:12px;
    .title-container{
        width:660px;
        height:45px;
        line-height: 45px;
        font-weight:500;
        color:rgba(51,51,51,1);
        background:rgba(247,247,247,1);
        border-radius:6px 6px 0px 0px;
        border:1px solid rgba(221,221,221,1);
        filter:blur(0px);
        margin: -12px -12px 12px;
        display: flex;
        justify-content: space-between;
        i{
            position: relative;
            top:13px;
            right: 15px;
        }
    }
    .outer-container{
        margin: -12px -12px 12px;
        .checking{
            margin-top: 160px;
            text-align: center;
        }
        .result>.item{
            display: flex;
            padding: 18px 0;
            border-bottom: 1px solid rgba(240,240,240,1);
            .title{
                // display: inline-box;
                width: 140px;
                text-align: right;
                font-family:PingFangSC-Regular;
                font-weight:400;
                color:rgba(102,102,102,1);
                // line-height:17px;
                margin-right: 17px;
            }
            .flex{
                display: flex;
                align-items: baseline;
                i{
                    margin-right: 10px;
                }
            }
            .detail{
                flex:1;
                margin-right: 85px;
                .select{
                    width: 85%;
                }
                .tips{
                    display: flex;
                    align-items: baseline;
                    padding: 10px 8px 12px 14px;
                    background:rgba(255,251,227,1);
                    border-radius:2px;
                    margin-bottom: 20px;
                    i{
                        margin-right: 7px;
                    }
                    span{
                        font-size:12px;
                        font-family:PingFangSC-Regular;
                        font-weight:400;
                        color:rgba(102,102,102,1);
                        line-height:18px;
                    }
                }
                .errMsg{
                    font-weight:400;
                    color:rgba(224,59,47,1);
                    line-height:20px;
                    position:relative;
                    top:-16px;
                    padding-left:48px;
                    .open{
                        color:#1890FF;
                    }
                }
                .music{
                    display: flex;
                    align-items: center;
                    span{
                        margin-right: 12px;
                    }
                    audio{
                        height: 38px;
                    }
                }
                .el-icon-success:before{
                    color:#18B41E;
                }
                .el-icon-warning:before{
                    color:#ECB845;
                }
                .el-icon-error:before{
                    color:#E03B2F;
                }
            }
        }
        .footer{
            padding-top: 14px;
            display: flex;
            justify-content: flex-end;
            >button{
                margin-right: 16px;
            }
        }
    }
}
</style>

