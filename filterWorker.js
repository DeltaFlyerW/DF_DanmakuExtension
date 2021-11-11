'use strict'


self.addEventListener('message', function (e) {
    let ruleGroup = e.data.rule
    let nldanmu = []
    for (let idanmu = 0; idanmu < e.data.ldanmu.length; idanmu += 1) {
        let danmu = e.data.ldanmu[idanmu]
        let content = danmu.content.toLowerCase()
        // let reason;
        if (ruleGroup['period']) {
            if (danmu.progress < ruleGroup['period'][0]) {
                continue
            }
            if (danmu.progress > ruleGroup['period'][1]) {
                break
            }
        }
        let ffilted = false;
        if (ruleGroup['string']) {
            for (let irule = 0; irule < ruleGroup['string'].length; irule += 1) {
                if (content.indexOf(ruleGroup['string'][irule]) !== -1) {
                    // reason=['string',ruleGroup['string'][irule],content,danmu]
                    ffilted = true;
                    break
                }
            }
        }
        if (ruleGroup['regexp'] && !ffilted) {
            for (let irule = 0; irule < ruleGroup['regexp'].length; irule += 1) {
                if (content.match(ruleGroup['regexp'][irule])) {
                    // reason=['regexp',ruleGroup['regexp'][irule],content,danmu]

                    ffilted = true;
                    break
                }
            }
        }


        if (ruleGroup['user'] && !ffilted) {
            for (let irule = 0; irule < ruleGroup['user'].length; irule += 1) {
                if (ruleGroup['user'][irule] === danmu.midHash) {
                    // reason=['midHash',ruleGroup['user'][irule],content,danmu]
                    ffilted = true;
                    break
                }
            }
        }
        if (!ffilted) {
            nldanmu.push(danmu)
        } else {
            // console.log(reason)
        }
    }
    self.postMessage({ldanmu: nldanmu})
}, false)