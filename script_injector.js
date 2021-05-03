// 'use strict'

async function sleep(time) {
    await new Promise((resolve) => setTimeout(resolve, time));
}

let lastHref = null
let lastDesc = null

async function getDescInfo() {
    if (window.location.href === lastHref) {
        return lastDesc
    }
    let youtubeUrl = null
    let nicoinfo = null
    let desc = null;
    while (desc === null) {
        if (document.querySelector('div[class="media-wrapper"]') !== null) {
            break;
        }
        desc = document.querySelector('div[id="v_desc"]')
    }
    if (desc !== null) {
        let info = desc.querySelector('div[class^="info"]')

        // }
        youtubeUrl = /\.youtube\.com\/watch\?[Vv]=([0-9a-zA-Z\-_]*)/.exec(info.innerText)
        if (youtubeUrl === null) {
            youtubeUrl = /youtu\.be\/([0-9a-zA-Z]*)/.exec(info.innerText)
        }
        if (youtubeUrl !== null) {
            youtubeUrl = youtubeUrl[1]
            youtubeComment(youtubeUrl)
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
    } else {
        console.log('Desc not found')
    }
    let duration = document.querySelector('span[class="bilibili-player-video-time-total"]')
    duration = duration.textContent.split(':')
    if (duration.length === 2) {
        duration = 60 * Number(duration[0]) + Number(duration[1])
    } else {
        duration = (60 * Number(duration[0]) + Number(duration[1])) * 60 + Number(duration[2])

    }
    let url = document.querySelector('meta[itemprop="url"]')
    let aid = null
    if (url !== null) {

        aid = /av(\d+)/.exec(url.getAttribute('content'))[1]
    }
    lastHref = window.location.href
    lastDesc = [aid, youtubeUrl, nicoinfo, duration]
    return [aid, youtubeUrl, nicoinfo, duration]
}

let createElement = function (sHtml) {
    // 创建一个可复用的包装元素
    var recycled = document.createElement('div'),
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
        var tagName = hash[RegExp.$1.toLowerCase()];
        // 若无，向包装元素innerHTML，创建/截取并返回元素
        if (!tagName) {
            recycled.innerHTML = sHtml;
            return recycled.removeChild(recycled.firstChild);
        }
        // 若匹配hash标签，迭代包装父标签，并保存迭代层次
        var deep = 0, element = recycled;
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
    result = text
    lkey = text.match(/{(.*?)}/g)


    for (let i = 0; i < lkey.length; i++) {
        key = lkey[i]
        result = result.replace(key, dict[key.slice(1, -1)])
    }


    return result
}


function youtubeComment(youtubeUrl) {


    console.log('加载油管评论', youtubeUrl)
    let commentTitle = document.querySelector("#comment > div > div.comment > div > div.comment-header.clearfix > div.tabs-order > ul")
    let youtubeListItem = createElement('<li class="youtube-comment" style="display: list-item;">油管评论</li>')

    // async function youtubeCommentButton() {
    //     console.log(youtubeListItem)
    //
    //     let commentList = document.querySelector("#comment > div > div.comment > div > div.comment-list")
    //     no_more = document.querySelector("#comment > div > div.comment > div > div.comment-list > div.no-more-reply")
    //     if (no_more) {
    //         commentList.removeChild(no_more)
    //
    //     }
    //     chrome.runtime.sendMessage({
    //         type: "youtube_comment",
    //         youtubeUrl: youtubeUrl,
    //         continuation: null,
    //         itct: null
    //     });
    //     let dComment = null
    //     await new Promise(resolve => {
    //         function handle(resp, sender, sendResponse) {
    //             if (resp.type !== 'youtube_comment_response')
    //                 return;
    //             chrome.runtime.onMessage.removeListener(handle)
    //             dComment = resp
    //
    //             resolve()
    //         }
    //
    //         chrome.runtime.onMessage.addListener(handle)
    //     })
    //
    //
    //     for (i = 0; i < dComment['comments'].length; i++) {
    //         comment = dComment['comments'][i]
    //         commentElement = createElement(format('<div class="list-item reply-wrap " data-id="870005214" data-index="0">\n' +
    //             '    <div class="user-face">\n' +
    //             '        <a href="https://www.youtube.com/channel/{channel}}" target="_blank" data-usercard-mid="{channel}">\n' +
    //             '            <div class="bili-avatar">\n' +
    //             '                <img width="48" height="48" class="bili-avatar-img bili-avatar-face bili-avatar-img-radius"\n' +
    //             '                     src="{photo}"\n' +
    //             '                     alt="">\n' +
    //             '\n' +
    //             '\n' +
    //             '                <span class="bili-avatar-icon"></span>\n' +
    //             '            </div>\n' +
    //             '        </a>\n' +
    //             '    </div>\n' +
    //             '    <div class="con ">\n' +
    //             '        <div class="user">\n' +
    //             '            <a data-usercard-mid="{channel}" href="https://www.youtube.com/channel/{channel}}"\n' +
    //             '               target="_blank" class="name"\n' +
    //             '               style="color">{author}\n' +
    //             '            </a>\n' +
    //             '\n' +
    //             '        </div>\n' +
    //             '        <p class="text">{text}</p>\n' +
    //             '        <div class="info">\n' +
    //             '            <span class="time">{time}</span>\n' +
    //             '            <span class="like ">\n' +
    //             '                <i></i>\n' +
    //             '                <span>{votes}</span>\n' +
    //             '            </span>\n' +
    //             '        </div>\n' +
    //             '        <div class="reply-box"></div>\n' +
    //             '        <div class="paging-box"></div>\n' +
    //             '    </div>\n' +
    //             '</div>', comment))
    //         commentList.appendChild(commentElement)
    //     }
    // }
    //
    // document.querySelector("#comment > div > div.comment > div > div.comment-header.clearfix > div.tabs-order > ul > li.hot-sort").addEventListener('click', function () {
    //     youtubeListItem.addEventListener('click', youtubeCommentButton)
    // })
    // document.querySelector("#comment > div > div.comment > div > div.comment-header.clearfix > div.tabs-order > ul > li.new-sort").addEventListener('click', function () {
    //     youtubeListItem.addEventListener('click', youtubeCommentButton)
    // })
    commentTitle.appendChild(youtubeListItem)
    // youtubeListItem.addEventListener('click', youtubeCommentButton)

}


let skipCid = {}


if (document.head) {
    window.addEventListener("message", async function (event) {
            console.log("pakku ajax: injecting hook");

            if (event.source !== window) return;

            if (event.data.type) {
                if (event.data.type === "pakku_ajax_request") {

                    let cid = /oid=(\d+)/.exec(event.data.arg)
                    if (skipCid === cid) {
                        console.log('Ignore cid', skipCid)
                        window.postMessage({
                            type: "pakku_ajax_response",
                            arg: event.data.arg,
                            resp: null
                        }, "*");
                        return
                    }

                    let [aid, youtubeUrl, nicoinfo, duration] = await getDescInfo()
                    console.log(youtubeUrl)
                    chrome.runtime.sendMessage({
                        type: "ajax_hook",
                        url: event.data.arg,
                        aid: aid,
                        cid: cid,
                        href: window.location.href,
                        duration: duration,
                        nicoinfo: nicoinfo,
                        youtubeUrl: youtubeUrl
                    });

                    await new Promise(resolve => {
                        function handle(resp, sender, sendResponse) {
                            if (resp.type !== 'ajax_hook_response' || resp.href.slice(55) !== event.data.arg.slice(55))
                                return;
                            chrome.runtime.onMessage.removeListener(handle)
                            if (resp.data !== null) {
                                console.log('GotDanmuFromDFex', resp.ndanmu)
                                if (skipCid !== cid) {
                                    let ondanmu = document.querySelector('span[class="bilibili-player-video-info-danmaku-number"]')
                                    if (Number(ondanmu.textContent) > resp.ndanmu) {
                                        // console.log('Abort Redirect due to less danmu for cid', cid)
                                        // skipCid = cid
                                        // resp.data = null
                                    } else {
                                        ondanmu.textContent = resp.ndanmu.toString()

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


                } else if (event.data.source === 'DFex') {
                    chrome.runtime.sendMessage(event.data, function (resp) {
                        window.postMessage({
                            type: event.data.type + '_response',
                            resp: resp
                        }, "*");
                    });
                }
            }
        }
        ,
        false
    );
    var script = document.createElement("script");
    script.src = chrome.runtime.getURL("https://unpkg.com/ajax-hook@2.0.3/dist/ajaxhook.min.js");
    script = document.createElement("script");
    script.src = chrome.runtime.getURL("xhr_hook.js");

    document.head.appendChild(script);
    // script = document.createElement("script");
    // script.src = chrome.runtime.getURL("commentFresh.js");
    // document.head.appendChild(script);

}


