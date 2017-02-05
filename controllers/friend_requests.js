'use strict';

const auth   = require('../services/auth');
const panic  = require('../services/panic');
const notify = require('../services/notify');
const models = {
  friend_requests: require('../models/friend_requests'),
  friends: require('../models/friends'),
};
const db = {
  users: require('../db/users'),
}

module.exports = function(app) {
  app.post('/friend_requests/:id', auth, create);
  app.put('/friend_requests/:id', auth, approve);
  app.delete('/friend_requests/mine/:id', auth, undo);
  app.delete('/friend_requests/:id', auth, deny);
  app.get('/friend_requests', auth, all);
}

function create(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }
  let friendRequest;

  if( req.user.id == req.params.id ) {
    return res.status(409).json({message: "You're already friends with yourself...technically."})
  }

  return models.friend_requests.create(req.user, req.params.id).then((fr) => {
    friendRequest = fr;
    return db.users.get(req.params.id).then((u) => {
      if( friendRequest.friendship ) {
        return notify.firebase(
          u.firebase_token,
          `${req.user.name} is your friend now.`,
          { type: 'friends:new', friend: friendRequest.friendship}
        ).then(() => {
          return res.status(200).json(friendRequest.friendship);
        });
      }

      return notify.firebase(
        u.firebase_token,
        `${req.user.name} wants to be friends.`,
        { type: 'friend_requests:new', friend_request: friendRequest}
      ).then(() => {
        return res.status(201).json(friendRequest);
      });
    })
  }).catch((err) => {
    if( err.name == 'Conflict' ) {
      return res.status(409).json({
        message: err.message,
      })
    }
    next(err);
  });
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.json({friend_requests: panic.friendRequests}); }

  return models.friend_requests.all(req.userId).then((requests) => {
    return res.json({
      friend_requests: requests
    })
  }).catch(next);
}

function deny(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return models.friend_requests.deny(req.userId, req.params.id).then(() => {
    return res.sendStatus(204);
  }).catch(next);
}

function undo(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return models.friend_requests.undo(req.userId, req.params.id).then(() => {
    return res.sendStatus(204);
  }).catch(next);
}

function approve(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }

  return models.friend_requests.accept(req.userId, req.params.id).then(() => {
    return res.sendStatus(204);
  }).catch(next);
}
