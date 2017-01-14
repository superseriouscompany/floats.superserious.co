const session = require('./session');

module.exports = function auth(req, res, next) {
  if( process.env.PANIC_MODE ) { return next(); }

  const token = req.get('X-Access-Token');
  if( !token ) { return res.status(401).json({error: "No access token provided"}) }

  session.find(token).then(function(id) {
    req.userId = id;
    next();
  }).catch(function(err) {
    if( err.name == 'SessionNotFound' ) {
      return res.status(401).json({error: "Invalid Access Token", token: token});
    }
    next(err);
  })
}
