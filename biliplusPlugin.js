async function postExtension(messageType, data) {
    let timeStamp = new Date().getTime();
    if (!data) data = {}
    if (messageType) data.type = messageType
    data.timeStamp = timeStamp
    data.source = 'DFex'
    chrome.runtime.sendMessage(data);
}

document.addEventListener("DOMNodeInserted", async (msg) => {
    if (msg.target.id) {
        if (msg.target.id === 'danmaku_container') {
            console.log(msg.target.className, msg.target)
            let historyButton = msg.target.querySelector('a[href^="/open/moepus.powered"]')
            let cid = /#(\d+)/.exec(historyButton.getAttribute('href'))[1]
            historyButton.onclick = function () {
                postExtension('biliplusDownloadDanmaku', {'cid':cid})
            }
            historyButton.removeAttribute('href')
        }
    }
})
