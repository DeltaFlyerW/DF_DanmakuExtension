async function postExtension(messageType, data) {
    if (!data) {
        data = {}
    }
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


async function requestSetting() {
    let result = await postExtension('getOption')
    window.setting = result.setting
    renderOption(result)
    help()
}

async function renderOption(result) {
    function setLabel(detail, key, value) {
        if (detail.indexOf("{" + key + "}") !== -1) {
            detail = detail.replace("{" + key + "}", value)
        } else {
            if (value === true) value = "是"
            else if (value === false) value = "否"
            detail = detail + ': ' + value
        }
        return detail
    }

    console.log(result)
    let setting = result.setting
    let detailDict = result.detail
    let keyList = []
    for (let key of Object.keys(detailDict)) {
        keyList.push(key)
    }
    for (let key of Object.keys(setting)) {
        if (keyList.indexOf(key) === -1 && ((typeof setting[key]) !== 'object')) {
            keyList.push(key)
        }
    }
    for (let key of Object.keys(setting)) {
        if (keyList.indexOf(key) === -1) {
            keyList.push(key)
        }
    }

    for (let key of keyList) {
        let detail = detailDict[key]
        if (!detail) {
            detail = key
        }
        let value = setting[key]

        if ((typeof value) === 'number') {
            let detailParts = detail.split('{' + key + '}')

            let rootDiv = createElement(
                `<div class="input-group mb-3" id="${key}-div">
                      <span class="input-group-text">${detailParts[0]}</span>
                      <input type="number" class="form-control" value="${value}">
                        <span class="input-group-text">${detailParts[1]}</span>
                    </div>`
            )
            rootDiv.addEventListener("input", event => {
                editConfig(key, event.target.valueAsNumber)
            })
            document.querySelector("body").appendChild(rootDiv)
        } else if ((typeof value) === 'boolean') {
            let checked = value ? 'checked' : ''
            let rootDiv = createElement(
                `<div class="form-check form-switch" id="${key}-div">
                         <input class="form-check-input" type="checkbox" role="switch" id="${key}-switch" ${checked}>
                         <label class="form-check-label" for="${key}-switch" id="${key}-label"></label>
                        </div>`
            )
            let optionLabel = rootDiv.lastChild
            rootDiv.addEventListener("click", function (event) {
                if (event.target.id.endsWith('div')) {
                    let newValue = !event.target.children[0].checked
                    editConfig(key, newValue)
                    event.target.children[0].checked = newValue
                    optionLabel.textContent = setLabel(detail, key, newValue)
                } else {
                    editConfig(key, event.target.checked)
                    optionLabel.textContent = setLabel(detail, key, event.target.checked)
                }
            })
            document.querySelector("body").appendChild(rootDiv)
            optionLabel.textContent = setLabel(detail, key, value)
        } else if ((typeof value) === 'object') {
            let content=JSON.stringify(value, null, 4)
            let rowNumber = content.split('\n').length
            let rootDiv = createElement(
                `<div class="mb-3" id="${key}-div">
                          <label id="${key}-label" for="${key}-input" class="form-label">${key}:</label>
                          <textarea class="form-control" id="${key}-input" rows="${rowNumber}">${content}</textarea>
                        </div>`)
            rootDiv.addEventListener("input", event => {
                value = event.target.value
                try {
                    value = JSON.parse(value)
                    editConfig(key, value)
                } catch (e) {
                    console.log(e)
                }
            })
            document.querySelector("body").appendChild(rootDiv)
            console.log(key, value)
        }
    }
}


function help() {
    console.log('https://github.com/DeltaFlyerW/DF_DanmakuExtension')
    console.log('扩展现在的设置为')
    console.log(format('如对于弹幕池上限为3000的24分钟番剧\n' +
        '    danmuRate: {danmuRate}, 将加载3000*{danmuRate}条以上的B站弹幕\n' +
        '    uidFilter: {uidFilter}, 将过滤uid在{uidFilter}以上的弹幕\n' +
        '    nicoDanmuRate:  {nicoDanmuRate}, 将加载3000*{nicoDanmuRate}条的N站弹幕\n' +
        '    translateNicoComment: {translateNicoComment}, 翻译N站弹幕\n' +
        '    translateThreshold: {translateThreshold}, 长度在{translateThreshold}以下的N站弹幕将不会被翻译\n' +
        '    replaceKatakana: {replaceKatakana}, 将未翻译的N站弹幕中的片假名替换为罗马字', window.setting))
    console.log('如需修改设置,请按')
    console.log('editConfig("danmuRate",3)')
    console.log('的格式输入')
}

function editConfig(key, value) {
    if (!window.setting.hasOwnProperty(key)) {
        console.log('设置中不含有', key, '这一项')
        return '修改失败'
    }
    if (typeof window.setting[key] !== typeof value) {
        console.log(key, '项的类型应为', typeof window.setting[key], '如', window.setting[key])
        console.log('而将要修改的值为', value, ',其类型为', typeof value)
        return '修改失败'
    }
    if (key === 'uidFilter') {
        if (value > 100000000) {
            console.log('不推荐用户uid过滤大于一亿')
        }
    }
    postExtension('editSetting', {
        key: key,
        value: value
    })
    return '修改成功'
}

function format(text, dict) {
    var result = text
    var lkey = text.match(/{(.*?)}/g)
    for (var i = 0; i < lkey.length; i++) {
        var key = lkey[i]
        result = result.replace(key, dict[key.slice(1, -1)])
    }
    return result
}

requestSetting()
