'use strict';

const fb      = require('../services/facebook');
const auth    = require('../services/auth');
const db      = require('../storage/users');
const session = require('../services/session');
const _       = require('lodash');

module.exports = function(app, l) {
  app.post('/users', createUser);
  app.patch('/users/me', auth, updateUser);
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
    return db.findByFacebookId(fbUser.id)
  }).then(function(user) {
    if( user ) {
      return res.status(200).json(_.pick(user, fields));
    }

    return db.createFromFacebook(fbUser).then(function(user) {
      return session.create(user.access_token, user.id).then(function(ok) {
        res.status(201).json(_.pick(user, fields));
      })
    });
  }).catch(next);
}

function updateUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
  res.sendStatus(204);
}
