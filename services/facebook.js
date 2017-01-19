const request = require('request-promise');

const baseUrl = process.env.NODE_ENV == 'production' ?
  'https://graph.facebook.com' :
  'http://localhost:4201';

const fb = request.defaults({
  baseUrl: baseUrl,
  json: true
})

module.exports = {
  me: function(accessToken) {
    return fb(`/me?access_token=${accessToken}`)
  }
}
