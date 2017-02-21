'use strict';

const haversine = require('haversine');
const _         = require('lodash');
const auth      = require('../services/auth');
const error     = require('../services/error');
const log       = require('../services/log');
const panic     = require('../services/panic');
const fb        = require('../services/facebook');
const models = {
  friends: require('../models/friends'),
  users:   require('../models/users'),
}
const db = {
  users: require('../db/users'),
}

module.exports = function(app) {
  app.get('/friends/nearby', auth, nearby);
  app.get('/friends', auth, all);
  app.delete('/friends/:id', auth, block);
  app.put('/friends/:id', auth, unblock);
  app.post('/autofriend', auth, autofriend);
}

function nearby(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({friends: panic.nearbyFriends}); }

  let lat, lng;

  return db.users.get(req.userId).then(function(user) {
    lat = user.lat;
    lng = user.lng;
    if( lat === undefined || lng === undefined ) {
      log.warn({userId: req.userId}, 'No pin set yet');
      throw error('No pin set yet', {userId: req.userId, name: 'NoPin'});
    }

    return models.friends.allUsers(req.userId);
  }).then(function(friends) {
    friends = friends.filter(function(f) {
      f.distance = haversine(
        { latitude: f.lat, longitude: f.lng },
        { latitude: lat, longitude: lng }
      )
      return f.distance <= 50;
    })

    res.json({
      friends: friends.map(function(f) { return _.pick(f, ['id', 'avatar_url', 'name', 'distance']); })
    })
  }).catch(function(err) {
    if( err.name == 'NoPin' ) {
      return res.status(400).json({
        message: err.message,
      })
    }

    next(err);
  });
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({friends: panic.friends}); }

  return models.friends.all(req.userId).then((friends) => {
    friends = friends.map((f) => {
      if( f.blocked ) {
        f.distance = 1000000;
      } else {
        f.distance = haversine(
          { latitude: f.lat, longitude: f.lng },
          { latitude: req.user.lat, longitude: req.user.lng }
        )
      }
    }).sort((a,b) => {
      return a.distance < b.distance ? 1 : -1
    })

    return res.json({
      friends: friends,
    })
  }).catch(next);
}

function autofriend(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  let userIds = [];
  return fb.friends(req.user.facebook_access_token).then((friendIds) => {
    return models.users.findByFacebookIds(friendIds)
  }).then((users) => {
    const promises = users.map((u) => {
      return models.friends.create(req.userId, u)
    })
    userIds = users.map((u) => {
      return u.id
    })
    return Promise.all(promises)
  }).then(() => {
    res.json({friend_ids: userIds})
  }).catch(next)
}

function block(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return models.friends.block(req.userId, req.params.id).then((friends) => {
    return res.sendStatus(204);
  }).catch(next);
}

function unblock(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return models.friends.unblock(req.userId, req.params.id).then((friends) => {
    return res.sendStatus(204);
  }).catch(next);
}
