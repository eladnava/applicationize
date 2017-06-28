// Get webview element
var webview = document.getElementById('webview');

// Get find box elements
var findBox = document.getElementById('find-box');
var findInput = document.getElementById('find-text');

// Initial page zoom factor
var zoomFactor = 1.0;

// Listen to keydown event
document.addEventListener('keydown', function (e) {
    // Check whether CTRL on Windows or CMD on Mac is pressed
    var modifierActive = (navigator.platform.startsWith('Win')) ? e.ctrlKey : e.metaKey;

    // Refresh the page (CTRL/CMD + R)
    if (modifierActive && e.keyCode == 'R'.charCodeAt(0)) {
        webview.reload();
    }

    // Find in page (CTRL/CMD + F)
    if (modifierActive && e.keyCode == 'F'.charCodeAt(0)) {
        // Show the find box
        findBox.style.display = 'block';

        // Focus the find input
        findInput.focus();

        // Select all existing text (if any)
        findInput.select();
    }

    // Copy URL (CTRL/CMD + L)
    if (modifierActive && e.keyCode == 'L'.charCodeAt(0)) {
        // Copy webview source to clipboard
        copyToClipboard(webview.src, 'text/plain');
    }

    // Zoom in (CTRL/CMD +)
    if (modifierActive && e.keyCode == 187) {
        zoomFactor += 0.1;
        webview.setZoom(zoomFactor);
    }

    // Zoom out (CTRL/CMD -)
    if (modifierActive && e.keyCode == 189) {
        zoomFactor -= 0.1;

        // Don't let zoom drop below 0.2
        if (zoomFactor <= 0.2) {
            zoomFactor = 0.2;
        }

        webview.setZoom(zoomFactor);
    }

    // Reset zoom (CTRL/CMD + 0)
    if (modifierActive && e.keyCode == '0'.charCodeAt(0)) {
        zoomFactor = 1.0;
        webview.setZoom(zoomFactor);
    }
});

// Find input: listen to keydown event
findInput.addEventListener('keyup', function (e) {
    // Search for current input text
    webview.find(findInput.value, { matchCase: false });
    
    // Escape key
    if (e.keyCode === 27) {
        webview.stopFinding();
        findBox.style.display = 'none';
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