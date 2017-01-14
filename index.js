'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const bunyan     = require('bunyan');
const uuid       = require('uuid');
const fb         = require('./services/facebook');

const log        = bunyan.createLogger({ name: 'bubbles' });
const app        = express();

app.use(bodyParser.json());

const port      = process.env.PORT || 3000;
const panicMode = process.env.PANIC_MODE || false;

let users    = {},
    sessions = {};

app.get('/', function(req, res) {
  res.json({cool: 'nice'});
})

app.post('/users', function(req, res, next) {
  if( panicMode ) { return res.status(201).json({access_token: 'PANICMODE'}) }

  if( !req.body.facebook_access_token ) {
    return res.status(403).json({error: 'Please provide `facebook_access_token` in json body'});
  }

  return fb.me(req.body.facebook_access_token).then(function(user) {
    if( users[user.id] ) {
      return res.json({access_token: users[user.id].access_token});
    }

    const accessToken = uuid.v1();
    users[user.id] = Object.assign(user, {access_token: accessToken});
    sessions[accessToken] = users[user.id];
    return res.status(201).json({access_token: accessToken});
  }).catch(next);
})

app.patch('/users/me', auth, function(req, res, next) {
  if( panicMode ) { return res.sendStatus(204); }
  res.sendStatus(204);
})

app.post('/sightings', auth, function(req, res, next) {
  if( panicMode ) { return res.sendStatus(204); }
  return res.sendStatus(204);
})

app.get('/friends/nearby', auth, function(req, res, next) {
  if( panicMode ) {
    return res.json({
      friends: [
        { id: 'PANICMODE1', name: "Oops", avatar_url: "https://placekitten.com/640/640"},
        { id: 'PANICMODE2', name: "Server's down.", avatar_url: "https://placekitten.com/640/640"},
        { id: 'PANICMODE3', name: "Work here?", avatar_url: "https://placekitten.com/640/640"},
      ]
    })
  }
})

app.post('/bubbles', auth, function(req, res, next) {
  log.info({text: req.body.text, exclude_ids: req.body.exclude_ids});
  if( panicMode ) { return res.status(201).json({id: 'PANICMODE'}); }
})

app.delete('/bubbles/:id', auth, function(req, res, next) {
  if( panicMode ) { return res.sendStatus(204); }
})

app.get('/bubbles/mine', auth, function(req, res, next) {
  if( panicMode ) {
    return res.json({
      title: "hmm, mewbe I should work for this app",
      created_at: +new Date - 1000 * 60 * 60,
      user: {
        avatar_url: 'https://placekitten.com/640/640',
        name: 'You',
      },
      attendees: [
        {
          avatar_url: 'https://placekitten.com/640/640',
          name: "You kitten me?",
          joined_at: +new Date,
        },
        {
          avatar_url: 'https://placekitten.com/640/640',
          name: "This is a catastrophe.",
          joined_at: +new Date,
        },
      ]
    })
  }
})

app.get('/bubbles', auth, function(req, res, next) {
  if( panicMode ) {
    return res.json({
      bubbles: [
        {
          title: 'Is everything down?',
          created_at: +new Date - 1000 * 60 * 35,
          user: {
            name: 'Yep',
            avatar_url: 'https://placekitten.com/640/640',
          },
          attending: false,
        },
        {
          title: 'Still?',
          created_at: +new Date - 1000 * 60 * 120,
          user: {
            name: 'Wow',
            avatar_url: 'https://placekitten.com/640/640',
          },
          attending: true,
        },
      ]
    })
  }
})

app.use(function(err, req, res, next) {
  log.error({err: err}, 'Uncaught server error');
  res.status(500).json({message: 'Something went wrong.'});
})

const server = express();
server.get('/', function(req, res) { res.redirect('/v1'); })
server.use('/v1', app);

server.listen(port, function(err) {
  if( err ) { throw err; }
  log.info(`Listening on ${port}`);
})

function auth(req, res, next) {
  if( panicMode ) { return next(); }

  const token = req.get('X-Access-Token');

  if( !token || !sessions[token] ) {
    return res.status(401).json({error: "Invalid Access Token", token: token});
  }

  next();
}
