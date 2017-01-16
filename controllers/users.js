'use strict';

const log     = require('../services/log');
const fb      = require('../services/facebook');
const auth    = require('../services/auth');
const error   = require('../services/auth');
const users   = require('../storage/users');
const session = require('../services/session');
const _       = require('lodash');

module.exports = function(app, l) {
  app.post('/users', createUser);
  app.get('/users/me', auth, getUser);
  app.patch('/users/me', auth, updateUser);
  app.delete('/users/me', auth, deleteUser);
}

function createUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({access_token: 'PANICMODE'}) }

  if( !req.body.facebook_access_token ) {
    log.warn('Facebook access token not provided', req.body);
    return res.status(403).json({error: 'Please provide `facebook_access_token` in json body'});
  }

  let fbUser;
  const fields = ['id', 'access_token', 'name', 'avatar_url', 'created_at', 'username'];
  return fb.me(req.body.facebook_access_token).then(function(fu) {
    fbUser = fu;
    return users.findByFacebookId(fbUser.id)
  }).then(function(user) {
    if( user ) {
      return res.status(200).json(_.pick(user, fields));
    }

    return users.createFromFacebook(fbUser).then(function(user) {
      return session.create(user.access_token, user.id).then(function(ok) {
        res.status(201).json(_.pick(user, fields));
      })
    });
  }).catch(next);
}

function getUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({name: 'Nope'}) }

  return users.get(req.userId).then(function(user) {
    if( !user ) { throw error('User not found', {userId: req.userId, name: 'NotFound'}) }
    let json = _.pick(user, 'id', 'name', 'avatar_url', 'created_at', 'username');
    json.hasFirebaseToken = !!user.firebase_token;
    return res.json(json);
  }).catch(next);
}

function updateUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  const fields = _.pick(req.body, 'name', 'username', 'firebase_token');
  users.update(req.userId, fields).then(function() {
    res.sendStatus(204);
  }).catch(next);
}

function deleteUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  next('not implemented');
}
