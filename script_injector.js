'use strict'


if (document.head) {
    async function sleep(time) {
        await new Promise((resolve) => setTimeout(resolve, time));
    }

    let setting = postExtension('getSetting').then(function (e) {
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
    let cacheUrls = []

    async function getBiliVideoDuration(aid, cid, ipage = undefined) {
        let pagelist = JSON.parse(await parse('https://api.bilibili.com/x/player/pagelist?aid=' + aid + '&jsonp=jsonp'))
        let tDuration = null
        for (let i = 0; i < pagelist.data.length; i++) {
            let page = pagelist.data[i]
            if (page.cid === parseInt(cid)) {
                tDuration = page.duration
                if (ipage === null) {
                    ipage = i
                }
            }
        }
        if (tDuration === null) {
            console.log('cid', cid, 'not in', pagelist)
        }
        if (ipage === undefined) {
            return tDuration
        } else {
            return [tDuration, ipage]
        }
    }

    async function getDescInfo(cid) {
        console.log(lastHref, window.location.href)
        if (window.location.href === lastHref) {
            return lastDesc
        } else {
            if (lastHref !== null) {
                await sleep(1000)
            }
        }

        let extraInfo = {}
        let desc = document.querySelector('div[class^="desc-info"]')
        if (desc !== null) {
            let info = desc.querySelector('span')
            if (info === null) {
                console.log('Desc not found')
            } else {
                let youtubeUrl = /\.youtube\.com\/watch\?[Vv]=([0-9a-zA-Z\-_]*)/.exec(info.innerText)
                if (youtubeUrl === null) {
                    youtubeUrl = /youtu\.be\/([_0-9a-zA-Z]*)/.exec(info.innerText)
                }
                if (youtubeUrl !== null) {
                    youtubeUrl = youtubeUrl[1]
                    console.log('Found YoutubeUrl:' + youtubeUrl)
                    extraInfo['youtube'] = youtubeUrl
                }
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

                if (nicoinfo === null) {
                    nicoinfo = /([sS][mM]\d+)/.exec(info.innerText)
                    if (nicoinfo !== null) {
                        nicoinfo = nicoinfo[1]
                    }
                }
                if (nicoinfo !== null) {
                    nicoinfo = nicoinfo.toLowerCase()
                    console.log('Found NicoUrl:' + nicoinfo)
                    extraInfo['niconico'] = nicoinfo
                }
                let twitchVOD = /https:\/\/www.twitch.tv\/videos\/(\d+)/.exec(info.innerText)
                if (twitchVOD !== null) {
                    console.log('Found twitchVOD:' + twitchVOD[1])
                    extraInfo['twitch'] = twitchVOD[1]
                }
            }
            // }
        } else {
            console.log('Desc not found')
        }

        // console.log(playerInfo.textContent)


        let ssid, aid, duration
        let ipage = null
        if (/play\/ss(\d+)/.exec(document.querySelector('script[type="application/ld+json"]').textContent)) {
            let seasonInfo
            if (cacheUrls['season']) {
                seasonInfo = JSON.parse(cacheUrls['season']['data'])
            }
            if (seasonInfo) {
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
        } else {
            aid = document.querySelector('meta[itemprop="url"]')
            aid = /(BV.*?)[\/?]/.exec(aid.getAttribute('content'))[1]
            aid = bv2av(aid)
            let videoInfo
            if (cacheUrls['view']) {
                videoInfo = JSON.parse(cacheUrls['view'].data).data
            } else {
                videoInfo = JSON.parse(await parse('https://api.bilibili.com/x/web-interface/view?aid=' + aid)).data
            }
            extraInfo.pubdate = videoInfo.pubdate
        }
        let mid = document.querySelector('*[id="v_upinfo"]')

        if (mid) {
            mid = mid.querySelector('a[href^="//space.bilibili.com"]').href
            mid = /com\/(\d+)/.exec(mid)[1]
            extraInfo.mid = mid
        }


        if (aid) {
            [duration, ipage] = await getBiliVideoDuration(aid, cid, ipage)
        }
        extraInfo.duration = duration
        lastHref = window.location.href
        lastDesc = [aid, ssid, ipage, extraInfo]
        window.postMessage({type: 'descLoad', 'desc': lastDesc}, '*')
        return lastDesc
    }


    let skipCid = {}
    let episodeUrlToBeReplace = []
    chrome.runtime.onMessage.addListener(function (message) {
        if (message.cid === currentCid) {
            window.postMessage(message)
        }
    })

    window.addEventListener("message", async function (event) {
            if (event.source !== window) return;
            if (event.data.type) {
                if (event.data.type === "pakku_ajax_request") {
                    try {
                        let cid = /oid=(\d+)/.exec(event.data.arg)[1]
                        let segmentIndex = parseInt(/segment_index=(\d+)/.exec(event.data.arg)[1])
                        if (segmentIndex !== 1) {
                            window.postMessage({
                                type: "pakku_ajax_response",
                                arg: event.data.arg,
                                resp: {data: new Uint8Array()}
                            }, "*");
                            return
                        }
                        currentCid = cid
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
                        let aid, ssid, ipage, extraInfo, expectedDanmuNum, ondanmu
                        [aid, ssid, ipage, extraInfo] = res
                        for (let xss of ['span[class="bilibili-player-video-info-danmaku-number"]',
                            'span[class="bpx-player-video-info-dm-number"]',
                            'div[class="bpx-player-video-info-dm"]',]) {
                            ondanmu = document.querySelector(xss)
                            if (ondanmu) {
                                expectedDanmuNum = Number(/\d+/.exec(ondanmu.textContent)[0])
                                break
                            }
                        }
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
                                if (resp.type !== 'ajax_hook_response' || resp.href.slice(55) !== event.data.arg.slice(55) || resp.cid !== currentCid)
                                    return;
                                chrome.runtime.onMessage.removeListener(handle)
                                if (resp.data !== null && resp.ndanmu !== null) {
                                    console.log('GotDanmuFromDFex', resp.ndanmu)
                                    if (skipCid !== cid) {
                                        if (ondanmu) {
                                            ondanmu.textContent = ondanmu.textContent.replace(/\d+/, resp.ndanmu)
                                        }
                                    }
                                    if (setting.debug) {
                                        let danmuSwitch = document.querySelector('div[class="bilibili-player-video-danmaku-switch bui bui-switch"]')
                                        console.log('danmuSwitch', danmuSwitch)
                                        if (danmuSwitch) {
                                            danmuSwitch.style.visibility = "hidden";
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
                        throw e
                    }


                } else if (event.data.type === 'cacheUrl') {
                    cacheUrls[event.data.urlType] = event.data
                } else if (event.data.type === 'queryDesc') {

                } else if (event.data.type === 'replaceEpisodeUrl') {
                    let info = JSON.parse(event.data.info)
                    for (let episode of episodeUrlToBeReplace) {
                        let bvid = episode[0], elem = episode[1]
                        for (let card of info['data']['cards']) {
                            if (card['desc']['bvid'] === bvid) {
                                elem.setAttribute('href', JSON.parse(card['card'])['redirect_url'])
                            }
                        }
                    }
                }
                if (event.data.source === 'DFex' && !event.data.type.endsWith('_response')) {
                    if (event.data.type === 'previewDanmaku') {
                        event.data.cid = lastDesc.cid
                    } else if (event.data.type === "twitch_chat") {
                        if (!lastDesc[3].twitch) {
                            return
                        }
                        event.data.vid = lastDesc.extraInfo.twitch
                    }
                    chrome.runtime.sendMessage(event.data);
                    let timeStamp = event.data.timeStamp
                    await new Promise(resolve => {
                        function handle(resp, sender, sendResponse) {
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
    if (window.location.href.indexOf('https://www.bilibili.com/bangumi') ||
        window.location.href.indexOf('https://www.bilibili.com/video')) {
    }
    {
        document.addEventListener("DOMNodeInserted", async (msg) => {
            if (msg.target.className) {
                if (msg.target.className === "comment-send ") {
                    if (document.querySelector('li[class^="youtube-comment"]')) {
                        return
                    }
                    if (!lastDesc) {
                        lastDesc = await new Promise((resolve) => {
                                let handle = (event) => {
                                    if (event.source === window && event.data
                                        && event.data.type === 'descLoad') {
                                        window.removeEventListener('message', handle)
                                        resolve(event.data.desc)
                                    }
                                }
                                window.addEventListener("message", handle, false);
                            }
                        )
                    }
                    if (lastDesc[3].youtube) {
                        postHook('replaceLoadPage', {'lastDesc': lastDesc})
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


    console.log('inject xhrhook')

    //chrome
    let script = document.createElement("script");
    script.src = chrome.runtime.getURL("xhr_hook.js");
    document.head.appendChild(script);
    //chrome end
}


