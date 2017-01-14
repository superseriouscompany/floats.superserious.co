const auth = require('../services/auth');

module.exports = function(app) {
  app.post('/pins', auth, dropPin);
}

function dropPin(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
  return res.sendStatus(204);
}
