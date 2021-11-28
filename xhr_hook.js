(function () {
    if (XMLHttpRequest.prototype.pakku_open) return;
    let insertedUI = false
    let setting = null

    async function parse(url, json = false) {

        let res = await postExtension('parse', {url: url})
        if (json) {
            return JSON.parse(res)
        } else {
            return res
        }
    }

    //postHook Listener
    window.addEventListener("message", function (event) {
        if (event.data.type === 'replaceLoadPage') {
            eval('window.bbComment.prototype.originLoadPage=' + window.bbComment.prototype.loadPage.toString())
            window.bbComment.prototype.loadPage = function (i, e) {
                if (window.loadPage) {
                    window.loadPage(i, e)
                } else {
                    this.originLoadPage(i, e)
                }
            }
        }
    }, false);


    async function postExtension(messageType, data) {
        let timeStamp = new Date().getTime();
        data.type = messageType
        data.timeStamp = timeStamp
        data.source = 'DFex'

        window.postMessage(
            data
            , "*");
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

    async function sleep(seconds) {
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }


    function bindLocalDanmu() {
        let ldeposide = []
        let eindex = document.querySelector('ul[class="bilibili-player-video-btn-menu"]')
        if (eindex !== null) {
            let leposide = eindex.querySelectorAll('li[class^="bilibili-player-video-btn-menu-list"]')
            for (let ieposide = 0; ieposide < leposide.length; ieposide++) {

                let eposide = leposide[ieposide]
                let deposide = {
                    isActive: eposide.getAttribute('class').indexOf('active') !== -1,
                    cid: eposide.getAttribute('data-id'),
                    title: eposide.textContent,
                }
                ldeposide.push(deposide)
            }
        }
        console.log(ldeposide)
        window.postMessage({
            type: "bindLocalDanmu",
            source: 'DFex',
            arg: JSON.stringify(ldeposide)
        }, "*");
    }

    // async function reload_danmaku_magic() {
    //     root_elem = document.body.querySelector('div[id="danmukuBox"]')
    //     console.log(root_elem)
    //     let date_picker = root_elem.querySelector['div[class="player-auxiliary-danmaku-date-picker-day-content clearfix"]'];
    //     history_btn = root_elem.querySelector('div[class="player-auxiliary-danmaku-date-picker-week clearfix"]');
    //
    //     if (!date_picker) {
    //         elem = root_elem.querySelector('div[class="bui-collapse-arrow"]')
    //         elem.click()
    //         await sleep(500)
    //         let history_btn = root_elem.querySelector('div[class="player-auxiliary-danmaku-btn-history bui bui-button bui-button-gray2"]');
    //         console.log(history_btn)
    //         history_btn.click()
    //         await sleep(100)
    //         telem = root_elem.querySelector('div[class="player-auxiliary-area relative"]');
    //         console.log(telem)
    //         telem = root_elem.querySelector('div[class="bui-collapse-body"]');
    //         console.log(telem)
    //         telem = root_elem.querySelector('div[class="player-auxiliary-danmaku-date-picker-container"]');
    //         console.log(telem)
    //         telem = root_elem.querySelector('div[class="player-auxiliary-danmaku-date-picker-body"]');
    //         console.log(telem)
    //         date_picker = telem.querySelectorAll['div'][1];
    //         console.log(date_picker)
    //         history_btn.click()
    //     }
    //     let elem = document.createElement("span");
    //     elem.className = "js-action __pakku_injected";
    //     elem.dataset["action"] = "changeDay";
    //     elem.dataset["timestamp"] = 0;
    //     elem.style.display = "none";
    //     date_picker.appendChild(elem);
    //     console.log("pakku magic reload: proceed");
    //     trigger_mouse_event(elem, "mousedown");
    //     trigger_mouse_event(elem, "mouseup");
    //     trigger_mouse_event(elem, "click");
    //     date_picker.removeChild(elem)
    // }
    //
    // window.reload_danmaku = reload_danmaku_magic
    window.bindLocalDanmu = bindLocalDanmu

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

    let callbacks = {};
    window.addEventListener("message", function (event) {
        if (event.source !== window || !event.data) return;
        if (event.data.type && event.data.type === "pakku_ajax_response") callbacks[event.data.arg](event.data.resp);
    }, false);

    function send_msg_proxy(arg, callback, type = "pakku_ajax_request") {
        callbacks[arg] = callback;
        window.postMessage({
            type: type,
            arg: arg
        }, "*");
    }

    window.Worker=null;

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
    XMLHttpRequest.prototype.send = function (arg) {
        if ((this.pakku_url.indexOf("list.so") !== -1
            || this.pakku_url.indexOf('seg.so') !== -1) && this.pakku_url.indexOf('data.bilibili.com') === -1
        ) {
            // || this.pakku_url.indexOf('web-interface/view') !== -1) {
            // if (!insertedUI) {
            //     insertUI()
            // }
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


    console.log("pakku ajax: hook set");


})
();
