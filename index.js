'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const fb         = require('./services/facebook');
const auth       = require('./services/auth');
const log        = require('./services/log');
const app        = express();

app.use(bodyParser.json());

const port      = process.env.PORT || 3000;
const panicMode = process.env.PANIC_MODE || false;

// healthcheck
app.get('/', function(req, res) { res.json({cool: 'nice'}); })

// app routes
require('./controllers/users')(app);
require('./controllers/pins')(app);
require('./controllers/friends')(app);
require('./controllers/floats')(app);

app.use(function(err, req, res, next) {
  log.error({err: err, message: err.message, errName: err.name, stack: err.stack}, 'Uncaught server error');
  res.status(500).json({message: 'Something went wrong.'});
})

const server = express();
server.get('/', function(req, res) { res.redirect('/v1'); })
server.use('/v1', app);

server.listen(port, function(err) {
  if( err ) { throw err; }
  log.info(`Listening on ${port}`);
})
