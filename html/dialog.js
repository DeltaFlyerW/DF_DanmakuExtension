document.forms[0].onsubmit = function(e) {
    e.preventDefault(); // Prevent submission
    var password = document.getElementById('pass').value;
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        bgWindow.setPassword(password);
        window.close();     // Close dialog
    });
};