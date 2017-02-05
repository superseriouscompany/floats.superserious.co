'use strict';

const expect   = require('expect');
const factory  = require('../factory');
const h        = require('../helpers');
const api      = require('../api');

module.exports = function() { describe("/users", function() {
  let user, fbToken;

  afterEach(function() {
    user = null;
    fbToken = null;
  })

  describe("creation", function () {
    it("403s without a facebook token", function () {
      return api.post('/users').then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(403);
      })
    });

    it("403s if permissions are insufficient");

    it("201s with valid facebook token", function () {
      return factory.fbUser().then(function(user) {
        expect(user.access_token).toExist(`No access token for ${JSON.stringify(user)}`);
        return api.post('/users', {body: { facebook_access_token: user.access_token }});
      }).then(function(response) {
        expect(response.statusCode).toEqual(201);
        expect(response.body.access_token).toExist(`No access token found in ${JSON.stringify(response.body)}`);
        expect(response.body.id).toExist(`No id found in ${JSON.stringify(response.body)}`);
      })
    });

    it("200s with valid facebook token for existing ID", function () {
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

  describe("deleting account", function() {
    it("allows deletion", function () {
      return factory.user().then(function(u) {
        user = u;
        return user.api.delete('/users/me')
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
        return user.api.get('/users/me').then(h.shouldFail).catch(function(err) {
          expect(err.statusCode).toEqual(401);
        })
      })
    });

    it("deletes floats");

    it("deletes friendships");

    it("deletes friend requests");

    it("leaves groups");

    it("ends dms");
  })

  describe("updating self", function() {
    // pending, security https://firebase.google.com/docs/auth/admin/verify-id-tokens
    it("verifies firebase token");

    it("401s with invalid access token", function () {
      return api.patch('/users/me', {body: { firebase_token: 'firebase123' }}).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(401);
      });
    });

    it("accepts firebase token", function () {
      return factory.user().then(function(u) {
        user = u;
        return user.api.patch({
          url: '/users/me',
          body:    { firebase_token: 'firebase123'},
        })
      }).then(function(response) {
        expect(response.statusCode).toEqual(204);
        return user.api('/users/me')
      }).then(function(response) {
        expect(response.statusCode).toEqual(200);
        expect(response.body.hasFirebaseToken).toEqual(true);
      })
    });
  });

  describe("setting location", function() {
    it("401s with invalid access token", function () {
      return api.post('/pins', {body: { lat: 10, lng: 10 }}).then(h.shouldFail).catch(function(err) {
        expect(err.statusCode).toEqual(401);
      });
    });

    it("400s if lat/lng are not provided", function() {
      return factory.user().then(function(user) {
        return user.api.post('/pins').then(h.shouldFail);
      }).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.debug).toEqual("Please provide `lat` and `lng` in request body");
      })
    });

    it("400s if lat/lng are invalid", function() {
      return factory.user().then(function(user) {
        return user.api.post('/pins', {
          body: {
            lat: 91,
            lng: 181,
          }
        }).then(h.shouldFail);
      }).catch(function(err) {
        expect(err.statusCode).toEqual(400);
        expect(err.response.body.debug).toMatch("`lat` or `lng` is out of range");
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
})}
