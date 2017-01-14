'use strict';

const express    = require('express');
const bodyParser = require('body-parser');
const fb         = require('./services/facebook');
const auth       = require('./services/auth');
const log        = require('./services/log');
const app        = express();

app.use(bodyParser.json());

const port      = process.env.PORT || 3000;
const panicMode = process.env.PANIC_MODE || false;

// healthcheck
app.get('/', function(req, res) { res.json({cool: 'nice'}); })

// user routes
require('./controllers/user')(app);
require('./controllers/sighting')(app);

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
  log.error({err: err, message: err.message, errName: err.name, stack: err.stack}, 'Uncaught server error');
  res.status(500).json({message: 'Something went wrong.'});
})

const server = express();
server.get('/', function(req, res) { res.redirect('/v1'); })
server.use('/v1', app);

server.listen(port, function(err) {
  if( err ) { throw err; }
  log.info(`Listening on ${port}`);
})
