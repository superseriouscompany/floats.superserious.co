'use strict';

const haversine = require('haversine');
const _         = require('lodash');
const auth      = require('../services/auth');
const db        = require('../storage/friends');
const users     = require('../storage/users');
const log       = require('../services/log');
const panic     = require('../services/panic');

module.exports = function(app) {
  app.get('/friends/nearby', auth, nearby);
}

function nearby(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({friends: panic.friends}); }

  let lat, lng;

  users.get(req.userId).then(function(user) {
    lat = user.lat;
    lng = user.lng;
    if( lat === undefined || lng === undefined ) {
      log.warn('No pin set yet', {userId: req.userId});
      return res.status(400).json({dev_message: 'No pin set yet', userId: req.userId})
    }

    return db.forUser(req.userId);
  }).then(function(friends) {
    friends = friends.filter(function(f) {
      return haversine(
        { latitude: f.lat, longitude: f.lng },
        { latitude: lat, longitude: lng },
        { threshold: 10 }
      )
    })

    res.json({
      friends: friends.map(function(f) { return _.pick(f, ['id', 'avatar_url', 'name']); })
    })
  }).catch(next);
}
