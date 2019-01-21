<template>
  <div class="home">
    <div class="img">
      <img src="../assets/images/img_home.png" alt="">
       <p class="playBtn" @click="goDIY" v-audio><img src="../assets/images/btn_start.png" alt=""></p>
    </div>
  </div>
</template>

<script>
import { wxshare } from '../mixins/wxshare'
export default {
  name: 'Home',
  mixins:[wxshare],
  data () {
    return {
      isPad:false,
      wxConfig:null
    }
  },
  mounted(){
    this.checkMobile()

  },
  methods: {
    checkMobile() {
      let ua = navigator.userAgent
      //Pad
      let isPad = ua.indexOf('SM-T') > -1 || ua.indexOf('iPad') > -1
      if (isPad) {
        this.isPad = true
      } else {
        this.isPad = false
      }
    },
    goDIY(){
      setTimeout(()=>{
        if (this.isPad) {
          this.$router.push({path: '/gamepad'})
        } else {
          this.$router.push({path: '/game'})
        }
      },300)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.home{
  position: absolute;
  right:0;
  top:0;
  left:0;
  bottom:0;
  background:#1e1d22 url(../assets/images/bg.jpg) no-repeat center top;
  background-size:100% auto;
  display: flex;
  align-items: center;
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
</style>
