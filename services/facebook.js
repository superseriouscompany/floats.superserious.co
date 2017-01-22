const request = require('request-promise');

const baseUrl = process.env.NODE_ENV != 'production' && global.facebookUrl
  ? global.facebookUrl
  : 'https://graph.facebook.com';

const fb = request.defaults({
  baseUrl: baseUrl,
  json: true
})

module.exports = {
  me: function(accessToken) {
    return fb(`/me?access_token=${accessToken}`)
  }
}
