'use strict';

const _      = require('lodash');
const auth   = require('../services/auth');
const log    = require('../services/log');
const panic  = require('../services/panic');
const db = {
  users:  require('../db/users'),
  convos: require('../db/convos'),
}

let wss;

module.exports = function(app, webSocketServer) {
  wss = webSocketServer;
  app.delete('/floats/:floatId/convos/:id', auth, destroy);
  app.delete('/floats/:floatId/convos/:id/membership', auth, leave);
  app.get('/convos', auth, all);
}

function destroy(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return Promise.resolve().then(function() {
    return db.convos.destroy(req.params.floatId, req.params.id);
  }).then(function() {
    return res.sendStatus(204);
  }).catch(next);
}

function leave(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return Promise.resolve().then(function() {
    return db.convos.leave(req.params.floatId, req.params.id, req.userId);
  }).then(function() {
    return res.sendStatus(204);
  }).catch(next);
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(200).json({convos: panic.convos}); }

  return db.convos.findByMemberId(req.userId).then(function(convos) {
    convos = convos.map(function(convo) {
      return convo;
    })
    return res.status(200).json({convos: convos});
  }).catch(next);
}
