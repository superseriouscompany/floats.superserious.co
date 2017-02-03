'use strict';

const auth   = require('../services/auth');
const panic  = require('../services/panic');
const models = {
  friend_requests: require('../models/friend_requests'),
  friends: require('../models/friends'),
};

module.exports = function(app) {
  app.post('/friend_requests/:id', auth, create);
  app.put('/friend_requests/:id', auth, approve);
  app.delete('/friend_requests/:id', auth, deny);
  app.get('/friend_requests', auth, all);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }

  return models.friend_requests.create(req.user, req.params.id).then(() => {
    return res.sendStatus(201)
  }).catch(next);
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({friend_requests: panic.friendRequests}); }

  return models.friend_requests.all(req.userId).then((requests) => {
    return res.json({
      friend_requests: requests
    })
  }).catch(next);
}

function deny(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return models.friend_requests.deny(req.userId, req.params.id).then(() => {
    return res.sendStatus(204);
  }).catch(next);
}

function approve(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return models.friend_requests.accept(req.userId, req.params.id).then(() => {
    return res.sendStatus(204);
  }).catch(next);
}

function undo(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204) }

  return next(new Error('not implemented'))
}
