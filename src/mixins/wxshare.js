import wx from 'weixin-js-sdk'

export const wxshare = {
    mounted(){
        let url = encodeURIComponent(window.location.href.split('#')[0])
        this.$http.get('/diono/public/signature?url='+ url).then((data) => {
            this.wxConfig = data
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: this.wxConfig.appid, // 必填，公众号的唯一标识
                timestamp: this.wxConfig.timestamp, // 必填，生成签名的时间戳
                nonceStr: this.wxConfig.noncestr, // 必填，生成签名的随机串
                signature: this.wxConfig.signature,// 必填，签名，见附录1
                jsApiList: [
                'onMenuShareAppMessage',
                'onMenuShareTimeline'
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            })
            wx.ready(()=>{
                wx.onMenuShareAppMessage({ // 分享给朋友  ,在config里面填写需要使用的JS接口列表，然后这个方法才可以用
                    title: '超赞！我刚DIY了一款丹麦筒冰淇淋！', // 分享标题
                    desc: '属于你的私人定制，尽在哈根达斯 NEW DIY CONE！', // 分享描述
                    link: 'http://wx.yukin.com.cn/hgds/diy', // 分享链接
                    imgUrl: 'http://img.yukin.com.cn/hgds/diy/share.jpg', // 分享图标
                    type: '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function() {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function() {
                        // 用户取消分享后执行的回调函数
                    }
                })
                wx.onMenuShareTimeline({ //分享朋友圈
                    title: '超赞！我刚DIY了一款丹麦筒冰淇淋！', // 分享标题
                    desc: '属于你的私人定制，尽在哈根达斯 NEW DIY CONE！', // 分享描述
                    link: 'http://wx.yukin.com.cn/hgds/diy',
                    imgUrl: 'http://img.yukin.com.cn/hgds/diy/share.jpg', // 分享图标
                    success: function() {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function() {
                        // 用户取消分享后执行的回调函数
                    }
                })
            })
        })
    }
}