'use strict';

if( process.env.NODE_ENV != 'production' && module.parent ) {
  global.TEST_MODE   = true;
  global.facebookUrl = 'http://localhost:4201';
  global.firebaseUrl = 'http://localhost:4202';
}

const express    = require('express');
const bodyParser = require('body-parser');
const log        = require('./services/log');
const socket     = require('./services/socket');
const api        = express();
const app        = express();

api.use(bodyParser.json());

// disable 304s
api.disable('etag');

// healthcheck
api.get('/', function(req, res) { res.json({cool: 'nice'}); });
api.get('/kill/:platform/:version', function(req, res) { return res.sendStatus(404); });

// api routes
const normalizedPath = require("path").join(__dirname, "controllers");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./controllers/" + file)(api);
});

api.use(function(err, req, res, next) {
  log.error({err: err, message: err.message, errName: err.name, stack: err.stack}, 'Uncaught server error');
  res.status(500).json({message: 'Something went wrong.'});
})

app.get('/', function(req, res) { res.redirect('/v1'); })
app.use('/v1', api);

const server = socket.bind(app);
if( process.env.NODE_ENV != 'production' && module.parent ) {
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
