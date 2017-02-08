'use strict';

const log     = require('../services/log');
const fb      = require('../services/facebook');
const auth    = require('../services/auth');
const error   = require('../services/auth');
const users   = require('../db/users');
const session = require('../services/session');
const panic   = require('../services/panic');
const _       = require('lodash');

const models = {
  friends: require('../models/friends'),
  users:   require('../models/users'),
}
const db = {
  floats:          require('../db/floats'),
  friend_requests: require('../db/friend_requests'),
}

module.exports = function(app, l) {
  app.post('/users', createUser);
  app.get('/users/me', auth, getUser);
  app.patch('/users/me', auth, updateUser);
  app.delete('/users/me', auth, deleteUser);
}

function createUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({access_token: 'PANICMODE'}) }

  if( !req.body.facebook_access_token ) {
    return res.status(403).json({error: 'Please provide `facebook_access_token` in json body'});
  }

  let fbUser;
  const fields = ['id', 'access_token', 'name', 'avatar_url', 'created_at', 'username'];
  return fb.me(req.body.facebook_access_token).then(function(fu) {
    fbUser = fu;
    return users.findByFacebookId(fbUser.id)
  }).then(function(user) {
    return res.status(200).json(_.pick(user, fields));
  }).catch(function(err) {
    if( err.name == 'UserNotFound' ) {
      return users.createFromFacebook(fbUser).then(function(user) {
        return session.create(user.access_token, user.id).then(function(ok) {
          res.status(201).json(_.pick(user, fields));
        })
      });
    }

    next(err);
  }).catch(next);
}

function getUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json(panic.user) }

  return models.users.get(req.userId, 'limited').then((user) => {
    res.json(user)
  }).catch(next);
}

function updateUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return models.users.update(req.userId, req.body).then(() => {
    res.sendStatus(204)
  }).catch(next);
}

function deleteUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return models.users.destroy(req.userId).then(() => {
    res.sendStatus(204);
    return session.destroy(req.user.access_token);
  }).catch(next);
}
