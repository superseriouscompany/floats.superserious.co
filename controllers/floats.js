const auth  = require('../services/auth');
const panic = require('../services/panic');

module.exports = function(app) {
  app.post('/floats', auth, create);
  app.get('/floats/mine', auth, mine);
  app.get('/floats', auth, all);
  app.delete('/floats/:id', auth, destroy);
}

function create(req, res, next) {
  log.info({text: req.body.text, user_ids: req.body.user_ids});
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }
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
