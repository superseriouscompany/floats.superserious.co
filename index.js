'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const fb         = require('./services/facebook');
const auth       = require('./services/auth');
const log        = require('./services/log');
const socket     = require('./services/socket');
const app        = express();

app.use(bodyParser.json());

// disable 304s
app.disable('etag');

// healthcheck
app.get('/', function(req, res) { res.json({cool: 'nice'}); })

// app routes
const normalizedPath = require("path").join(__dirname, "controllers");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./controllers/" + file)(app);
});

app.use(function(err, req, res, next) {
  log.error({err: err, message: err.message, errName: err.name, stack: err.stack}, 'Uncaught server error');
  res.status(500).json({message: 'Something went wrong.'});
})

const wrapper = express();
wrapper.get('/', function(req, res) { res.redirect('/v1'); })
wrapper.use('/v1', app);

const server = socket(wrapper);
if( module.parent ) {
  module.exports = function(port) {
    const ref    = server.listen(port);
    const handle = ref.close.bind(ref);
    return handle;
  }
  return;
}

const port = process.env.PORT || 3000
server.listen(port, function(err) {
  if( err ) { throw err; }
  log.info(`Listening on ${port}`);
});
