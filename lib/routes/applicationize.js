var fs = require('fs');
var url = require('url');
var pem = require('pem');
var path = require('path');
var https = require('https');
var request = require('request');
var cheerio = require('cheerio');
var thunkify = require('thunkify');

// Convert callbacks to thunks
var requestThunk = thunkify(request);
var createCertificate = thunkify(pem.createCertificate);

// CRX packaging module, instantiated with the `new` keyword
var Extension = require('crx');

// POST /generate
module.exports = function* () {
    // Get target URL from input
    var url = this.request.body.url;

    // Build .crx config for the provided URL
    var crxConfig = yield buildCrxConfig(url);

    // Generate the .crx file based on the config
    var crxBuffer = yield generateCrx(crxConfig);

    // Send it to the browser (save to disk)
    yield sendCrx(this, crxConfig, crxBuffer);
};

function* buildCrxConfig(targetUrl) {
    // Parse and validate the input URL (may throw an error)
    var parsedUrl = parseUrl(targetUrl);

    // Prepare crx object with default values
    var crxConfig = {
        url: targetUrl,
        parsedUrl: parsedUrl,
        title: parsedUrl.hostname,
        filename: parsedUrl.hostname + '.crx'
    };

    // Normalize hostname for custom use-cases
    crxConfig.host = parsedUrl.hostname.toLowerCase().replace('www.', '');

    var $;

    // Execute GET request to provided URL
    // May fail for internal URLs, continue anyway
    try {
        $ = yield getPageDOM(crxConfig.url);
    }
    catch (exc) {
        return crxConfig;
    }

    // Extract .crx icon from page's shortcut-icon <link> element
    crxConfig.icon = getCrxIcon($);

    // Get extension title and handle custom cases
    crxConfig.title = getCrxTitle($, crxConfig);

    // Return the extension configuration object
    return crxConfig;
};

function getCrxIcon(dom) {
    // Shortcut icon selectors (first ones are the highest quality)
    var selectors = [
        'link[rel="fluid-icon"]',
        'link[rel="apple-touch-icon"]',
        'link[rel="icon"]',
        'link[rel="shortcut icon"]'
    ];

    // Traverse selectors, find first one that exists
    for (var i in selectors) {
        // Get element by tag + class name
        var element = dom(selectors[i]);

        // Found it?
        if (element.length > 0) {
            // Return <link>'s href attribute
            return element.attr('href');
        }
    }

    // No go, generate a custom icon
    return undefined;
}

function getCrxTitle(dom, crxConfig) {
    // Extract extension title from the dom's <title> tag
    var title = dom('title').text().trim() || crxConfig.parsedUrl.hostname;

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
};

function parseUrl(targetUrl) {
    // Bad input?
    if (!targetUrl) {
        throw new Error('Please provide a URL to continue.');
    }

    // Parse URL (to retrieve hostname and verify its validity)
    var parsedUrl = url.parse(targetUrl);

    // Parse failed?
    if (!parsedUrl || !parsedUrl.protocol || parsedUrl.protocol.indexOf('http') == -1) {
        throw new Error('Please provide a valid URL for your extension. (It must start with http(s)://)');
    }

    return parsedUrl;
};

function* getPageDOM(url) {
    // Prepare request (send fake browser user-agent header)
    var req = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
        }
    };

    // Actually execute the request
    var response = yield requestThunk(req);

    // Load DOM into Cheerio (HTML parser)
    return cheerio.load(response[0].body);
};

function* generateCrx(crxConfig) {
    // Generate pem certificate
    var cert = yield createCertificate({ days: 365 * 10, selfSigned: true });

    // Init new .crx extension with our private key
    var crx = new Extension({ privateKey: cert.clientKey });

    // Load extension manifest and default icon
    yield crx.load(path.join(__dirname, '../assets/crx'));

    // Set extension title to extension URL's <title>
    crx.manifest.name = crxConfig.title;

    // Override extension icon if we prepared one for this host
    yield overrideIconIfExists(crxConfig, crx);

    // Only continue if we haven't overriden the icon
    if (!crxConfig.iconOverriden) {
        // Got a favicon from the host's HTML?
        if (crxConfig.icon) {
            // Download it and overwrite default icon
            yield downloadIcon(crxConfig, crx);
        }
        else {
            // Set a placeholder icon instead (letter)
            yield setPlaceholderIcon(crxConfig, crx);
        }
    }

    // Customize the crx's embed.html file
    yield customizeEmbedFile(crxConfig, crx);

    // Pack the extension into a .crx and return its buffer
    var crxBuffer = yield crx.pack();

    // Return buffer
    return crxBuffer;
};

function* downloadIcon(crxConfig, crx) {
    // Convert relative icon path to absolute
    var absoluteIconUrl = url.resolve(crxConfig.url, crxConfig.icon);

    // Resolve succeeded?
    if (absoluteIconUrl) {
        // Set download path as current extension icon's path
        var downloadPath = crx.path + '/' + crx.manifest.icons['128'];

        // Download it
        yield downloadFile(absoluteIconUrl, downloadPath);
    }
};

function* overrideIconIfExists(crxConfig, crx) {
    // Build path to override icon
    var iconPath = path.join(__dirname, '../assets/icons/' + crxConfig.host + '.png');

    try {
        // Check if icon exists
        fs.accessSync(iconPath, fs.F_OK);
    }
    catch (err) {
        // No such file
        return;
    }

    // Set target copy path as current extension icon's path
    var copyToPath = crx.path + '/' + crx.manifest.icons['128'];

    // Copy the local file and override extension's default icon
    yield copyLocalFile(iconPath, copyToPath);

    // Avoid downloading the original favicon or setting a placeholder one
    crxConfig.iconOverriden = true;
};

function* customizeEmbedFile(crxConfig, crx) {
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
};

function* setPlaceholderIcon(crxConfig, crx) {
    // Grab first char (hopefully a letter)
    var letter = crxConfig.parsedUrl.hostname.substring(0, 1).toUpperCase();

    // Not an English letter?
    if (!letter.match(/[A-Z]/)) {
        return;
    }

    // Build path to placeholder letter icon
    var copyFromPath = path.join(__dirname, '../assets/icons/fallback/' + letter + '.png');

    // Set target copy path as current extension icon's path
    var copyToPath = crx.path + '/' + crx.manifest.icons['128'];

    // Copy the local file and override extension's default icon
    yield copyLocalFile(copyFromPath, copyToPath);
};

function* sendCrx(request, crxConfig, crxBuffer) {
    // Set content-type to .crx extension mime type
    request.set('content-type', 'application/x-chrome-extension');

    // Set extension filename
    request.set('content-disposition', 'attachment; filename=' + crxConfig.filename);

    // Set the request body to the .crx file buffer
    request.body = crxBuffer;
};

function downloadFile(url, filePath) {
    // Promisify the request
    return new Promise(function(resolve, reject) {
        try {
            // Create write stream
            var stream = fs.createWriteStream(filePath);

            // Wait for finish event
            stream.on('finish', function() {
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
};

function copyLocalFile(from, to) {
    // Promisify the request
    return new Promise(function(resolve, reject) {
        try {
            // Create write stream
            var writeStream = fs.createWriteStream(to);

            // Wait for finish event
            writeStream.on('finish', function() {
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
};