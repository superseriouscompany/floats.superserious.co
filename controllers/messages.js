'use strict';

const auth     = require('../services/auth');
const log      = require('../services/log');
const panic    = require('../services/panic');
const socket   = require('../services/socket');
const db = {
  messages: require('../storage/messages'),
  convos:   require('../storage/convos'),
}

module.exports = function(app) {
  app.post('/floats/:floatId/convos/:convoId/messages', auth, create);
  app.get('/floats/:floatId/convos/:convoId/messages', auth, all);
  app.delete('/floats/:floatId/convos/:convoId/messages/:id', auth, destroy);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
  let convo;
  return db.convos.get(req.params.floatId, req.params.convoId).then(function(c) {
    convo = c;
    return db.messages.create(
      req.params.floatId,
      req.params.convoId,
      req.userId,
      req.body.text
    )
  }).then(function(m) {
    const payload = JSON.stringify(Object.assign({type: 'new_message'}, m));
    convo.members.forEach(function(userId) {
      socket.send(userId, payload).catch(function(err) {
        if( err.name == 'ClientNotFound' ) { return; }
        log.error({err: err}, 'Websocket Error');
      });
    })
    res.status(201).json(m);
  }).catch(next);
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({messages: panic.messages}); }

  return db.messages.findByConvo(req.params.floatId, req.params.convoId).then(function(messages) {
    return res.json({messages: messages})
  }).catch(next);
}

function destroy(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return db.messages.destroy(req.params.floatId, req.params.convoId, req.params.id).then(function() {
    return res.sendStatus(204);
  }).catch(next);
}
