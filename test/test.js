'use strict';

const expect   = require('expect');
const request  = require('request-promise');
const fakebook = require('./fakebook');
const factory  = require('./factory');
const api      = require('./api');

describe("bubbles api", function () {
  let handle;
  this.slow(1000);

  before(function() {
    return api('/').catch(function(err) {
      console.error(`API is not running at ${api.baseUrl}`);
      process.exit(1);
    })
  })

  before(function() {
    handle = fakebook(3001);
  })
  after(function() {
    handle();
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
      return api.patch('/users/me', {body: { firebase_token: 'firebase123' }}).then(shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(401);
      });
    });

    it("400s if lat/lng are not provided");

    it("400s if lat/lng are invalid");

    it("204s with real lat/lng", function () {
      return factory.user().then(function(user) {
        return user.api.post('/sightings', {
          body: {
            lat: 39.376585,
            lng: -9.340847
          }
        })
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
      });
    });
  });
});

describe("friends", function() {
  it("creates friends automatically from facebook friends");

  it("allows removing friends");

  it("gets nearby friends within a 10km radius", function () {
    let u0, u1, u2, accessToken;

    return Promise.all([
      factory.user(),
      factory.user(),
      factory.user()
    ]).then(function(users) {
      u0 = users[0];
      u1 = users[1];
      u2 = users[2];

      return Promise.all([
        api.post('/sightings', {
          body:    { lat: 10, lng: 10 },
          headers: { 'X-Access-Token': u0.access_token },
        }),
        api.post('/sightings', {
          body:    { lat: 10, lng: 10 },
          headers: { 'X-Access-Token': u1.access_token },
        }),
        api.post('/sightings', {
          body:    { lat: 30, lng: 30 },
          headers: { 'X-Access-Token': u2.access_token },
        }),
      ])
    }).then(function() {
      return factory.user()
    }).then(function(u) {
      accessToken = u.access_token;
      return api.post('/sightings', {
        body: { lat: 10, lng: 10 },
        headers: { 'X-Access-Token': accessToken },
      })
    }).then(function() {
      api.get('/friends/nearby', {
        headers: { 'X-Access-Token': accessToken },
      })
    }).then(function(response) {
      expect(response.body.friends).toExist(`No friends in ${JSON.stringify(response.body)}`);
      expect(response.body.friends.length).toEqual(2);
      const u0Match = response.body.friends.find(function(f) { return f.id == u0.id});
      expect(u0Match).toExist(`Didn't find ${u0.id} in ${JSON.stringify(response.body)}`);
      const u1Match = response.body.friends.find(function(f) { return f.id == u1.id});
      expect(u1Match).toExist(`Didn't find ${u1.id} in ${JSON.stringify(response.body)}`);
      const u2Match = response.body.friends.find(function(f) { return f.id == u1.id});
      expect(u2Match).toNotExist(`Found out of range user in nearby friends`);
    })
  });
});

describe("blowing bubbles", function() {
  it("sends push notifications to all nearby friends");

  it("allows excluding ids");
})

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
