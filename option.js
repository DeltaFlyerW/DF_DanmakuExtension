async function postExtension(messageType, data) {
    if(!data){
        data={}
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


async function requestSetting() {
    window.setting = await postExtension('getSetting')
    help()

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
