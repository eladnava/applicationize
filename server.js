// Dependencies
var http        = require('http')
  , koa         = require('koa')
  , serve       = require('koa-static')
  , bodyParser  = require('koa-bodyparser');

// Custom Koa middleware
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
console.log('Server listening on port ' + port);
