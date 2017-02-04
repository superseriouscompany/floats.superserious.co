'use strict';

const expect   = require('expect');
const tinystub = require('tinystub');
const factory  = require('../factory');
const h        = require('../helpers');
const api      = require('../api');

module.exports = function() { describe("/floats", function() {
  let user, convo, float, stub;

  before(function() {
    stub = tinystub(4202);
  })

  afterEach(function() {
    user  = null;
    convo = null;
    float = null;
    return h.clearStub();
  })

  after(function() {
    stub();
  })

  describe("creating floats", function() {
    it("requires invitees", function() {
      return factory.user().then(function(u) {
        return u.api.post('/floats', {
          body: {
            title: 'Lets hang out with no one',
            invitees: [],
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.debug).toEqual("`invitees` array must contain at least one user id");
      })
    });

    // Pending bc everyone is friends with everyone by default
    it("validates friendships", true ? null : function() {
      let rando;
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
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.debug).toEqual(`These are not your friends: [${rando.id}]`);
      })
    });

    // Pending bc I'm not sure how to do this in a scalable way
    it("validates proximity", true ? null : function() {
      let friend;
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
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.name).toEqual('OutOfBounds');
        expect(err.response.body.debug).toEqual(`These friends are not in the area: [${friend.id}]`);
      })
    });

    it("validates length", function() {
      let invitee;
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
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.message).toEqual('Your title is too long. It can only contain 140 characters.');
      })
    });

    it("doesn't allow more than 100 invitees", function() {
      return factory.user().then(function(user) {
        return user.api.post('/floats', {
          body: {
            invitees: new Array(102).join('nope-').split('-'),
            title: 'Surf session?',
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.message).toEqual('You have tried to invite too many people. You can invite 100 people at most.');
      })
    });

    it("requires a title", function () {
      let invitee;
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
          }
        })
      }).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.message).toEqual('Your title must contain at least one word.');
      })
    });

    it("creates a float", function() {
      return factory.friendship().then((f) => {
        user = f.u0;
        return user.api.post('/floats', {
          body: {
            invitees: [f.u1.id],
            title: 'Test Float'
          }
        })
      }).then((response) => {
        expect(response.statusCode).toEqual(201);
        expect(response.body.id).toExist();
      })
    })

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
        expect(stub.calls.length).toEqual(4, `Expected 2 calls in ${JSON.stringify(stub.calls)}`);
        expect(stub.calls[0].url).toEqual('/fcm/send');
        expect(stub.calls[0].body).toExist();
        const notification = stub.calls[0].body;
        expect(notification.priority).toEqual('high');
        expect(notification.notification.body).toEqual('Becca Webster floated "Go to maracuja"');
      })
    });
  })

  describe("viewing floats", function() {
    it("returns floats you were invited to", function() {
      return factory.float().then(function(f) {
        float = f;
        user = float.user;
        return float.users[0].api.get('/floats')
      }).then(function(response) {
        expect(response.statusCode).toEqual(200);
        expect(response.body.floats).toExist();
        expect(response.body.floats.length).toEqual(1, `Expected exactly 1 float in ${JSON.stringify(response.body.floats)}`);
        const f = response.body.floats[0];
        expect(f.id).toEqual(float.id);
        expect(f.title).toEqual(float.title);
        expect(f.created_at).toEqual(float.created_at);
        expect(f.user.avatar_url).toEqual(user.avatar_url);
        expect(f.user.name).toEqual(user.name);
      })
    });

    it("returns floats you created", function() {
      return factory.float().then(function(f) {
        float = f;
        user = float.user;
        return user.api.get('/floats/mine')
      }).then(function(response) {
        expect(response.statusCode).toEqual(200);
        expect(response.body.floats).toExist();
        expect(response.body.floats.length).toEqual(1, `Expected exactly 1 float in ${JSON.stringify(response.body.floats)}`);
        const f = response.body.floats[0];
        expect(f.id).toEqual(float.id);
        expect(f.title).toEqual(float.title);
        expect(f.created_at).toEqual(float.created_at);
        expect(f.user.avatar_url).toEqual(user.avatar_url);
        expect(f.user.name).toEqual(user.name);
        expect(f.attendees).toExist();
        expect(f.attendees.length).toEqual(1);
      })
    })
  })

  describe("leaving floats", function() {
    it("400s if the float isn't there");

    it("403s if you're not a member");

    it("204s and removes float on success", function() {
      let u0;
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
      let u0;
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
})}
