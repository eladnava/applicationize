var send = require('koa-send');

// GET /now
module.exports = function* () {
    // Send HTML file
    yield send(this, './public/now.html');
}