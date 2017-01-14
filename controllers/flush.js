'use strict';

const users  = require('../storage/users');
const floats = require('../storage/floats');

module.exports = function(app) {
  if( process.env.NODE_ENV == 'production' ) { return; }

  app.delete('/flush', function(req, res, next) {
    users.flush().then(function() {
      return floats.flush()
    }).then(function() {
      res.sendStatus(204);
    })
  })
}
