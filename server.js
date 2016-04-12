var koa = require('koa');
var route = require('koa-route');
var static = require('koa-static');
var bodyParser = require('koa-bodyparser');

// Koa middleware
var https = require('./lib/middleware/https');
var error = require('./lib/middleware/error');

// Create koa app
var app = koa();

// Koa middleware
app.use(error());
app.use(https());
app.use(bodyParser());
app.use(static('./public'));

// HTML file aliases
app.use(route.get('/now', require('./lib/routes/now')));

// API routes
app.use(route.post('/applicationize', require('./lib/routes/applicationize')));

// Define configurable port
var port = process.env.PORT || 3000;

// Listen for connections
app.listen(port);

// Log port
console.log('Server listening on port ' + port);