'use strict'


self.addEventListener('message', function (e) {
    let ruleGroup = e.data.rule
    let nldanmu = []
    for (let idanmu = 0; idanmu < e.data.ldanmu.length; idanmu += 1) {
        let danmu = e.data.ldanmu[idanmu]
        let content = danmu.content.toLowerCase()

        if (ruleGroup['period']) {
            if (danmu.progress < ruleGroup['period'][0]) {
                continue
            }
            if (danmu.progress > ruleGroup['period'][1]) {
                break
            }
        }
        let ffilted = false;
        for (let irule = 0; irule < ruleGroup['string'].length; irule += 1) {
            if (ruleGroup['string'][irule].indexOf(content) !== -1) {
                ffilted = true;
                break
            }
        }
        if (ruleGroup['regexp'] && !ffilted) {
            for (let irule = 0; irule < ruleGroup['regexp'].length; irule += 1) {
                if (ruleGroup['regexp'][irule].match(content)) {
                    ffilted = true;
                    break
                }
            }
        }
        if (ruleGroup['color'] && !ffilted) {
            for (let irule = 0; irule < ruleGroup['color'].length; irule += 1) {
                if (ruleGroup['color'][irule] === danmu.color) {
                    ffilted = true;
                    break
                }
            }
        }
        if (!ffilted) {
            nldanmu.push(danmu)
        }
    }
    self.postMessage({ldanmu: nldanmu})
}, false)