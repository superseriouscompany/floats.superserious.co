const auth   = require('../services/auth');
const panic  = require('../services/panic');
const log    = require('../services/log');
const floats = require('../storage/floats');

module.exports = function(app) {
  app.post('/floats', auth, create);
  app.get('/floats/mine', auth, mine);
  app.get('/floats', auth, all);
  app.delete('/floats/:id', auth, destroy);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }

  floats.create({
    user_id: req.body.userId,
    title: req.body.title,
    invitees: req.body.user_ids,
  }).then(function(float) {
    return res.status(201).json({
      id: float.id
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
