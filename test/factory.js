'use strict';

const request = require('request-promise');
const api     = require('./api');

const fakebook = request.defaults({
  baseUrl: 'http://localhost:3001',
  json: true
})

const factory = {
  fbUser: function(body) {
    return fakebook.post('/users', {body: body});
  },

  user: function(body) {
    return factory.fbUser(body).then(function(user) {
      return api.post('/users', {body: { facebook_access_token: user.access_token }});
    }).then(function(response) {
      let user = response.body;
      user.api = api.authenticated(user.access_token);
      return user;
    })
  },

  friendship: function(u0, u1) {
    return Promise.resolve({key: u0+'|'+u1});
    // TODO: send and accept friend request
  }
}

module.exports = factory;
