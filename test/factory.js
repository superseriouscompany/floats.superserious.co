'use strict';

const request = require('request-promise');
const _       = require('lodash');
const api     = require('./api');

const fakebook = request.defaults({
  baseUrl: 'http://localhost:4201',
  json: true
})

const factory = {
  fbUser: function(body) {
    return fakebook.post('/users', {body: body});
  },

  user: function(body) {
    body = Object.assign({lat: 0, lng: 0, name: 'Tiago Quixote'}, body);

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
    body = Object.assign({title: 'Surf?', user: null, invitees: [null]}, body);

    let user, users;
    return Promise.resolve().then(() => {
      return body.user || factory.user()
    }).then((u) => {
      user = u;
      const promises = body.invitees.map((invitee) => {
        return factory.friendship(this.user, invitee);
      })
      return Promise.all(promises);
    }).then((v) => {
      const ids   = _.map(v, 'u1.id');
      users  = _.map(v, 'u1');
      return user.api.post('/floats', {
        body: {
          invitees: ids,
          title: body.title,
        }
      })
    }).then((response) => {
      let float = response.body;
      float.users = users;
      float.user = user;
      return float;
    })
  },

  convo: function() {
    let float;
    return factory.float().then(function(f) {
      float = f;
      return f.users[0].api.get(`/convos`)
    }).then(function(response) {
      let convo = response.body.convos[0];
      convo.float = float;
      return convo;
    });
  },

  message: function(user, floatId, convoId, text) {
    return user.api.post(`/floats/${floatId}/convos/${convoId}/messages`, {
      body: {
        text: text,
      }
    }).then(function(response) {
      return response.body;
    })
  }
}

module.exports = factory;
