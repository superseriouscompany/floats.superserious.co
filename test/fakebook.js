'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const request    = require('request');
const shortid    = require('shortid');
const _          = require('lodash');
const app        = express();

let users = {};
let seq   = +new Date;

app.use(bodyParser.json());

app.post('/users', function(req, res) {
  const id          = seq++;
  const accessToken = `FAKEBOOK${id}`;

  users[accessToken] = Object.assign(req.body, {id: String(id)});
  res.json({
    access_token: accessToken,
    id: id,
  })
})

app.use(function(req, res, next) {
  if( !req.query.access_token || !req.query.access_token.match(/^FAKEBOOK/) ) {
    console.warn("Proxying request to facebook");
    const url = `https://graph.facebook.com${req.url}`;
    return req.pipe(request(url)).pipe(res);
  }

  next();
})

app.post('/friends/:id', function(req, res) {
  const user = users[req.query.access_token];
  user.friends = user.friends || [];
  user.friends.push({id: req.params.id})

  for( var i in users ) {
    if( users[i].id == req.params.id ) {
      users[i].friends = users[i].friends || [];
      users[i].friends.push({id: user.id})
      break;
    }
  }

  res.sendStatus(204);
})

app.get('/me', function(req, res) {
  const user = users[req.query.access_token];

  if( !user ) {
    return res.status(400).json({
      error: {
        message: "Invalid OAuth access token.",
        type: "OAuthException",
        code: 190,
        fbtrace_id: "fakebook"
      }
    });
  }

  res.json(user);
})

app.get('/me/friends', function(req, res) {
  const user = users[req.query.access_token];

  res.json({
    data: user.friends || []
  })
})

module.exports = function(port) {
  const server = app.listen(port);
  let handle   = server.close.bind(server);
  return handle;
}
