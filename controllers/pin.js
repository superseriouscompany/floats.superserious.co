const auth = require('../services/auth');

module.exports = function(app) {
  app.post('/pins', auth, dropPin);
}

function dropPin(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
  if( !req.body.lat || !req.body.lng ) {
    return res.status(400).json({
      dev_message: 'Please provide `lat` and `lng` in request body'
    })
  }

  return res.sendStatus(204);
}
