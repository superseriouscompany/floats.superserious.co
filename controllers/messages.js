'use strict';

const auth     = require('../services/auth');
const messages = require('../storage/messages');
const log      = require('../services/log');

let wss;

module.exports = function(app, webSocketServer) {
  wss = webSocketServer;
  app.post('/floats/:floatId/convos/:convoId/messages', auth, create);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
  messages.create(req.params.floatId, req.params.convoId, req.userId, req.body.text).then(function(m) {
    wss.clients.forEach(function(c) {
      if( c.readyState !== require('ws').OPEN ) {
        return log.warn('Client not in readyState', {client: c});
      }
      console.log("Broadcasting one message");
      c.send(JSON.stringify(m));
    })
  }).catch(next);
}
