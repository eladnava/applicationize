var koa = require('koa');
var http = require('http');
var serve = require('koa-static');
var bodyParser = require('koa-bodyparser');

// Koa middleware
var router = require('./api/router');
var error = require('./api/lib/middleware/error');

// Create koa app
var app = koa();

// Koa middleware
app.use(error());
app.use(bodyParser());
app.use(serve('./frontend/dist'));

// Define routes
router(app);

// Define configurable port
var port = process.env.PORT || 4000;

// Listen for connections
app.listen(port);

// Log port
console.log('Server listening on http://localhost:' + port);
