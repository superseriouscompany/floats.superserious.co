'use strict';

const db = {
  users:  require('../db/users'),
  floats: require('../db/floats'),
  convos: require('../db/convos'),
}

module.exports = function(app) {
  if( process.env.NODE_ENV == 'production' ) { return; }

  app.delete('/flush', function(req, res, next) {
    Promise.all([
      db.users.flush(),
      db.floats.flush(),
      db.convos.flush(),
    ]).then(function() {
      res.sendStatus(204);
    }).catch(next);
  })
}
