'use strict';

const normalizedPath = require("path").join(__dirname, "api");
const expect         = require('expect');
const fakebook       = require('./fakebook');
const api            = require('./api');
const server         = require('../index');

describe("api", function() {
  let serverHandle, fakebookHandle;
  this.slow(1000);

  before(function() {
    serverHandle   = server(4200);
    fakebookHandle = fakebook(4201);
  })
  afterEach(function() {
    if( process.env.LIVE ) { return; }

    return api.delete('/flush');
  })
  after(function() {
    serverHandle();
    fakebookHandle();
  })

  it("provides healthcheck", function () {
    return api('/').then(function(response) {
      expect(response.body.cool).toEqual("nice", `Unexpected healthcheck result ${JSON.stringify(response.body)}`);
    }).catch(function(err) {
      if( err ) { console.error(err); process.exit(1); }
    })
  });

  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    require("./api/" + file)();
  });
})
