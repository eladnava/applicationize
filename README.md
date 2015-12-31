Applicationize
===================

Applicationize your favorite websites by wrapping them inside a Chrome extension that runs standalone like a native desktop app.

http://applicationize.com/

How it Works
---
1. Enter a URL to any website, such as https://web.whatsapp.com/.
2. Press Enter and download the generated `.crx` Chrome extension.
3. Open a new tab and navigate to [chrome://extensions/](chrome://extensions/) (copy the link and open it manually).
4. Drag the downloaded `.crx` file from its download folder to the extensions page and install it. Don't drag it from within Chrome, it may not work as expected.

That's it! Access the applicationized website via the **Chrome App Launcher**. If you're on Mac, drag it from the **Launchpad** to your dock to create a shortcut to it!

Run the Server
---

Run the following commands in the root directory of this project.

    npm install
    npm start