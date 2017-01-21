'use strict';

const auth     = require('../services/auth');
const log      = require('../services/log');
const db = {
  messages: require('../storage/messages'),
}

let wss;

module.exports = function(app, webSocketServer) {
  wss = webSocketServer;
  app.post('/floats/:floatId/convos/:convoId/messages', auth, create);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
  return db.messages.create(
    req.params.floatId,
    req.params.convoId,
    req.userId,
    req.body.text
  ).then(function(m) {
    res.status(201).json(m);
  }).catch(next);
}
