<template>
  <div class="wrapper">
    <div class="home" v-if="!gameStart">
      <div class="img">
        <img src="../assets/images/img_home.png" alt="">
        <p class="playBtn" @click="goDIY" v-audio><img src="../assets/images/btn_start.png" alt=""></p>
      </div>
    </div>
    <div class="game">
      <div class="main play" v-show="!gameOver">
        <canvas id="cropperCanvas" disable-scroll="true"></canvas>
        <canvas id="cameraCanvas" disable-scroll="true"></canvas>
        <canvas id="gameCanvas" disable-scroll="true" @touchstart="touchstart" @touchmove="touchmove"></canvas>
        <div class="topbg">
          <ol class="stepNav">
            <li v-for="(item,index) in stepNav" :key="index" :class="'step'+(index+1)" v-if="step===index+1"></li>
          </ol>
        </div>
        <div class="bottom">
          <div class="stepTitle"><span>{{step}}</span><em>{{stepTitles[step-1]}}</em></div>
          <div class="menu">
            <div class="menuInn swiper-container">
              <ul class="dtList swiper-wrapper" v-if="step===1">
                <li class="swiper-slide" v-for="(item,index) in dtBtns" :key="index" @click="selectImg(index)" v-audio><img :src="item" alt=""></li>
              </ul>
              <ul class="jlList swiper-wrapper" v-if="step===2">
                <li class="swiper-slide" v-for="(item,index) in jlBtns" :key="index" @click="selectImg(index)" v-audio><img :src="item" alt=""></li>
              </ul>
              <ul class="qiuList swiper-wrapper" v-if="step===3">
                <li class="swiper-slide" v-for="(item,index) in qiuBtns" :key="index" @click="selectImg2(index,'qiu',2)" v-audio><img :src="item" alt=""></li>
              </ul>
              <ul class="plList swiper-wrapper" v-if="step===4">
                <li class="swiper-slide" v-for="(item,index) in ljBtns" :key="index" @click="selectImg2(index,'lj',3)" v-audio><img :src="item" alt=""></li>
              </ul>
              <ul class="plList swiper-wrapper" v-if="step===5">
                <li class="swiper-slide" v-for="(item,index) in plBtns" :key="index" @click="selectImg2(index,'pl',6)" v-audio><img :src="item" alt=""></li>
              </ul>
            </div>
          </div>
          <div class="btns">
            <p class="back" @click="back" v-audio>BACK</p>
            <p class="next" @click="next" v-audio>
              <span v-if="step===5"><input id="upload" type="file" accept="image/*" capture="camera" @change="getCameraFile">与冰淇淋合影</span>
              <span v-else>NEXT</span>
            </p>
          </div>
        </div>
      </div>
      <div class="main poster" v-show="gameOver && !postOver">
        <!-- <p class="hgLogo"><img src="../assets/images/titbg.png" alt=""></p> -->
        <canvas id="posterCanvas" disable-scroll="true" @touchstart="iceTouchstart" @touchmove="iceTouchmove"></canvas>
        <div class="btns">
          <p class="back" @click="backGame" v-audio>BACK</p>
          <p class="next" @click="createPoster"><span>生成海报</span></p>
        </div>
      </div>
      <div class="main poster" v-show="gameOver && postOver">
        <canvas id="finalCanvas" disable-scroll="true"></canvas>
        <div class="btns">
          <p class="back" @click="home" v-audio>首页</p>
          <p class="next"><span>长按保存海报</span><img :src="finalImg"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swiper from 'swiper/dist/js/swiper.min.js'
import 'swiper/dist/css/swiper.min.css'
import {dtBtns,dtSkins,qiuBtns,qiuSkins,jlBtns,jlSkins,ljBtns,ljSkins,plBtns,plSkins,canvasElements,elementsProp} from '../settings/avatars'
import {Toast,Indicator} from 'mint-ui'
import 'hidpi-canvas/dist/hidpi-canvas.min.js'
import { wxshare } from '../mixins/wxshare'
import Exif from 'exif-js'

