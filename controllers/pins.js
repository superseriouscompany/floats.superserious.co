const auth  = require('../services/auth');
const pins  = require('../storage/pins');
const users = require('../storage/users');

module.exports = function(app) {
  app.post('/pins', auth, dropPin);
}

function dropPin(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
  if( req.body.lat === undefined || req.body.lng === undefined ) {
    return res.status(400).json({
      debug: 'Please provide `lat` and `lng` in request body'
    })
  }
  const lat = Number(req.body.lat);
  const lng = Number(req.body.lng);
  if( isNaN(lat) || isNaN(lng)
      || lat < -90  || lat > 90
      || lng < -180 || lng > 180 ) {
    return res.status(400).json({
      debug: '`lat` or `lng` is out of range (-90 to 90 and 180 to 180) or NaN'
    })
  }

  const now = +new Date;
  pins.create({
    lat: lat,
    lng: lng,
    user_id: req.userId,
    created_at: now,
  }).then(function() {
    return users.update(req.userId, {lat: lat, lng: lng, last_pin_at: now});
  }).then(function() {
    return res.sendStatus(204);
  }).catch(next)
}
