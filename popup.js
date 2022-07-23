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

function timetrans(date) {
    date = new Date(date * 1000);//如果date为10位需要乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y + M + D + h + m + s;
}

(async function main() {
    let videoInfo = await postExtension('currentAdjustVideoInfo')
    let table = document.querySelector('table')
    let shtml = []
    shtml.push('<tbody>')

    for (let part of videoInfo['list']) {
        let offset = 0
        if (part.offset) {
            offset = part.offset
        }
        shtml.push(
            `<tr>
        <th scope="row">${part['page']}</th>
        <td>${part['part']}</td>
        <td>${part['cid']}</td>
        <td id="cid_${part.cid}_latest"></td>
        <td id="cid_${part.cid}_last"></td>
        <td ><input type="text" class="form-control" placeholder="${offset}" id="cid_${part.cid}_offset"></td>
        </tr>`
        )
    }

    shtml.push('</tbody>')
    table.appendChild(createElement(shtml.join('\n')))

    for (let part of videoInfo['list']) {
        let info = await postExtension('danmakuDetail', {cid: part.cid})
        document.querySelector('[id=cid_' + part.cid + '_last]').textContent = info.last / 1000 + '秒'
        document.querySelector('[id=cid_' + part.cid + '_latest]').textContent = timetrans(info.latest)
    }
})()