'use strict';

const auth    = require('../services/auth');
const panic   = require('../services/panic');
const log     = require('../services/log');
const notify  = require('../services/notify');
const floats  = require('../storage/floats');
const users   = require('../storage/users');
const friends = require('../storage/friends');
const _       = require('lodash');

module.exports = function(app) {
  app.post('/floats', auth, create);
  app.get('/floats/mine', auth, mine);
  app.get('/floats', auth, all);
  app.post('/floats/:id/join', auth, join);
  app.delete('/floats/:id', auth, destroy);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }

  if( !req.body.invitees ) {
    return res.status(400).json({dev_message: 'You must provide an array of `invitees` in the request body.'})
  }

  let user, recipients;
  users.get(req.userId).then(function(u) {
    user = u;
    return friends.all(req.userId)
  }).then(function(friends) {
    recipients = friends.filter(function(f) {
      return req.body.invitees.indexOf(f.id) !== -1;
    });
    return floats.create({
      user_id: req.body.userId,
      title: req.body.title,
      invitees: recipients.map(function(r) { return r.id }),
      user: _.pick(user, 'id', 'name', 'username', 'avatar_url'),
    })
  }).then(function(float) {
    const stubUrl = process.env.NODE_ENV != 'production' && req.get('X-Stub-Url');
    const promises = recipients.map(function(r) {
      return notify.firebase(r.firebase_token, `${user.name} floated "${req.body.title}"`, stubUrl);
    })

    return Promise.all(promises).then(function() {
      return res.status(201).json(float);
    })
  }).catch(next);
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({floats: panic.floats}); }

  floats.findByInvitee(req.userId).then(function(floats) {
    floats = floats.map(function(f) {
      let ret = _.pick(f, 'id', 'title', 'user', 'created_at');
      ret.attending = !!f.attendees.find(function(u) {
        return u.id == req.userId
      })
      return ret;
    })
    return res.json({floats: floats});
  }).catch(next);
}

function mine(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({floats: panic.myFloats}); }

  floats.findByCreator(req.userId).then(function(floats) {
    floats = floats.map(function(f) {
      return _.pick(f, 'id', 'title', 'user', 'created_at', 'attendees');
    })
    return res.json({floats: floats});
  }).catch(next);
}

function join(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  floats.join(req.params.id, req.userId).then(function() {
    res.sendStatus(204);
  })
}

function destroy(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
}
