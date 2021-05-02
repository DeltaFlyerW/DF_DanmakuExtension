'use strict'
function reload_danmaku_magic() {
    if (!root_elem) {
        console.log("pakku magic reload: root_elem not found");
        return
    }

    function proceed(date_picker) {
        var elem = document.createElement("span");
        elem.className = "js-action __pakku_injected";
        elem.dataset["action"] = "changeDay";
        elem.dataset["timestamp"] = 0;
        elem.style.display = "none";
        date_picker.appendChild(elem);
        console.log("pakku magic reload: proceed");
        trigger_mouse_event(elem, "mousedown");
        trigger_mouse_event(elem, "mouseup");
        trigger_mouse_event(elem, "click");
        date_picker.removeChild(elem)
    }

    var date_picker = root_elem.querySelector(".player-auxiliary-danmaku-date-picker-day-content, .bilibili-player-danmaku-date-picker-day-content");
    if (date_picker) proceed(date_picker); else {
        var history_btn = root_elem.querySelector(".player-auxiliary-danmaku-btn-history, .bilibili-player-danmaku-btn-history");
        console.log("pakku magic reload: activating date picker with", history_btn);
        history_btn.click();
        history_btn.click();
        date_picker = root_elem.querySelector(".player-auxiliary-danmaku-date-picker-day-content, .bilibili-player-danmaku-date-picker-day-content");
        if (date_picker) proceed(date_picker); else {
            show_danmu_list();
            var tries_left = 10;

            function try_find() {
                history_btn.click();
                history_btn.click();
                date_picker = root_elem.querySelector(".player-auxiliary-danmaku-date-picker-day-content, .bilibili-player-danmaku-date-picker-day-content");
                if (date_picker) proceed(date_picker); else {
                    if (--tries_left > 0) setTimeout(try_find, 350); else console.log("pakku magic reload: FAILED to find date picker")
                }
            }

            setTimeout(try_find, 1e3)
        }
    }
}


function trigger_mouse_event(node, eventType) {
    var clickEvent = document.createEvent("MouseEvents");
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent)
}