// (C) 2017-2019 @xmcp. THIS PROJECT IS LICENSED UNDER GPL VERSION 3. SEE `LICENSE.txt`.


(function () {
    let insertedUI = false
    let setting = null
    let log = console.log

    async function postExtension(messageType, data) {
        window.postMessage({
            type: messageType,
            source: 'DFex',
            data: data,
        }, "*");
        return await new Promise((resolve) => {
            let handle = (event) => {
                if (event.source !== window) return;
                if (event.data.type && event.data.type === messageType + '_response') {
                    window.removeEventListener('message', handle)
                    resolve(event.data.data)
                }
            }
            window.addEventListener("message", handle, false);
        })
    }

    async function insertUI() {
        try {


            insertedUI = true

            function changeSetting(name, value) {
                window.postMessage({
                        type: "changeSetting",
                        source: 'DFex',
                        data: {
                            name: name,
                            value: value
                        }
                    }
                )
            }

            bilibiliplayer = document.body.querySelector('div[class="player"]')
            if (bilibiliplayer == null) {
                console.log(bilibiliplayer, 'Player not Found')
                return
            }
            console.log('try insert', bilibiliplayer,)

            setting = await postExtension('getSetting')
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

            function insertSwitch() {
                function selectById(label) {
                    return document.body.querySelector('#' + label)
                }

                function insertOption() {
                    function insertBefore(element, child) {
                        element.insertBefore(child, element.childNodes[0])
                    }

                    function createCheckbox(fatherNode, name, event,) {
                        element = createElement(
                            '<div class="bilibili-player-video-danmaku-setting-right-speedsync" data-name="df-inserted-setting">\n' +
                            '                        <span class="bilibili-player-video-danmaku-setting-right-speedsync-box bui bui-checkbox bui-dark">' +
                            '<input class="bui-checkbox-input" type="checkbox" aria-label="弹幕速度同步播放倍数" id="' + name + '">\n' +
                            '<label class="bui-checkbox-label">\n' +
                            '    <span class="bui-checkbox-icon bui-checkbox-icon-default"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M8 6a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2H8zm0-2h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4V8c0-2.21 1.79-4 4-4z"></path></svg></span>\n' +
                            '    <span class="bui-checkbox-icon bui-checkbox-icon-selected"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M13 18.25l-1.8-1.8c-.6-.6-1.65-.6-2.25 0s-.6 1.5 0 2.25l2.85 2.85c.318.318.762.468 1.2.448.438.02.882-.13 1.2-.448l8.85-8.85c.6-.6.6-1.65 0-2.25s-1.65-.6-2.25 0l-7.8 7.8zM8 4h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4V8c0-2.21 1.79-4 4-4z"></path></svg></span>\n' +
                            '    <span class="bui-checkbox-name">' + name + '</span>\n' +
                            '</label></span>\n' +
                            '                    </div>'
                        )
                        insertBefore(fatherNode, element)
                        element.addEventListener('click', function (self) {
                            event(self.target.checked)
                        })
                    }

                    function createNdanmuBar(fatherNode) {
                        element = createElement('' +
                            '<div class="bilibili-player-video-danmaku-setting-left-block-word" data-name="df-inserted-setting">\n' +
                            '    <div class="bilibili-player-video-danmaku-setting-left-block-add" id="buttonNdanmu">1倍弹幕</div >' +
                            '<input class="bilibili-player-video-danmaku-input" placeholder="输入弹幕倍率" id="inputNdanmu" style="" >\n' +
                            '    \n' +
                            '</div >' +
                            '')
                        insertBefore(fatherNode, element)
                        buttonNdanmu = selectById('buttonNdanmu')
                        inputNdanmu = selectById('inputNdanmu')
                        inputNdanmu.style.visibility = "hidden"
                        buttonNdanmu.addEventListener('click', function (event) {
                            if (buttonNdanmu.textContent !== '确定') {
                                buttonNdanmu.textContent = '确定'
                                inputNdanmu.style.visibility = "visible"
                            } else {
                                buttonNdanmu.textContent = '1倍弹幕'
                                inputNdanmu.style.visibility = "hidden"
                            }
                        })
                    }

                    setting = document.body.querySelector('div[class="bilibili-player-video-danmaku-setting-left"]')
                    createCheckbox(setting, '自适应过滤', (event) => {
                        changeSetting('filter', event)
                    })
                    createNdanmuBar(setting)
                    createCheckbox(setting, '全局开关', (event) => {
                        changeSetting('switch', event)
                    })
                }

                function removeOption() {
                    setting = document.body.querySelector('div[class="bilibili-player-video-danmaku-setting-left"]')
                    loption = setting.querySelectorAll('[data-name="df-inserted-setting"]')
                    for (i = 0; i < loption.length; i += 1) {
                        setting.removeChild(loption[i])
                    }
                }

                button = createElement(
                    '<div class="bilibili-player-video-danmaku-switch bui bui-switch" id="DF拓展设置">' +
                    '<input class="bui-switch-input" type="checkbox" checked="" aria-label="df_switch" id="DF拓展设置开关">\n' +
                    '<label class="bui-switch-label">\n' +
                    '    <span class="bui-switch-name"></span>\n' +
                    '    <span class="bui-switch-body">\n' +
                    '        <span class="bui-switch-dot">\n' +
                    '            <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1.311 3.759l-.153 1.438h2.186c0 1.832-.066 3.056-.175 3.674-.131.618-.688.959-1.683 1.023-.284 0-.568-.021-.874-.043L.317 8.818c.284.032.59.053.896.053.546 0 .852-.17.929-.511.077-.341.12-1.076.12-2.204H0l.306-3.344h1.847V1.427H.098V.479h3.18v3.28H1.311zM4 1.747h1.311A8.095 8.095 0 004.492.426L5.53.085c.306.426.579.873.809 1.363l-.689.299h1.508c.306-.544.569-1.129.809-1.747l1.082.373c-.219.511-.47.969-.743 1.374h1.268V6.23H7.322v.82H10v1.044H7.322V10H6.208V8.094H3.607V7.05h2.601v-.82H4V1.747zm4.568 3.557v-.831H7.322v.831h1.246zm-2.36 0v-.831H5.016v.831h1.192zM5.016 3.557h1.191v-.873H5.016v.873zm2.306-.873v.873h1.246v-.873H7.322z"></path></svg></span>\n' +
                    '        </span>\n' +
                    '    </span>\n' +
                    '</label>\n' +
                    '<span class="choose_danmaku">打开DF拓展设置</span></div>'
                )
                danmaku_root = document.querySelector('div[class="bilibili-player-video-danmaku-root"]')
                danmaku_root.insertBefore(button, danmaku_root.childNodes[0])
                button = selectById("DF拓展设置开关")
                button.addEventListener('click', function (self) {
                    if (self.target.checked) {
                        insertOption()
                    } else {
                        removeOption()
                    }
                })
            }

            insertSwitch()

            // function insertFilter() {
            //     let filterMenu = document.querySelector('.player-auxiliary-wraplist')
            //     let originFilter = filterMenu.querySelector('.bui-tabs-header')
            //
            //     function openAdvanceFliter() {
            //
            //         function insertAfter(element, origin) {
            //             if (origin instanceof String) {
            //                 origin = filterMenu.querySelector(origin)
            //             }
            //             origin.parentNode.insertBefore(element, origin.nextSibling)
            //         }
            //
            //         console.log('openAdvanceFliter')
            //         originFilter.style.display = "none"
            //         advanceFilter = createElement(
            //             '<div class="bui-tabs-header" id="advance-filter"></div>'
            //         )
            //         insertAfter(advanceFilter, originFilter)
            //
            //
            //     }
            //
            //     function removeAdvanceFliter() {
            //
            //     }
            //
            //     advanceFliterButton = createElement(
            //         '<div class="player-auxiliary-block-string-short-btn bui bui-button bui-button-gray">\n' +
            //         '                                    <span>高级屏蔽</span>\n' +
            //         '                                </div>'
            //     )
            //
            //     advanceFliterButton.addEventListener('click', openAdvanceFliter)
            //     originFilter.setAttribute('id', 'origin-filter')
            //     originFilter.appendChild(advanceFliterButton)
            // }

            function insertFilter() {
                let filterMenu = document.querySelector('.player-auxiliary-wraplist')
                let originFilter = filterMenu.querySelector('.bui-tabs-header')

                function updateFilter() {

                }


                updateFilterButton = createElement(
                    '<div class="player-auxiliary-block-string-short-btn bui bui-button bui-button-gray">\n' +
                    '                                    <span>更新屏蔽列表</span>\n' +
                    '                                </div>'
                )

                updateFilterButton.addEventListener('click', updateFilter)
                originFilter.setAttribute('id', 'origin-filter')
                originFilter.appendChild(updateFilterButton)
            }

            insertFilter()
        } catch (e) {
            console.log(e)
        }
    }

    async function sleep(seconds) {
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }


    function bindLocalDanmu() {

        ldeposide = []
        eindex = document.querySelector('ul[class="bilibili-player-video-btn-menu"]')
        if (eindex !== null) {
            leposide = eindex.querySelectorAll('li[class^="bilibili-player-video-btn-menu-list"]')
            for (ieposide = 0; ieposide < leposide.length; ieposide++) {

                eposide = leposide[ieposide]
                deposide = {
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
    //     var date_picker = root_elem.querySelector['div[class="player-auxiliary-danmaku-date-picker-day-content clearfix"]'];
    //     history_btn = root_elem.querySelector('div[class="player-auxiliary-danmaku-date-picker-week clearfix"]');
    //
    //     if (!date_picker) {
    //         elem = root_elem.querySelector('div[class="bui-collapse-arrow"]')
    //         elem.click()
    //         await sleep(500)
    //         var history_btn = root_elem.querySelector('div[class="player-auxiliary-danmaku-btn-history bui bui-button bui-button-gray2"]');
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
    //     var elem = document.createElement("span");
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
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function byte_object_to_arraybuffer(obj) {
        var ks = Object.keys(obj);
        var buf = new ArrayBuffer(ks.length);
        var bufView = new Uint8Array(buf);
        ks.forEach(function (i) {
            bufView[i] = obj[i];
        });
        return buf;
    }

    var callbacks = {};
    if (XMLHttpRequest.prototype.pakku_open) return;
    window.addEventListener("message", function (event) {
        if (event.source !== window) return;
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
        }
        return this.pakku_addEventListener(name, callback);
    };
    XMLHttpRequest.prototype.pakku_send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (arg) {
        if (this.pakku_url.indexOf("list.so") !== -1
            || this.pakku_url.indexOf('seg.so') !== -1
        ) {
            // || this.pakku_url.indexOf('web-interface/view') !== -1) {
            if (!insertedUI) {
                insertUI()
            }
            var link = document.createElement("a");
            link.href = this.pakku_url;
            this.pakku_url = link.href;
            var that = this;
            console.log(this.pakku_url)
            if (this.pakku_load_callback) {
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
                    } else {
                        that.response = that.responseText = resp.data;
                    }
                    // console.log(resp.data)
                    that.readyState = 4;
                    that.status = 200;
                    that.statusText = "Pakku OK";
                    console.log("pakku ajax: got tampered response for", that.pakku_url);
                    that.abort();
                    for (var i = 0; i < that.pakku_load_callback.length; i++) that.pakku_load_callback[i].bind(that)();
                });
            } else {
                console.log("pakku ajax: ignoring request as no onload callback found", this.pakku_url);
                return that.pakku_send(arg);
            }
        } else {
            return this.pakku_send(arg)
        }
    };


    console.log("pakku ajax: hook set");




})
();
