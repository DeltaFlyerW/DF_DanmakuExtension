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

    // async function insertUI() {
    //     try {
    //
    //
    //         insertedUI = true
    //
    //         function changeSetting(name, value) {
    //             window.postMessage({
    //                     type: "changeSetting",
    //                     source: 'DFex',
    //                     data: {
    //                         name: name,
    //                         value: value
    //                     }
    //                 }
    //             )
    //         }
    //
    //         bilibiliplayer = document.body.querySelector('div[class="player"]')
    //         if (bilibiliplayer == null) {
    //             console.log(bilibiliplayer, 'Player not Found')
    //             return
    //         }
    //         console.log('try insert', bilibiliplayer,)
    //
    //         setting = await postExtension('getSetting')
    //
    //
    //         function insertSwitch() {
    //             function selectById(label) {
    //                 return document.body.querySelector('#' + label)
    //             }
    //
    //             function insertOption() {
    //                 function insertBefore(element, child) {
    //                     element.insertBefore(child, element.childNodes[0])
    //                 }
    //
    //                 function createCheckbox(fatherNode, name, event,) {
    //                     element = createElement(
    //                         '<div class="bilibili-player-video-danmaku-setting-right-speedsync" data-name="df-inserted-setting">\n' +
    //                         '                        <span class="bilibili-player-video-danmaku-setting-right-speedsync-box bui bui-checkbox bui-dark">' +
    //                         '<input class="bui-checkbox-input" type="checkbox" aria-label="弹幕速度同步播放倍数" id="' + name + '">\n' +
    //                         '<label class="bui-checkbox-label">\n' +
    //                         '    <span class="bui-checkbox-icon bui-checkbox-icon-default"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M8 6a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2H8zm0-2h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4V8c0-2.21 1.79-4 4-4z"></path></svg></span>\n' +
    //                         '    <span class="bui-checkbox-icon bui-checkbox-icon-selected"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M13 18.25l-1.8-1.8c-.6-.6-1.65-.6-2.25 0s-.6 1.5 0 2.25l2.85 2.85c.318.318.762.468 1.2.448.438.02.882-.13 1.2-.448l8.85-8.85c.6-.6.6-1.65 0-2.25s-1.65-.6-2.25 0l-7.8 7.8zM8 4h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4V8c0-2.21 1.79-4 4-4z"></path></svg></span>\n' +
    //                         '    <span class="bui-checkbox-name">' + name + '</span>\n' +
    //                         '</label></span>\n' +
    //                         '                    </div>'
    //                     )
    //                     insertBefore(fatherNode, element)
    //                     element.addEventListener('click', function (self) {
    //                         event(self.target.checked)
    //                     })
    //                 }
    //
    //                 function createNdanmuBar(fatherNode) {
    //                     element = createElement('' +
    //                         '<div class="bilibili-player-video-danmaku-setting-left-block-word" data-name="df-inserted-setting">\n' +
    //                         '    <div class="bilibili-player-video-danmaku-setting-left-block-add" id="buttonNdanmu">1倍弹幕</div >' +
    //                         '<input class="bilibili-player-video-danmaku-input" placeholder="输入弹幕倍率" id="inputNdanmu" style="" >\n' +
    //                         '    \n' +
    //                         '</div >' +
    //                         '')
    //                     insertBefore(fatherNode, element)
    //                     buttonNdanmu = selectById('buttonNdanmu')
    //                     inputNdanmu = selectById('inputNdanmu')
    //                     inputNdanmu.style.visibility = "hidden"
    //                     buttonNdanmu.addEventListener('click', function (event) {
    //                         if (buttonNdanmu.textContent !== '确定') {
    //                             buttonNdanmu.textContent = '确定'
    //                             inputNdanmu.style.visibility = "visible"
    //                         } else {
    //                             buttonNdanmu.textContent = '1倍弹幕'
    //                             inputNdanmu.style.visibility = "hidden"
    //                         }
    //                     })
    //                 }
    //
    //                 setting = document.body.querySelector('div[class="bilibili-player-video-danmaku-setting-left"]')
    //                 createCheckbox(setting, '自适应过滤', (event) => {
    //                     changeSetting('filter', event)
    //                 })
    //                 createNdanmuBar(setting)
    //                 createCheckbox(setting, '全局开关', (event) => {
    //                     changeSetting('switch', event)
    //                 })
    //             }
    //
    //             function removeOption() {
    //                 setting = document.body.querySelector('div[class="bilibili-player-video-danmaku-setting-left"]')
    //                 loption = setting.querySelectorAll('[data-name="df-inserted-setting"]')
    //                 for (i = 0; i < loption.length; i += 1) {
    //                     setting.removeChild(loption[i])
    //                 }
    //             }
    //
    //             button = createElement(
    //                 '<div class="bilibili-player-video-danmaku-switch bui bui-switch" id="DF拓展设置">' +
    //                 '<input class="bui-switch-input" type="checkbox" checked="" aria-label="df_switch" id="DF拓展设置开关">\n' +
    //                 '<label class="bui-switch-label">\n' +
    //                 '    <span class="bui-switch-name"></span>\n' +
    //                 '    <span class="bui-switch-body">\n' +
    //                 '        <span class="bui-switch-dot">\n' +
    //                 '            <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1.311 3.759l-.153 1.438h2.186c0 1.832-.066 3.056-.175 3.674-.131.618-.688.959-1.683 1.023-.284 0-.568-.021-.874-.043L.317 8.818c.284.032.59.053.896.053.546 0 .852-.17.929-.511.077-.341.12-1.076.12-2.204H0l.306-3.344h1.847V1.427H.098V.479h3.18v3.28H1.311zM4 1.747h1.311A8.095 8.095 0 004.492.426L5.53.085c.306.426.579.873.809 1.363l-.689.299h1.508c.306-.544.569-1.129.809-1.747l1.082.373c-.219.511-.47.969-.743 1.374h1.268V6.23H7.322v.82H10v1.044H7.322V10H6.208V8.094H3.607V7.05h2.601v-.82H4V1.747zm4.568 3.557v-.831H7.322v.831h1.246zm-2.36 0v-.831H5.016v.831h1.192zM5.016 3.557h1.191v-.873H5.016v.873zm2.306-.873v.873h1.246v-.873H7.322z"></path></svg></span>\n' +
    //                 '        </span>\n' +
    //                 '    </span>\n' +
    //                 '</label>\n' +
    //                 '<span class="choose_danmaku">打开DF拓展设置</span></div>'
    //             )
    //             danmaku_root = document.querySelector('div[class="bilibili-player-video-danmaku-root"]')
    //             danmaku_root.insertBefore(button, danmaku_root.childNodes[0])
    //             button = selectById("DF拓展设置开关")
    //             button.addEventListener('click', function (self) {
    //                 if (self.target.checked) {
    //                     insertOption()
    //                 } else {
    //                     removeOption()
    //                 }
    //             })
    //         }
    //
    //         insertSwitch()
    //
    //         // function insertFilter() {
    //         //     let filterMenu = document.querySelector('.player-auxiliary-wraplist')
    //         //     let originFilter = filterMenu.querySelector('.bui-tabs-header')
    //         //
    //         //     function openAdvanceFliter() {
    //         //
    //         //         function insertAfter(element, origin) {
    //         //             if (origin instanceof String) {
    //         //                 origin = filterMenu.querySelector(origin)
    //         //             }
    //         //             origin.parentNode.insertBefore(element, origin.nextSibling)
    //         //         }
    //         //
    //         //         console.log('openAdvanceFliter')
    //         //         originFilter.style.display = "none"
    //         //         advanceFilter = createElement(
    //         //             '<div class="bui-tabs-header" id="advance-filter"></div>'
    //         //         )
    //         //         insertAfter(advanceFilter, originFilter)
    //         //
    //         //
    //         //     }
    //         //
    //         //     function removeAdvanceFliter() {
    //         //
    //         //     }
    //         //
    //         //     advanceFliterButton = createElement(
    //         //         '<div class="player-auxiliary-block-string-short-btn bui bui-button bui-button-gray">\n' +
    //         //         '                                    <span>高级屏蔽</span>\n' +
    //         //         '                                </div>'
    //         //     )
    //         //
    //         //     advanceFliterButton.addEventListener('click', openAdvanceFliter)
    //         //     originFilter.setAttribute('id', 'origin-filter')
    //         //     originFilter.appendChild(advanceFliterButton)
    //         // }
    //
    //
    //         function insertFilter(target) {
    //             console.log('insertFilter', target)
    //             let tabs_header = target.querySelector('.bui-tabs-header')
    //             let colorFilter = createElement('<div class="bui-tabs-header-item" data-index="4">屏蔽颜色</div>')
    //             let colorPicker = createElement('<div class="bilibili-player-mode-selection-container"><div class="bilibili-player-mode-selection-panel"><div class="bilibili-player-mode-selection-row color">\n' +
    //                 '                                <div class="row-title">颜色</div>\n' +
    //                 '                                <div class="row-selection danmaku-color bui bui-color-picker bui-dark"><div class="bui-color-picker-wrap" style="width: 176px;">\n' +
    //                 '    <div class="bui-color-picker-result">\n' +
    //                 '        <span class="bui-color-picker-input bui bui-input" style="width: auto; flex: 1;"><div class="bui-input-wrap ">\n' +
    //                 '    \n' +
    //                 '    <input class="bui-input-input" type="text" value="#FFFFFF">\n' +
    //                 '    \n' +
    //                 '    \n' +
    //                 '</div></span>\n' +
    //                 '        <span class="bui-color-picker-display" style="background: #FFFFFF"></span>\n' +
    //                 '    </div>\n' +
    //                 '    <ul class="bui-color-picker-options" style=" margin-right: -10.666666666666666px;">\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #FE0302; margin-right: 10.666666666666666px;" data-value="#FE0302"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #FF7204; margin-right: 10.666666666666666px;" data-value="#FF7204"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #FFAA02; margin-right: 10.666666666666666px;" data-value="#FFAA02"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #FFD302; margin-right: 10.666666666666666px;" data-value="#FFD302"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #FFFF00; margin-right: 10.666666666666666px;" data-value="#FFFF00"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #A0EE00; margin-right: 10.666666666666666px;" data-value="#A0EE00"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #00CD00; margin-right: 10.666666666666666px;" data-value="#00CD00"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #019899; margin-right: 10.666666666666666px;" data-value="#019899"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #4266BE; margin-right: 10.666666666666666px;" data-value="#4266BE"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #89D5FF; margin-right: 10.666666666666666px;" data-value="#89D5FF"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #CC0273; margin-right: 10.666666666666666px;" data-value="#CC0273"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #222222; margin-right: 10.666666666666666px;" data-value="#222222"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option" style="background: #9B9B9B; margin-right: 10.666666666666666px;" data-value="#9B9B9B"></li>\n' +
    //
    //                 '        <li class="bui-color-picker-option bui-color-picker-option-active" style="background: #FFFFFF; margin-right: 10.666666666666666px;" data-value="#FFFFFF"></li>\n' +
    //
    //                 '    </ul>\n' +
    //                 '</div></div>\n' +
    //                 '                            </div></div></div>')
    //             colorFilter.appendChild(colorPicker)
    //             colorFilter.addEventListener('mouseenter', () => {
    //                 console.log('focus')
    //                 colorPicker.classList.add('active')
    //             })
    //             colorFilter.addEventListener('mouseleave', () => {
    //                 console.log('blur')
    //
    //                 colorPicker.classList.remove('active')
    //             })
    //             tabs_header.appendChild(colorFilter)
    //
    //         }
    //
    //         document.addEventListener("DOMNodeInserted", (msg) => {
    //
    //             if (msg.target.className === "bui-tabs-wrap") {
    //                 insertFilter(msg.target)
    //             }
    //         });
    //     } catch (e) {
    //         console.log(e)
    //     }
    // }

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
        } else {
            if (name === 'readystatechange' && callback.toString().startsWith('function(){if(4===s.readyState)')) {
                this.pakku_load_callback = this.pakku_load_callback || [];
                this.pakku_load_callback.push(callback);
            }
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
