const session = require('./session');
const users   = require('../db/users');;

module.exports = function auth(req, res, next) {
  if( process.env.PANIC_MODE ) { return next(); }

  const token = req.get('X-Access-Token');
  if( !token ) { return res.status(401).json({error: "No access token provided"}) }

  users.findByAccessToken(token).then(function(user) {
    req.userId = user.id;
    req.user = user;
    next();
  }).catch(function(err) {
    if( err.name == 'UserNotFound' ) {
      return res.status(401).json({error: "Invalid Access Token", token: token});
    }
    next(err);
  })
}
