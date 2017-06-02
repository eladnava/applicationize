// Get webview element
var webview = document.getElementById('webview');

// Initial page zoom factor
var zoomFactor = 1.0;

// Listen to keydown event
document.addEventListener('keydown', function (e) {
    // Refresh the page (CMD + R)
    if (e.metaKey && e.keyCode == 'R'.charCodeAt(0)) {
        webview.reload();
    }

    // Copy URL (CMD + L)
    if (e.metaKey && e.keyCode == 'L'.charCodeAt(0)) {
        // Copy webview source to clipboard
        copyToClipboard(webview.src, 'text/plain');
    }

    // Zoom in (CMD +)
    if (e.metaKey && e.keyCode == 187) {
        zoomFactor += 0.1;
        webview.setZoom(zoomFactor);
    }

    // Zoom out (CMD -)
    if (e.metaKey && e.keyCode == 189) {
        zoomFactor -= 0.1;

        // Don't let zoom drop below 0.2
        if (zoomFactor <= 0.2) {
            zoomFactor = 0.2;
        }

        webview.setZoom(zoomFactor);
    }

    // Reset zoom (CMD + 0)
    if (e.metaKey && e.keyCode == '0'.charCodeAt(0)) {
        zoomFactor = 1.0;
        webview.setZoom(zoomFactor);
    }
});

function copyToClipboard(str, mimetype) {
    // Listen for 'oncopy' event
    document.oncopy = function (event) {
        event.clipboardData.setData(mimetype, str);
        event.preventDefault();
    };

    // Execute browser command 'Copy'
    document.execCommand("Copy", false, null);
}