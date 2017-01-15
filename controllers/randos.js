'use strict';

const auth  = require('../services/auth');
const panic = require('../services/panic');

module.exports = function(app) {
  app.get('/randos', auth, all);
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({randos: panic.randos}); }

  next('not implemented');
}
