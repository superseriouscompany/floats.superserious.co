const auth = require('../services/auth');

module.exports = function(app) {
  app.post('/floats', auth, create);
  app.get('/floats/mine', auth, mine);
  app.get('/floats', auth, all);
  app.delete('/floats/:id', auth, destroy);
}

function create(req, res, next) {
  log.info({text: req.body.text, user_ids: req.body.user_ids});
  if( process.env.PANIC_MODE ) { return res.status(201).json({id: 'PANICMODE'}); }
}

function all(req, res, next) {
  if( process.env.PANIC_MODE ) {
    return res.json({
      floats: [
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
}

function mine(req, res, next) {
  if( process.env.PANIC_MODE ) {
    return res.json({
      floats: [{
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
      }]
    })
  }
}

function destroy(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
}
