(function () {
    'use strict'
    if (XMLHttpRequest.prototype.pakku_open) return;


    //postHook Listener
    window.addEventListener("message", function (event) {
            if (event.source !== window || !event.data || !event.data.type) return;
            // console.log(event.data)
            if (event.data.type === 'replaceLoadPage') {
                eval('window.bbComment.prototype.originLoadPage=' + window.bbComment.prototype.loadPage.toString())
                if (!window.loadPage) {
                    window.loadPage = buildLoadPage(event.data.lastDesc)
                }
                window.bbComment.prototype.loadPage = function (i, e) {
                    if (!window.loadPage || window.loadPage(i, e)) {
                        this.originLoadPage(i, e)
                    }
                }
            }
            if (event.data.type && event.data.type === "pakku_ajax_response") callbacks[event.data.arg](event.data.resp);
            if (event.data.type && event.data.type === "load_danmaku" && event.origin !== 'https://message.bilibili.com') {
                loadDanmu(event.data.ldanmu)
            }
            if (event.data.type && event.data.type === "load_twitch_chat" && event.origin !== 'https://message.bilibili.com') {
                let lTwitchDanmu = event.data.ldanmu

                loadDanmu(event.data.ldanmu)
                let startTime = event.data.startTime
                if (!startTime) startTime = 0
                let twitchSegment = []
                twitchSegment.push({
                    start: startTime,
                    end: event.data.ldanmu[event.data.ldanmu.length - 1].progress / 1000,
                    cursor: event.data.cursor,
                    vid: event.data.vid
                })

                function appendTwitchChat(ldanmu) {
                    let tldanmu = []
                    ldanmu.forEach(function (t) {
                        for (let danmu of lTwitchDanmu) {
                            if (danmu.progress === t.progress && danmu.content === t.content) {
                                return
                            }
                        }
                        tldanmu.push(t)
                    })
                    lTwitchDanmu = lTwitchDanmu.concat(tldanmu)
                    loadDanmu(tldanmu)
                }

                window.closure.danmakuPlayer.bind('video_progress_update', async function (e, t) {
                    let currentTime = t.currentTime
                    let segFound = false
                    for (let seg of twitchSegment) {
                        if (currentTime > seg.start && currentTime < seg.end) {
                            segFound = true
                            if (currentTime + 10 > seg.end) {
                                if (!seg.cursor || seg.loading) continue
                                seg.loading = true
                                console.log('continue twitch seg', currentTime, seg)
                                let result = await postExtension('twitch_chat', seg)
                                seg.loading = false
                                seg.end = result.ldanmu[result.ldanmu.length - 1].progress / 1000
                                seg.cursor = result.cursor
                                appendTwitchChat(result.ldanmu)
                            }
                            break
                        }
                    }
                    if (!segFound) {
                        let seg = {
                            start: currentTime,
                            end: currentTime + 10,
                            vid: event.data.vid,
                            loading: true
                        }
                        twitchSegment.push(seg)
                        console.log('new twitch seg', currentTime)
                        let result = await postExtension('twitch_chat', {
                            startTime: parseInt(currentTime),
                            vid: event.data.vid
                        })
                        seg.loading = false
                        seg.cursor = result.cursor
                        if (result.cursor) {
                            seg.end = result.ldanmu[result.ldanmu.length - 1].progress / 1000
                        } else {
                            seg.end = NaN
                        }
                        seg.cursor = result.cursor
                        appendTwitchChat(result.ldanmu)
                    }
                })
            }
        }
        ,
        false
    );

    async function postExtension(messageType, data, hasCallback = true) {
        let timeStamp = new Date().getTime();
        if (!data) data = {}
        data.type = messageType
        data.timeStamp = timeStamp
        data.source = 'DFex'
        data.hasCallback = hasCallback
        window.postMessage(
            data
            , "*");
        if (hasCallback) {
            return await new Promise((resolve) => {
                    let handle = (event) => {
                        if (event.source === window && event.data
                            && event.data.type === messageType + '_response'
                            && event.data.timeStamp === timeStamp) {
                            window.removeEventListener('message', handle)
                            resolve(event.data.content)
                        }
                    }
                    window.addEventListener("message", handle, false);
                }
            )
        }
    }


    let callbacks = {};
    (function pakkuXhrHook() {
        // https://github.com/xmcp/pakku.js/blob/master/pakkujs/assets/xhr_hook.js
        XMLHttpRequest.prototype.pakku_open = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
            this.pakku_url = url;
            return this.pakku_open(method, url, async === undefined ? true : async, user, password);
        };
        XMLHttpRequest.prototype.pakku_addEventListener = XMLHttpRequest.prototype.addEventListener;
        XMLHttpRequest.prototype.addEventListener = function (name, callback) {
            if (name === "load") {
                this.pakku_load_callback = this.pakku_load_callback || [];
                this.pakku_load_callback.push(callback);
            }
            return this.pakku_addEventListener(name, callback);
        };
        XMLHttpRequest.prototype.pakku_send = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = (function () {
            function uint8array_to_arraybuffer(array) {
                // https://stackoverflow.com/questions/37228285/uint8array-to-arraybuffer
                return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
            }

            function str_to_arraybuffer(str) {
                // https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
                let buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
                let bufView = new Uint16Array(buf);
                for (let i = 0, strLen = str.length; i < strLen; i++) {
                    bufView[i] = str.charCodeAt(i);
                }
                return buf;
            }

            function byte_object_to_arraybuffer(obj) {
                let ks = Object.keys(obj);
                let buf = new ArrayBuffer(ks.length);
                let bufView = new Uint8Array(buf);
                ks.forEach(function (i) {
                    bufView[i] = obj[i];
                });
                return buf;
            }

            function send_msg_proxy(arg, callback, type = "pakku_ajax_request") {
                callbacks[arg] = callback;
                window.postMessage({
                    type: type,
                    arg: arg,
                    loadDanmu: hasLoadDanmu()
                }, "*");
            }

            return function (arg) {
                if ((this.pakku_url.indexOf("list.so") !== -1
                    || this.pakku_url.indexOf('seg.so') !== -1) && this.pakku_url.indexOf('data.bilibili.com') === -1
                ) {
                    // || this.pakku_url.indexOf('web-interface/view') !== -1) {
                    // injectUI()
                    let link = document.createElement("a");
                    link.href = this.pakku_url;
                    this.pakku_url = link.href;
                    let that = this;
                    console.log(this.pakku_url)
                    if (this.pakku_load_callback || this.onreadystatechange !== null) {
                        send_msg_proxy(that.pakku_url, function (resp) {

                            if (!resp || !resp.data) return that.pakku_send(arg);
                            Object.defineProperty(that, "response", {
                                writable: true
                            });
                            Object.defineProperty(that, "responseText", {
                                writable: true
                            });
                            Object.defineProperty(that, "readyState", {
                                writable: true
                            });
                            Object.defineProperty(that, "status", {
                                writable: true
                            });
                            Object.defineProperty(that, "statusText", {
                                writable: true
                            });
                            Object.defineProperty(that, "responseURL", {
                                writable: true
                            });

                            if (that.responseType === 'arraybuffer') {
                                if (resp.data instanceof Uint8Array)
                                    that.response = uint8array_to_arraybuffer(resp.data);
                                else if (resp.data instanceof Object) // uint8arr object representation {0: ord, 1: ord, ...}
                                    that.response = byte_object_to_arraybuffer(resp.data);
                                else // maybe str
                                    that.response = str_to_arraybuffer(resp.data);
                                that.responseURL = 'file:'
                            } else {
                                that.response = that.responseText = resp.data;
                            }
                            // console.log(resp.data)
                            that.readyState = 4;
                            that.status = 200;
                            that.statusText = "Pakku OK";
                            console.log("pakku ajax: got tampered response for", that.pakku_url);
                            that.abort();
                            if (that.pakku_load_callback) {
                                for (let i = 0; i < that.pakku_load_callback.length; i++) that.pakku_load_callback[i].bind(that)();
                            }
                            if (that.onreadystatechange) {
                                that.onreadystatechange()
                            }
                        });
                    } else {
                        console.log("pakku ajax: ignoring request as no onload callback found", this.pakku_url);
                        return that.pakku_send(arg);
                    }
                } else if (this.pakku_url.indexOf('season?ep_id') !== -1) {
                    console.log('hook seasonInfo')
                    this.pakku_addEventListener('readystatechange', function (s) {
                        if (4 === s.target.readyState) {
                            console.log('post seasonInfo')
                            window.postMessage({
                                type: 'seasonInfo',
                                arg: s.target.responseText
                            }, "*");
                        }
                    })
                    return this.pakku_send(arg)
                } else {
                    return this.pakku_send(arg)
                }
            };
        })();
        return true
    })();

    (function closureExpose() {
        if (window.location.href.indexOf('https://www.bilibili.com/bangumi') === -1
            && window.location.href.indexOf('https://www.bilibili.com/video') === -1) {
            return;
        }
        try {
            if (window.top.closure && window.top.closure.danmakuPlayer) return;
        } catch (e) {
            console.log(e)
            return;
        }
        let widgetsJsonpString = null
        if (window.top.nanoWidgetsJsonp && !window.top.nanoWidgetsJsonp.pakku_push) {
            widgetsJsonpString = 'nanoWidgetsJsonp'
        }
        if (window.top.videoWidgetsJsonP && !window.top.videoWidgetsJsonP.pakku_push) {
            widgetsJsonpString = 'videoWidgetsJsonP'
        }
        if (!widgetsJsonpString) return
        let widgetsJsonp = eval('window.top.' + widgetsJsonpString)
        window.top.closure = {
            danmakuPlayer: null,
            danmukuScroll: null
        }
        widgetsJsonp.pakku_push = widgetsJsonp.push
        widgetsJsonp.push = function (obj) {
            for (let prop in obj[1]) {

                try {
                    if (!window.top.closure.danmakuPlayer) {

                        if (obj[1][prop].toString().indexOf('initDanmaku()') !== -1) {
                            console.log(prop, obj[1])
                            window.top.eval(`window.top.${widgetsJsonpString}[window.top.${widgetsJsonpString}.length-1][1][${prop}]=`

                                // eval('obj[1][prop]='
                                + obj[1][prop].toString().replace('initDanmaku()', 'initDanmaku();window.top.closure.danmakuPlayer=this,console.log(this,window.top)'))
                            loadDanmu = function (ldanmu) {
                                console.log('loadDanmu', ldanmu)
                                window.top.closure.danmakuPlayer.dmListStore.appendDm(ldanmu)
                                window.top.closure.danmakuPlayer.dmListStore.refresh()
                            }
                        }
                        if (obj[1][prop].toString().indexOf('firstPb') !== -1) {
                            console.log(prop, obj[1])
                            window.top.eval(`window.top.${widgetsJsonpString}[window.top.${widgetsJsonpString}.length-1][1][${prop}]=`

                                // eval('obj[1][prop]='
                                + obj[1][prop].toString().replace('this.allDM=', 'window.top.closure.danmakuPlayer=this.player,console.log(this,window.top),this.allDM='))
                            loadDanmu = function (ldanmu) {
                                console.log('loadDanmu', ldanmu)
                                window.top.closure.danmakuPlayer.danmaku.loadPb.appendDm(ldanmu)
                                try {
                                    window.top.closure.danmukuScroll.reLoad()
                                } catch (e) {
                                    console.log(e)
                                }
                            }
                        }
                    }
                    if (obj[1][prop].toString().indexOf('listMask.show())') !== -1) {
                        console.log(prop, obj[1], 'danmukuScroll')
                        window.top.eval(`window.top.${widgetsJsonpString}[window.top.${widgetsJsonpString}.length-1][1][${prop}]=`
                            + obj[1][prop].toString().replace('o=this.child;', 'o=this.child;' +
                                'if(!window.top.closure.danmukuScroll){window.top.closure.danmukuScroll=this,console.log(this,window.top);}'))
                    }
                } catch (e) {
                    console.log(e, window.top, window)
                }
                widgetsJsonp.pakku_push(obj)

            }
        }
        console.log(window.nanoWidgetsJsonp)
    })();

    let youtubeManager = {
        youtubeId: null,
        created: false,
        isEnd: false,
        context: null,
        ytcfg: null,
        showed: false,
        lastHref: window.location.href,
        commentList: []
    }

    function buildLoadPage(lastDesc,) {
        async function sleep(seconds) {
            await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
        }

        async function parse(url, json = false) {
            let res = await postExtension('parse', {url: url})
            while (!res) {
                await sleep(2)
                res = await postExtension('parse', {url: url})
            }
            if (json) {
                return JSON.parse(res)
            } else {
                return res
            }
        }

        if (youtubeManager.lastHref !== window.location.href) {
            youtubeManager = {
                youtubeId: null,
                created: false,
                isEnd: false,
                endpoint: null,
                ytcfg: null,
                showed: false,
                lastHref: window.location.href,
                commentList: []
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
            let url = 'server::/youtube_comment?youtubeid=' + youtubeManager.youtubeId
            if (youtubeManager.endpoint) {
                url += '&context=' + encodeURIComponent(JSON.stringify([youtubeManager.endpoint, youtubeManager.ytcfg]))
            }
            let ret = await parse(
                url, true
            )
            console.log(ret)
            let dComment = ret[0]
            youtubeManager.endpoint = ret[1]
            if (ret[2]) youtubeManager.ytcfg = ret[2]
            youtubeManager.session_token = ret['session_token']
            let commentList = document.querySelector("#comment > div > div.comment > div > div.comment-list")

            for (let i = 0; i < dComment.length; i++) {
                let comment = dComment[i]
                let commentElement = createReply(i, comment)
                if (comment.hasOwnProperty('comment')) {
                    let replyButton = createElement('<div  class="view-more" ">共<b>' + comment.comment + '</b>条回复, <a class="btn-more" data-pid="0" data-fold="false">点击查看</a></div>')
                    replyButton.continuationEndpoint = comment.continuationEndpoint
                    commentElement.querySelector('div[class="reply-box"]').appendChild(replyButton)
                    replyButton.addEventListener('click', async (e) => {
                        if (replyButton.querySelector('a[class="btn-more"]').textContent !== '加载中...' && replyButton.style.display !== 'none') {
                            replyButton.querySelector('a[class="btn-more"]').textContent = '加载中...'
                        } else {
                            return
                        }
                        let url = 'server::/youtube_comment?youtubeid=' + youtubeManager.youtubeId
                        url += '&context=' + encodeURIComponent(JSON.stringify([replyButton.continuationEndpoint, youtubeManager.ytcfg]))
                        ret = await parse(
                            url, true
                        )
                        let dComment = ret[0]

                        for (let j = 0; j < dComment.length; j++) {
                            let commentElement = createReply(j, dComment[j]);
                            replyButton.parentElement.insertBefore(commentElement, replyButton)
                        }
                        replyButton.querySelector('b').textContent = (parseInt(replyButton.querySelector('b').textContent) - dComment.length).toString()
                        if (ret[1]) {
                            replyButton.childNodes[0].data = '更多'
                            replyButton.continuationEndpoint = ret[1]
                            replyButton.querySelector('a[class="btn-more"]').textContent = '点击加载'
                        } else {
                            replyButton.style.display = 'none'
                        }
                    })
                }
                commentList.appendChild(commentElement)
                youtubeManager.commentList.push(commentElement)
            }
            if (ret[1] == null) {
                youtubeManager.isEnd = true
            }
            return ret[1] == null;
        }

        function renderYoutubeButton() {
            youtubeManager.created = true
            console.log('加载油管评论', youtubeManager.youtubeId)
            let commentTitle = document.querySelector("#comment > div > div.comment > div > div.comment-header.clearfix > div.tabs-order > ul")
            let youtubeListItem = createElement('<li class="youtube-comment" style="display: list-item;">油管评论</li>')
            commentTitle.appendChild(youtubeListItem)
        }

        let youtubeId = lastDesc[3].youtube
        if (youtubeManager.created === false) {
            youtubeManager.youtubeId = youtubeId
            renderYoutubeButton()
        }
        return function (i, e) {

            if (!document.querySelector('li[class="youtube-comment on"]')) {
                youtubeManager.showed = false
                return true
            }
            let o = this;

            if (youtubeManager.showed !== true) {
                let commentList = document.querySelector("#comment > div > div.comment > div > div.comment-list")
                for (let i = commentList.childNodes.length - 1; i >= 0; i--) {
                    commentList.removeChild(commentList.childNodes[i]);
                }
                for (let i = 0; i < youtubeManager.commentList.length; i++) {
                    commentList.appendChild(youtubeManager.commentList[i])
                }
                youtubeManager.showed = true
            } else {
                if (o.loading
                ) return;
            }


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
    }

    let loadDanmu = null

    function hasLoadDanmu() {
        if (loadDanmu) {
            return true
        }
    }

    console.log("pakku ajax: hook set");
})();
