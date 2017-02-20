'use strict';

const auth    = require('../services/auth');
const panic   = require('../services/panic');
const session = require('../services/session');

const models = {
  friends: require('../models/friends'),
  users:   require('../models/users'),
}
const db = {
  floats:          require('../db/floats'),
  friend_requests: require('../db/friend_requests'),
}

module.exports = function(app) {
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

  return models.users.createFromFacebook(req.body.facebook_access_token).then((user) => {
    const status = user.metadata && user.metadata.existed ? 200 : 201;
    return res.status(status).json(user);
  }).catch(next)
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
