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


function getdate(date) {
    let month = Number(date.getMonth()) + 1;
    if (month < 10) {
        month = '0' + month
    }
    let sdate
    if (Number(date.getDate()) < 10) {
        sdate = '0' + date.getDate()
    } else {
        sdate = date.getDate()
    }
    return [date.getFullYear(), month, sdate].join('-')
}

async function main() {
    console.log('bahaPlugin running!')
    if (document.title !== '巴哈姆特電玩資訊站 - 系統異常回報') {
        postExtension('bahaCookieSet', {})
    }
    let elem = document.querySelector("#BH_background > div.container-player > section.player > div.subtitle > div.sub_top.ani-tabs")
    if (elem) {
        let sn = /sn=(\d+)/.exec(location.href)[1]

        let tab = document.createElement('div')
        tab.setAttribute('class', 'ani-tabs__item')
        let a = document.createElement('a')
        a.setAttribute('class', 'ani-tabs-link')
        a.text = '下载弹幕'
        let title = document.querySelector("head > title").text
        title = 'sn' + sn + ' ' + title.slice(0, title.indexOf(" 線上看"))
        tab.appendChild(a)
        tab.addEventListener('click', function () {
            tab.style.visibility = 'none'
            console.log('download', {cid: 'sn' + sn})
            postExtension('bahamuteDownloadDanmaku', {cid: 'sn' + sn, name: title})
        })
        elem.appendChild(tab)
    }
    let season = document.querySelector('section[class="season"]')

    if (season) {
        let title = document.querySelector("head > title")
        if (/ \[.*?] /.exec(title.text)) {
            title = title.text.slice(0, / \[.*?] /.exec(title.text).index)
        }
        title = title.replace('/', ' ')

        let lsn = []


        if (!season.querySelector('p')) {
            for (let a of season.querySelectorAll('a')) {
                lsn.push({
                    'name': a.text,
                    'sn': 'sn' + /sn=(\d+)/.exec(a.href)[1]
                })
            }
        } else {
            let lSeasonTitle = season.querySelectorAll('p')
            let lSeason = season.querySelectorAll('ul')
            for (let i = 0; i < lSeason.length; i++) {
                for (let a of lSeason[i].querySelectorAll('a')) {
                    lsn.push({
                        'name': lSeasonTitle[i].innerText + ' ' + a.text,
                        'sn': 'sn' + /sn=(\d+)/.exec(a.href)[1]
                    })
                }
            }
        }


        let elem = season.querySelector("ul")
        let a = document.createElement('a')
        a.text = '下载剧集弹幕'

        let li = document.createElement('li')
        li.appendChild(a)

        li.addEventListener('click', function () {
            li.style.visibility = 'none'
            console.log('download', {name: title + ' ' + getdate(new Date()), lsn: lsn})
            postExtension('bahamuteDownloadDanmaku', {name: title + ' ' + getdate(new Date()), lsn: lsn})
            li.style.visibility = 'hidden'
        })
        elem.appendChild(li)

    }
}

main()

