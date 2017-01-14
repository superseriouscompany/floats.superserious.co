'use strict';

const auth    = require('../services/auth');
const panic   = require('../services/panic');
const log     = require('../services/log');
const notify  = require('../services/notify');
const floats  = require('../storage/floats');
const users   = require('../storage/users');
const friends = require('../storage/friends');

module.exports = function(app) {
  app.post('/floats', auth, create);
  app.get('/floats/mine', auth, mine);
  app.get('/floats', auth, all);
  app.delete('/floats/:id', auth, destroy);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }

  if( !req.body.user_ids ) {
    return res.status(400).json({dev_message: 'You must provide an array of `user_ids` in the request body.'})
  }

  let user, recipients;
  users.get(req.userId).then(function(u) {
    user = u;
    return friends.all(req.userId)
  }).then(function(friends) {
    recipients = friends.filter(function(f) {
      return req.body.user_ids.indexOf(f.id) !== -1;
    });
    return floats.create({
      user_id: req.body.userId,
      title: req.body.title,
      invitees: recipients.map(function(r) { return r.id }),
    })
  }).then(function(float) {
    const promises = recipients.map(function(r) {
      return notify.firebase(r.firebase_token, `${user.name} floated "${req.body.title}"`);
    })

    return Promise.all(promises).then(function() {
      return res.status(201).json({
        id: float.id
      })
    })
  }).catch(next);
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({floats: panic.floats}); }
}

function mine(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({floats: panic.myFloats}); }
}

function destroy(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
}
