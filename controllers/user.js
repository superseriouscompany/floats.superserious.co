const auth = require('../services/auth');

module.exports = function(app) {
  app.post('/users', createUser);
  app.patch('/users/me', auth, updateUser);
}

function createUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.status(201).json({access_token: 'PANICMODE'}) }

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
}

function updateUser(req, res, next) {
  if( process.env.PANIC_MODE ) { return res.sendStatus(204); }
    res.sendStatus(204);
  })
}
