'use strict';

const expect   = require('expect');
const request  = require('request-promise');
const tinystub = require('tinystub');
const fakebook = require('./fakebook');
const factory  = require('./factory');
const api      = require('./api');
const h        = require('./helpers');
const server   = require('../index');

describe("floats api", function () {
  let serverHandle, fakebookHandle, stub;

  let float, user;
  this.slow(1000);

  before(function() {
    serverHandle   = server(4200);
    fakebookHandle = fakebook(4201);
    stub           = tinystub(4202);
  })
  afterEach(function() {
    float = null;
    user  = null;
    if( process.env.LIVE ) { return; }

    return api.delete('/flush').then(function() {
      return request('http://localhost:4202', {
        method: 'DELETE'
      })
    });
  })
  after(function() {
    serverHandle();
    fakebookHandle();
    stub();
  })

  it("provides healthcheck", function () {
    return api('/').then(function(response) {
      expect(response.body.cool).toEqual("nice", `Unexpected healthcheck result ${JSON.stringify(response.body)}`)
    })
  });

  describe("making friends", function() {
    it("pulls all people on the app in reverse cron order of when they joined");
    it("pulls your facebook friends");
    it("allows sending a friend request");
    it("allows canceling a sent request");
    it("allows accepting a friend request");
    it("allows denying a friend request");
  })

  describe("friends", function() {
    it("allows removing friends");

    it("gets nearby friends within a 10km radius", function () {
      let u0, u1, u2, user, accessToken;

      return Promise.all([
        factory.user(),
        factory.user(),
        factory.user(),
        factory.user(),
      ]).then(function(users) {
        u0 = users[0];
        u1 = users[1];
        u2 = users[2];
        user = users[3];

        return Promise.all([
          u0.api.post('/pins', {
            // surfer's lodge
            body: { lat: 39.370423, lng: -9.328313 },
          }),
          u1.api.post('/pins', {
            // supertubos
            body: { lat: 39.345404, lng: -9.363375 },
          }),
          u2.api.post('/pins', {
            // lisbon
            body: { lat: 38.710198, lng: -9.143254 },
          }),
          user.api.post('/pins', {
            // ilha do baleal
            body: { lat: 39.376358, lng: -9.340980 },
          })
        ])
      }).then(function() {
        return user.api.get('/friends/nearby');
      }).then(function(response) {
        expect(response.body.friends).toExist(`No friends in ${JSON.stringify(response.body)}`);
        const u0Match = response.body.friends.find(function(f) { return f.id == u0.id});
        expect(u0Match).toExist(`Didn't find ${u0.id} in ${JSON.stringify(response.body)}`);
        const u1Match = response.body.friends.find(function(f) { return f.id == u1.id});
        expect(u1Match).toExist(`Didn't find ${u1.id} in ${JSON.stringify(response.body)}`);
        const u2Match = response.body.friends.find(function(f) { return f.id == u2.id});
        expect(u2Match).toNotExist(`Found out of range user in nearby friends`);
        expect(response.body.friends.length).toEqual(2, `Found the wrong number of nearby friends in ${JSON.stringify(response.body)}`);
      })
    });
  });

  describe("creating floats", function() {
    it("requires invitees", function() {
      return factory.user().then(function(u) {
        return u.api.post('/floats', {
          body: {
            title: 'Lets hang out with no one',
            invitees: [],
          },
          headers: {
            'X-Stub-Url': 'http://localhost:4202'
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.debug).toEqual("`invitees` array must contain at least one user id");
      })
    });

    // Pending bc everyone is friends with everyone by default
    it("validates friendships", true ? null : function() {
      let user, rando;
      return Promise.all([
        factory.user(),
        factory.user(),
      ]).then(function(v) {
        user   = v[0];
        rando  = v[1];
        return user.api.post('/floats', {
          body: {
            invitees: [rando.id],
            title: 'Attempt at spamming'
          },
          headers: {
            'X-Stub-Url': 'http://localhost:4202'
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.debug).toEqual(`These are not your friends: [${rando.id}]`);
      })
    });

    // Pending bc I'm not sure how to do this in a scalable way
    it("validates proximity", true ? null : function() {
      let user, friend;
      return Promise.all([
        factory.user({lat: 0, lng: 0}),
        factory.user({lat: 50, lng: 50}),
      ]).then(function(v) {
        user   = v[0];
        friend = v[1];
        return factory.friendship(user, friend);
      }).then(function() {
        return user.api.post('/floats', {
          body: {
            invitees: [friend.id],
            title: 'Attempt at inviting out of range user'
          },
          headers: {
            'X-Stub-Url': 'http://localhost:4202'
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.name).toEqual('OutOfBounds');
        expect(err.response.body.debug).toEqual(`These friends are not in the area: [${friend.id}]`);
      })
    });

    it("validates length", function() {
      let user, invitee;
      return Promise.all([
        factory.user(),
        factory.user(),
      ]).then(function(values) {
        user = values[0];
        invitee = values[1];
        return user.api.post('/floats', {
          body: {
            invitees: [invitee.id],
            title: 'a'.repeat(141),
          },
          headers: {
            'X-Stub-Url': 'http://localhost:4202'
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.message).toEqual('Your title is too long. It can only contain 140 characters.');
      })
    });

    it("doesn't allow more than 100 invitees", function() {
      let user;
      return factory.user().then(function(user) {
        return user.api.post('/floats', {
          body: {
            invitees: new Array(102).join('nope-').split('-'),
            title: 'Surf session?',
          },
          headers: {
            'X-Stub-Url': 'http://localhost:4202'
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.message).toEqual('You have tried to invite too many people. You can invite 100 people at most.');
      })
    });

    it("requires a title", function () {
      let user, invitee;
      return Promise.all([
        factory.user(),
        factory.user(),
      ]).then(function(values) {
        user = values[0];
        invitee = values[1];
        return user.api.post('/floats', {
          body: {
            invitees: [invitee.id],
            title: '         ',
          },
          headers: {
            'X-Stub-Url': 'http://localhost:4202'
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.message).toEqual('Your title must contain at least one word.');
      })
    });

    it("sends push notifications to all nearby friends", function() {
      let becca, cam, kevin;
      return Promise.all([
        // becca
        factory.user({name: 'Becca Webster', lat: 40.697931, lng: -73.913163}),
        // cam
        factory.user({lat: 40.712465, lng: -73.957452}),
        // kevin
        factory.user({lat: 40.732394, lng: -73.987489}),
      ]).then(function(values) {
        becca = values[0];
        cam = values[1];
        kevin = values[2];

        return Promise.all([
          factory.friendship(becca, cam),
          factory.friendship(becca, kevin),
        ])
      }).then(function() {
        return becca.api.post('/floats', {
          body: {
            invitees: [cam.id, kevin.id],
            title: 'Go to maracuja'
          }
        })
      }).then(function(response) {
        expect(response.statusCode).toEqual(201);
        expect(response.body.id).toExist();
        expect(stub.calls.length).toEqual(2, `Expected 2 calls in ${JSON.stringify(stub.calls)}`);
        expect(stub.calls[0].url).toEqual('/fcm/send');
        expect(stub.calls[0].body).toExist();
        const notification = stub.calls[0].body;
        expect(notification.priority).toEqual('high');
        expect(notification.notification.body).toEqual('Becca Webster floated "Go to maracuja"');
        expect(stub.calls.length).toEqual(2);
      })
    });
  })

  describe("viewing floats", function() {
    it("returns floats you were invited to", function() {
      let u0, float;
      return factory.float().then(function(f) {
        float = f;
        u0 = float.user;
        return float.users[0].api.get('/floats')
      }).then(function(response) {
        expect(response.statusCode).toEqual(200);
        expect(response.body.floats).toExist();
        expect(response.body.floats.length).toEqual(1, `Expected exactly 1 float in ${JSON.stringify(response.body.floats)}`);
        const f = response.body.floats[0];
        expect(f.id).toEqual(float.id);
        expect(f.title).toEqual(float.title);
        expect(f.created_at).toEqual(float.created_at);
        expect(f.user.avatar_url).toEqual(u0.avatar_url);
        expect(f.user.name).toEqual(u0.name);
      })
    });

    it("returns floats you created", function() {
      let u0, float;
      return factory.float().then(function(f) {
        float = f;
        u0 = float.user;
        return u0.api.get('/floats/mine')
      }).then(function(response) {
        expect(response.statusCode).toEqual(200);
        expect(response.body.floats).toExist();
        expect(response.body.floats.length).toEqual(1, `Expected exactly 1 float in ${JSON.stringify(response.body.floats)}`);
        const f = response.body.floats[0];
        expect(f.id).toEqual(float.id);
        expect(f.title).toEqual(float.title);
        expect(f.created_at).toEqual(float.created_at);
        expect(f.user.avatar_url).toEqual(u0.avatar_url);
        expect(f.user.name).toEqual(u0.name);
        expect(f.attendees).toExist();
        expect(f.attendees.length).toEqual(1);
      })
    })
  })

  describe("leaving floats", function() {
    it("400s if the float isn't there");

    it("403s if you're not a member");

    it("204s and removes float on success", function() {
      let user, u0, float;
      return factory.float().then(function(f) {
        float = f;
        user = float.user;
        u0 = float.users[0];
        return u0.api.delete(`/floats/${float.id}/leave`);
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
        return u0.api.get('/floats');
      }).then(function(response) {
        expect(response.body.floats.length).toEqual(0);
      })
    });

    it("removes convos on success", function () {
      let user, u0, float;
      return factory.float().then(function(f) {
        float = f;
        user = float.user;
        u0 = float.users[0];
        return u0.api.delete(`/floats/${float.id}/leave`);
      }).then(function(response) {
        return u0.api.get('/convos');
      }).then(function(response) {
        expect(response.body.convos.length).toEqual(0);
      })
    });
  })

  describe("deleting floats", function() {
    it("403s if you aren't the creator", function() {
      let user;
      return factory.user().then(function(u) {
        user = u;
        return factory.float();
      }).then(function(f) {
        return user.api.delete(`/floats/${f.id}`)
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(403);
        expect(err.response.body.message).toEqual("Permission denied.");
      })
    });

    it("allows deletion from creator", function () {
      let user;
      return factory.float().then(function(f) {
        user = f.user;
        return user.api.delete(`/floats/${f.id}`)
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
        return user.api.get('/floats/mine')
      }).then(function(response) {
        expect(response.body.floats.length).toEqual(0, `Expected no floats in ${JSON.stringify(response.body.floats)}`);
      })
    });

    it("deletes associated convos", function() {
      let convo;
      return factory.convo().then(function(c) {
        convo = c;
        return convo.float.user.api.delete(`/floats/${convo.float.id}`)
      }).then(function() {
        return convo.float.user.api.get('/convos');
      }).then(function(response) {
        expect(response.body.convos.length).toEqual(0);
      })
    });
  })
});
