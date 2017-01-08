'use strict';

const expect   = require('expect');
const request  = require('request-promise');
const fakebook = require('./fakebook');
const factory  = require('./factory');

const baseUrl = process.env.NODE_ENV == 'production' ? config.baseUrl: 'http://localhost:3000';
const api = request.defaults({
  baseUrl: baseUrl,
  json: true,
  resolveWithFullResponse: true,
})

describe("bubbles api", function () {
  let handle;
  this.slow(1000);

  before(function() {
    return api('/').catch(function(err) {
      console.error(`API is not running at ${baseUrl}`);
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
});

describe("fakebook", function() {
  this.slow(1000);

  const api = request.defaults({
    baseUrl: 'http://localhost:3001',
    json: true,
    resolveWithFullResponse: true,
  })

  let handle;
  before(function() {
    handle = fakebook(3001);
  })

  after(function() {
    handle();
  })

  it("proxies real access tokens to facebook", function() {
    this.timeout(5000);

    return api('/me?access_token=newp').then(shouldFail).catch(function(err) {
      expect(err.statusCode).toEqual(400);
      const body = err.response.body;
      expect(body).toExist();
      expect(body.error).toExist();
      expect(body.error.code).toEqual(190, `Wrong error code in ${JSON.stringify(body.error)}`);
      expect(body.error.fbtrace_id).toExist();
      expect(body.error.fbtrace_id).toNotEqual('fakebook');
    })
  });

  it("returns arbitrary details for a user created", function () {
    let fbToken;

    return api.post('/users', {body: {name: 'neil', cool: 'great'}}).then(function(r) {
      expect(r.body.access_token).toExist(`Missing access token in ${JSON.stringify(r.body)}`);
      fbToken = r.body.access_token;
      return api.get(`/me?access_token=${fbToken}`)
    }).then(function(r) {
      expect(r.body.name).toEqual('neil');
      expect(r.body.cool).toEqual('great');
      expect(r.body.id).toExist();
    })
  });
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
