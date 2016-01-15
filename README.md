Applicationize
===================
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/eladnava/applicationize?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![Join the chat at https://gitter.im/eladnava/applicationize](https://badges.gitter.im/eladnava/applicationize.svg)](https://gitter.im/eladnava/applicationize?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Applicationize your favorite web apps by wrapping them inside a Chrome extension that runs standalone like a native desktop app.

http://applicationize.com/

Demo
---
<img src="https://raw.github.com/eladnava/applicationize/master/frontend/src/assets/images/preview.png" />

How it Works
---
1. Enter a URL to any web app, such as https://web.whatsapp.com/.
2. Press Enter and download the generated `.crx` Chrome extension.
3. Open a new tab and navigate to chrome://extensions/
4. Drag the downloaded `.crx` file from its download folder to the extensions page and install it. Don't drag it from within Chrome, it may not work as expected. More on installing `.crx` files manually [here](http://www.simplehelp.net/2012/08/19/how-to-install-extensions-that-arent-from-the-chrome-web-store/).

That's it! Access the applicationized web app via the **Chrome App Launcher**. If you're on Mac, drag it from the **Launchpad** to your dock to create a shortcut to it!

Run the Server
---

Run the following commands in the root directory of this project.

    npm install
    npm start
