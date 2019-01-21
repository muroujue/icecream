<template>
  <div class="poster">
    <div class="img"><img :src="posterImg" alt=""></div>
    <p class="infoTxt">长按保存图片<br>点击右上角 分享至朋友圈</p>
  </div>
</template>

<script>
import { wxshare } from '../mixins/wxshare'
export default {
  name: 'Home',
  mixins:[wxshare],
  data () {
    return {
      wxConfig:null,
      posterImg:null
    }
  },
  created(){
    // console.log(this.$route.query)
    this.posterImg = decodeURIComponent(this.$route.query.img)
  },
  methods: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.poster{
  background: #000;
  position: absolute;
  right:0;
  left:0;
  top:0;
  bottom:0;
  img{
    width:100%;
  }
  .infoTxt{
    position: fixed;
    bottom:0;
    left:0;
    width:100%;
    text-align: center;
    height:3rem;
    background: #000;
    z-index:10;
    box-sizing: border-box;
    padding:1rem 1.07rem 0;
    color:#fff;
  }
}
</style>
