# icecream-diy
使用`canvas`实现的一个蛋筒DIY游戏。

###开发中遇到的问题
1. canvas 的宽高要直接用width和height属性来设置，不能用css设置，会变形
2. 绘制虚线的方法
```
drawDashRect(left, top, width, height, step = 1) {
  this.ctx.setLineDash([3])
  this.ctx.lineWidth = step
  this.ctx.strokeStyle = '#ffffff'
  this.ctx.strokeRect(left,top,width,height)
}
```
3. canvas中如何绘制高清图片
https://segmentfault.com/a/1190000003730246?utm_source=tag-newest
**解决办法：**hidpi-canvas插件
https://www.npmjs.com/package/hidpi-canvas
使用注意：图片需要手动设定x,y,width,height，其他canvas方法由插件自动做高清处理
4. canvas上拖动时如何禁止body滑动或者拖拽事件
```
document.body.addEventListener('touchmove' , function(e){
    e.preventDefault()
})
```
5. canvas上绘制图片，有时会出现绘制不上的情况，这时要考虑该图片是否onload，有些操作放到onload的函数里
```
this.iceCream.onload = () => {
 posterCtx.drawImage(this.iceCream, 0, 0,this.ctxWidth*this.pixelRatio,this.ctxHeight*this.pixelRatio)
 this.posterImg = posterCanvas.toDataURL('image/png')
}
```
6. 上传base64文件，文件太大超过3M，要通过文件上传的方式
https://segmentfault.com/q/1010000013036163/a-1020000013048701
