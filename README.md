# DF_DanmakuExtension
- 这是一个致力于改善哔哩哔哩的弹幕体验的拓展程序XD
- niconico作为弹幕视频网站的鼻祖,有许多富有创造力的Po主在N站活动,漫天的弹幕正是N站的一大特色.B站也有很多搬运自N站的视频,遗憾的是这些视频很多时候的弹幕量都远不及本家,少了弹幕,也就少了许多整活的欢乐.为了弥补这一要素,我在pakku.js的基础上,开发了一个Chrome扩展程序 (以下记为DFex)实现了在B站网页端加载N站弹幕的功能.
- 以一集24分钟的动画为例,在本地弹幕播放器弹弹play中,可以加载任意数量的历史弹幕,而B站播放器却只有3000条弹幕,现在改版后也只有6000条,加入各种屏蔽词还会进一步稀释. DFex最初的目的,就是在B站的播放器中加载更多弹幕.到现在,DFex的功能还加上了

  1.当视频简介中有N站链接时加载对应的N站弹幕,并翻译为中文

  2.根据uid屏蔽弹幕,如屏蔽所有uid大于七位数的弹幕

  3.根据视频长度调整弹幕上限,长度4小时的指环王和长度1小时的视频弹幕量一样,这河里吗?

  4.当视频简介中有油管链接时,加载油管的评论

  5.加载本地弹幕,在正版合集中加载老合集的弹幕

  6.当有弹幕因为关键词屏蔽时,补充对应数量的弹幕

  7.高级屏蔽功能,如屏蔽某一颜色的弹幕,根据某些关键词的密度提升屏蔽等级,如在弹幕开始刷年龄或者日期时暂时屏蔽所有数字
  
  8.加载外站弹幕,在解析番剧弹幕时,如果在NicoNico或者F站有对应的番剧,可以加载外站的弹幕
  
  9.加载已删减的弹幕,如在对岸的番剧弹幕稀少,这边的弹幕多但有删减,则可以将删减后的弹幕调整为完整版的弹幕在对岸加载
  
  10.当视频简介中有twitch链接时,加载twitch的弹幕

  10.当视频简介中有油管录播链接时,加载油管录播弹幕

# 下载
点击右上角的 Code ,选择download ZIP

# 安装方法(以Chrome浏览器为例):
    
    1.解压下载的压缩包

    2.在Chrome地址栏中输入 chrome://extensions/ 并打开

    3.在右上角打开 开发者模式

    4.选择左上角的加载已解压的扩展程序

    5.选择解压出的文件夹

这个扩展程序应该兼容于Windows中大部分使用Chromium内核的浏览器,包括Edge,QQ浏览器和360浏览器等,
安装方法可以百度 如何在XX浏览器中安装已解压的扩展程序.

# 交流
不管技术交流,问题反馈,或者单纯是热爱弹幕,群号809248863

# 鸣谢
在开发DFex前,我对JavaScript的了解仅限于在手机上运行的auto.js脚本,啃了几天b站播放器的混淆后源码还是一无所获,所幸有大佬xmcp开发的pakku.js ,  DFex正是在它之上二次开发的.

  ​https://github.com/xmcp/pakku.js

扩展使用了xpadev开发的niconicomments库,以显示来自NicoNico的CommentArt,该库于MIT协议下开源

  https://github.com/xpadev-net/niconicomments

    
