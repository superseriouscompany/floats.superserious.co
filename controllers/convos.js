'use strict';

const auth   = require('../services/auth');
const convos = require('../storage/convos');
const log    = require('../services/log');

let wss;

module.exports = function(app, webSocketServer) {
  wss = webSocketServer;
  app.post('/floats/:floatId/convos', auth, create);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }

  convos.create(req.params.floatId, req.userId, req.body.members).then(function(convo) {
    return res.status(201).json(convo);
  }).catch(next);
}
