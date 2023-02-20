(function () {
    'use strict'
    if (XMLHttpRequest.prototype.pakku_open) return;

    let setting = {}
    postExtension("getSetting").then(function (result) {
        setting = result.setting
    })
    //postHook Listener
    window.addEventListener("message", function (event) {
            if (event.source !== window || !event.data || !event.data.type) return;
            // console.log(event.data)
            if (event.data.type === 'replaceLoadPage') {
                console.log('replaceLoadPage')
                let loadPage = buildLoadPage(event.data.youtube)
                if (!loadPage) return;
                if (window.bbComment.prototype.originLoadPage) {
                    return;
                }
                eval('window.bbComment.prototype.originLoadPage=' + window.bbComment.prototype.loadPage.toString())
                if (!window.loadPage) {
                    window.loadPage = buildLoadPage(event.data.youtube)
                }
                window.bbComment.prototype.loadPage = function (i, e) {
                    if (!window.loadPage || window.loadPage(i, e)) {
                        this.originLoadPage(i, e)
                    }
                }
            }
            if (event.data.type && event.data.type === "pakku_ajax_response") {
                callbacks[event.data.arg](event.data.resp);
                delete callbacks[event.data.arg]
            }
            if (event.data.type && event.data.type === "load_danmaku" && event.origin !== 'https://message.bilibili.com') {
                window.top.closure.loadDanmu(event.data.ldanmu)
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

    let callbacksAfterDanmakuRequest = [
        () => {
            while (console.log.__sentry_original__) {
                console.log = console.log.__sentry_original__
            }
            while (
                Element.prototype.addEventListener.__sentry_original__
                ) {
                Element.prototype.addEventListener = Element.prototype.addEventListener.__sentry_original__
            }
            console.log('disable sentry')
        },
        biliEvolvedPlugin
    ];
    let callbacks = {};
    let loadedSegmentList = [];
    let currentCid = null;


    (function pakkuXhrHook() {
        async function hasLoadDanmu() {
            await new Promise((resolve) => setTimeout(resolve, 1));
            if (window.top.closure && window.top.closure.loadDanmu) {
                return true
            }
        }

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

            async function send_msg_proxy(arg, callback, type = "pakku_ajax_request") {
                callbacks[arg] = callback;
                window.postMessage({
                    type: type,
                    arg: arg,
                    loadDanmu: await hasLoadDanmu()
                }, "*");
            }

            return function (arg) {

                if (
                    this.pakku_url.indexOf('seg.so') !== -1 && this.pakku_url.indexOf('segment_index') !== -1
                    && this.pakku_url.indexOf('data.bilibili.com') === -1
                ) {
                    while (callbacksAfterDanmakuRequest.length !== 0) {
                        let callback = callbacksAfterDanmakuRequest.pop()
                        callback()
                    }
                    // || this.pakku_url.indexOf('web-interface/view') !== -1) {
                    // injectUI()
                    let link = document.createElement("a");
                    link.href = this.pakku_url;
                    this.pakku_url = link.href;
                    let that = this;
                    let cid = /oid=(\d+)/.exec(that.pakku_url)[1]
                    console.log(currentCid, '/', cid)
                    if (cid !== currentCid) {
                        currentCid = cid
                        console.log('cid changed,clear')
                        loadedSegmentList = []
                    }
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
                            that.responseURL = that.pakku_url
                            console.log("pakku ajax: got tampered response for", that.pakku_url);
                            that.pakku_load_callback = that.pakku_load_callback || [];
                            if (that.onreadystatechange)
                                that.pakku_load_callback.push(that.onreadystatechange);
                            if (that.onload)
                                that.pakku_load_callback.push(that.onload);
                            if (that.pakku_load_callback.length > 0) {
                                for (let i = 0; i < that.pakku_load_callback.length; i++) that.pakku_load_callback[i].bind(that)();
                            }
                        });
                    } else {
                        console.log("pakku ajax: ignoring request as no onload callback found", this.pakku_url);
                        return that.pakku_send(arg);
                    }
                } else if (youtubeManager.loadComment && this.pakku_url.indexOf("x/v2/reply") !== -1) {
                    youtubeManager.loadComment(this.pakku_url).then((response) => {
                        this.abort();
                        Object.defineProperty(this, "response", {
                            writable: true
                        });
                        Object.defineProperty(this, "responseText", {
                            writable: true
                        });
                        Object.defineProperty(this, "readyState", {
                            writable: true
                        });
                        Object.defineProperty(this, "status", {
                            writable: true
                        });
                        Object.defineProperty(this, "statusText", {
                            writable: true
                        });
                        Object.defineProperty(this, "responseURL", {
                            writable: true
                        });

                        this.response = this.responseText = response;
                        // console.log(resp.data)
                        this.readyState = 4;
                        this.status = 200;
                        this.statusText = "Pakku OK";
                        this.responseURL = this.pakku_url
                        console.log("pakku ajax: got tampered response for", this.pakku_url);
                        this.pakku_load_callback = this.pakku_load_callback || [];
                        for (let callback of [this.onreadystatechange, this.onload, this.onloadend]) {
                            if (callback) {
                                this.pakku_load_callback.push(callback);
                            }
                        }
                        if (this.pakku_load_callback.length > 0) {
                            for (let i = 0; i < this.pakku_load_callback.length; i++) this.pakku_load_callback[i].bind(this)();
                        }
                    }).catch(() => {
                        return this.pakku_send(arg)
                    })
                } else {
                    let cacheUrlList = [{
                        type: 'season',
                        pattern: 'season?ep_id'
                    }, {
                        type: 'view',
                        pattern: 'view?aid='
                    }]
                    let url = this.pakku_url
                    for (let cache of cacheUrlList) {
                        if (this.pakku_url.indexOf(cache.pattern) !== -1) {
                            this.pakku_addEventListener('readystatechange', function (s) {
                                if (4 === s.target.readyState) {
                                    window.postMessage({
                                        type: 'cacheUrl',
                                        url: url,
                                        urlType: cache.type,
                                        data: s.target.response,
                                    }, "*");
                                }
                            })
                        }
                    }

                    return this.pakku_send(arg)
                }
            };
        })();
        return true
    })();

    (function closureExpose() {
        function hookFunction(target, functionName, newFunction) {
            let __pakku_origin__ = target[functionName]
            target[functionName] = function () {
                newFunction.apply(target, arguments)
                __pakku_origin__.apply(target, arguments)
            }
        }

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
        let widgetsJsonp = eval(' window.top.' + widgetsJsonpString)
        if (!window.top.closure) {
            window.top.closure = {
                danmakuPlayer: null,
                danmakuScroll: null
            }
            for (let key of Object.keys(window.top.closure)) {
                Object.defineProperty(window.top.closure, key, {
                    set: function (value) {
                        let callback = window.top.closure['_' + key]
                        window.top.closure['_' + key] = value
                        if (callback) {
                            callback()
                        }
                    },
                    get: function () {
                        return window.top.closure['_' + key]
                    }
                })
            }
        }
        widgetsJsonp.pakku_push = widgetsJsonp.push
        let injectList = [
            {
                keyword: 'initDanmaku()',
                replaceList: [
                    [',this.initDanmaku()', ',this.initDanmaku(),window.top.closure.danmakuPlayer=this,console.log(this)']
                ],
                callback: function () {
                    window.top.closure.loadDanmu = function (ldanmu) {
                        console.log('loadDanmu', ldanmu)
                        let temp = []
                        for (let danmu of ldanmu) {
                            temp.push({
                                color: danmu.color,
                                date: danmu.ctime,
                                mode: danmu.mode,
                                size: danmu.fontsize,
                                stime: danmu.progress,
                                text: danmu.content,
                                uhash: danmu.midHash,
                                weight: danmu.weight ? danmu.weight : 10,
                                dmid: danmu.id,
                            })
                        }
                        ldanmu = temp
                        if (window.top.closure.danmakuPlayer.dmListStore && window.top.closure.danmakuPlayer.dmListStore.appendDm) {
                            window.top.closure.danmakuPlayer.dmListStore.appendDm(ldanmu)
                            window.top.closure.danmakuPlayer.dmListStore.refresh()
                        } else {
                            //add at 2022.12.16
                            window.top.closure.danmakuPlayer.danmaku.addList(ldanmu)
                        }
                        if (window.top.closure.danmakuScroll) {
                            window.top.closure.danmakuScroll.toinit()
                        }
                    };
                    setInterval(
                        async function () {
                            if (window.top.player && currentCid) {
                                let currentTime = window.top.player.getCurrentTime()
                                let segmentIndex = Math.ceil((currentTime) / 360)
                                if (!loadedSegmentList.includes(segmentIndex)) {
                                    loadedSegmentList.push(segmentIndex)
                                    console.log('postExtension("actualSegment")')
                                    await postExtension("actualSegment", {'segmentIndex': segmentIndex})
                                }
                                if (currentTime + 30 > segmentIndex * 360 && !loadedSegmentList.includes(segmentIndex + 1)) {
                                    loadedSegmentList.push(segmentIndex + 1)
                                    console.log('postExtension("actualSegment")')
                                    await postExtension("actualSegment", {'segmentIndex': segmentIndex + 1})
                                }
                            }
                        },
                        1000
                    )
                }
            },
            {
                keyword: 'firstPb',
                replaceList: [
                    ['this.allDM=', '\nwindow.top.closure.danmakuPlayer=this.player,console.log(this),this.allDM=']
                ],
                callback: function () {
                    window.top.closure.loadDanmu = function (ldanmu) {
                        console.log('loadDanmu', ldanmu)
                        window.top.closure.danmakuPlayer.danmaku.loadPb.appendDm(ldanmu)
                        if (window.top.closure.danmakuScroll) {
                            window.top.closure.danmakuScroll.toinit()
                        }
                    }
                }
            },
            {
                keyword: '弹幕列表填充中',
                replaceList: [
                    ['this.danmaku.style.display="block",',
                        'this.danmaku.style.display = "block",window.top.closure.danmakuScroll=this,']
                ]
            },
        ]

        widgetsJsonp.push = function (obj) {
            for (let prop in obj[1]) {
                try {
                    for (let inject of injectList) {
                        if (obj[1][prop].toString().indexOf(inject.keyword) !== -1) {
                            console.log(prop, obj[1], inject.keyword)
                            let injectedFunction = obj[1][prop].toString()
                            let injected = false
                            for (let r of inject.replaceList) {
                                if (typeof r === 'string') {
                                    throw inject
                                }
                                let [src, dst] = r
                                if (injectedFunction.indexOf(src) === -1) {
                                    console.log('inject for', src, 'not found')
                                } else {
                                    injected = true
                                    console.log('replace ', src)
                                    injectedFunction = injectedFunction.replace(src, dst)
                                }
                            }
                            if (injected) {
                                if (inject.callback) {
                                    inject.callback()
                                }
                                try {
                                    window.top.eval(`window.top.${widgetsJsonpString}[window.top.${widgetsJsonpString}.length-1][1][${prop}]=`
                                        + injectedFunction
                                    )
                                } catch (e) {
                                    console.log(e)
                                    console.log(e.stack)
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log(e, window.top, window)
                }
                widgetsJsonp.pakku_push(obj)
            }
        }
        console.log(window.nanoWidgetsJsonp)
    })();

    async function biliEvolvedPlugin() {
        let i = 0, sideBar
        if (document.querySelector('[id="custom-navbar-style"]') || document.querySelector('[id="auto-hide-sidebar"]')) {
            while (!sideBar && i < 25) {
                i += 1
                sideBar = document.querySelector("body > div.be-settings > div.sidebar")
                await new Promise((resolve) => setTimeout(resolve, 200));
            }
        }
        if (!sideBar) {
            sideBar = copySidebar()
        }
        console.log('sideBar', sideBar)
        let htmlText = `
                        <div title="加载本地弹幕" class="dfex-upload"><i class="be-icon" style="--size:26px;">
                            <div class="custom-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1920">
                                    <path d="m1838.86 1451.576 81.14 81.37-361.566 361.566H361.566L0 1532.946l81.255-81.37 327.891 328.007h1101.708l328.006-328.007ZM962.333 25l500.285 500.285-81.14 81.37-361.795-361.681v1187.559H904.869V244.973L543.188 606.655l-81.14-81.37L962.333 25Z"
                                          fill-rule="evenodd"/>
                                </svg>
                            </div>
                        </i></div>
                        <div title="绑定外站视频" class="dfex-bind"><i class="be-icon" style="--size:26px;">
                            <div class="custom-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1920">
                                    <path d="M1866.003 351.563 1565.128 50.575c-69.46-67.652-180.932-67.426-248.923.565L906.23 461.116c-68.33 68.443-68.33 179.69.113 248.132l31.623 31.624 79.737-79.963-31.624-31.51c-24.282-24.396-24.282-64.038 0-88.433l409.977-409.977c24.508-24.395 64.828-24.17 89.675 0l299.859 299.972c24.734 25.186 24.847 65.619.564 90.014l-409.976 409.977c-24.508 24.282-64.15 24.282-88.546 0l-110.795-110.909 159.473-159.36-79.85-79.85-435.614 435.502-109.779-109.779c-32.866-33.656-76.8-52.292-123.67-52.63-43.596 1.694-92.273 18.296-126.156 52.178L51.377 1316.081c-68.442 68.442-68.442 179.69 0 248.132l301.553 301.553c34.108 34.108 79.059 51.275 124.01 51.275 44.95 0 89.9-17.167 124.122-51.275l409.976-409.977c33.77-33.882 52.405-78.607 52.066-126.042-.226-46.984-18.974-90.918-52.066-123.219l-30.494-30.494-79.85 79.85 30.946 30.945c11.86 11.633 18.41 27.106 18.523 43.595.113 16.942-6.664 33.092-18.974 45.516l-409.977 409.976c-23.492 23.492-64.94 23.492-88.433 0l-301.553-301.553c-11.746-11.746-18.183-27.444-18.183-44.273 0-16.715 6.437-32.414 18.183-44.16l409.977-409.976c12.197-12.31 28.235-19.087 45.063-19.087h.452c16.49.113 31.962 6.663 43.934 19.087l110.344 110.23-162.184 162.297 79.85 79.85 438.324-438.438 110.796 110.908c34.334 34.221 79.171 51.275 124.122 51.275 44.95 0 89.901-17.054 124.122-51.275l409.977-409.977c67.877-67.99 67.99-179.463 0-249.26"
                                          fill-rule="evenodd"/>
                                </svg>
                            </div>
                        </i></div>
                        `
        sideBar.insertAdjacentHTML('beforeend', htmlText);

        function copySidebar() {
            let translateX = setting.hideSidebar ? '-90' : '-50'


            let sideBarHtml = `<style type="text/css">.be-settings {
    line-height: normal;
    font-size: 12px;
    --panel-height: calc(100vh - 120px);
}
.be-settings > .sidebar {
    position: fixed;
    top: 50%;
    z-index: 1002;
    transform: translateX(calc(${translateX}% * var(--direction))) translateY(-50%);
}
body:not(.settings-panel-dock-right) .be-settings {
    --direction: 1;
}
.be-settings > .sidebar > * {
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    width: 26px;
    height: 26px;
    padding: 8px;
    box-sizing: content-box;
    background-color: rgba(255, 255, 255, 0.6666666667);
    border-radius: 50%;
    position: relative;
}
.be-settings > .sidebar > *:not(:last-child) {
    margin-bottom: 26px;
}
.be-settings > .sidebar > *::after {
    content: "";
    width: 140%;
    height: 140%;
    position: absolute;
    top: -20%;
    left: -20%;
    background: transparent;
}
.be-settings > .sidebar > * .be-icon {
    font-size: 26px;
    color: #888;
    fill: #888;
    transition: fill 0.3s ease-out;
}
.be-settings > .sidebar > *:hover {
    transform: translateX(calc(60% * var(--direction))) scale(1.1);
    background-color: #fff;
}
.be-settings > .sidebar > *:hover .be-icon {
    color: #222;
    fill: #222;
}
.be-settings > .sidebar > *.open {
    transform: translateX(calc(100% * var(--direction))) scale(1.5);
    opacity: 0;
}
body:not(.settings-panel-dock-right) .be-settings > .sidebar {
    left: 0;
}
body:not(.settings-panel-dock-right) .settings-panel-popup .settings-panel-content .sidebar {
    border-right: 1px solid rgba(136, 136, 136, 0.1333333333);
}
body.settings-panel-dock-right {
    --direction: -1;
}
body.settings-panel-dock-right .be-settings > .sidebar {
    right: 0;
}
body.settings-panel-dock-right .settings-panel-popup .settings-panel-content .sidebar {
    order: 1;
    border-left: 1px solid rgba(136, 136, 136, 0.1333333333);
}
</style>
<div class="be-settings">
    <div class="sidebar">
        
    </div>
</div>
`
            document.body.insertAdjacentHTML('beforeend', sideBarHtml)
            let sideBar = document.body.querySelector('[class="sidebar"]')
            if (!setting.hideSidebar) {
                let html =
                    `
                    <div title="完全收起侧边栏" id="dfex-hide-sidebar"><i class="be-icon" style="--size:26px;">
                        <div class="custom-icon">
                            <svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.70710678,12 L19.5,12 C19.7761424,12 20,12.2238576 20,12.5 C20,12.7761424 19.7761424,13 19.5,13 L8.70710678,13 L11.8535534,16.1464466 C12.0488155,16.3417088 12.0488155,16.6582912 11.8535534,16.8535534 C11.6582912,17.0488155 11.3417088,17.0488155 11.1464466,16.8535534 L7.14644661,12.8535534 C6.95118446,12.6582912 6.95118446,12.3417088 7.14644661,12.1464466 L11.1464466,8.14644661 C11.3417088,7.95118446 11.6582912,7.95118446 11.8535534,8.14644661 C12.0488155,8.34170876 12.0488155,8.65829124 11.8535534,8.85355339 L8.70710678,12 L8.70710678,12 Z M4,5.5 C4,5.22385763 4.22385763,5 4.5,5 C4.77614237,5 5,5.22385763 5,5.5 L5,19.5 C5,19.7761424 4.77614237,20 4.5,20 C4.22385763,20 4,19.7761424 4,19.5 L4,5.5 Z"/>
                            </svg>
                        </div>
                    </i></div>
                    `
                sideBar.insertAdjacentHTML('beforeend', html)
                let hideButton = sideBar.querySelector('[id="dfex-hide-sidebar"]')
                hideButton.addEventListener("click", function () {
                    hideButton.title = '已收起'
                    postExtension("editSetting", {'key': 'hideSidebar', 'value': true})
                })
                sideBar.appendChild(hideButton)
            }
            return sideBar
        }

        function popupWindow() {
            let html = `
<div id="dfex-window">
    <style type="text/css">
        #dfex-window {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 320px;
            height: 200px;
            background-color: white;
            box-shadow: rgb(51, 51, 51) 0px 0px 10px 0px;
            z-index: 99999;
        }

        #dfex-close {
            position: absolute;
            right: 2px;
            top: 2px;
            background-color: transparent;
            border: none;
            outline: none;
            cursor: pointer;
        }
        
        #dfex-center {
            position: absolute;
            left: 10px;
            top: 10px;
            width: 90%;
            height: 90%;
        }
    </style>
    <div id="dfex-center">
    </div>
    <button id="dfex-close">
            <svg width="20px" height="20px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#000000" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"/></svg>
    </button>
</div>
`
            document.body.insertAdjacentHTML('beforeend', html)
            let window = document.querySelector('[id="dfex-window"]')
            window.querySelector('[id="dfex-close"]').addEventListener('click', function () {
                document.body.removeChild(window)
            })
            window.center = window.querySelector('[id="dfex-center"]')
            document.body.appendChild(window);
            return window
        }

        (function uploadButton() {
            let button = sideBar.querySelector('[class="dfex-upload"]')

            function handle() {
                let html = `<label for="dfex-upload-input">请选择XML弹幕文件:</label><input type="file" accept="application/xml" id="dfex-upload-input">
<p  id="dfex-upload-result"></p>`
                let popup = popupWindow()

                popup.center.innerHTML = html
                let input = popup.center.querySelector('[id="dfex-upload-input"]')
                input.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        let ldanmu = (await postExtension('parseXmlContent', {
                            'content': event.target.result
                        })).ldanmu
                        popup.center.querySelector('[id="dfex-upload-result"]').textContent =
                            '\n' +
                            `从文件中读取到${ldanmu.length}条弹幕\n`
                    };
                    reader.readAsText(file);
                });

                function loadFileDanmaku(reload = false) {
                    const file = input.files[0];
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        let ldanmu = (await postExtension('parseXmlContent', {
                            'content': event.target.result
                        })).ldanmu
                        if (reload) {
                            window.top.closure.danmakuPlayer.dmListStore.allDm = []
                        }
                        window.top.closure.loadDanmu(ldanmu)
                        popup.center.querySelector('[id="dfex-upload-result"]').textContent =
                            '\n' +
                            `从文件中读取到${ldanmu.length}条弹幕\n` +
                            `总弹幕数:${window.top.closure.danmakuPlayer.dmListStore.allDm.length}`
                    };
                    reader.readAsText(file);
                }

                let bottomHtml = `
                    <style>#dfex-upload-reload {
                        position: absolute;
                        right: 8px;
                        bottom: 8px;
                        outline: none;
                        cursor: pointer;
                    }</style>
                    <input type="button" value="重载" id="dfex-upload-reload" title="清空现有弹幕后加载"/>
                    <style>#dfex-upload-append {
                        position: absolute;
                        right: 40px;
                        bottom: 8px;
                        outline: none;
                        cursor: pointer;
                    }</style>
                    <input type="button" value="追加" id="dfex-upload-append" title="同现有弹幕一起加载"/>
                    `

                popup.insertAdjacentHTML('beforeend', bottomHtml)
                popup.querySelector('[id="dfex-upload-reload"]').addEventListener('click', () => {
                    loadFileDanmaku(true)
                })
                popup.querySelector('[id="dfex-upload-append"]').addEventListener('click', () => {
                    loadFileDanmaku(false)
                })
            }

            button.addEventListener('click', handle)
            sideBar.appendChild(button)
        })();

        (function bindButton() {
            let button = sideBar.querySelector('[class="dfex-bind"]')

            async function handle() {
                let lastDesc = (await postExtension("queryDesc")).lastDesc
                let bindDict = {}
                let html = `<style>
                            #dfex-bind-input, #dfex-bind-confirm, #dfex-bind-error, #dfex-bind-result {
                              margin-top: 10px;
                              margin-bottom: 10px;
                               float: left;
                              margin-right: 10px;
                            }</style>
                            <p>请输入需要绑定的网址:</p>
                            <input type="url"  id="dfex-bind-input" style="width: 80%">
                            <input type="button" id="dfex-bind-confirm" value="确定"/>
                            <p id="dfex-bind-error" style="width: 80%">    </p>
                            <div id="dfex-bind-result"></div>`
                let popup = popupWindow()

                let bottomHtml = `
                    <style>#dfex-bind-submit {
                        position: absolute;
                        right: 8px;
                        bottom: 8px;
                        /*border: none;*/
                        outline: none;
                        cursor: pointer;
                        display: none;
                    }</style>
                    <input type="button" value="提交" id="dfex-bind-submit"/>
                    `
                if (lastDesc[3].youtube) {
                    bottomHtml +=
                        `
                        <style>
                            #dfex-bind-youtube-chat {
                            position: absolute;
                            right: 40px;
                            bottom: 8px;
                            outline: none;
                            cursor: pointer;
                        }</style>
                        <input type="button" id="dfex-bind-youtube-chat" value="油管回放弹幕" title="加载直播弹幕"/>
                        `
                }

                popup.insertAdjacentHTML('beforeend',
                    bottomHtml
                )

                popup.center.innerHTML = html
                let input = popup.center.querySelector('input[id="dfex-bind-input"]')
                let confirm = popup.center.querySelector('input[id="dfex-bind-confirm"]')
                let submit = popup.querySelector('input[id="dfex-bind-submit"]')
                let result = popup.center.querySelector('div[id="dfex-bind-result"]')
                let error = popup.center.querySelector('p[id="dfex-bind-error"]')
                let youtubeChat = popup.querySelector('input[id="dfex-bind-youtube-chat"]')
                confirm.addEventListener('click', async function () {
                    error.textContent = ''
                    let bindResult = await postExtension('parseBindInfo', {content: input.value})
                    let keys = Object.keys(bindResult)
                    confirm.value = '继续'
                    if (keys.length === 0) {
                        error.textContent = "错误: 未识别到匹配的网址"
                    } else {
                        for (let key of keys) {
                            bindDict[key] = bindResult[key]
                        }
                        input.value = ''
                        let resultText = ''
                        for (let key of Object.keys(bindDict)) {
                            resultText += `<p>${key}: ${bindDict[key]}</p>`
                        }
                        result.innerHTML = resultText
                        submit.style.display = "block"
                    }
                })
                submit.addEventListener('click', async function () {
                    postExtension('bindVideo', {'bindDict': bindDict})
                    result.innerHTML = '<p>已提交</p>'
                    if (bindDict.youtube) {
                        buildLoadPage(bindDict.youtube)
                    }
                })
                youtubeChat.addEventListener("click", async function () {
                    input.value = "https://www.youtube.com/watch?v=" + lastDesc[3].youtube + "&live=1"
                    confirm.click()
                })
            }

            button.addEventListener('click', handle)
            sideBar.appendChild(button)
        })();
    }

    let youtubeManager = {
        youtubeId: null,
        created: false,
        isEnd: false,
        context: null,
        ytcfg: null,
        showed: false,
        lastHref: window.location.href,
        loadComment: null,
        commentList: [],
        init: true
    }

    let buildLoadPage = function (youtubeId) {
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

        function copyStyle(src, dst) {
            dst.style.cssText = document.defaultView.getComputedStyle(src, "").cssText;
        }

        function buildLoadPageV1(youtubeId,) {
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

                ``
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

        function buildLoadPageV2(youtubeId) {
            if (youtubeManager.lastHref !== window.location.href) {
                youtubeManager = {
                    youtubeId: null,
                    created: false,
                    isEnd: false,
                    context: null,
                    ytcfg: null,
                    showed: false,
                    lastHref: window.location.href,
                    loadComment: null,
                    commentList: [],
                    init: true

                }
            }

            async function renderYoutubeButton() {
                youtubeManager.created = true
                console.log('加载油管评论', youtubeManager.youtubeId)
                let commentTitle = document.querySelector('[class^="nav-sort"]')
                let youtubeListItem = createElement('<div class="youtube-comment">油管评论</div>')


                for (let child of commentTitle.children) {
                    if (child.className.indexOf("sort") !== -1) {
                        child.addEventListener("click", function (event) {
                            if (!event.isTrusted) {
                                return
                            }
                            youtubeManager.init = true
                            youtubeManager.showed = false
                            youtubeListItem.style.color = "#9499a0"
                            event.target.style.color = "#18191c"

                            for (let child1 of commentTitle.children) {
                                if (child1.className.indexOf("sort") !== -1 && child1.className !== event.target.className) {
                                    if (event.target.hiddenActive) {
                                        child1.click()
                                        event.target.click()
                                        event.target.hiddenActive = false
                                    }
                                    child1.style.color = "#9499a0"
                                }
                            }
                        })
                    }
                }
                let existPartSymbol = commentTitle.querySelector('[class="part-symbol"]')
                while (existPartSymbol === null) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                    existPartSymbol = commentTitle.querySelector('[class="part-symbol"]')
                }
                let partSymbol = createElement(existPartSymbol.outerHTML);
                partSymbol.style.color = "#18191c"

                youtubeListItem.style.cursor = "pointer";
                youtubeListItem.addEventListener("click", function (event) {
                    console.log(event)
                    youtubeManager.showed = true
                    youtubeListItem.style.color = "#18191c"

                    let sort = commentTitle.className.split(' ')[1]
                    for (let child of commentTitle.children) {
                        if (child.className.indexOf(sort) === -1) {
                            child.click()
                            child.hiddenActive = true
                        }
                        child.style.color = "#9499a0"
                    }
                })
                commentTitle.appendChild(partSymbol)
                commentTitle.appendChild(youtubeListItem)
            }

            async function loadYoutubeComment(url) {
                await new Promise(r => setTimeout(r, 1))
                if (!youtubeManager.showed) {
                    throw ''
                }
                if (url.indexOf('main') !== -1) {
                    if (youtubeManager.init) {
                        youtubeManager.init = false
                        if (youtubeManager.commentList.length !== 0) {
                            return buildMainContent(youtubeManager.commentList, youtubeManager.isEnd)
                        }
                    } else if (youtubeManager.isEnd) {
                        return buildMainContent(null)
                    }
                    let url = 'server::/youtube_comment?youtubeid=' + youtubeManager.youtubeId
                    if (youtubeManager.endpoint) {
                        url += '&context=' + encodeURIComponent(JSON.stringify([youtubeManager.endpoint, youtubeManager.ytcfg]))
                    }
                    let ret = await parse(
                        url, true
                    )
                    console.log(ret)
                    youtubeManager.endpoint = ret[1]
                    if (ret[2]) youtubeManager.ytcfg = ret[2]
                    if (ret[1] == null) {
                        youtubeManager.isEnd = true
                    }
                    for (let comment of ret[0]) {
                        comment.rpid = youtubeManager.commentList.length
                        if (comment.comment) {
                            comment.replyList = []
                        }
                        youtubeManager.commentList.push(comment)
                    }
                    return buildMainContent(ret[0])
                } else if (url.indexOf("reply?csrf") !== -1) {
                    let page = Number(/pn=(\d+)/.exec(url)[1])
                    let pageSize = Number(/ps=(\d+)/.exec(url)[1])
                    let rootIndex = Number(/root=(\d+)/.exec(url)[1])
                    let root = youtubeManager.commentList[rootIndex]
                    let pageInfo = {
                        "count": root.comment,
                        "size": pageSize,
                        "num": Math.ceil(root.count / pageSize)
                    }
                    while (root.replyList.length < page * pageSize && root.continuationEndpoint !== null) {
                        let url = 'server::/youtube_comment?youtubeid=' + youtubeManager.youtubeId
                        url += '&context=' + encodeURIComponent(JSON.stringify([root.continuationEndpoint, youtubeManager.ytcfg]))
                        let ret = await parse(
                            url, true
                        )
                        ret[0].forEach(it => {
                            it.rpid = root.replyList.length
                            root.replyList.push(it)
                        })
                        root.continuationEndpoint = ret[1]
                    }
                    return buildSublist(root.replyList.slice(page * pageSize - pageSize, page * pageSize), pageInfo)

                } else
                    throw "unknownType"
            }

            function buildMainContent(commentList, isEnd) {
                let response = {
                    "code": 0,
                    "message": "0",
                    "ttl": 1,
                    "data": {
                        "cursor": {
                            "is_begin": false,
                            "prev": 0,
                            "next": 1,
                            "is_end": true,
                            "all_count": 0,
                            "mode": 2,
                            "support_mode": [2, 3],
                            "name": "最新评论"
                        },
                        "replies": [],
                        "top": {"admin": null, "upper": null, "vote": null},
                        "top_replies": null,
                        "up_selection": {"pending_count": 0, "ignore_count": 0},
                        "effects": {"preloading": ""},
                        "assist": 0,
                        "blacklist": 0,
                        "vote": 0,
                        "config": {"showtopic": 1, "show_up_flag": true, "read_only": false},
                        "upper": {"mid": 23436313},
                        "control": {
                            "input_disable": false,
                            "root_input_text": "发一条友善的评论",
                            "child_input_text": "",
                            "giveup_input_text": "不发没关系，请继续友善哦~",
                            "answer_guide_text": "需要升级成为lv2会员后才可以评论，先去答题转正吧！",
                            "answer_guide_icon_url": "http://i0.hdslb.com/bfs/emote/96940d16602cacbbac796245b7bb99fa9b5c970c.png",
                            "answer_guide_ios_url": "https://www.bilibili.com/h5/newbie/entry?navhide=1&re_src=12",
                            "answer_guide_android_url": "https://www.bilibili.com/h5/newbie/entry?navhide=1&re_src=6",
                            "bg_text": "",
                            "show_type": 1,
                            "show_text": "",
                            "web_selection": false,
                            "disable_jump_emote": false
                        },
                        "note": 1,
                        "callbacks": {}
                    }
                }
                if (commentList === null) {
                    return response
                }

                let commentTemplate = {
                    "rpid": 0,
                    "oid": 0,
                    "type": 1,
                    "mid": 0,
                    "root": 0,
                    "parent": 0,
                    "dialog": 0,
                    "count": 0,
                    "rcount": 0,
                    "state": 0,
                    "fansgrade": 0,
                    "attr": 0,
                    "ctime": 1669435438,
                    "rpid_str": "0",
                    "root_str": "0",
                    "parent_str": "0",
                    "like": 0,
                    "action": 0,
                    "member": {
                        "mid": "0",
                        "uname": "",
                        "sex": "未知",
                        "sign": "",
                        "avatar": "",
                        "rank": "10000",
                        "face_nft_new": 0,
                        "is_senior_member": 0,
                        "pendant": {
                            "pid": 0,
                            "name": "",
                            "image": "",
                            "expire": 0,
                            "image_enhance": "",
                            "image_enhance_frame": ""
                        },
                        "nameplate": {
                            "nid": 0,
                            "name": "",
                            "image": "",
                            "image_small": "",
                            "level": "",
                            "condition": ""
                        },
                        "official_verify": {"type": -1, "desc": ""},
                        "fans_detail": null,
                        "user_sailing": {"pendant": null, "cardbg": null, "cardbg_with_focus": null},
                        "is_contractor": false,
                        "contract_desc": "",
                        "nft_interaction": null
                    },
                    "content": {
                        "message": "",
                        "plat": 0,
                        "device": "",
                        "members": [],
                        "max_line": 6
                    },
                    "replies": null,
                    "assist": 0,
                    "up_action": {"like": false, "reply": false},
                    "invisible": false,
                    "reply_control": {"time_desc": ""},
                    "folder": {"has_folded": false, "is_folded": false, "rule": ""}
                }

                for (let comment of commentList) {
                    let reply = commentTemplate
                    reply = JSON.parse(JSON.stringify(reply))
                    reply.content.message = comment['text']
                    reply.reply_control.time_desc = comment.time
                    reply.member.uname = comment.author
                    reply.member.avatar = comment.photo
                    reply.like = comment.votes
                    reply.rpid = comment.rpid
                    reply.rpid_str = reply.rpid.toString()
                    if (comment.hasOwnProperty("comment")) {
                        reply.rcount = comment.comment
                        reply.count = comment.comment
                        reply.reply_control.sub_reply_entry_text = `共${comment.comment}条回复`
                        reply.reply_control.sub_reply_title_text = `相关回复共${comment.comment}条`

                        let invisibleComment = JSON.parse(JSON.stringify(commentTemplate))
                        invisibleComment.invisible = true
                        invisibleComment.parent = reply.rpid
                        invisibleComment.parent_str = reply.rpid_str
                        reply.replies = [invisibleComment]
                    }
                    response.data.replies.push(reply)
                }
                response.data.cursor.is_end = isEnd
                return JSON.stringify(response)
            }

            function buildSublist(commentList, pageInfo) {
                let response = {
                    "code": 0, "message": "0", "ttl": 1, "data": {
                        "config": {"showtopic": 0, "show_up_flag": false, "read_only": false},
                        "control": {
                            "input_disable": false,
                            "root_input_text": "发一条友善的评论",
                            "child_input_text": "",
                            "giveup_input_text": "不发没关系，请继续友善哦~",
                            "answer_guide_text": "需要升级成为lv2会员后才可以评论，先去答题转正吧！",
                            "answer_guide_icon_url": "http://i0.hdslb.com/bfs/emote/96940d16602cacbbac796245b7bb99fa9b5c970c.png",
                            "answer_guide_ios_url": "https://www.bilibili.com/h5/newbie/entry?navhide=1&re_src=12",
                            "answer_guide_android_url": "https://www.bilibili.com/h5/newbie/entry?navhide=1&re_src=6",
                            "bg_text": "",
                            "show_type": 1,
                            "show_text": "",
                            "web_selection": false,
                            "disable_jump_emote": false
                        },
                        "page": pageInfo,
                        "replies": [],
                        "root": {},
                        "show_bvid": true,
                        "show_text": "按时间",
                        "show_type": 1,
                        "upper": {"mid": 0}
                    }
                }
                let commentTemplate = {
                    "rpid": 0,
                    "oid": 0,
                    "type": 1,
                    "mid": 0,
                    "root": 0,
                    "parent": 0,
                    "dialog": 0,
                    "count": 0,
                    "rcount": 0,
                    "state": 0,
                    "fansgrade": 0,
                    "attr": 0,
                    "ctime": 1669435438,
                    "rpid_str": "0",
                    "root_str": "0",
                    "parent_str": "0",
                    "like": 0,
                    "action": 0,
                    "member": {
                        "mid": "0",
                        "uname": "",
                        "sex": "未知",
                        "sign": "",
                        "avatar": "",
                        "rank": "10000",
                        "face_nft_new": 0,
                        "is_senior_member": 0,
                        "pendant": {
                            "pid": 0,
                            "name": "",
                            "image": "",
                            "expire": 0,
                            "image_enhance": "",
                            "image_enhance_frame": ""
                        },
                        "nameplate": {
                            "nid": 0,
                            "name": "",
                            "image": "",
                            "image_small": "",
                            "level": "",
                            "condition": ""
                        },
                        "official_verify": {"type": -1, "desc": ""},
                        "fans_detail": null,
                        "user_sailing": {"pendant": null, "cardbg": null, "cardbg_with_focus": null},
                        "is_contractor": false,
                        "contract_desc": "",
                        "nft_interaction": null
                    },
                    "content": {
                        "message": "",
                        "plat": 0,
                        "device": "",
                        "members": [],
                        "max_line": 6
                    },
                    "replies": null,
                    "assist": 0,
                    "up_action": {"like": false, "reply": false},
                    "invisible": false,
                    "reply_control": {"time_desc": ""},
                    "folder": {"has_folded": false, "is_folded": false, "rule": ""}
                }
                for (let comment of commentList) {
                    let reply = commentTemplate
                    reply = JSON.parse(JSON.stringify(reply))
                    reply.rpid = comment.rpid
                    reply.rpid_str = reply.rpid.toString()
                    reply.content.message = comment['text']
                    reply.reply_control.time_desc = comment.time
                    reply.member.uname = comment.author
                    reply.member.avatar = comment.photo
                    reply.like = comment.votes
                    response.data.replies.push(reply)
                }
                return JSON.stringify(response)
            }

            let createMutationObserver = function () {
                let targetNode = document.querySelector("[class='reply-list']")

                // Options for the observer (which mutations to observe)
                const config = {childList: true, subtree: true};

                // Callback function to execute when mutations are observed
                const callback = (mutationList, observer) => {
                    for (const mutation of mutationList) {
                        let replyItem = mutation.addedNodes[0]
                        if (mutation.type === 'childList' && replyItem) {
                            if (replyItem.className === "reply-item") {
                                let rpid = replyItem.querySelector('[class="root-reply-avatar"]').getAttribute("data-root-reply-id")
                                if (rpid < youtubeManager.commentList.length) {
                                    replyItem.querySelector('[class="reply-time"]').textContent = youtubeManager.commentList[rpid].time
                                    replyItem.querySelector('[class$="user-info"]').removeChild(replyItem.querySelector('[class$="user-level"]'))
                                    replyItem.querySelector('[class$="reply-info"]').removeChild(replyItem.querySelector('[class$="reply-dislike"]'))
                                    replyItem.querySelector('[class$="reply-info"]').removeChild(replyItem.querySelector('[class$="reply-btn"]'))
                                }
                            } else if (replyItem.className === "sub-reply-item") {
                                let rpid = replyItem.parentElement.parentElement.parentElement.querySelector('[class="root-reply-avatar"]').getAttribute("data-root-reply-id")
                                if (rpid < youtubeManager.commentList.length) {
                                    let subId = replyItem.querySelector('[class="sub-reply-avatar"]').getAttribute("data-root-reply-id")
                                    replyItem.querySelector('[class="sub-reply-time"]').textContent = youtubeManager.commentList[rpid].replyList[subId].time
                                    replyItem.querySelector('[class$="sub-user-info"]').removeChild(replyItem.querySelector('[class$="sub-user-level"]'))
                                    replyItem.querySelector('[class$="sub-reply-info"]').removeChild(replyItem.querySelector('[class$="sub-reply-dislike"]'))
                                    replyItem.querySelector('[class$="sub-reply-info"]').removeChild(replyItem.querySelector('[class$="sub-reply-btn"]'))
                                }
                            }
                        }
                    }
                };

                // Create an observer instance linked to the callback function
                const observer = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                observer.observe(targetNode, config);
            }

            youtubeManager.loadComment = loadYoutubeComment
            createMutationObserver()
            if (youtubeManager.created === false) {
                youtubeManager.youtubeId = youtubeId
                renderYoutubeButton()
            }
        }

        if (document.querySelector('[class^="nav-sort"]') !== null) {
            return buildLoadPageV2(youtubeId)
        } else {
            return buildLoadPageV1(youtubeId)
        }

    }

    console.log("pakku ajax: hook set");
})();
