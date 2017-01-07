'use strict';

const expect  = require('expect');
const request = require('request-promise');

const baseUrl = process.env.NODE_ENV == 'production' ? config.baseUrl : 'http://localhost:3000';
const api = request.defaults({
  baseUrl: baseUrl,
  json: true,
  resolveWithFullResponse: true,
})

describe("bubbles api", function () {
  this.slow(1000);

  before(function() {
    return api('/').catch(function(err) {
      console.error(`API is not running at ${baseUrl}`);
      process.exit(1);
    })
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
      return api.post('/users', {body: { facebook_access_token: "FAKEBOOK1" }}).then(function(response) {
        expect(response.statusCode).toEqual(201);
        expect(response.body.access_token).toExist(`No access token found in ${JSON.stringify(response.body)}`);
      })
    });

    it("200s with valid facebook token for existing ID", function () {
      return api.post('/users', {body: { facebook_access_token: "FAKEBOOK2" }}).then(function(response) {
        return api.post('/users', {body: { facebook_access_token: "FAKEBOOK2" }});
      }).then(function(response) {
        expect(response.statusCode).toEqual(200);
        expect(response.body.access_token).toExist(`No access token found in ${JSON.stringify(response.body)}`);
      })
    });
  });
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
