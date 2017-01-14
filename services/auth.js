module.exports = function auth(req, res, next) {
  if( process.env.PANIC_MODE ) { return next(); }

  const token = req.get('X-Access-Token');

  if( !token || !sessions[token] ) {
    return res.status(401).json({error: "Invalid Access Token", token: token});
  }

  next();
}
