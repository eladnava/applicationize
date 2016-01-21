Applicationize
===================
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/eladnava/applicationize?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Applicationize your favorite web apps by wrapping them inside a Chrome extension that runs standalone like a native desktop app.

<a href="http://applicationize.com/" target="_blank">http://applicationize.com/</a>

Demo
---

Here's a screenshot of Facebook Messenger (https://www.messenger.com/) running as an applicationized desktop app:

<img src="https://raw.github.com/eladnava/applicationize/master/frontend/src/assets/images/demo.jpg" width="512" />

How to Use
---
1. Go to <a href="http://applicationize.com/" target="_blank">http://applicationize.com/</a>.
2. Enter a URL to any web app, such as https://web.whatsapp.com/.
3. Press `Enter` and download the generated Chrome extension.
4. Open a new tab and navigate to chrome://extensions/
5. Drag the downloaded `.crx` file from its download folder to the extensions page and install it. Don't drag it from within Chrome, it may not work as expected. 

Need help with installing the `.crx`? Check out this [informative guide](http://www.simplehelp.net/2012/08/19/how-to-install-extensions-that-arent-from-the-chrome-web-store/).

That's it! Access the applicationized web app via the **Chrome App Launcher**. If you're on Mac, drag it from the **Launchpad** to your dock to create a shortcut to it!

Running Locally
---

Run the following commands in the root directory of this project:

```shell
$ npm install
$ npm start
```

License
---
Apache 2.0