export default {
  name: 'Game',
  mixins:[wxshare],
  data () {
    return {
      gameStart:false,
      gameOver:false,
      postOver:false,
      step:1,
      stepNav:new Array(5),
      stepTitles:[
        '选择喜欢的丹麦筒',
        '选择喜欢的酱料',
        '选择冰淇淋球口味',
        '选择喜欢的淋酱',
        '多加一点配料',
        '给作品起个名字'
      ],
      dtBtns:dtBtns,
      dtSkins:dtSkins,
      qiuBtns:qiuBtns,
      qiuSkins:qiuSkins,
      jlBtns:jlBtns,
      jlSkins:jlSkins,
      ljBtns:ljBtns,
      ljSkins:ljSkins,
      plBtns:plBtns,
      plSkins:plSkins,
      ctx: null,
      cropperCtx:null,
      posterCtx:null,
      elements:JSON.parse(canvasElements),
      touch: {
        delete: -1,
        method: '',
        element: {
          index: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          centerX:0,
          centerY:0,
          scale: 1
        },
        start: {
          index: 0,
          x: 0,
          y: 0
        },
        move: {
          x: 0,
          y: 0
        }
      },
      clearIcon:new Image(),
      dragIcon:new Image(),
      rotateIcon:new Image(),
      ctxWidth:null,
      ctxHeight:null,
      qiuNum:0,
      ljNum:0,
      jlNum:0,
      dtSkinImgs:null,
      qiuSkinImgs:null,
      jlSkinImgs:null,
      ljSkinImgs:null,
      plSkinImgs:null,
      rem:null,
      inputName:'',
      iceCream:new Image(),
      iceCreamEle:{
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        scale: 1,
        rotate: 0,
        translateX:0,
        translateY:0,
        active:true,
        centerX:0,
        centerY:0
      },
      cropperImg:new Image(),
      photoImg:new Image(),
      // piconBg:new Image(),
      posterImg:new Image(),
      finalImg:null,
      pixelRatio:1,
      pos:{
        x:6.6,
        y:5.07
      },
      original:elementsProp,
      cameraImg:new Image(),
      photoHeight:null,
      logoTop:new Image(),
      signBtm:new Image()
    }
  },
  mounted(){
    this.initElements()
    document.body.addEventListener('touchmove' , (e) => {
      e.preventDefault()
    })
    //设置游戏区域区域canvas
    let gameCanvas = document.getElementById('gameCanvas')
    this.ctxWidth = document.documentElement.clientWidth
    this.ctxHeight =  document.documentElement.clientHeight
    gameCanvas.width = this.ctxWidth
    gameCanvas.height = this.ctxHeight
    this.ctx = gameCanvas.getContext('2d')
    //设置裁剪区域canvas
    let cropperCanvas = document.getElementById('cropperCanvas')
    cropperCanvas.width = 3.07 * this.rem * this.pixelRatio
    cropperCanvas.height = 7.7 * this.rem * this.pixelRatio
    this.cropperCtx = cropperCanvas.getContext('2d')
    //初始化图片
    this.clearIcon.src = './static/images/btn_del.png'
    this.dragIcon.src = './static/images/btn_sf.png'
    this.logoTop.src = './static/images/logo_top.png'
    this.signBtm.src = './static/images/txt_btm.png'
    this.rotateIcon.src = './static/images/btn_xz.png'
    this.imgLoaded()
    this.swiper()
    this.getPixelRatio()
  },
  computed:{
    stepName() {
      let name
      if (this.step === 1) {
        name = 'dtSkin'
      } else if (this.step === 2) {
        name = 'jlSkin'
      } else if (this.step === 3) {
        name = 'qiuSkin'
      } else if (this.step === 4) {
        name = 'ljSkin'
      } else if (this.step === 5) {
        name = 'plSkin'
      }
      return name
    }
  },
  methods: {
    goDIY(){
      setTimeout(()=>{
        this.gameStart = true
      },300)
    },
    checkMobile() {
      let ua = navigator.userAgent
      //Android
      let isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1
      //Ios
      let isiOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
      if (isAndroid) {
        return 'isAndroid'
      } else if (isiOS) {
        return 'isiOS'
      }
    },
    getPixelRatio(){
      let backingStore = this.ctx.backingStorePixelRatio ||
              this.ctx.webkitBackingStorePixelRatio ||
              this.ctx.mozBackingStorePixelRatio ||
              this.ctx.msBackingStorePixelRatio ||
              this.ctx.oBackingStorePixelRatio ||
              this.ctx.backingStorePixelRatio || 1
      this.pixelRatio = (window.devicePixelRatio || 1) / backingStore
    },
    getRem(){
      let deviceWidth = document.documentElement.clientWidth
      this.rem = deviceWidth / 10
    },
    initElements(){
      this.getRem()
      this.elements.map((item,index) => {
        item.width = this.original[index].width * this.rem
        item.height = this.original[index].height * this.rem
        item.x = this.pos.x * this.rem
        item.y = this.pos.y * this.rem
      })
    },
    initEle(index){
      this.elements[index].width = this.original[index].width * this.rem
      this.elements[index].height = this.original[index].height * this.rem
      this.elements[index].x = this.pos.x * this.rem
      this.elements[index].y = this.pos.y * this.rem
    },
    imgLoaded(){
      this.dtSkinImgs = this.dtSkins.map((item)=>{
        let img = new Image()
        img.src = item
        return img
      })
      this.qiuSkinImgs = this.qiuSkins.map((item)=>{
        let img = new Image()
        img.src = item
        return img
      })
      this.jlSkinImgs = this.jlSkins.map((item)=>{
        let img = new Image()
        img.src = item
        return img
      })
      this.ljSkinImgs = this.ljSkins.map((item)=>{
        let img = new Image()
        img.src = item
        return img
      })
      this.plSkinImgs = this.plSkins.map((item)=>{
        let img = new Image()
        img.src = item
        return img
      })
    },
    swiper(){
      let perNum = 4
      if (this.step === 2) {
        perNum = 2
      } else if (this.step === 4) {
        perNum = 3
      }
      this.$nextTick(() => {
        new Swiper('.swiper-container',{
          slidesPerView: perNum
        })
      })
    },
    back(){
      if (this.step > 1) {
        this.step --
        this.swiper()
      } else if (this.step === 1) {
        setTimeout(()=>{
          location.reload()
        },300)
      }
    },
    next() {
      if (this.step < 5) {
        this.step ++
        this.swiper()
      }
    },
    home(){
      location.reload()
    },
    backGame(){
      this.clearCtx(this.cropperCtx)
      this.clearCtx(this.posterCtx)
      this.cameraImg.src = ''
      this.cropperImg.src = ''
      this.iceCream.src = ''
      this.gameOver = false
    },
    clearCtx(ctx){
      ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight)
    },
    selectImg(index) {
      for (let item of this.elements) {
        item.active = false
      }
      this.elements.map((item)=>{
        if (item.type===this.stepName) {
          item.avatar = this[this.stepName+'Imgs'][index]
          item.active = true
        }
        return item
      })
      this.drawCanvas()
    },
    selectImg2(index,type,maxnum){
      let name
      if (type == 'qiu') {
        name = '冰淇淋球'
      } else if (type == 'lj') {
        name = '淋酱'
      } else if (type == 'pl') {
        name = '配料'
      }
      if (this[type+'Num'] === maxnum) {
        Toast(`最多只能选择${maxnum}种${name}哦~`)
        return
      }
      for (let item of this.elements) {
        item.active = false
      }
      for (let i = this.elements.length-1;i !== -1; i--) {
        let item = this.elements[i]
        if (item.type===(this.stepName) && !item.avatar) {
          item.avatar = this[this.stepName+'Imgs'][index]
          item.active = true
          break
        }
      }
      this[type+'Num'] ++
      this.drawCanvas()
    },
    drawCanvas() {
      this.clearCtx(this.ctx)
      this.ctx.save()
      this.elements.map((item) => {
        if (item.avatar) {
          this.drawImg(item)
        }
      })
      this.ctx.restore()
    },
    drawImg(item){
      this.ctx.drawImage(item.avatar, item.x * this.pixelRatio, item.y * this.pixelRatio,item.width * this.pixelRatio,item.height * this.pixelRatio)
      if (item.active) {
        this.drawDashRect(this.ctx,item.x-1,item.y-1,item.width+2,item.height+2)
        this.ctx.drawImage(this.clearIcon, (item.x - 12) * this.pixelRatio, (item.y - 12) * this.pixelRatio, 24 * this.pixelRatio, 24 * this.pixelRatio)
        this.ctx.drawImage(this.dragIcon, (item.x + item.width - 12) * this.pixelRatio, (item.y + item.height - 12) * this.pixelRatio, 24 * this.pixelRatio, 24 * this.pixelRatio)
      }
    },
    getCameraFile(){
      Indicator.open({text: '正在制作冰淇淋...',spinnerType: 'triple-bounce'})
      for (let item of this.elements) {
        item.active = false
      }
      this.drawCanvas()
      let fileInput = document.getElementById('upload')
      if (fileInput.files && fileInput.files[0]) {
        let vue_this = this
        Exif.getData(fileInput.files[0], function() {
          Exif.getAllTags(this)
          let Orientation = Exif.getTag(this, 'Orientation')
          let reader = new FileReader()
          reader.onload = (e) => {
            vue_this.cameraImg.src = e.target.result
            vue_this.createPhoto(Orientation)
            vue_this.createIce()
          }
          reader.readAsDataURL(fileInput.files[0])
        })
      }
    },
    createPhoto(Orientation){
      this.cameraImg.onload = () => {
        let canvas = document.getElementById('cameraCanvas')
        canvas.width = this.ctxWidth
        canvas.height = this.ctxHeight
        this.photoCtx = canvas.getContext('2d')
        this.photoCtx.save()
        // alert(Orientation)
        if(Orientation && Orientation != 1){
          switch(Orientation){
            case 6:     // 旋转90度
                this.photoHeight = parseInt (this.ctxWidth * (this.cameraImg.width / this.cameraImg.height))
                canvas.width = this.photoHeight
                canvas.height = this.ctxWidth
                this.photoCtx.rotate(Math.PI / 2)
                // (0,-imgHeight) 从旋转原始图那里获得的起始点
                this.photoCtx.drawImage(this.cameraImg, 0, -this.photoHeight, this.ctxWidth, this.photoHeight)
                this.photoCtx.restore()
                break
            case 3:     // 旋转180度
                this.photoHeight = parseInt (this.ctxWidth * (this.cameraImg.height / this.cameraImg.width))
                canvas.height = this.photoHeight
                this.photoCtx.rotate(Math.PI)
                this.photoCtx.drawImage(this.cameraImg, -this.ctxWidth, -this.photoHeight, this.ctxWidth, this.photoHeight)
                this.photoCtx.restore()
                break
            case 8:     // 旋转-90度
                this.photoHeight = parseInt (this.ctxWidth * (this.cameraImg.width / this.cameraImg.height))
                canvas.width = this.photoHeight
                canvas.height = this.ctxWidth
                this.photoCtx.rotate(3 * Math.PI / 2)
                this.photoCtx.drawImage(this.cameraImg, -this.ctxWidth, 0, this.ctxWidth, this.photoHeight)
                this.photoCtx.restore()
                break
          }
        } else{
          this.photoHeight = this.ctxHeight
          this.photoCtx.drawImage(this.cameraImg, 0, 0, this.ctxWidth*this.pixelRatio, this.ctxHeight*this.pixelRatio)
        }
        this.photoImg.src = canvas.toDataURL()
      }
    },
    createIce(){
      for (let item of this.elements) {
        item.active = false
      }
      let canvas = document.getElementById('gameCanvas')
      let imgDataURI = canvas.toDataURL()
      this.cropperImg.src = imgDataURI
      this.cropperImg.onload = () => {
        this.cropperCtx.save()
        let posY = -this.ctxHeight/2 + 4.5*this.rem
        this.cropperCtx.translate(0,posY)
        this.cropperCtx.drawImage(this.cropperImg, -3.46*this.rem*this.pixelRatio,0,this.ctxWidth*this.pixelRatio,this.ctxHeight*this.pixelRatio)
        this.cropperCtx.translate(0,0)
        this.cropperCtx.restore()
        let canvasCropper = document.getElementById('cropperCanvas')
        let imgDataURI = canvasCropper.toDataURL()
        this.iceCream.src = imgDataURI
        this.posterCanvas()
      }
    },
    posterCanvas(){
      setTimeout(() => {
        this.gameOver = true
        let posterCanvas = document.getElementById('posterCanvas')
        posterCanvas.width = this.ctxWidth
        posterCanvas.height = this.photoHeight
        this.posterCtx = posterCanvas.getContext('2d')
        this.iceCreamEle = {
          x: 3.46*this.rem,
          y: (this.ctxHeight/2 - 4.5*this.rem),
          width: this.iceCream.width/this.pixelRatio,
          height: this.iceCream.height/this.pixelRatio,
          scale: 1,
          rotate:0,
          translateX:0,
          translateY:0,
          active:true,
          centerX:3.46*this.rem+this.iceCream.width/this.pixelRatio/2,
          centerY:(this.ctxHeight/2 - 4.5*this.rem)+this.iceCream.height/this.pixelRatio/2
        }
        this.drawIceCanvas()
        Indicator.close()
      },2000)
    },
    drawIceCanvas(){
      this.clearCtx(this.posterCtx)
      this.posterCtx.save()
      this.posterCtx.drawImage(this.photoImg, 0, 0,this.ctxWidth*this.pixelRatio,this.photoHeight*this.pixelRatio)
      this.posterCtx.drawImage(this.logoTop, (this.ctxWidth/2 - 4.68*this.rem)*this.pixelRatio, .33*this.rem*this.pixelRatio, 9.36*this.rem*this.pixelRatio,1.77*this.rem* this.pixelRatio)
      this.posterCtx.drawImage(this.signBtm, (this.ctxWidth - 5.1*this.rem)*this.pixelRatio, (this.photoHeight - 2.1*this.rem)*this.pixelRatio, 4.93*this.rem*this.pixelRatio,1.96*this.rem* this.pixelRatio)
      this.posterCtx.translate(this.iceCreamEle.translateX, this.iceCreamEle.translateY)
      this.posterCtx.rotate(this.toRad(this.iceCreamEle.rotate))
      this.posterCtx.translate(-this.iceCreamEle.translateX, -this.iceCreamEle.translateY)
      this.posterCtx.drawImage(this.iceCream, this.iceCreamEle.x*this.pixelRatio, this.iceCreamEle.y*this.pixelRatio, this.iceCreamEle.width*this.pixelRatio, this.iceCreamEle.height*this.pixelRatio)
      if (this.iceCreamEle.active){
        this.drawDashRect(this.posterCtx,this.iceCreamEle.x-1,this.iceCreamEle.y-1,this.iceCreamEle.width+2,this.iceCreamEle.height+2)
        this.posterCtx.drawImage(this.dragIcon, (this.iceCreamEle.x + this.iceCreamEle.width - 12)* this.pixelRatio, (this.iceCreamEle.y + this.iceCreamEle.height - 12)* this.pixelRatio, 24 * this.pixelRatio, 24 * this.pixelRatio)
        this.posterCtx.drawImage(this.rotateIcon, (this.iceCreamEle.x - 12)* this.pixelRatio, (this.iceCreamEle.y - 12)* this.pixelRatio, 24 * this.pixelRatio, 24 * this.pixelRatio)
      }
      this.posterCtx.restore()
    },
    createPoster(){
      Indicator.open({text: '正在生成海报...',spinnerType: 'triple-bounce'})
      this.iceCreamEle.active = false
      this.drawIceCanvas()
      let canvas = document.getElementById('posterCanvas')
      let imgDataURI = canvas.toDataURL()
      this.posterImg.src = imgDataURI
      this.finalCanvas()
    },
    finalCanvas(){
      setTimeout(() => {
        this.postOver = true
        let finalCanvas = document.getElementById('finalCanvas')
        finalCanvas.width = this.ctxWidth
        finalCanvas.height = this.photoHeight
        let finalCtx = finalCanvas.getContext('2d')
        finalCtx.drawImage(this.posterImg, 0, 0,this.ctxWidth*this.pixelRatio,this.photoHeight*this.pixelRatio)
        this.finalImg = finalCanvas.toDataURL()
        Indicator.close()
      },1000)
    },
    touchstart (e) {
      // 判断是偏移, 旋转还是放大
      // 触摸的开始值
      this.touch.start.x = e.touches[0].clientX
      this.touch.start.y = e.touches[0].clientY
      // 初始化触摸的元素
      this.touch.method = ''
      this.touch.element.index = -1
      this.touch.element.width = 0
      this.touch.element.height = 0
      this.touch.element.x = 0
      this.touch.element.y = 0
      this.touch.element.scale = 1
      this.touch.element.rotate = 0
      // 判断touch到哪个元素
      for (let i = this.elements.length - 1; i !== -1; i--) {
        if (this.elements[i].avatar) {
          let item = this.elements[i]
          // 计算物体旋转之后的位置
          let r = Math.sqrt(2) * (item.width / 2)
          let center = {
            x: 0,
            y: 0
          }
          let del = {
            x: 0,
            y: 0
          }
          let move = {
            x: 0,
            y: 0
          }
          center.x = item.x + item.width / 2
          center.y = item.y + item.height / 2
          del.x = item.x
          del.y = item.y
          move.x = item.x + item.width
          move.y = item.y + item.height
          if (item && item.active) {
            // 判断删除
            if (e.touches[0].clientX > (del.x - 14) &&
                e.touches[0].clientX < (del.x + 14) &&
                e.touches[0].clientY > (del.y - 14) &&
                e.touches[0].clientY < (del.y + 14)) {
              this.touch.method = 'clear'
              this.touch.delete = i
              break
            }
            // 判断旋转放大
            if (e.touches[0].clientX > (move.x - 14) &&
                e.touches[0].clientX < (move.x + 14) &&
                e.touches[0].clientY > (move.y - 14) &&
                e.touches[0].clientY < (move.y + 14)) {
              // console.log('旋转放大开始')
              this.touch.method = 'zoom'
              this.touch.element.index = i
              this.touch.element.width = item.width
              this.touch.element.height = item.height
              this.touch.element.x = item.x
              this.touch.element.y = item.y
              this.touch.element.scale = item.scale
              this.touch.element.rotate = item.rotate
              break
            }
          }
          if (e.touches[0].clientX > center.x - r &&
              e.touches[0].clientX < center.x + r &&
              e.touches[0].clientY > center.y - r &&
              e.touches[0].clientY < center.y + r) {
            // console.log('拖动开始')
            this.touch.method = 'drag'
            this.touch.element.index = i
            this.touch.element.width = item.width
            this.touch.element.height = item.height
            this.touch.element.x = item.x
            this.touch.element.y = item.y
            break
          }
        }
      }
      // 执行删除命令
      if (this.touch.method === 'clear' && this.touch.delete !== -1) {
        this.elements[this.touch.delete].avatar = null
        this.elements[this.touch.delete].active = false
        this.initEle(this.touch.delete)
        if (this.elements[this.touch.delete].type === 'qiuSkin') {
          this.qiuNum --
        }
        if (this.elements[this.touch.delete].type === 'plSkin') {
          this.plNum --
        }
        this.touch.delete = -1
      }
      for (let item of this.elements) {
        item.active = false
      }
      if (this.touch.element.index !== -1 && this.touch.element.index < this.elements.length) {
        this.elements[this.touch.element.index].active = true
      }
      this.drawCanvas()
    },
    touchmove (e) {
      if (this.touch.element.index === -1) {
        return
      }
      let index = this.touch.element.index
      if (this.touch.method === 'drag') {
        // console.log('拖动')
        if (e.touches[0].clientX > 0 && e.touches[0].clientX < this.ctxWidth && e.touches[0].clientY > 0 && e.touches[0].clientY < this.ctxHeight) {
          this.touch.move.x = e.touches[0].clientX
          this.touch.move.y = e.touches[0].clientY

          this.elements[index].x = this.touch.element.x + this.touch.move.x - this.touch.start.x
          this.elements[index].y = this.touch.element.y + this.touch.move.y - this.touch.start.y
        }
      } else if (this.touch.method === 'zoom') {
        // console.log('旋转')
        // 旋转放大中
        this.touch.move.x = e.touches[0].clientX
        this.touch.move.y = e.touches[0].clientY

        // 缩放
        let cotA = this.elements[index].height / this.elements[index].width
        this.elements[index].width = (this.touch.move.x - this.touch.start.x) + this.touch.element.width
        this.elements[index].height = (this.touch.move.x - this.touch.start.x) * cotA + this.touch.element.height
      }
      this.drawCanvas()
    },
    getDotX(dot,c,rad){
      return (dot.x-c.x)*Math.cos(rad) - (dot.y-c.y)*Math.sin(rad) + c.x
    },
    getDotY(dot,c,rad){
      return (dot.x-c.x)*Math.sin(rad) + (dot.y-c.y)*Math.cos(rad) + c.y
    },
    iceTouchstart(e) {
      // 判断是偏移, 旋转还是放大

      // 计算物体旋转之后的位置
      // let radA = Math.atan(this.iceCreamEle.width / this.iceCreamEle.height)
      // let radC = Math.PI / 2 + this.toRad(this.iceCreamEle.rotate) - radA
      // let r = this.iceCreamEle.width / 2 / Math.sin(radA)
      let center = {
        x: this.iceCreamEle.centerX,
        y: this.iceCreamEle.centerY
      }
      let A01 = {
        x: this.iceCreamEle.x,
        y: this.iceCreamEle.y
      }
      let A02 = {
        x: this.iceCreamEle.x + this.iceCreamEle.width,
        y: this.iceCreamEle.y
      }
      let A03 = {
        x: this.iceCreamEle.x + this.iceCreamEle.width,
        y: this.iceCreamEle.y + this.iceCreamEle.height
      }
      let A04 = {
        x: this.iceCreamEle.x,
        y: this.iceCreamEle.y + this.iceCreamEle.height
      }
      let A1={},A2={},A3={},A4={}

      // console.log('************************')
      // console.log(this.touch.method)
      // console.log('center:'+center.x+' , '+center.y)
      // console.log(this.iceCreamEle.rotate)
      let rotateA = this.toRad(this.iceCreamEle.rotate)
      A1.x = this.getDotX(A01,center,rotateA)
      A1.y = this.getDotY(A01,center,rotateA)
      A2.x = this.getDotX(A02,center,rotateA)
      A2.y = this.getDotY(A02,center,rotateA)
      A3.x = this.getDotX(A03,center,rotateA)
      A3.y = this.getDotY(A03,center,rotateA)
      A4.x = this.getDotX(A04,center,rotateA)
      A4.y = this.getDotY(A04,center,rotateA)
      // console.log('************************')
      // console.log('x&y:'+this.iceCreamEle.x+' , '+this.iceCreamEle.y)
      // console.log(this.iceCreamEle.width,this.iceCreamEle.height)
      // console.log(this.iceCreamEle.x,this.iceCreamEle.y)
      // console.log(A1.x,A1.y)
      // console.log(A2.x,A2.y)
      // console.log(A3.x,A3.y)
      // console.log(A4.x,A4.y)
      let xArr = [A1.x,A2.x,A3.x,A4.x].sort((v1,v2)=>{
        return v1-v2
      })
      let yArr = [A1.y,A2.y,A3.y,A4.y].sort((v1,v2)=>{
        return v1-v2
      })
      let minX = xArr[0],
          maxX = xArr[3],
          minY = yArr[0],
          maxY = yArr[3]

      // 触摸的开始值
      this.touch.start.x = e.touches[0].clientX
      this.touch.start.y = e.touches[0].clientY
      // 初始化触摸的元素
      this.touch.method = ''
      this.touch.element.index = -1
      this.touch.element.width = 0
      this.touch.element.height = 0
      this.touch.element.x = 0
      this.touch.element.y = 0
      this.touch.element.scale = 1
      this.touch.element.rotate = 0
      this.touch.element.centerX = this.iceCreamEle.centerX
      this.touch.element.centerY = this.iceCreamEle.centerY
      if (e.touches[0].clientX > minX &&
          e.touches[0].clientX < maxX &&
          e.touches[0].clientY > minY &&
          e.touches[0].clientY < maxY) {
        // console.log('拖动开始')
        this.touch.method = 'drag'
        this.touch.element.width = this.iceCreamEle.width
        this.touch.element.height = this.iceCreamEle.height
        this.touch.element.x = this.iceCreamEle.x
        this.touch.element.y = this.iceCreamEle.y
      }
      if (e.touches[0].clientX < minX ||
          e.touches[0].clientX > maxX ||
          e.touches[0].clientY < minY ||
          e.touches[0].clientY > maxY) {
        this.touch.method = 'rotate'
        // 中心点的坐标
        this.iceCreamEle.translateX = this.iceCreamEle.centerX
        this.iceCreamEle.translateY = this.iceCreamEle.centerY
        this.touch.element.scale = this.iceCreamEle.scale
        this.touch.element.rotate = this.iceCreamEle.rotate
        this.touch.element.width = this.iceCreamEle.width
        this.touch.element.height = this.iceCreamEle.height
        this.touch.element.x = this.iceCreamEle.x
        this.touch.element.y = this.iceCreamEle.y
      }
      if (e.touches[0].clientX > (A1.x - 28) &&
          e.touches[0].clientX < (A1.x + 28) &&
          e.touches[0].clientY > (A1.y - 28) &&
          e.touches[0].clientY < (A1.y + 28)) {
        this.touch.method = 'rotate'
        // 中心点的坐标
        this.iceCreamEle.translateX = this.iceCreamEle.centerX
        this.iceCreamEle.translateY = this.iceCreamEle.centerY
        this.touch.element.scale = this.iceCreamEle.scale
        this.touch.element.rotate = this.iceCreamEle.rotate
        this.touch.element.width = this.iceCreamEle.width
        this.touch.element.height = this.iceCreamEle.height
        this.touch.element.x = this.iceCreamEle.x
        this.touch.element.y = this.iceCreamEle.y
      }

      // 判断旋转放大
      if (e.touches[0].clientX > (A3.x - 28) &&
          e.touches[0].clientX < (A3.x + 28) &&
          e.touches[0].clientY > (A3.y - 28) &&
          e.touches[0].clientY < (A3.y + 28)) {
        // console.log('旋转放大开始')
        this.touch.method = 'zoom'
        this.touch.element.width = this.iceCreamEle.width
        this.touch.element.height = this.iceCreamEle.height
        this.touch.element.x = this.iceCreamEle.x
        this.touch.element.y = this.iceCreamEle.y
      }
      // this.drawIceCanvas()
    },
    iceTouchmove(e) {
      if (this.touch.method === 'drag') {
        // console.log('拖动')
        if (e.touches[0].clientX > 0 && e.touches[0].clientX < this.ctxWidth && e.touches[0].clientY > 0 && e.touches[0].clientY < this.ctxHeight) {
          this.touch.move.x = e.touches[0].clientX
          this.touch.move.y = e.touches[0].clientY
          this.iceCreamEle.x = this.touch.element.x + this.touch.move.x - this.touch.start.x
          this.iceCreamEle.centerX = this.touch.element.centerX + this.touch.move.x - this.touch.start.x
          this.iceCreamEle.y = this.touch.element.y + this.touch.move.y - this.touch.start.y
          this.iceCreamEle.centerY = this.touch.element.centerY + this.touch.move.y - this.touch.start.y
          // console.log('draggggggggggggggggggg')
          // console.log('ice X&Y:'+ this.iceCreamEle.x+' , '+this.iceCreamEle.y)
          // console.log(this.touch.move.x - this.touch.start.x)
          // console.log(this.touch.move.y - this.touch.start.y)
          // console.log('draggggggggggggggggggg')
        }
      } else if (this.touch.method === 'zoom') {
        // console.log('旋转')
        // 旋转放大中
        this.touch.move.x = e.touches[0].clientX
        this.touch.move.y = e.touches[0].clientY

        // 放大
        let cotA = this.iceCreamEle.height / this.iceCreamEle.width
        this.iceCreamEle.width = (this.touch.move.x - this.touch.start.x) + this.touch.element.width
        this.iceCreamEle.height = (this.touch.move.x - this.touch.start.x) * Math.abs(cotA) + this.touch.element.height
        this.iceCreamEle.centerX = (this.touch.move.x - this.touch.start.x) + this.touch.element.centerX
        this.iceCreamEle.centerY = (this.touch.move.x - this.touch.start.x) * Math.abs(cotA) + this.touch.element.centerY
      } else if (this.touch.method === 'rotate') {
        // console.log('rotate')
        this.touch.move.x = e.touches[0].clientX
        this.touch.move.y = e.touches[0].clientY
        // 以下为旋转
        // 触摸前的角度
        this.iceCreamEle.centerX = this.iceCreamEle.translateX
        this.iceCreamEle.centerY = this.iceCreamEle.translateY
        let diffXBefore = this.touch.start.x - this.iceCreamEle.translateX
        let diffYBefore = this.touch.start.y - this.iceCreamEle.translateY

        let diffXAfter = this.touch.move.x - this.iceCreamEle.translateX
        let diffYAfter = this.touch.move.y - this.iceCreamEle.translateY

        let angleBefore = this.toAng(Math.atan2(diffYBefore, diffXBefore))
        let angleAfter = this.toAng(Math.atan2(diffYAfter, diffXAfter))

        this.iceCreamEle.rotate = angleAfter - angleBefore + this.touch.element.rotate
        // console.log(this.iceCreamEle.rotate)
      }
      this.drawIceCanvas()
    },
    drawDashRect(ctx, left, top, width, height, step = 1) {
      ctx.setLineDash([3])
      ctx.lineWidth = step
      ctx.strokeStyle = '#ffffff'
      ctx.strokeRect(left,top,width,height)
    },
    toRad(angle){
      return angle * Math.PI / 180
    },
    toAng(radian){
      return radian * 180 / Math.PI
    }
  }
}
</script>

