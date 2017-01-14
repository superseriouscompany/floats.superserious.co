'use strict';

const fb   = require('../services/facebook');
const auth = require('../services/auth');
const db   = require('../storage/users');

let log;
module.exports = function(app, l) {
  log = l;
  app.post('/users', createUser);
  app.patch('/users/me', auth, updateUser);
}

function createUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({access_token: 'PANICMODE'}) }

  if( !req.body.facebook_access_token ) {
    return res.status(403).json({error: 'Please provide `facebook_access_token` in json body'});
  }

  let fbUser;
  return fb.me(req.body.facebook_access_token).then(function(fu) {
    fbUser = fu;
    return db.findByFacebookId(fbUser.id)
  }).then(function(user) {
    if( user ) {
      return res.status(200).json({access_token: user.access_token, id: user.id});
    }

    return db.createFromFacebook(fbUser).then(function(user) {
      res.status(201).json({access_token: user.access_token, id: user.id});
    });
  }).catch(next);
}

function updateUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
  res.sendStatus(204);
}
