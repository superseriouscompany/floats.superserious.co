'use strict';

const request  = require('request-promise');
const expect   = require('expect');
const fakebook = require('./fakebook');

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

  it("proxies real access tokens to facebook (run with LIVE=1)", !process.env.LIVE ? undefined : function() {
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