<style scoped lang="scss">
.wrapper{
  .home{
    position: fixed;
    right:0;
    top:0;
    left:0;
    bottom:0;
    background:#1e1d22 url(../assets/images/bg.jpg) no-repeat center top;
    background-size:100% auto;
    display: flex;
    align-items: center;
    z-index:10;
    .img{
      position: relative;
      text-align: center;
      width:100%;
      img{
        width:8.35rem;
      }
    }
    .playBtn{
      position: absolute;
      bottom:0;
      width:100%;
      left:0;
      text-align: center;
      img{
        width:3.57rem;
      }
    }
  }
  .main{
    position: fixed;
    left:0;
    top:0;
    width:100%;
    font-size:0;
    right:0;
    bottom:0;
    display: flex;
    align-items: center;
    justify-content:center;
    flex-direction:column;
    background-color:#1e1d22;
    background-image:url(../assets/images/bg.jpg);
    background-repeat:no-repeat;
    background-position:center top;
    background-size:100% auto;
    &.play{
      .topbg{
        position: relative;
        background-image:url(../assets/images/img_top.png);
        .stepNav{
          position: absolute;
          bottom:0.6rem;
          left:0.6rem;
          width: 1.2rem;
          height:6.06rem;
          background: url(../assets/images/bg_stepnav.png) no-repeat center top;
          background-size:100% auto;
          box-sizing: border-box;
          padding-left: 0.26rem;
          li{
            width:.76rem;
            height:.76rem;
            background-position: 0 0;
            background-repeat: no-repeat;
            background-size:100% auto;
            &.step1{
              background-image: url(../assets/images/step1_on.png)
            }
            &.step2{
              margin-top: 1.25rem;
              background-image: url(../assets/images/step2_on.png)
            }
            &.step3{
              margin-top: 2.5rem;
              background-image: url(../assets/images/step3_on.png)
            }
            &.step4{
              margin-top: 3.68rem;
              background-image: url(../assets/images/step4_on.png)
            }
            &.step5{
              margin-top: 4.84rem;
              background-image: url(../assets/images/step5_on.png)
            }
          }
        }
      }
    }
    &.poster{
      background: #000;
      .hgLogo{
        text-align: center;
        position: absolute;
        z-index: 11;
        width: 100%;
        left: 0;
        top: 1rem;
        img{
          width:7.08rem;
        }
      }
      .btns{
        position: fixed;
        bottom:0;
        left:0;
        height:2rem;
        width:100%;
        background: #000;
        z-index:10;
        box-sizing: border-box;
        padding:0.5rem 1.07rem 0;
        p{
          &.next{
            position: relative;
            width:2.68rem;
            overflow: hidden;
            background-image: url(../assets/images/btn_right02.png);
            span{
              display: inline-block;
              width:2.47rem;
            }
            img{
              position: absolute;
              left:0;
              top:0;
              opacity: 0;
            }
          }
        }
      }
    }
    canvas{
      margin: 0;
      position: absolute;
      left:0;
      top:0;
      z-index:9;
      &#cropperCanvas{
        z-index:-1;
        opacity: 0;
      }
      &#cameraCanvas{
        z-index:-1;
        opacity: 0;
      }
    }
    .topbg{
      width:100%;
      height:10rem;
      margin-top: 0.2rem;
      background-repeat:no-repeat;
      background-position:center top;
      background-size:7.04rem auto;
    }
    .bottom{
      position:relative;
      z-index:10;
      width:100%;
      height:4.12rem;
      text-align: center;
    }
    .stepTitle{
      background: url(../assets/images/bg_stepinfo.png) no-repeat center top;
      background-size:100% auto;
      width:4rem;
      height:0.85rem;
      margin: 0 auto 0.2rem;
      line-height: 0.86rem;
      font-size:0.36rem;
      color:#000;
      font-weight: bold;
      &.title5{
        bottom:2.85rem;
      }
      span{
        display: inline-block;
        width:.8rem;
        text-align: center;
      }
      em{
        width:3rem;
        display: inline-block;
        text-align: center;
      }
    }
    .menu{
      margin: 0 auto 0.2rem;
      width:7.88rem;
      height:1.97rem;
      background: url(../assets/images/bg_xu1.png) no-repeat center top;
      background-size:100% auto;
      box-sizing:border-box;
      padding:2px;
      .menuInn{
        padding:0 .4rem;
      }
      ul{
        li{
          text-align:center;
        }
        &.dtList{
          li{
            padding-top:0.16rem;
            width:25%;
            img{
              width:.67rem;
            }
          }
        }
        &.qiuList{
          li{
            padding-top: 0.12rem;
            img{
              height:1.6rem;
            }
          }
        }
        &.jlList{
          padding-top: 0.14rem;
          li{
            img{
              height:1.6rem;
            }
          }
        }
        &.plList{
          li{
            padding-top: 0.14rem;
            img{
              height:1.6rem;
            }
          }
        }
      }
    }
    .btns{
      height:.92rem;
      width:7.88rem;
      margin: 0 auto;
      p{
        color:#000;
        font-size:0.32rem;
        width:2.31rem;
        height:.92rem;
        line-height: .92rem;
        font-weight: bold;
        box-sizing: border-box;
        &.back{
          background: url(../assets/images/btn_left.png) no-repeat 0 0;
          background-size: 100% auto;
          padding-left: .2rem;
          float:left;
          text-align: left;
        }
        &.next{
          position: relative;
          background: url(../assets/images/btn_right01.png) no-repeat 0 0;
          background-size: 100% auto;
          text-align: right;
          padding-right: .2rem;
          float:right;
          input{
            position: absolute;
            height:.92rem;
            left:0;
            top:0;
            opacity: 0;
          }
        }
      }
    }
  }
}

</style>
