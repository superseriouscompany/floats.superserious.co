'use strict';

const auth   = require('../services/auth');
const panic  = require('../services/panic');
const models = {
  friend_requests: require('../models/friend_requests')
};

module.exports = function(app) {
  app.post('/friend_requests', auth, create);
  app.put('/friend_requests/:id', auth, approve);
  app.delete('/friend_requests/:id', auth, reject);
  app.get('/friend_requests', auth, all);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }

  if( !req.body.id ) { return res.status(400).json({debug: '`id` is not present in json'}); }

  return models.friend_requests.create(req.user, req.body.id).then(() => {
    return res.sendStatus(201)
  })
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({friend_requests: panic.friendRequests}); }

  next('not implemented');
}

function approve(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  next('not implemented');
}

function undo(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204) }
}

function reject(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  next('not implemented');
}
