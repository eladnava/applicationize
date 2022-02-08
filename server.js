var fs = require('fs');
var koa = require('koa');
var http = require('http');
var https = require('https');
var route = require('koa-route');
var static = require('koa-static');
var body = require('koa-better-body');

// Koa middleware
var error = require('./lib/middleware/error');
var redirect = require('./lib/middleware/redirect');

// Create koa app
var app = koa();

// Koa middleware
app.use(error());
app.use(body());
app.use(redirect());
app.use(static('./public'));

// HTML file aliases
app.use(route.get('/now', require('./lib/routes/now')));

// API routes
app.use(route.post('/applicationize', require('./lib/routes/applicationize')));

// Define configurable port
var port = process.env.PORT || 8080;
var securePort = process.env.SECURE_PORT || 8443;

// Listen for connections
http.createServer(app.callback()).listen(port);

// HTTPS support
https.createServer({
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
}, app.callback()).listen(securePort);

// Log port
console.log('Server listening on port ' + port);