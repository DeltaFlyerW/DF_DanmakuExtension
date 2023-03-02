(function () {
    'use strict'

    async function sleep(time) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }

    let setting = {}
    postExtension('getSetting').then(function (e) {
        setting = e
    })

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
        return result - add ^ xor
    }

    let lastHref = null
    let lastDesc = null
    let currentCid = null
    let passiveParserList = []
    let cacheUrls = []

    async function getBiliVideoDuration(aid, cid) {
        let pagelist = JSON.parse(await parse('https://api.bilibili.com/x/player/pagelist?aid=' + aid + '&jsonp=jsonp'))
        let duration = null
        let ipage
        for (let i = 0; i < pagelist.data.length; i++) {
            let page = pagelist.data[i]
            if (page.cid === parseInt(cid)) {
                duration = page.duration
                ipage = i
            }
        }
        if (duration === null) {
            console.log('cid', cid, 'not in', pagelist)
        }
        return [duration, ipage]
    }

    function parseDescBind(content) {
        let extraInfo = {}
        let youtubeUrl = /\.youtube\.com\/watch\?[Vv]=([0-9a-zA-Z\-_]+)/.exec(content)
        if (youtubeUrl === null) {
            youtubeUrl = /youtu\.be\/([_0-9a-zA-Z]+)/.exec(content)
        }
        if (youtubeUrl !== null) {
            youtubeUrl = youtubeUrl[1]
            console.log('Found YoutubeUrl:' + youtubeUrl)
            extraInfo['youtube'] = youtubeUrl
        }
        let nicoinfo = /([^a-zA-Z]|^)([sS][mM]\d+)([^a-zA-Z]|$)/.exec(content)
        if (nicoinfo !== null) {
            nicoinfo = nicoinfo[2]
        }
        if (nicoinfo !== null) {
            nicoinfo = nicoinfo.toLowerCase()
            console.log('Found NicoUrl:' + nicoinfo)
            extraInfo['niconico'] = nicoinfo
        }
        let twitchVOD = /https:\/\/www.twitch.tv\/videos\/(\d+)/.exec(content)
        if (twitchVOD !== null) {
            console.log('Found twitchVOD:' + twitchVOD[1])
            extraInfo['twitch'] = twitchVOD[1]
        }
        return extraInfo
    }

    function parseBindParams(content) {
        let paramText = ''
        let params = new URLSearchParams(content)
        let paramList = ['indexOffset', 'offset', 'live', 'translate']
        for (let param of paramList) {
            if (params.has(param)) {
                paramText += `:${param}=${params.get(param)}`
            }
        }
        return paramText
    }

    function parseBangumiBind(content) {
        let prefixDict = {
            'ss': 'bilibili', 'ep': 'bilibili', 'so': 'niconico', 'sn': 'animad'
        }

        for (let prefix of Object.keys(prefixDict)) {
            let match = RegExp('([^a-zA-Z]|^)(' + prefix + '\d+)([^a-zA-Z]|$)').exec(content)
            if (match) {
                let matchResult = match[2]
                let result = {}
                result[prefixDict[prefix]] = matchResult
                return result
            }
        }
    }

    async function getDescInfo(cid) {
        for (let parser of passiveParserList) {
            if (parser.type !== 'passive') {
                console.log('waiting for prev parser')
                return await new Promise(resolve => {
                    passiveParserList.push({callback: resolve, type: 'active'})
                    console.log('wait for desc', passiveParserList)
                })
            }
        }
        console.log('parse desc', lastHref, window.location.href)
        if (window.location.href === lastHref && cid === currentCid) {
        } else {
            if (lastHref !== null) {
                await sleep(1000)
            }
            let extraInfo = {}
            let desc = document.querySelector('div[class^="desc-info"]')
            if (desc === null) {
                desc = document.querySelector('div[class^="basic-desc-info"]')
            }
            if (desc !== null) {
                let info = desc.querySelector('span')
                if (info === null) {
                    console.log('Desc not found')
                } else {
                    extraInfo = parseDescBind(desc.innerText)
                    let lnico = info.querySelectorAll('a[target=_blank][href^="//acg.tv/sm"]');
                    let nico = lnico[0]
                    let nicoinfo = null
                    if (nico) {
                        nicoinfo = nico.getAttribute('href')
                        nicoinfo = /([sS][mM]\d+)/.exec(nicoinfo)
                        if (nicoinfo !== null) {
                            nicoinfo = nicoinfo[1]
                        }
                        for (let nico of lnico) {
                            let nicoinfo = nico.getAttribute('href')
                            nicoinfo = /([sS][mM]\d+)/.exec(nicoinfo)
                            nico.setAttribute('href', 'https://www.nicovideo.jp/watch/' + nicoinfo[1])
                        }
                    }
                }
                // }
            } else {
                console.log('Desc not found')
            }

            // console.log(playerInfo.textContent)


            let ssid, aid, duration
            let ipage = null

            if (/bangumi\/play/.exec(window.location.href)) {
                let seasonInfo
                if (cacheUrls['season']) {
                    seasonInfo = JSON.parse(cacheUrls['season']['data'])
                }
                if (seasonInfo && seasonInfo['result'] && seasonInfo['result']['season_id']) {
                    ssid = seasonInfo['result']['season_id']
                    for (let i = 0; i < seasonInfo['result']['episodes'].length; i++) {
                        if (seasonInfo['result']['episodes'][i]['cid'] === parseInt(cid)) {
                            aid = seasonInfo['result']['episodes'][i]['aid']
                            ipage = i
                            break
                        }
                    }
                    if (ipage === null) {
                        debugger
                    }
                } else {
                    ssid = /play\/ss(\d+)/.exec(window.location.href)
                    if (ssid) {
                        ssid = ssid[1]
                        let data = JSON.parse(await parse('https://api.bilibili.com/pgc/web/season/section?season_id=' + ssid))
                        extraInfo['firstAid'] = data['result']['main_section']['episodes'][0]['aid']
                        for (let i = 0; i < data.result.main_section.episodes.length; i++) {
                            if (data.result.main_section.episodes[i].cid === parseInt(cid)) {
                                aid = data.result.main_section.episodes[i].aid
                                ipage = i
                            }
                        }
                        if (ipage === null) {
                            debugger
                        }
                        if (ipage === null) {
                            debugger
                        }
                    } else {
                        let epid = /\/ep(\d+)/.exec(window.location.href)
                        let data = await parse('https://bangumi.bilibili.com/view/web_api/season?ep_id=' + epid[1])
                        data = JSON.parse(data)
                        ssid = data['result']['season_id']
                        let episodes = data['result']['episodes']
                        if (episodes.length === 0) {
                            episodes = JSON.parse(await parse('https://api.bilibili.com/pgc/web/season/section?season_id=' + ssid)).result.main_section.episodes
                        }
                        extraInfo['firstAid'] = episodes[0]['aid']
                        for (let i = 0; i < episodes.length; i++) {
                            if (episodes[i]['cid'] === parseInt(cid)) {
                                aid = episodes[i]['aid']
                                ipage = i
                                break
                            }
                        }
                        if (ipage === null) {
                            debugger
                        }
                    }
                }
                duration = (await getBiliVideoDuration(aid, cid))[0]
            } else {
                let match = /BV([a-zA-Z0-9]+)/.exec(location.href)
                if (match) {
                    let bvid = match[0]
                    aid = bv2av(bvid)
                } else if (document.querySelector('meta[itemprop="url"]')) {
                    let bvid = /(BV.*?)[\/?]/.exec(document.querySelector('meta[itemprop="url"]')
                        .getAttribute('content'))[1]
                    aid = bv2av(bvid)
                } else if (/av([a-zA-Z0-9]+)/.exec(location.href)) {
                    aid = parseInt(/av([a-zA-Z0-9]+)/.exec(location.href)[1])
                }
                let videoInfo
                if (cacheUrls['view']) {
                    videoInfo = JSON.parse(cacheUrls['view'].data).data
                } else {
                    videoInfo = JSON.parse(await parse('https://api.bilibili.com/x/web-interface/view?aid=' + aid)).data
                }
                extraInfo.pubdate = videoInfo.pubdate
                if (aid) {
                    [duration, ipage] = await getBiliVideoDuration(aid, cid)
                }
            }
            let mid = document.querySelector('*[id="v_upinfo"]')

            if (mid) {
                mid = mid.querySelector('a[href^="//space.bilibili.com"]').href
                mid = /com\/(\d+)/.exec(mid)[1]
                extraInfo.mid = mid
            }


            extraInfo.duration = duration
            extraInfo.cid = cid
            lastHref = window.location.href
            lastDesc = [aid, ssid, ipage, extraInfo]
        }
        passiveParserList.forEach(parser => {
            parser.callback(lastDesc)
        })
        passiveParserList = []
        return lastDesc
    }

    chrome.runtime.onMessage.addListener(function (message) {
        if (message.cid === currentCid) {
            window.postMessage(message, '*')
        }
    })
    let skipCid = {}

    window.addEventListener("message", async function (event) {
        if (event.source !== window) return;
        if (event.data.type) {
            if (event.data.type === "pakku_ajax_request") {
                try {
                    if (setting.blockHighlightDanmaku) {
                        var styleSheet = document.createElement("style")
                        styleSheet.innerText = '.b-danmaku-high-icon {display: none;}'
                        document.head.appendChild(styleSheet)
                    }
                    let cid = /oid=(\d+)/.exec(event.data.arg)[1]
                    if (skipCid === cid) {
                        console.log('Ignore cid', skipCid)
                        window.postMessage({
                            type: "pakku_ajax_response", arg: event.data.arg, resp: null
                        }, "*");
                        return
                    }
                    if (cid !== currentCid) {
                        lastDesc = null
                    }
                    let res = await getDescInfo(cid)
                    currentCid = cid
                    let aid, ssid, ipage, extraInfo, expectedDanmuNum
                    [aid, ssid, ipage, extraInfo] = res
                    let message = {
                        type: "ajax_hook",
                        url: event.data.arg,
                        aid: aid,
                        cid: cid,
                        href: window.location.href,
                        extraInfo: extraInfo,
                        ssid: ssid,
                        ipage: ipage,
                        expectedDanmuNum: expectedDanmuNum,
                        loadDanmu: event.data.loadDanmu
                    }
                    try {
                        message['block'] = JSON.parse(localStorage.bilibili_player_settings).block
                    } catch (e) {
                        console.log(e)
                    }
                    chrome.runtime.sendMessage(message);

                    await new Promise(resolve => {
                        function handle(resp, sender, sendResponse) {

                            if (resp.type !== 'ajax_hook_response' || resp.href.slice(55) !== event.data.arg.slice(55) || resp.cid !== currentCid) return;
                            chrome.runtime.onMessage.removeListener(handle)
                            if (resp.data !== null && resp.ndanmu !== null) {
                                console.log('GotDanmuFromDFex', resp.ndanmu)
                                if (setting.debug) {
                                    let danmuSwitch = document.querySelector('div[class="bilibili-player-video-danmaku-switch bui bui-switch"]')
                                    console.log('danmuSwitch', danmuSwitch)
                                    if (danmuSwitch) {
                                        danmuSwitch.style.visibility = "hidden";
                                    }
                                }
                            }
                            let message = {
                                type: "pakku_ajax_response", arg: event.data.arg, resp: resp
                            }
                            console.log('postMessage', message)
                            window.postMessage(message, "*");
                            resolve()
                        }

                        chrome.runtime.onMessage.addListener(handle)

                    })

                } catch (e) {
                    console.log(e)
                    window.postMessage({
                        type: "pakku_ajax_response", arg: event.data.arg, resp: null
                    }, "*");
                    throw e
                }


            } else if (event.data.type === 'cacheUrl') {
                cacheUrls[event.data.urlType] = event.data
            } else if (event.data.type === 'parseBindInfo') {
                //lastDesc = [aid, ssid, ipage, extraInfo]
                let result
                if (lastDesc[1]) {
                    result = parseBangumiBind(event.data.content)
                } else {
                    result = parseDescBind(event.data.content)
                }
                let params = parseBindParams(event.data.content)
                for (let key of Object.keys(result)) {
                    result[key] += params
                }
                window.postMessage({
                    type: 'parseBindInfo_response', timeStamp: event.data.timeStamp, content: result
                }, "*");
            } else if (event.data.type === 'getSetting') {
                window.postMessage({
                    type: 'getSetting_response', timeStamp: event.data.timeStamp, content: {
                        setting: setting
                    }
                }, "*");
            } else if (event.data.type === 'queryDesc') {
                window.postMessage({
                    type: 'queryDesc_response', timeStamp: event.data.timeStamp, content: {
                        lastDesc: lastDesc
                    }
                }, "*");
            } else if (event.data.type) if (event.data.source === 'DFex' && !event.data.type.endsWith('_response')) {
                if (event.data.type === 'previewDanmaku') {
                    event.data.cid = lastDesc.cid
                } else if (event.data.type === "actualSegment") {
                    if (!lastDesc) {
                        await new Promise(resolve => {
                            passiveParserList.push({callback: resolve, type: 'passive'})
                        })
                    }
                    let [aid, ssid, ipage, extraInfo] = lastDesc
                    let desc = {
                        aid: aid,
                        cid: extraInfo.cid,
                        href: window.location.href,
                        extraInfo: extraInfo,
                        ssid: ssid,
                        ipage: ipage,
                    }
                    for (let key of Object.keys(desc)) {
                        event.data[key] = desc[key]
                    }
                    console.log('actualSegment', event.data)
                } else if (event.data.type === 'bindVideo') {
                    if (lastDesc[1]) {
                        event.data.ss = lastDesc[1]
                    } else {
                        event.data.aid = lastDesc[0]
                    }
                }
                chrome.runtime.sendMessage(event.data);
                let timeStamp = event.data.timeStamp
                await new Promise(resolve => {
                    function handle(resp, sender, sendResponse) {
                        if (resp.type !== event.data.type + '_response' || resp.timeStamp !== timeStamp) return;
                        chrome.runtime.onMessage.removeListener(handle)
                        window.postMessage(resp, "*");
                        resolve()
                    }

                    chrome.runtime.onMessage.addListener(handle)
                })
            }
        }
    }, false);
    if (window.location.href.indexOf('https://www.bilibili.com/video') || window.location.href.indexOf("https://www.bilibili.com/list/watchlater?bvid=")) {
    }
    {
        document.addEventListener("DOMNodeInserted", async (msg) => {
            if (typeof msg.target.className == 'string') {
                if (msg.target.className === "comment-send " || msg.target.className.indexOf('bili-comment') !== -1) {
                    if (document.querySelector('[class^="youtube-comment"]')) {
                        return
                    }
                    if (!lastDesc) {
                        await new Promise(resolve => {
                            passiveParserList.push({callback: resolve, 'type': 'passive'})
                        })
                    }
                    if (lastDesc[3].youtube) {
                        postHook('replaceLoadPage', {'youtube': lastDesc[3].youtube})
                    }
                }
            }
        })

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
        if (!data) data = {}
        if (messageType) data.type = messageType
        data.timeStamp = timeStamp
        data.source = 'DFex'
        chrome.runtime.sendMessage(data);
        return await new Promise(resolve => {
            function handle(resp, sender, sendResponse) {
                if (resp.type !== data.type + '_response' || resp.timeStamp !== timeStamp) return;
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


    console.log('inject xhrhook');

    let script = document.createElement("script");
    //为了在页面元素的script执行前覆盖,使用同步逻辑
    const xhr = new XMLHttpRequest();
    xhr.open("get", chrome.runtime.getURL("xhr_hook.js"), false);
    xhr.send()
    script.textContent = xhr.responseText
    document.documentElement.insertBefore(script, document.documentElement.firstChild);

})();


