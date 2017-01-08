const request = require('request-promise');

const fakebook = request.defaults({
  baseUrl: 'http://localhost:3001',
  json: true
})

const factory = {
  fbUser: function(body) {
    return fakebook.post('/users', {body: body});
  },
}

module.exports = factory;
