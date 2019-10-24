var os = require('os');
var url = require('url');
var pem = require('pem');
var path = require('path');
var fs = require('fs-extra');
var request = require('request');
var cheerio = require('cheerio');
var thunkify = require('thunkify');
var validator = require('validator');

// Convert callbacks to thunks
var requestThunk = thunkify(request);
var createCertificate = thunkify(pem.createCertificate);

// CRX packaging module, instantiated with the `new` keyword
var Extension = require('crx');

// POST /generate
module.exports = function* () {
    // Build .crx config for the provided URL
    var crxConfig = yield buildCrxConfig(this);

    // Generate the .crx file based on the config
    var crxBuffer = yield generateCrx(crxConfig);

    // Send it to the browser (save to disk)
    sendCrx(this, crxConfig, crxBuffer);
};

function* buildCrxConfig(ctx) {
    // Get target URL from input
    var url = ctx.body.url;

    // Bad input?
    if (!url) {
        throw { status: 400, message: 'Please provide a URL to continue.' };
    }

    // Parse and validate the input URL (may throw an error)
    var parsedUrl = parseUrl(url);

    // Prepare crx object with default values
    var crxConfig = {
        url: parsedUrl.href, // href appends trailing slash to hostnames
        hostname: parsedUrl.hostname,
        parsedUrl: parsedUrl,
        title: parsedUrl.hostname,
        filename: parsedUrl.hostname + '.crx'
    };

    // Normalize hostname for custom use-cases
    crxConfig.host = parsedUrl.hostname.toLowerCase().replace('www.', '');

    var $;

    try {
        // Execute GET request to provided URL - may fail for internal URLs, continue anyway
        $ = yield getPageDOM(crxConfig.url);
    }
    catch (exc) {
        // Ignore exception, continue execution ($ is optional)
    }

    // Get extension title and handle custom cases
    crxConfig.title = getCrxTitle($, crxConfig, ctx);

    // Get extension icon path (either from default host icons, page DOM, or a user-uploaded icon)
    crxConfig.icon = yield getCrxIcon($, crxConfig, ctx);

    // Get extension frame color (advanced option)
    crxConfig.frameColor = getCrxFrameColor(ctx);

    // Get extra permissions (advanced options)
    crxConfig.permissions = getExtraPermissions(ctx);

    // Get custom user agent (optional)
    crxConfig.userAgent = ctx.body.userAgent;

    // Check whether user wants internal links
    crxConfig.internalLinks = ctx.body.internalLinks !== undefined;

    // Return the extension configuration object
    return crxConfig;
}

function* getCrxIcon($, crxConfig, ctx) {
    // Read any uploaded files from the post body (do this before reading from parts.fields)
    var customIcon = ctx.body.files.icon;

    // Check if the user uploaded a custom icon
    if (customIcon && customIcon.size > 0 && customIcon.type == 'image/png') {
        // Return the path to the uploaded custom icon
        return customIcon.path;
    }

    // Check if we have a default icon for this host (if so, it should override the web app's favicon)
    var defaultHostIcon = getDefaultHostIconPath(crxConfig);

    // Got one?
    if (defaultHostIcon) {
        // Return it as the icon's path
        return defaultHostIcon;
    }

    // Got page DOM?
    if ($) {
        // Shortcut icon selectors (first ones are the highest quality)
        var selectors = [
            'link[rel="fluid-icon"]',
            'link[rel="apple-touch-icon"]',
            'link[rel="icon"]',
            'link[rel="shortcut icon"]'
        ];

        // The actual href value of one of these selectors
        var linkHref;

        // Traverse selectors, find first one that exists
        for (var i in selectors) {
            // Get element by selector
            var element = $(selectors[i]);

            // Found it?
            if (element.length > 0) {
                // Set linkHref to <link>'s href attribute
                linkHref = element.attr('href');
                break;
            }
        }

        // Got a valid image URL?
        if (linkHref) {
            // Construct a temporary upload path on the server
            var tmpUploadPath = path.join(os.tmpdir(), Math.random().toString() + '.png');

            // Convert relative icon path to absolute
            var absoluteIconUrl = url.resolve(crxConfig.url, linkHref);

            // Resolve succeeded?
            if (absoluteIconUrl) {
                // Download it locally to the tmp path
                yield downloadFile(absoluteIconUrl, tmpUploadPath);
            }

            // Return the path to the downloaded icon
            return tmpUploadPath;
        }
    }

    // Fallback to generic letter icon: grab first char of hostname (hopefully a letter)
    var letter = crxConfig.parsedUrl.hostname.substring(0, 1).toUpperCase();

    // Not an English letter?
    if (!letter.match(/[A-Z]/)) {
        // Use default applicationize icon
        return null;
    }

    // Build path to placeholder letter icon
    return path.join(__dirname, '../../assets/icons/fallback/' + letter + '.png');
}

