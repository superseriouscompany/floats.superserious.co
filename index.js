'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const bunyan     = require('bunyan');
const uuid       = require('uuid');
const fb         = require('./services/facebook');

const log        = bunyan.createLogger({ name: 'bubbles' });
const app        = express();

app.use(bodyParser.json());

const port    = process.env.PORT || 3000;

let users    = {},
    sessions = {};

app.get('/', function(req, res) {
  res.json({cool: 'nice'});
})

app.post('/users', function(req, res, next) {
  if( !req.body.facebook_access_token ) {
    return res.status(403).json({error: 'Please provide `facebook_access_token` in json body'});
  }

  return fb.me(req.body.facebook_access_token).then(function(user) {
    if( users[user.id] ) {
      return res.json({access_token: users[user.id].access_token});
    }

    const accessToken = uuid.v1();
    users[user.id] = Object.assign(user, {access_token: accessToken});
    sessions[accessToken] = users[user.id];
    return res.status(201).json({access_token: accessToken});
  }).catch(next);
})

app.patch('/users/me', auth, function(req, res, next) {
  res.sendStatus(204);
})

app.use(function(err, req, res, next) {
  log.error({err: err}, 'Uncaught server error');
  res.status(500).json({message: 'Something went wrong.'});
})

app.listen(port, function(err) {
  if( err ) { throw err; }
  log.info(`Listening on ${port}`);
})

function auth(req, res, next) {
  const token = req.get('X-Access-Token');

  console.log("checking token", token, Object.keys(sessions));

  if( !token || !sessions[token] ) {
    return res.status(401).json({error: "Invalid Access Token", token: token});
  }

  next();
}
