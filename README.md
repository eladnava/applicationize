# Applicationize
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/eladnava/applicationize?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Applicationize convert your favorite web apps into desktop apps with their own dedicated launcher icon. 

It generates a Google Chrome extension that embeds your favorite [SPA](https://en.wikipedia.org/wiki/Single-page_application) web app and places a custom shortcut icon in your app launcher when you install it.

<a href="https://applicationize.me/" target="_blank">https://applicationize.me/</a>

## Demo

Here's a screenshot of Facebook Messenger (https://www.messenger.com/) running as an applicationized desktop app:

<br />
<img src="https://raw.github.com/eladnava/applicationize/master/public/img/preview.png" width="512" />

## How to Use

1. Go to https://applicationize.me/now
2. Enter a URL to any web app, such as https://web.whatsapp.com/
3. Press `Enter` and download the generated Chrome extension
4. Open a new tab and navigate to `chrome://extensions/`
5. Drag the downloaded `.crx` file from its download folder to the extensions page to install it

That's it! Your applicationized web app is now available via your app launcher. We recommend pinning it to your application dock or system taskbar!

## Contributing

* If you find a bug or wish to make some kind of change, please create an issue first
* Make sure your code conventions are in-line with the project's code style
* Make your commits and PRs as tiny as possible - one feature or bugfix at a time
* Write detailed commit messages, in-line with the project's commit naming conventions

### Running the Server

Run the following commands in the root directory of this project:

```shell
npm install
npm start
```

Then, visit [http://localhost:3000/](http://localhost:3000/) to browse to your local instance of Applicationize.

## License

Apache 2.0
