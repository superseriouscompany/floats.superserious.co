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
    body = Object.assign({lat: 0, lng: 0}, body);

    return factory.fbUser(body).then(function(user) {
      return api.post('/users', {body: { facebook_access_token: user.access_token }});
    }).then(function(response) {
      let user = response.body;
      user.api = api.authenticated(user.access_token);
      return user;
    })
  },

  friendship: function(u0, u1) {
    u0 = u0 ? Promise.resolve(u0) : factory.user();
    u1 = u1 ? Promise.resolve(u1) : factory.user();

    return Promise.all([u0, u1]).then(function(values) {
      const u0 = values[0];
      const u1 = values[1];

      // TODO: send and accept friend request
      return Promise.resolve({
        key: u0 + '|' + u1,
        u0: u0,
        u1: u1,
      })
    })
  },

  float: function(body) {
    body = Object.assign({title: 'Surf?'}, body);

    let friendship;
    return factory.friendship().then(function(fp) {
      friendship = fp;
      return friendship.u0.api.post('/floats', {
        body: {
          user_ids: [friendship.u1.id],
          title: body.title
        },
        headers: {
          'X-Stub-Url': 'http://localhost:3002'
        }
      })
    }).then(function(response) {
      let float = response.body;
      float.users = [friendship.u1];
      float.user = friendship.u0;
      return float;
    })
  }
}

module.exports = factory;
