// Wait for embed.html page DOM to load
window.onload = function() {
    // Get webview DOM element
    var webview = document.getElementById('webview');

    // Sign up for "newwindow" event
    // Emitted when a target="_blank" link is clicked within the webview
    webview.addEventListener('newwindow', function(e) {
        // Open the link in a new browser tab/window
        window.open(e.targetUrl);
    });
}