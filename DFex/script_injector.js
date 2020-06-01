// (C) 2017-2019 @xmcp. THIS PROJECT IS LICENSED UNDER GPL VERSION 3. SEE `LICENSE.txt`.

// (C) 2017-2019 @xmcp. THIS PROJECT IS LICENSED UNDER GPL VERSION 3. SEE `LICENSE.txt`.

if (document.head) {


    window.addEventListener("message", function (event) {
            console.log("pakku ajax: injecting hook");

            if (event.source !== window) return;

            if (event.data.type) {
                if (event.data.type === "pakku_ajax_request") {
                    youtubeUrl = null
                    nicoinfo = null
                    desc = null;

                    while (desc === null) {
                        if (document.querySelector('div[class="media-wrapper"]') !== null) {

                            break;
                        }
                        desc = document.querySelector('div[id="v_desc"]')

                    }
                    if (desc !== null) {
                        eindex = document.querySelector('div[id="multi_page"]')
                        if (eindex !== null) {

                        }
                        info = desc.querySelector('div[class^="info"]')
                        urlPos = info.innerText.indexOf('watch?v=')

                        if (urlPos !== -1) {
                            urlPos += 8
                            p0 = info.innerText.indexOf(' ', urlPos)
                            p1 = info.innerText.indexOf('\n', urlPos)
                            if (p0 !== -1) {
                                if (p1 !== -1) {
                                    youtubeUrl = info.innerText.substring(urlPos, Math.min(p0, p1))
                                } else {
                                    youtubeUrl = info.innerText.substring(urlPos, p0)
                                }
                            } else {
                                if (p1 !== -1) {
                                    youtubeUrl = info.innerText.substring(urlPos, p1)
                                } else {
                                    youtubeUrl = info.innerText.substring(urlPos)
                                }
                            }

                        }
                        if(youtubeUrl!==null){
                            console.log('Found YoutubeUrl:'+youtubeUrl)
                        }
                        nicoinfo = document.querySelector('a[target=_blank][href^="http://acg.tv/sm"]');
                        if (nicoinfo !== null) {
                            nicoinfo = nicoinfo.getAttribute('href')
                            console.log('Found NicoUrl:'+nicoinfo)
                        }
                    }

                    chrome.runtime.sendMessage({
                        type: "ajax_hook",
                        url: event.data.arg,
                        href: window.location.href,
                        nicoinfo: nicoinfo,
                        youtubeUrl: youtubeUrl
                    }, function (resp) {

                        console.log(resp.data.length)
                        window.postMessage({
                            type: "pakku_ajax_response",
                            arg: event.data.arg,
                            resp: resp
                        }, "*");
                        

                    });
                } else if (event.data.source === 'DFex') {
                    chrome.runtime.sendMessage(event.data, function (resp) {
                        window.postMessage({
                            type: resp.type + '_response',
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
    script.src = chrome.runtime.getURL("xhr_hook.js");
    document.head.appendChild(script);

}
