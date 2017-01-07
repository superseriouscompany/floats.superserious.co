'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const bunyan     = require('bunyan');

const log        = bunyan.createLogger({ name: 'bubbles' });
const app        = express();

app.use(bodyParser.json());

const port    = process.env.PORT || 3000;

app.get('/', function(req, res) {
  res.json({cool: 'nice'});
})

app.post('/users', function(req, res) {
  if( !req.body.facebook_access_token ) {
    return res.status(403).json({error: 'Please provide `facebook_access_token` in json body'});
  }

  return res.status(201).json({access_token: 'nice'});
})

app.listen(port, function(err) {
  if( err ) { throw err; }
  log.info(`Listening on ${port}`);
})
