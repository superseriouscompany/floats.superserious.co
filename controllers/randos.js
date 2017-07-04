'use strict';

const _      = require('lodash');
const auth   = require('../services/auth');
const panic  = require('../services/panic');
const models = {
  randos: require('../models/randos')
}

module.exports = function(app) {
  app.get('/randos', auth, all);
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({randos: panic.randos}); }

  return models.randos.all(req.userId).then((randos) => {
    randos = randos.map((r) => {
      return _.pick(r, 'id', 'name', 'avatar_url');
    })
    return res.json({
      randos: randos,
    })
  }).catch(next);
}
