// Get webview element
var webview = document.getElementById('webview');

// Listen to keydown event
document.addEventListener('keydown', function (e) {
    // Refresh the page (CMD + R)
    if (e.metaKey && e.keyCode == 'R'.charCodeAt(0)) {
        webview.reload();
    }
});