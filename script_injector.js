'use strict'


if (document.head) {
    async function sleep(time) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }

    function bv2av(str) {
        const table = [...'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'];
        const s = [11, 10, 3, 8, 4, 6];
        const xor = 177451812;
        const add = 8728348608;
        let result = 0;
        let i = 0;
        while (i < 6) {
            result += table.indexOf(str[s[i]]) * 58 ** i;
            i += 1;
        }
        ;
        return result - add ^ xor
    }

    let lastHref = null
    let lastDesc = null
    let runningDescResolveCid = null

    async function getDescInfo(cid) {
        if (window.location.href === lastHref) {
            return lastDesc
        }
        if (runningDescResolveCid !== cid) {
            runningDescResolveCid = cid
        } else {
            console.log('descLis', cid, lastDesc, lastHref, window.location.href)
            return await new Promise(resolve => {
                function handle(event) {
                    if (!event.data || !event.data.type) {
                        return;
                    }
                    console.log('descLis', cid, event)
                    if (event.data.type !== 'descCache' || event.data.cid !== cid) {
                        return
                    }
                    window.removeEventListener('message', handle)
                    resolve(event.data.desc)
                }

                window.addEventListener("message", handle)
            })
        }


        let youtubeUrl = null
        let nicoinfo = null
        let desc = document.querySelector('div[class^="desc-info"]')
        if (desc !== null) {
            let info = desc.querySelector('span')
            if (info === null) {
                console.log('Desc not found')
            } else {
                youtubeUrl = /\.youtube\.com\/watch\?[Vv]=([0-9a-zA-Z\-_]*)/.exec(info.innerText)
                if (youtubeUrl === null) {
                    youtubeUrl = /youtu\.be\/([_0-9a-zA-Z]*)/.exec(info.innerText)
                }
                if (youtubeUrl !== null) {
                    youtubeUrl = youtubeUrl[1]

                    console.log('Found YoutubeUrl:' + youtubeUrl)
                }
                let nico = info.querySelector('a[target=_blank][href^="//acg.tv/sm"]');
                if (nico !== null) {
                    nicoinfo = nico.getAttribute('href')

                    nicoinfo = /([sS][mM]\d+)/.exec(nicoinfo)
                    nico.setAttribute('href', 'https://www.nicovideo.jp/watch/' + nicoinfo[1])

                    if (nicoinfo !== null) {
                        nicoinfo = nicoinfo[1]
                    }

                }
                if (nicoinfo === null) {
                    nicoinfo = /([sS][mM]\d+)/.exec(info.innerText)
                    if (nicoinfo !== null) {
                        nicoinfo = nicoinfo[1]
                    }
                }
                if (nicoinfo !== null) {
                    nicoinfo = nicoinfo.toLowerCase()
                    console.log('Found NicoUrl:' + nicoinfo)
                }
            }
            // }

        } else {
            console.log('Desc not found')
        }

        // console.log(playerInfo.textContent)


        let ssid, aid
        ssid = /play\/ss(\d+)/.exec(document.querySelector('script[type="application/ld+json"]').textContent)
        if (ssid) {
            ssid = ssid[1]
        }
        let ipage = null
        if (ssid !== null) {
            if (window.seasonInfo !== undefined) {
                for (let i = 0; i < window.seasonInfo['result']['episodes'].length; i++) {
                    if (window.seasonInfo['result']['episodes'][i]['cid'] === parseInt(cid)) {
                        aid = window.seasonInfo['result']['episodes'][i]['aid']
                        ipage = i
                        break
                    }
                }
            } else {
                let epid = /\/ep(\d+)/.exec(window.location.href)
                if (epid) {
                    epid = epid[1]
                    let data = await parse('https://bangumi.bilibili.com/view/web_api/season?ep_id=' + epid)
                    data = JSON.parse(data)
                    ssid = data['result']['season_id']
                    for (let i = 0; i < data['result']['episodes'].length; i++) {
                        if (data['result']['episodes'][i]['cid'] === parseInt(cid)) {
                            aid = data['result']['episodes'][i]['aid']
                            ipage = i
                            break
                        }
                    }
                } else {
                    let data = JSON.parse(await parse('https://api.bilibili.com/pgc/web/season/section?season_id=' + ssid))
                    for (let i = 0; i < data.result.main_section.episodes.length; i++) {
                        if (data.result.main_section.episodes[i].cid === parseInt(cid)) {
                            ipage = i
                        }
                    }
                }
            }
        } else {
            try {
                aid = document.querySelector('meta[itemprop="url"]')
                aid = /(BV.*?)[\/?]/.exec(aid.getAttribute('content'))[1]
                aid = bv2av(aid)
            } catch (e) {
                console.log(e)
            }
        }
        lastHref = window.location.href
        lastDesc = [aid, youtubeUrl, nicoinfo, ssid, ipage]
        window.postMessage({type: 'descCache', cid: cid, desc: lastDesc})
        return lastDesc
    }


    let skipCid = {}


    window.addEventListener("message", async function (event) {
            if (event.source !== window) return;
            if (event.data.type) {
                console.log(event.data.type, event)
                if (event.data.type === "pakku_ajax_request") {
                    try {
                        let cid = /oid=(\d+)/.exec(event.data.arg)[1]
                        if (skipCid === cid) {
                            console.log('Ignore cid', skipCid)
                            window.postMessage({
                                type: "pakku_ajax_response",
                                arg: event.data.arg,
                                resp: null
                            }, "*");
                            return
                        }
                        let res = await getDescInfo(cid)
                        let aid, youtubeUrl, nicoinfo, ssid, ipage
                        [aid, youtubeUrl, nicoinfo, ssid, ipage] = res
                        let ondanmu = document.querySelector('span[class="bilibili-player-video-info-danmaku-number"]')
                        if (!ondanmu) {
                            ondanmu = document.querySelector('span[class="bpx-player-video-info-dm-number"]')
                        }
                        let expectedDanmuNum = 0
                        if (ondanmu !== null) {
                            expectedDanmuNum = Number(ondanmu.textContent)
                        }
                        chrome.runtime.sendMessage({
                            type: "ajax_hook",
                            url: event.data.arg,
                            aid: aid,
                            cid: cid,
                            href: window.location.href,
                            nicoinfo: nicoinfo,
                            youtubeUrl: youtubeUrl,
                            ssid: ssid,
                            ipage: ipage,
                            block: JSON.parse(localStorage.bilibili_player_settings).block,
                            expectedDanmuNum: expectedDanmuNum
                        });

                        await new Promise(resolve => {
                            function handle(resp, sender, sendResponse) {
                                if (resp.type !== 'ajax_hook_response' || resp.href.slice(55) !== event.data.arg.slice(55))
                                    return;
                                chrome.runtime.onMessage.removeListener(handle)
                                if (resp.data !== null && resp.ndanmu !== null) {
                                    console.log('GotDanmuFromDFex', resp.ndanmu)
                                    if (skipCid !== cid) {
                                        if (ondanmu !== null) {
                                            if (Number(ondanmu.textContent) > resp.ndanmu) {
                                                console.log('Abort Redirect due to less danmu for cid', cid)
                                                skipCid = cid
                                                // resp.data = null
                                            } else {
                                                ondanmu.textContent = resp.ndanmu.toString()

                                            }
                                        }
                                    }
                                }
                                window.postMessage({
                                    type: "pakku_ajax_response",
                                    arg: event.data.arg,
                                    resp: resp
                                }, "*");
                                resolve()
                            }

                            chrome.runtime.onMessage.addListener(handle)

                        })
                    } catch (e) {
                        console.log(e)
                        window.postMessage({
                            type: "pakku_ajax_response",
                            arg: event.data.arg,
                            resp: null
                        }, "*");
                    }


                } else if (event.data.type === 'seasonInfo') {
                    window.seasonInfo = JSON.parse(event.data.arg)
                } else if (event.data.source === 'DFex') {
                    console.log(event)
                    chrome.runtime.sendMessage(event.data);
                    let timeStamp = event.data.timeStamp
                    await new Promise(resolve => {
                        function handle(resp, sender, sendResponse) {
                            console.log(resp)
                            if (resp.type !== event.data.type + '_response' || resp.timeStamp !== timeStamp)
                                return;
                            chrome.runtime.onMessage.removeListener(handle)
                            window.postMessage(resp, "*");
                            resolve()
                        }

                        chrome.runtime.onMessage.addListener(handle)

                    })
                }
            }
        }
        ,
        false
    );

    let youtubeManager = {
        youtubeId: null,
        created: false,
        isEnd: false,
        continuation: null,
        itct: null,
        showed: false,
        lastHref: window.location.href,
        commentList: []
    }

    function format(text, dict) {
        let result = text
        let lkey = text.match(/{(.*?)}/g)


        for (let i = 0; i < lkey.length; i++) {
            let key = lkey[i]
            result = result.replace(key, dict[key.slice(1, -1)])
        }


        return result
    }

    function createReply(iComment, comment) {
        let lPos = comment.text.match(/\d+[:：]\d+[:：]*\d*/g)
        if (lPos !== null) {
            for (let i = 0; i < lPos.length; i++) {
                let pos = lPos[i]
                pos = pos.replace('：', ':')
                pos = pos.split(':')
                if (pos.length === 2) {
                    pos = parseInt(pos[0]) * 60 + parseInt(pos[1])
                    comment.text = comment.text.replace(lPos[i], '<a class="video-seek" data-p="-1" data-time="' + pos + '">' + lPos[i] + '</a>')
                }
                if (pos.length === 3) {
                    pos = parseInt(pos[0]) * 3600 + parseInt(pos[1]) * 60 + parseInt(pos[2])
                    comment.text = comment.text.replace(lPos[i], '<a class="video-seek" data-p="-1" data-time="' + pos + '">' + lPos[i] + '</a>')
                }
            }
        }

        let shtml = format('<div class="list-item reply-wrap " data-id="0" data-index="' + iComment + '">\n' +
            '    <div class="user-face">\n' +
            '        <a href="https://www.youtube.com/channel/{channel}" target="_blank" data-usercard-mid="{channel}">\n' +
            '            <div class="bili-avatar">\n' +
            '                <img width="48" height="48" class="bili-avatar-img bili-avatar-face bili-avatar-img-radius"\n' +
            '                     src="{photo}"\n' +
            '                     alt="">\n' +
            '\n' +
            '\n' +
            '                <span class="bili-avatar-icon"></span>\n' +
            '            </div>\n' +
            '        </a>\n' +
            '    </div>\n' +
            '    <div class="con ">\n' +
            '        <div class="user">\n' +
            '            <a data-usercard-mid="{channel}" href="https://www.youtube.com/channel/{channel}"\n' +
            '               target="_blank" class="name"\n' +
            '               style="color">{author}\n' +
            '            </a>\n' +
            '\n' +
            '        </div>\n' +
            '        <p class="text">{text}</p>\n' +
            '        <div class="info">\n' +
            '            <span class="time">{time}</span>\n' +
            '            <span class="like ">\n' +
            '                <i></i>\n' +
            '                <span>{votes}</span>\n' +
            '            </span>\n' +
            '        </div>\n' +
            '        <div class="reply-box"></div>\n' +
            '        <div class="paging-box"></div>\n' +
            '    </div>\n' +
            '</div>', comment)

        return createElement(shtml)

    }

    async function renderPage() {
        if (youtubeManager.isEnd) {
            return true
        }
        let url = 'http://127.0.0.1:800/youtube_comment/?youtubeid=' + youtubeManager.youtubeId
        if (youtubeManager.continuation !== null) {
            url += '&continuation=' + encodeURIComponent(youtubeManager.continuation) + '&itct=' + encodeURIComponent(youtubeManager.itct)// + '&session_token=' + encodeURIComponent(youtubeManager.session_token)
        }
        let ret = await parse(
            url, true
        )
        let dComment = ret['comments']
        youtubeManager.continuation = ret['continuation']
        youtubeManager.itct = ret['itct']
        youtubeManager.session_token = ret['session_token']
        let commentList = document.querySelector("#comment > div > div.comment > div > div.comment-list")

        for (let i = 0; i < dComment.length; i++) {
            let comment = dComment[i]
            let commentElement = createReply(i, comment)
            if (comment.hasOwnProperty('replyCount')) {
                let replyButton = createElement('<div  class="view-more" ">共<b>' + comment.replyCount + '</b>条回复, <a class="btn-more" data-pid="0" data-fold="false">点击查看</a></div>')
                replyButton.continuation = comment["replies"][0]
                replyButton.itct = comment["replies"][1]
                commentElement.querySelector('div[class="reply-box"]').appendChild(replyButton)
                replyButton.addEventListener('click', async (e) => {
                    if (replyButton.querySelector('a[class="btn-more"]').textContent !== '加载中...' && replyButton.style.display !== 'none') {
                        replyButton.querySelector('a[class="btn-more"]').textContent = '加载中...'
                    } else {
                        return
                    }
                    console.log(replyButton.continuation)
                    console.log(replyButton.itct)
                    let url = 'http://127.0.0.1:800/youtube_comment/?youtubeid=' + youtubeManager.youtubeId
                    url += '&continuation=' + encodeURIComponent(replyButton.continuation)
                        + '&itct=' + encodeURIComponent(replyButton.itct)
                        // + '&session_token=' + encodeURIComponent(youtubeManager.session_token)
                        + '&action=action_get_comment_replies'
                    ret = await parse(
                        url, true
                    )
                    let dComment = ret['comments']

                    for (i = 0; i < dComment.length; i++) {
                        let commentElement = createReply(i, dComment[i])
                        replyButton.parentElement.insertBefore(commentElement, replyButton)
                    }
                    replyButton.querySelector('b').textContent = (parseInt(replyButton.querySelector('b').textContent) - dComment.length).toString()
                    if (ret['continuation'] !== null) {
                        replyButton.itct = ret['itct']
                        replyButton.continuation = ret['continuation']
                    } else {
                        replyButton.style.display = 'none'
                    }
                })
            }
            commentList.appendChild(commentElement)
            youtubeManager.commentList.push(commentElement)
        }
        if (ret['continuation'] == null) {
            youtubeManager.isEnd = true
        }
        return ret['continuation'] == null;
    }

    async function parse(url, json) {
        let res = await postExtension('parse', {url: url})
        if (json) {
            return JSON.parse(res)
        } else {
            return res
        }
    }

    async function postExtension(messageType, data) {
        let timeStamp = new Date().getTime();
        data.type = messageType
        data.timeStamp = timeStamp
        data.source = 'DFex'
        chrome.runtime.sendMessage(data);
        return await new Promise(resolve => {
            function handle(resp, sender, sendResponse) {
                console.log(resp)
                if (resp.type !== data.type + '_response' || resp.timeStamp !== timeStamp)
                    return;
                chrome.runtime.onMessage.removeListener(handle)
                resolve(resp.content)
            }

            chrome.runtime.onMessage.addListener(handle)
        })
    }

    async function postHook(messageType, data) {
        let timeStamp = new Date().getTime();
        data.type = messageType
        data.timeStamp = timeStamp
        data.source = 'DFex'
        window.postMessage(data, "*");
    }

    let realStyle = function (_elem, _style) {
        let computedStyle;
        if (typeof _elem.currentStyle != 'undefined') {
            computedStyle = _elem.currentStyle;
        } else {
            computedStyle = document.defaultView.getComputedStyle(_elem, null);
        }

        return _style ? computedStyle[_style] : computedStyle;
    };

    let copyComputedStyle = function (s, dest) {
        for (let i in s) {
            // Do not use `hasOwnProperty`, nothing will get copied
            if (typeof i == "string" && i != "cssText" && !/\d/.test(i)) {
                // The try is for setter only properties
                try {
                    dest.style[i] = s[i];
                    // `fontSize` comes before `font` If `font` is empty, `fontSize` gets
                    // overwritten.  So make sure to reset this property. (hackyhackhack)
                    // Other properties may need similar treatment
                    if (i == "font") {
                        dest.style.fontSize = s.fontSize;
                    }
                } catch (e) {
                }
            }
        }
    };

    window.loadPage = function (i, e) {
        if (!document.querySelector('li[class="youtube-comment on"]')) {
            this.originLoadPage(i, e)
            youtubeManager.showed = false
            return
        }
        if (youtubeManager.showed !== true) {
            let commentList = document.querySelector("#comment > div > div.comment > div > div.comment-list")
            for (let i = commentList.childNodes.length - 1; i >= 0; i--) {
                commentList.removeChild(commentList.childNodes[i]);
            }
            for (let i = 0; i < youtubeManager.commentList.length; i++) {
                commentList.appendChild(youtubeManager.commentList[i])
            }
            youtubeManager.showed = true
        }

        let o = this;
        o.loading = !0
        let loadingState = document.querySelector("#comment > div > div.comment > div > div.loading-state")
        loadingState.innerHTML = '正在加载中...'

        renderPage()
            .then(function (e) {
                e ? loadingState.innerHTML = "没有更多评论" : loadingState.innerHTML = ""
            })
            .catch(function (e) {
                console.log(e)
                o.loaded || o._showLoading('<span>加载失败，<a class="reload-comment">点击重试</a></span>')
            })
            .finally(function () {
                o.loading = !1
            })
    }

    function removeClasses(ele, txt) {
        let str = ele.className,
            index = str.indexOf(txt);
        if (index > -1) {
            ele.className = str.replace(' ' + txt, "");
        }
    }

    function addClass(ele, txt) {
        let str = ele.className,
            index = str.indexOf(txt);
        if (index === -1) {
            ele.className += ' ' + txt
        }
    }

    let createElement = function (sHtml) {
        // 创建一个可复用的包装元素
        let recycled = document.createElement('div'),
            // 创建标签简易匹配
            reg = /^<([a-zA-Z]+)(?=\s|\/>|>)[\s\S]*>$/,
            // 某些元素HTML标签必须插入特定的父标签内，才能产生合法元素
            // 另规避：ie7-某些元素innerHTML只读
            // 创建这些需要包装的父标签hash
            hash = {
                'colgroup': 'table',
                'col': 'colgroup',
                'thead': 'table',
                'tfoot': 'table',
                'tbody': 'table',
                'tr': 'tbody',
                'th': 'tr',
                'td': 'tr',
                'optgroup': 'select',
                'option': 'optgroup',
                'legend': 'fieldset'
            };
        // 闭包重载方法（预定义变量避免重复创建，调用执行更快，成员私有化）
        createElement = function (sHtml) {
            // 若不包含标签，调用内置方法创建并返回元素
            if (!reg.test(sHtml)) {
                return document.createElement(sHtml);
            }
            // hash中是否包含匹配的标签名
            let tagName = hash[RegExp.$1.toLowerCase()];
            // 若无，向包装元素innerHTML，创建/截取并返回元素
            if (!tagName) {
                recycled.innerHTML = sHtml;
                return recycled.removeChild(recycled.firstChild);
            }
            // 若匹配hash标签，迭代包装父标签，并保存迭代层次
            let deep = 0, element = recycled;
            do {
                sHtml = '<' + tagName + '>' + sHtml + '</' + tagName + '>';
                deep++;
            }
            while (tagName = hash[tagName]);
            element.innerHTML = sHtml;
            // 根据迭代层次截取被包装的子元素
            do {
                element = element.removeChild(element.firstChild);
            }
            while (--deep > -1);
            // 最终返回需要创建的元素
            return element;
        }
        // 执行方法并返回结果
        return createElement(sHtml);
    }


    function renderYoutubeButton() {
        youtubeManager.created = true
        console.log('加载油管评论', youtubeManager.youtubeId)
        let commentTitle = document.querySelector("#comment > div > div.comment > div > div.comment-header.clearfix > div.tabs-order > ul")
        let youtubeListItem = createElement('<li class="youtube-comment" style="display: list-item;">油管评论</li>')
        commentTitle.appendChild(youtubeListItem)
    }

    console.log('inject xhrhook')
    let script = document.createElement("script");
    script.src = chrome.runtime.getURL("xhr_hook.js");

    document.head.appendChild(script);
    // script = document.createElement("script");
    // script.src = chrome.runtime.getURL("commentFresh.js");
    // document.head.appendChild(script);

}


