'use strict';

const auth  = require('../services/auth');
const panic = require('../services/panic');

module.exports = function(app) {
  app.get('/randos', auth, all);
}

function all(req, res, next) {
  return res.json({randos: panic.randos});
}
