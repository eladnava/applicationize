// Dependencies
var route = require('koa-route');

// Route definitions
module.exports = function router(app)
{
  // Define route to file mapping
  app.use(route.post('/generate', require('./routes/generate')));
};