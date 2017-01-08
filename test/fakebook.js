'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const request    = require('request');
const app        = express();

app.use(function(req, res) {
  if( !req.query.access_token || !req.query.access_token.match(/^FAKEBOOK/) ) {
    const url = `https://graph.facebook.com${req.url}`;
    return req.pipe(request(url)).pipe(res);
  }
})

app.use(bodyParser.json());

module.exports = function(port) {
  const server = app.listen(port);
  let handle   = server.close.bind(server);
  return handle;
}
