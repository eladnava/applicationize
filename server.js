var koa = require('koa');
var http = require('http');
var route = require('koa-route');
var serve = require('koa-static');
var bodyParser = require('koa-bodyparser');

// Koa middleware
var error = require('./api/middleware/error');

// Create koa app
var app = koa();

// Koa middleware
app.use(error());
app.use(bodyParser());
app.use(serve('./frontend/dist'));

// API routes
app.use(route.post('/generate', require('./api/routes/generate')));

// Define configurable port
var port = process.env.PORT || 3000;

// Listen for connections
app.listen(port);

// Log port
console.log('Server listening on port ' + port);
