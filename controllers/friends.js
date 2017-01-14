'use strict';

const auth      = require('../services/auth');
const db        = require('../storage/friends');
const users     = require('../storage/users');
const log       = require('../services/log');
const haversine = require('haversine');
const _         = require('lodash');

module.exports = function(app) {
  app.get('/friends/nearby', auth, nearby);
}

function nearby(req, res, next) {
  if( process.env.PANIC_MODE ) {
    return res.json({
      friends: [
        { id: 'PANICMODE1', name: "Oops", avatar_url: "https://placekitten.com/640/640"},
        { id: 'PANICMODE2', name: "Server's down.", avatar_url: "https://placekitten.com/640/640"},
        { id: 'PANICMODE3', name: "Work here?", avatar_url: "https://placekitten.com/640/640"},
      ]
    })
  }

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
