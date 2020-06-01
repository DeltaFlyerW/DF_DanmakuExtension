function htmlEscape(text) {
    return text.replace(/[<>"&]/g, function (match, pos, originalText) {
        switch (match) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "\"":
                return "&quot;";
        }
    });
}

async function localServer(order, argv) {
    var ws = new WebSocket("ws://localhost:56789");

    ws.onopen = function (evt) {
        ws.send(htmlEscape(order + ':' + argv))
    }
    async function recvData() {
        await new Promise((resolve) => {
            ws.onmessage = function (evt) {
                data = evt.data

                res = data
                resolve();
            }
        })

        return res
    }

    res = recvData()
    if (order!=='read'||res.slice(0,7)==='[failed'){
        res=JSON.parse(res)
    }
    return res

}
res=localServer('danmuPath', "E:\\data\\bilibiliLib\\archiveLib\\有顶天家族\\av637987 【7月】有顶天家族 01")

