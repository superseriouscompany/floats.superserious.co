'use strict';

const expect   = require('expect');
const request  = require('request-promise');
const tinystub = require('tinystub');
const fakebook = require('./fakebook');
const factory  = require('./factory');
const api      = require('./api');

describe("floats api", function () {
  let handle, stub;
  this.slow(1000);

  before(function() {
    return api('/').catch(function(err) {
      console.error(`API is not running at ${api.baseUrl}`);
      process.exit(1);
    })
  })

  before(function() {
    handle = fakebook(3001);
    stub   = tinystub(3002);

  })
  afterEach(function() {
    return api.delete('/flush')
  })
  after(function() {
    handle();
    stub();
  })

  it("provides healthcheck", function () {
    return api('/').then(function(response) {
      expect(response.body.cool).toEqual("nice", `Unexpected healthcheck result ${JSON.stringify(response.body)}`)
    })
  });

  describe("user creation", function () {
    it("403s without a facebook token", function () {
      return api.post('/users').then(shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(403);
      })
    });

    it("403s if permissions are insufficient");

    it("201s with valid facebook token", function () {
      return factory.fbUser().then(function(user) {
        expect(user.access_token).toExist(`No access token for ${JSON.stringify(user)}`);
        return api.post('/users', {body: { facebook_access_token: user.access_token }})
      }).then(function(response) {
        expect(response.statusCode).toEqual(201);
        expect(response.body.access_token).toExist(`No access token found in ${JSON.stringify(response.body)}`);
        expect(response.body.id).toExist(`No id found in ${JSON.stringify(response.body)}`);
      })
    });

    it("200s with valid facebook token for existing ID", function () {
      let fbToken;

      return factory.fbUser().then(function(user) {
        fbToken = user.access_token;
        return api.post('/users', {body: { facebook_access_token: fbToken }});
      }).then(function() {
        return api.post('/users', {body: { facebook_access_token: fbToken }});
      }).then(function(response) {
        expect(response.statusCode).toEqual(200);
        expect(response.body.access_token).toExist(`No access token found in ${JSON.stringify(response.body)}`);
      });
    });
  });

  describe("deleting account", true ? null : function() {
    let user;
    return factory.user().then(function(u) {
      user = u;
      return user.api.delete('/users/me')
    }).then(function(response) {
      expect(response.statusCode).toEqual(204)
      user.api.get('/users/me').then(shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(401);
      })
    })
  })

  describe("updating self", function() {
    it("verifies firebase token");

    it("401s with invalid access token", function () {
      return api.patch('/users/me', {body: { firebase_token: 'firebase123' }}).then(shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(401);
      });
    });

    it("accepts firebase token", function () {
      return factory.user().then(function(user) {
        return api({
          method: 'PATCH',
          url: '/users/me',
          body:    { firebase_token:   'firebase123'},
          headers: { 'X-Access-Token': user.access_token }
        })
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
      })
    });
  });

  describe("setting location", function() {
    it("401s with invalid access token", function () {
      return api.post('/pins', {body: { lat: 10, lng: 10 }}).then(shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(401);
      });
    });

    it("400s if lat/lng are not provided", function() {
      return factory.user().then(function(user) {
        return user.api.post('/pins').then(shouldFail);
      }).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.dev_message).toEqual("Please provide `lat` and `lng` in request body");
      })
    });

    it("400s if lat/lng are invalid", function() {
      return factory.user().then(function(user) {
        return user.api.post('/pins', {
          body: {
            lat: 91,
            lng: 181,
          }
        }).then(shouldFail);
      }).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.dev_message).toMatch("`lat` or `lng` is out of range");
      })
    });

    it("204s with real lat/lng", function () {
      return factory.user().then(function(user) {
        return user.api.post('/pins', {
          body: {
            lat: 0,
            lng: 0
          }
        })
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
      });
    });
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
    it("requires invitees");

    it("validates friendships");

    it("validates proximity");

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
          },
          headers: {
            'X-Stub-Url': 'http://localhost:3002'
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

    it("truncates text");
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
        expect(f.attendees.length).toEqual(0);
      })
    })
  })

  describe("joining floats", function() {
    it("400s if float is not found");

    it("allows joining a float", function () {
      let user, u0;
      return factory.float().then(function(float) {
        user = float.user;
        u0 = float.users[0];
        return u0.api.post(`/floats/${float.id}/join`, {
          headers: {'X-Stub-Url': 'http://localhost:3002'}
        })
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
        return u0.api.get('/floats')
      }).then(function(response) {
        const float = response.body.floats[0];
        expect(float.attending).toEqual(true, `Expected attending true in ${float}`);
        return user.api.get('/floats/mine')
      }).then(function(response) {
        const attendees = response.body.floats[0].attendees;
        expect(attendees.length).toEqual(1, `Expected exactly 1 attendee in ${JSON.stringify(attendees)}`);
        expect(attendees[0].name).toEqual(u0.name);
        expect(attendees[0].avatar_url).toEqual(u0.avatar_url);
        expect(attendees[0].id).toEqual(u0.id);
      })
    });

    it("sends a notification to the float creator", function() {
      let user;
      return factory.float().then(function(float) {
        user = float.user;
        return float.users[0].api.post(`/floats/${float.id}/join`, {
          headers: { 'X-Stub-Url': 'http://localhost:3002' }
        })
      }).then(function(response) {
        expect(stub.calls.length).toEqual(1, `Expected 1 call in ${JSON.stringify(stub.calls)}`);
        expect(stub.calls[0].url).toEqual('/fcm/send');
        expect(stub.calls[0].body).toExist();
        const notification = stub.calls[0].body;
        expect(notification.priority).toEqual('high');
        expect(notification.notification.body).toEqual('Tiago Quixote joined "Surf?"');
        expect(notification.token).toEqual(user.firebase_token);
      })
    });

    it("409s if they've already joined");

  })
});

function shouldFail(r) {
  let err;
  if( r.statusCode ) {
    err = new Error(`Expected an unsuccessful response, got: ${r.statusCode} ${JSON.stringify(r.body)}`);
    err.statusCode = r.statusCode;
    err.response = { body: r.body };
  } else {
    err = new Error(`Expected an unsuccessful response, got: ${r}`);
    err.statusCode = 420;
  }
  throw err;
}