function getCrxTitle($, crxConfig, ctx) {
    // Specified a custom title for the extension?
    if (ctx.body.title) {
        // Return it (it should override all other title extraction mechanisms)
        return ctx.body.title;
    }

    // No DOM?
    if (!$) {
        // Return current extension title (the web app's hostname)
        return crxConfig.title;
    }

    // Extract extension title from the dom's <title> tag
    var title = $('title').text().trim() || crxConfig.parsedUrl.hostname;

    // Handle custom use-cases per hostname
    switch (crxConfig.host) {
        case 'messenger.com':
            // Fix weird 0x8234 chars in FB messenger <title>
            title = 'Messenger';
            break;
        case 'keep.google.com':
            // Avoid "Sign In - Google Accounts"
            title = 'Google Keep';
            break;
    }

    return title;
}

function getExtraPermissions(ctx) {
    // Extra permissions list
    var permissions = [];
    
    // Notifications
    if (ctx.body.notifications) {
        permissions.push('notifications');
    }

    // Microphone
    if (ctx.body.audioCapture) {
        permissions.push('audioCapture');
    }

    // Webcam
    if (ctx.body.videoCapture) {
        permissions.push('videoCapture');
    }

    // We're good to go
    return permissions;
}

function getCrxFrameColor(ctx) {
    // Extract frame color from input
    var frameColor = ctx.body.frameColor;

    // Didn't specify a custom frame color for the extension?
    if (!frameColor) {
        // Use default frame color
        return null;
    }

    // Make sure it's a valid hex value (Chrome won't accept anything else)
    if (!validator.isHexColor(frameColor)) {
        throw { status: 400, message: 'Please provide a valid hex color value to customize the frame color.' };
    }

    // We're good to go
    return frameColor;
}

function parseUrl(targetUrl) {
    // Parse URL (to retrieve hostname and verify its validity)
    var parsedUrl = url.parse(targetUrl);

    // Parse failed?
    if (!parsedUrl || !parsedUrl.protocol || !parsedUrl.host || parsedUrl.protocol.indexOf('http') == -1) {
        throw { status: 400, message: 'Please provide a valid URL for your extension. (It must start with http(s)://)' };
    }

    // Valid URL
    return parsedUrl;
}

function* getPageDOM(url) {
    // Prepare request (send fake browser user-agent header)
    var req = {
        url: url,
        timeout: 7000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
        }
    };

    // Actually execute the request
    var response = yield requestThunk(req);

    // Load DOM into Cheerio (HTML parser)
    return cheerio.load(response[0].body);
}

function* generateCrx(crxConfig) {
    // Generate pem certificate
    var cert = yield createCertificate({ days: 365 * 10, selfSigned: true });

    // Init new .crx extension with our private key
    var crx = new Extension({ privateKey: cert.clientKey });

    // Tmp crx staging path
    var crxPath = path.join(__dirname, '../../assets/staging');

    // Clear all files from previous staging runs
    fs.removeSync(crxPath);

    // Copy crx files to tmp staging directory
    fs.copySync(path.join(__dirname, '../../assets/crx'), crxPath)

    // Load extension manifest and default icon
    yield crx.load(crxPath);

    // Do we have a local icon to copy over?
    if (crxConfig.icon) {
        // Set target copy path as current extension icon's path
        var copyToPath = crx.path + '/' + crx.manifest.icons['128'];

        // Copy the local file to the current extension's folder, where the icon currently resides
        yield copyLocalFile(crxConfig.icon, copyToPath);
    }

    // Customize the crx's manifest.json file
    customizeManifestFile(crxConfig, crx);

    // Customize the crx's embed.html file
    customizeEmbedFile(crxConfig, crx);

    // Customize the crx's background.js file
    customizeBackgroundScript(crxConfig, crx);

    // Pack the extension into a .crx and return its buffer
    var crxBuffer = yield crx.pack();

    // Return buffer
    return crxBuffer;
}

