'use strict';

const auth    = require('../services/auth');
const panic   = require('../services/panic');
const log     = require('../services/log');
const notify  = require('../services/notify');
const error   = require('../services/error');
const models = {
  floats: require('../models/floats'),
}
const db = {
  floats:  require('../db/floats'),
  users:   require('../db/users'),
  convos:  require('../db/convos'),
}
const _       = require('lodash');

module.exports = function(app) {
  app.post('/floats', auth, create);
  app.get('/floats/mine', auth, mine);
  app.get('/floats', auth, all);
  app.delete('/floats/:id/leave', auth, leave);
  app.delete('/floats/:id', auth, destroy);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }

  if( !req.body.invitees || !req.body.invitees.length ) {
    return res.status(400).json({debug: '`invitees` array must contain at least one user id'});
  }
  if( req.body.invitees.length > 100 ) {
    return res.status(400).json({message: 'You have tried to invite too many people. You can invite 100 people at most.'})
  }
  if( !req.body.title || req.body.title.trim().length < 3 ) {
    return res.status(400).json({message: 'Your title must contain at least one word.'});
  }
  if( req.body.title.trim().length > 140 ) {
    return res.status(400).json({message: 'Your title is too long. It can only contain 140 characters.'});
  }

  return models.floats.create(req.user, req.body.title, req.body.invitees).then((x) => {
    const promises = x.recipients.map(function(r) {
      return notify.firebase(r.firebase_token, `${req.user.name} floated "${req.body.title}"`);
    })

    return Promise.all(promises).then(function() {
      return res.status(201).json(x.float);
    })
  }).catch(function(err) {
    if( err.name == 'InvalidFriends' ) {
      const badIds = err.ids && err.ids.length && err.ids.join(',');
      return res.status(400).json({debug: `These are not your friends: [${badIds}]`});
    }
    next(err);
  });
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({floats: panic.floats}); }

  db.floats.findByInvitee(req.userId).then(function(floats) {
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

  db.floats.findByCreator(req.userId).then(function(floats) {
    floats = floats.map(function(f) {
      return _.pick(f, 'id', 'title', 'user', 'created_at', 'attendees', 'invitees');
    })
    return res.json({floats: floats});
  }).catch(next);
}

function leave(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  let float;

  return db.floats.get(req.params.id).then(function(f) {
    float = f
    return db.floats.leave(req.params.id, req.userId);
  }).then(function() {
    return db.convos.leaveAll(float.id, req.userId);
  }).then(function() {
    res.sendStatus(204);
  }).catch(next);
}

function destroy(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  let float;
  return db.floats.get(req.params.id).then(function(f) {
    if( !f ) { throw error('This float was deleted.', {name: 'NotFound'}); }
    if( f.user_id != req.userId ) { throw error('Permission denied.', {name: 'Unauthorized', userId: req.userId, floatId: f.id}); }
    float = f;
    return db.floats.destroy(f.id)
  }).then(function() {
    return db.convos.destroyByFloatId(float.id);
  }).then(function() {
    res.sendStatus(204);
  }).catch(function(err) {
    if( err.name == 'NotFound' ) {
      return res.status(400).json({message: err.message, debug: 'Float not found', id: req.params.id})
    }
    if( err.name == 'Unauthorized' ) {
      return res.status(403).json({message: err.message, debug: 'Creator id does not match authenticated user', floatId: err.floatId, userId: req.userId});
    }
    next(err);
  })
}