function getDefaultHostIconPath(crxConfig) {
    // Build path to the default icon for this host
    var iconPath = path.join(__dirname, '../../assets/icons/' + crxConfig.host + '.png');

    try {
        // Check if icon exists
        fs.accessSync(iconPath, fs.F_OK);
    }
    catch (err) {
        // No such file
        return null;
    }

    // File exists
    return iconPath;
}

function customizeManifestFile(crxConfig, crx) {
    // Build path to manifest.json
    var manifestPath = crx.path + '/manifest.json';

    // Read its contents (JSON)
    var json = fs.readFileSync(manifestPath, 'utf8');

    // Parse manifest.json
    var manifest = JSON.parse(json);

    // Set extension title to page title or custom title
    manifest.name = crxConfig.title;

    // Any custom permissions?
    if (crxConfig.permissions) {
        manifest.permissions = manifest.permissions.concat(crxConfig.permissions);
    }

    // Convert back to json string
    json = JSON.stringify(manifest);

    // Overwrite the manifest file with the new json
    fs.writeFileSync(manifestPath, json);
}

function customizeEmbedFile(crxConfig, crx) {
    // Build path to embed.html
    var embedPath = crx.path + '/' + crx.manifest.app.background.pages[0];

    // Read its contents
    var html = fs.readFileSync(embedPath, 'utf8');

    // Load DOM into Cheerio (HTML parser)
    var $ = cheerio.load(html);

    // Set page title to crx title
    $('title').text(crxConfig.title);

    // Set webview source to applicationized URL
    $('webview').attr('src', crxConfig.url);

    // Convert back to html string
    html = $.html();

    // Overwrite the embed file with the new html
    fs.writeFileSync(embedPath, html);
}

function customizeBackgroundScript(crxConfig, crx) {
    // Config object to inject into background.js
    var appConfig = {
        // App hostname to load in webview
        hostname: crxConfig.hostname,
        // Pass in a custom user agent
        userAgent: crxConfig.userAgent,
        // Custom behavior params
        behavior: {
            // Whether to open external links in Chrome or in a new Applicationize window
            internalLinks: crxConfig.internalLinks
        },
        // Default params for `chrome.app.window.create` in `background.js`
        chromeAppWindow: {
            id: 'embed',
            frame: {
                type: 'chrome'
            },
            innerBounds: {
                'width': 1180,
                'height': 900
            }
        }
    };

    // User picked a custom frame color?
    if (crxConfig.frameColor) {
        // Insert it into the chrome app window params
        appConfig.chromeAppWindow.frame.color = crxConfig.frameColor;
    }

    // Build path to background.js
    var scriptPath = crx.path + '/' + crx.manifest.app.background.scripts[0];

    // Read its contents
    var js = fs.readFileSync(scriptPath, 'utf8');

    // Inject chrome app window params into background.js file (replace {inject-background-script-config} with stringified JSON)
    js = js.replace(/{inject-background-script-config}/, JSON.stringify(appConfig));

    // Overwrite the background script with the modified contents
    fs.writeFileSync(scriptPath, js);
}

function sendCrx(request, crxConfig, crxBuffer) {
    // Set content-type to .crx extension mime type
    request.set('content-type', 'application/octet-stream');

    // Set extension filename
    request.set('content-disposition', 'attachment; filename=' + crxConfig.filename);

    // Set the request body to the .crx file buffer
    request.body = crxBuffer;
}

function downloadFile(url, filePath) {
    // Promisify the request
    return new Promise(function (resolve, reject) {
        try {
            // Create write stream
            var stream = fs.createWriteStream(filePath);

            // Wait for finish event
            stream.on('finish', function () {
                // Resolve the promise
                return resolve(true);
            });

            // Pipe the request to a file
            return request(url).pipe(stream);
        } catch (e) {
            // Failed
            return reject(e);
        }
    });
}

function copyLocalFile(from, to) {
    // Promisify the request
    return new Promise(function (resolve, reject) {
        try {
            // Create write stream
            var writeStream = fs.createWriteStream(to);

            // Wait for finish event
            writeStream.on('finish', function () {
                // Resolve the promise
                return resolve(true);
            });

            // Pipe the "from" stream into the "to" stream
            fs.createReadStream(from).pipe(writeStream);
        } catch (e) {
            // Failed
            return reject(e);
        }
    });
}
